import { and, eq, inArray, sql } from 'drizzle-orm'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { db } from '../db/index.ts'
import {
  gpCitizens,
  gpWaterConnectionDemandLines,
  gpWaterConnectionDemands,
  gpWaterConnections,
} from '../db/schema/index.ts'
import { currentFiscalYear } from '../lib/fiscal.ts'
import { assertRowCap, parseImportBuffer } from '../lib/spreadsheet.ts'
import { sqlBigintArray, sqlDate, sqlUuidArray } from '../lib/sql-helpers.ts'
import {
  collectWaterDemandArrearsRowErrors,
  type WaterDemandArrearsRow,
} from '../types/water-demand-arrears.dto.ts'

type ImportWaterArrearsArgs = {
  gpId: string
  buffer: Buffer
  generatedBy: string | null
  fiscalYear?: string
}

type FailedRow = {
  consumerNo: string
  rowNos: number[]
  reason: string
}

type DemandState = {
  demandId: string
  lineId: string
  citizenNo: number
  citizenNameMr: string
  citizenNameEn: string | null
  connectionType: string
  pipeSizeInch: number
  currentPaise: number
  paidPaise: number
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase('en-IN')
}

function citizenNameMatches(rowName: string, state: DemandState): boolean {
  const probe = normalizeText(rowName)
  if (!probe) return false
  const mr = normalizeText(state.citizenNameMr)
  const en = state.citizenNameEn ? normalizeText(state.citizenNameEn) : ''
  return probe === mr || (en.length > 0 && probe === en)
}

function openingImportAuditLine(at: Date, userId: string | null): string {
  const who = userId ?? 'unknown'
  return `Water opening arrear import ${at.toISOString()} (user ${who})`
}

