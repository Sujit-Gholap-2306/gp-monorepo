import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { gpNamuna9DemandLines, gpNamuna9Demands, gpProperties } from '../db/schema/index.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { assertRowCap, parseImportBuffer } from '../lib/spreadsheet.ts'
import { toPaise } from '../lib/money.ts'
import { currentFiscalYear } from '../lib/fiscal.ts'
import { TAX_HEADS, type TaxHead } from '../lib/tax-head.ts'
import {
  collectNamuna9OpeningRowErrors,
  type Namuna9OpeningRow,
} from '../types/namuna9-opening.dto.ts'

type ImportOpeningBalancesArgs = {
  gpId: string
  buffer: Buffer
  generatedBy: string | null
  fiscalYear?: string
}

type FailedRow = {
  propertyNo: string
  rowNos: number[]
  reason: string
}

type PropertyLineState = {
  propertyId: string
  demandId: string
  lineIdByHead: Map<TaxHead, string>
  currentPaiseByHead: Map<TaxHead, number>
  paidPaiseByHead: Map<TaxHead, number>
}

/** Appended to `gp_namuna9_demands.notes` so imports have the same class of audit as `generatedBy` on generate (without overwriting who first generated the header). */
function openingImportAuditLine(at: Date, userId: string | null): string {
  const who = userId ?? 'unknown'
  return `Opening balance import ${at.toISOString()} (user ${who})`
}

export const namuna9OpeningBalancesService = {
  async importFile({
    gpId,
    buffer,
    generatedBy,
    fiscalYear,
  }: ImportOpeningBalancesArgs) {
    const targetFiscalYear = fiscalYear ?? currentFiscalYear()
    const rawRows = await parseImportBuffer(buffer)
    assertRowCap(rawRows)

    const parsed = collectNamuna9OpeningRowErrors(rawRows)
    if (!parsed.ok) {
      throw new ApiError(400, 'Validation failed', parsed.errors)
    }

    const rowNoByPropertyNo = new Map<string, number>()
    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i]!
      rowNoByPropertyNo.set(row.propertyNo, i + 2)
    }

    const failedByProperty = new Map<string, FailedRow>()
    function addFailure(propertyNo: string, reason: string) {
      if (failedByProperty.has(propertyNo)) return
      failedByProperty.set(propertyNo, {
        propertyNo,
        rowNos: [rowNoByPropertyNo.get(propertyNo) ?? -1].filter((n) => n > 0),
        reason,
      })
    }

    const propertyNos = parsed.data.map((row) => row.propertyNo)
    const propertyRows = propertyNos.length === 0
      ? []
      : await db
        .select({
          id: gpProperties.id,
          propertyNo: gpProperties.propertyNo,
        })
        .from(gpProperties)
        .where(and(eq(gpProperties.gpId, gpId), inArray(gpProperties.propertyNo, propertyNos)))

    const propertyIdByNo = new Map(propertyRows.map((row) => [row.propertyNo, row.id]))
    const propertyNoById = new Map(propertyRows.map((row) => [row.id, row.propertyNo]))

    for (const row of parsed.data) {
      if (!propertyIdByNo.has(row.propertyNo)) {
        addFailure(row.propertyNo, 'property_no not found in this GP')
      }
    }

    const knownPropertyIds = [...propertyIdByNo.values()]
    const headers = knownPropertyIds.length === 0
      ? []
      : await db
        .select({
          id: gpNamuna9Demands.id,
          propertyId: gpNamuna9Demands.propertyId,
        })
        .from(gpNamuna9Demands)
        .where(
          and(
            eq(gpNamuna9Demands.gpId, gpId),
            eq(gpNamuna9Demands.fiscalYear, targetFiscalYear),
            inArray(gpNamuna9Demands.propertyId, knownPropertyIds)
          )
        )

    const headerByPropertyId = new Map(headers.map((row) => [row.propertyId, row.id]))
    for (const row of parsed.data) {
      const propertyId = propertyIdByNo.get(row.propertyNo)
      if (!propertyId) continue
      if (!headerByPropertyId.has(propertyId)) {
        addFailure(
          row.propertyNo,
          `current FY demand not found (${targetFiscalYear}). Run N09 generate first.`
        )
      }
    }

    const demandIds = headers.map((row) => row.id)
    const lines = demandIds.length === 0
      ? []
      : await db
        .select({
          id: gpNamuna9DemandLines.id,
          demandId: gpNamuna9DemandLines.demandId,
          taxHead: gpNamuna9DemandLines.taxHead,
          currentPaise: gpNamuna9DemandLines.currentPaise,
          paidPaise: gpNamuna9DemandLines.paidPaise,
        })
        .from(gpNamuna9DemandLines)
        .where(inArray(gpNamuna9DemandLines.demandId, demandIds))

    const propertyStateByNo = new Map<string, PropertyLineState>()
    const demandPropertyIdMap = new Map(headers.map((row) => [row.id, row.propertyId]))
    for (const line of lines) {
      if (!TAX_HEADS.includes(line.taxHead as TaxHead)) continue
      const propertyId = demandPropertyIdMap.get(line.demandId)
      if (!propertyId) continue
      const propertyNo = propertyNoById.get(propertyId)
      if (!propertyNo) continue

      let state = propertyStateByNo.get(propertyNo)
      if (!state) {
        state = {
          propertyId,
          demandId: line.demandId,
          lineIdByHead: new Map<TaxHead, string>(),
          currentPaiseByHead: new Map<TaxHead, number>(),
          paidPaiseByHead: new Map<TaxHead, number>(),
        }
        propertyStateByNo.set(propertyNo, state)
      }
      const head = line.taxHead as TaxHead
      state.lineIdByHead.set(head, line.id)
      state.currentPaiseByHead.set(head, line.currentPaise)
      state.paidPaiseByHead.set(head, line.paidPaise)
    }

    for (const row of parsed.data) {
      const propertyId = propertyIdByNo.get(row.propertyNo)
      if (!propertyId) continue
      const demandId = headerByPropertyId.get(propertyId)
      if (!demandId) continue

      const state = propertyStateByNo.get(row.propertyNo)
      if (!state) {
        addFailure(row.propertyNo, 'N09 demand-lines missing for this property')
        continue
      }

      for (const head of TAX_HEADS) {
        if (!state.lineIdByHead.has(head)) {
          addFailure(row.propertyNo, `N09 demand-line missing for head ${head}`)
          break
        }

        const newPreviousPaise = toPaise(row.arrearsByHead[head])
        const currentPaise = state.currentPaiseByHead.get(head) ?? 0
        const paidPaise = state.paidPaiseByHead.get(head) ?? 0
        if (paidPaise > newPreviousPaise + currentPaise) {
          addFailure(row.propertyNo, `arrears too low for head ${head}; paid already recorded`)
          break
        }
      }
    }

    const failed = [...failedByProperty.values()]
    const failedPropertyNos = new Set(failed.map((item) => item.propertyNo))
    const toUpdate = parsed.data.filter((row) => !failedPropertyNos.has(row.propertyNo))
    const now = new Date()
    const updated: { propertyNo: string; demandId: string }[] = []

    // Collect all updates in memory (no DB) before opening the transaction.
    const lineUpdates: Array<{ id: string; previousPaise: number }> = []
    const demandIdsToUpdate: string[] = []

    for (const row of toUpdate) {
      const state = propertyStateByNo.get(row.propertyNo)
      if (!state) continue

      for (const head of TAX_HEADS) {
        const lineId = state.lineIdByHead.get(head)
        if (!lineId) continue
        lineUpdates.push({ id: lineId, previousPaise: toPaise(row.arrearsByHead[head]) })
      }

      demandIdsToUpdate.push(state.demandId)
      updated.push({ propertyNo: row.propertyNo, demandId: state.demandId })
    }

    if (lineUpdates.length > 0) {
      const auditLine = openingImportAuditLine(now, generatedBy)
      const lineIds = lineUpdates.map((u) => u.id)
      const lineValues = lineUpdates.map((u) => u.previousPaise)

      await db.transaction(async (tx) => {
        // One UPDATE for all demand lines via unnest — N properties × 4 heads = 1 DB hit.
        await tx.execute(sql`
          UPDATE gp_namuna9_demand_lines AS t
          SET previous_paise = v.previous_paise,
              updated_at     = ${now}
          FROM (
            SELECT UNNEST(${lineIds}::uuid[])   AS id,
                   UNNEST(${lineValues}::bigint[]) AS previous_paise
          ) AS v
          WHERE t.id = v.id
        `)

        // One UPDATE for all demand headers — append audit line without a prior SELECT.
        await tx.execute(sql`
          UPDATE gp_namuna9_demands
          SET notes      = CASE
                             WHEN notes IS NULL OR TRIM(notes) = ''
                               THEN ${auditLine}
                             ELSE notes || E'\n' || ${auditLine}
                           END,
              updated_at = ${now}
          WHERE id = ANY(${demandIdsToUpdate}::uuid[])
        `)

      })
    }

    return {
      fiscalYear: targetFiscalYear,
      summary: {
        rowsInFile: rawRows.length,
        propertiesInFile: parsed.data.length,
        updatedProperties: updated.length,
        failedProperties: failed.length,
      },
      updated,
      failed,
    }
  },
}