export const waterDemandArrearsImportService = {
  async importFile({ gpId, buffer, generatedBy, fiscalYear }: ImportWaterArrearsArgs) {
    const targetFiscalYear = fiscalYear ?? currentFiscalYear()
    const rawRows = await parseImportBuffer(buffer)
    assertRowCap(rawRows)

    const parsed = collectWaterDemandArrearsRowErrors(rawRows)
    if (!parsed.ok) {
      throw new ApiError(400, 'Validation failed', parsed.errors)
    }

    const rowNoByConsumerNo = new Map<string, number>()
    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i]!
      rowNoByConsumerNo.set(row.consumerNo, i + 2)
    }

    const failedByConsumer = new Map<string, FailedRow>()
    function addFailure(consumerNo: string, reason: string) {
      if (failedByConsumer.has(consumerNo)) return
      failedByConsumer.set(consumerNo, {
        consumerNo,
        rowNos: [rowNoByConsumerNo.get(consumerNo) ?? -1].filter((n) => n > 0),
        reason,
      })
    }

    const consumerNos = parsed.data.map((row) => row.consumerNo)
    const demandRows = consumerNos.length === 0
      ? []
      : await db
        .select({
          demandId: gpWaterConnectionDemands.id,
          consumerNo: gpWaterConnections.consumerNo,
          citizenNo: gpCitizens.citizenNo,
          citizenNameMr: gpCitizens.nameMr,
          citizenNameEn: gpCitizens.nameEn,
          connectionType: gpWaterConnections.connectionType,
          pipeSizeInch: sql<number>`${gpWaterConnections.pipeSizeInch}::float8`,
          lineId: gpWaterConnectionDemandLines.id,
          currentPaise: gpWaterConnectionDemandLines.currentPaise,
          paidPaise: gpWaterConnectionDemandLines.paidPaise,
        })
        .from(gpWaterConnectionDemands)
        .innerJoin(
          gpWaterConnections,
          eq(gpWaterConnectionDemands.waterConnectionId, gpWaterConnections.id)
        )
        .innerJoin(gpCitizens, eq(gpWaterConnections.citizenId, gpCitizens.id))
        .innerJoin(
          gpWaterConnectionDemandLines,
          eq(gpWaterConnectionDemandLines.demandId, gpWaterConnectionDemands.id)
        )
        .where(
          and(
            eq(gpWaterConnectionDemands.gpId, gpId),
            eq(gpWaterConnectionDemands.fiscalYear, targetFiscalYear),
            inArray(gpWaterConnections.consumerNo, consumerNos)
          )
        )

    const stateByConsumerNo = new Map<string, DemandState>(
      demandRows.map((row) => [
        row.consumerNo,
        {
          demandId: row.demandId,
          lineId: row.lineId,
          citizenNo: row.citizenNo,
          citizenNameMr: row.citizenNameMr,
          citizenNameEn: row.citizenNameEn,
          connectionType: row.connectionType,
          pipeSizeInch: row.pipeSizeInch,
          currentPaise: row.currentPaise,
          paidPaise: row.paidPaise,
        },
      ])
    )

    for (const row of parsed.data) {
      const state = stateByConsumerNo.get(row.consumerNo)
      if (!state) {
        addFailure(
          row.consumerNo,
          `current FY water demand not found (${targetFiscalYear}). Run water demand generate first.`
        )
        continue
      }

      if (state.citizenNo !== row.citizenNo) {
        addFailure(row.consumerNo, 'citizen_no does not match this consumer connection')
        continue
      }
      if (!citizenNameMatches(row.citizenName, state)) {
        addFailure(row.consumerNo, 'citizen_name does not match this consumer connection')
        continue
      }
      if (state.connectionType !== row.connectionType) {
        addFailure(row.consumerNo, 'connection_type does not match this consumer connection')
        continue
      }
      if (state.pipeSizeInch !== row.pipeSizeInch) {
        addFailure(row.consumerNo, 'pipe_size_inch does not match this consumer connection')
        continue
      }
      if (state.paidPaise > row.previousPaise + state.currentPaise) {
        addFailure(row.consumerNo, 'previous_paise too low; paid amount already recorded')
        continue
      }
    }

    const failed = [...failedByConsumer.values()]
    const failedConsumerNos = new Set(failed.map((item) => item.consumerNo))
    const toUpdate = parsed.data.filter((row) => !failedConsumerNos.has(row.consumerNo))
    const now = new Date()
    const updated: { consumerNo: string; demandId: string }[] = []

    const lineUpdates: Array<{ id: string; previousPaise: number }> = []
    const demandIdsToUpdate: string[] = []
    for (const row of toUpdate) {
      const state = stateByConsumerNo.get(row.consumerNo)
      if (!state) continue
      lineUpdates.push({ id: state.lineId, previousPaise: row.previousPaise })
      demandIdsToUpdate.push(state.demandId)
      updated.push({ consumerNo: row.consumerNo, demandId: state.demandId })
    }

    if (lineUpdates.length > 0) {
      const lineIds = lineUpdates.map((u) => u.id)
      const previousValues = lineUpdates.map((u) => u.previousPaise)
      const auditLine = openingImportAuditLine(now, generatedBy)

      await db.transaction(async (tx) => {
        await tx.execute(sql`
          UPDATE gp_water_connection_demand_lines AS t
          SET previous_paise = v.previous_paise,
              updated_at     = ${sqlDate(now)}
          FROM (
            SELECT UNNEST(${sqlUuidArray(lineIds)}) AS id,
                   UNNEST(${sqlBigintArray(previousValues)}) AS previous_paise
          ) AS v
          WHERE t.id = v.id
        `)

        await tx.execute(sql`
          UPDATE gp_water_connection_demands
          SET notes      = CASE
                             WHEN notes IS NULL OR TRIM(notes) = ''
                               THEN ${auditLine}
                             ELSE notes || E'\n' || ${auditLine}
                           END,
              updated_at = ${sqlDate(now)}
          WHERE id = ANY(${sqlUuidArray(demandIdsToUpdate)})
        `)
      })
    }

    return {
      fiscal_year: targetFiscalYear,
      summary: {
        rowsInFile: rawRows.length,
        rowsValidated: parsed.data.length,
        updatedRows: updated.length,
        failedRows: failed.length,
      },
      updated,
      failed,
    }
  },
}
