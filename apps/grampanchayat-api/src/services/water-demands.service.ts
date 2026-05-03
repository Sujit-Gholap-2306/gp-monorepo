import { and, asc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { db } from '../db/index.ts'
import {
  gpCitizens,
  gpWaterConnectionDemandLines,
  gpWaterConnectionDemands,
  gpWaterConnectionRates,
  gpWaterConnections,
} from '../db/schema/index.ts'
import { currentFiscalYear, formatFiscalYear, parseFiscalYear } from '../lib/fiscal.ts'
import type { Namuna9Status } from '../types/namuna9.dto.ts'
import type { WaterDemandListQuery } from '../types/water-demands.dto.ts'

type ActiveConnectionCombo = {
  connection_type: string
  pipe_size_inch: number
}

type WaterDemandRow = {
  demandId: string
  waterConnectionId: string
  fiscalYear: string
  generatedAt: Date
  consumerNo: string
  connectionType: string
  pipeSizeInch: number
  citizenId: string
  citizenNo: number
  citizenNameMr: string
  citizenNameEn: string | null
  wardNumber: string
  lineId: string
  previousPaise: number
  currentPaise: number
  paidPaise: number
  totalDuePaise: number | null
  status: string | null
}

function keyForCombo(connectionType: string, pipeSizeInch: number): string {
  return `${connectionType}::${String(pipeSizeInch)}`
}

function previousFiscalYear(fiscalYear: string): string {
  const { startYear } = parseFiscalYear(fiscalYear)
  return formatFiscalYear(startYear - 1)
}

function normalizeStatus(status: string | null): Namuna9Status {
  if (status === 'pending' || status === 'partial' || status === 'paid') {
    return status
  }
  return 'pending'
}

async function activeConnectionCombos(
  gpId: string
): Promise<ActiveConnectionCombo[]> {
  const rows = await db
    .selectDistinct({
      connection_type: gpWaterConnections.connectionType,
      pipe_size_inch: sql<number>`${gpWaterConnections.pipeSizeInch}::float8`,
    })
    .from(gpWaterConnections)
    .where(and(eq(gpWaterConnections.gpId, gpId), eq(gpWaterConnections.status, 'active')))

  return rows
}

export const waterDemandsService = {
  async getRateMasterStatus(gpId: string, fiscalYear?: string) {
    const targetFiscalYear = fiscalYear ?? currentFiscalYear()
    const combos = await activeConnectionCombos(gpId)

    if (combos.length === 0) {
      return {
        fiscal_year: targetFiscalYear,
        isComplete: true,
        missingCombinations: [] as ActiveConnectionCombo[],
      }
    }

    const rates = await db
      .select({
        connectionType: gpWaterConnectionRates.connectionType,
        pipeSizeInch: sql<number>`${gpWaterConnectionRates.pipeSizeInch}::float8`,
      })
      .from(gpWaterConnectionRates)
      .where(
        and(
          eq(gpWaterConnectionRates.gpId, gpId),
          eq(gpWaterConnectionRates.fiscalYear, targetFiscalYear)
        )
      )

    const rateSet = new Set(rates.map((r) => keyForCombo(r.connectionType, r.pipeSizeInch)))
    const missingCombinations = combos
      .filter((combo) => !rateSet.has(keyForCombo(combo.connection_type, combo.pipe_size_inch)))
      .sort(
        (a, b) =>
          a.connection_type.localeCompare(b.connection_type) ||
          a.pipe_size_inch - b.pipe_size_inch
      )

    return {
      fiscal_year: targetFiscalYear,
      isComplete: missingCombinations.length === 0,
      missingCombinations,
    }
  },

  async generate(gpId: string, generatedBy: string | null, fiscalYear?: string) {
    const targetFiscalYear = fiscalYear ?? currentFiscalYear()
    const rateStatus = await this.getRateMasterStatus(gpId, targetFiscalYear)
    if (!rateStatus.isComplete) {
      throw new ApiError(
        422,
        'Rate master is incomplete for active connections',
        rateStatus.missingCombinations
      )
    }

    const out = await db.transaction(async (tx) => {
      const connections = await tx
        .select({
          id: gpWaterConnections.id,
          connectionType: gpWaterConnections.connectionType,
          pipeSizeInch: sql<number>`${gpWaterConnections.pipeSizeInch}::float8`,
        })
        .from(gpWaterConnections)
        .where(and(eq(gpWaterConnections.gpId, gpId), eq(gpWaterConnections.status, 'active')))

      if (connections.length === 0) {
        return { fiscal_year: targetFiscalYear, generated: 0, skipped: 0 }
      }

      const connectionIds = connections.map((c) => c.id)
      const existing = await tx
        .select({
          waterConnectionId: gpWaterConnectionDemands.waterConnectionId,
        })
        .from(gpWaterConnectionDemands)
        .where(
          and(
            eq(gpWaterConnectionDemands.gpId, gpId),
            eq(gpWaterConnectionDemands.fiscalYear, targetFiscalYear),
            inArray(gpWaterConnectionDemands.waterConnectionId, connectionIds)
          )
        )

      const existingSet = new Set(existing.map((r) => r.waterConnectionId))
      const toCreate = connections.filter((c) => !existingSet.has(c.id))
      const skipped = connections.length - toCreate.length

      if (toCreate.length === 0) {
        return { fiscal_year: targetFiscalYear, generated: 0, skipped }
      }

      const rates = await tx
        .select({
          connectionType: gpWaterConnectionRates.connectionType,
          pipeSizeInch: sql<number>`${gpWaterConnectionRates.pipeSizeInch}::float8`,
          annualPaise: gpWaterConnectionRates.annualPaise,
        })
        .from(gpWaterConnectionRates)
        .where(
          and(
            eq(gpWaterConnectionRates.gpId, gpId),
            eq(gpWaterConnectionRates.fiscalYear, targetFiscalYear)
          )
        )

      const rateByCombo = new Map(
        rates.map((r) => [keyForCombo(r.connectionType, r.pipeSizeInch), r.annualPaise])
      )

      const priorFiscalYear = previousFiscalYear(targetFiscalYear)
      const priorRows = await tx
        .select({
          waterConnectionId: gpWaterConnectionDemands.waterConnectionId,
          priorDuePaise: gpWaterConnectionDemandLines.totalDuePaise,
        })
        .from(gpWaterConnectionDemands)
        .innerJoin(
          gpWaterConnectionDemandLines,
          eq(gpWaterConnectionDemandLines.demandId, gpWaterConnectionDemands.id)
        )
        .where(
          and(
            eq(gpWaterConnectionDemands.gpId, gpId),
            eq(gpWaterConnectionDemands.fiscalYear, priorFiscalYear),
            inArray(
              gpWaterConnectionDemands.waterConnectionId,
              toCreate.map((row) => row.id)
            )
          )
        )

      const priorDueByConnectionId = new Map(
        priorRows.map((r) => [r.waterConnectionId, r.priorDuePaise ?? 0])
      )

      const headers = await tx
        .insert(gpWaterConnectionDemands)
        .values(
          toCreate.map((row) => ({
            gpId,
            waterConnectionId: row.id,
            fiscalYear: targetFiscalYear,
            generatedBy,
          }))
        )
        .onConflictDoNothing({
          target: [
            gpWaterConnectionDemands.gpId,
            gpWaterConnectionDemands.waterConnectionId,
            gpWaterConnectionDemands.fiscalYear,
          ],
        })
        .returning({
          id: gpWaterConnectionDemands.id,
          waterConnectionId: gpWaterConnectionDemands.waterConnectionId,
        })

      if (headers.length === 0) {
        return { fiscal_year: targetFiscalYear, generated: 0, skipped: connections.length }
      }

      const connectionById = new Map(toCreate.map((row) => [row.id, row]))
      const lineValues = headers.map((header) => {
        const connection = connectionById.get(header.waterConnectionId)
        if (!connection) {
          throw new ApiError(500, 'Connection not found for generated demand header')
        }

        const rate = rateByCombo.get(keyForCombo(connection.connectionType, connection.pipeSizeInch))
        if (rate == null) {
          throw new ApiError(
            422,
            `Missing water rate for combination ${connection.connectionType}/${connection.pipeSizeInch}`
          )
        }

        return {
          demandId: header.id,
          previousPaise: priorDueByConnectionId.get(header.waterConnectionId) ?? 0,
          currentPaise: rate,
          paidPaise: 0,
        }
      })

      await tx.insert(gpWaterConnectionDemandLines).values(lineValues)

      return {
        fiscal_year: targetFiscalYear,
        generated: headers.length,
        skipped: skipped + (toCreate.length - headers.length),
      }
    })

    return out
  },

  async list(gpId: string, query: WaterDemandListQuery) {
    const fiscalYear = query.fiscal_year ?? currentFiscalYear()
    const conditions = [
      eq(gpWaterConnectionDemands.gpId, gpId),
      eq(gpWaterConnectionDemands.fiscalYear, fiscalYear),
    ]

    if (query.status) {
      conditions.push(eq(gpWaterConnectionDemandLines.status, query.status))
    }
    if (query.ward) {
      conditions.push(eq(gpCitizens.wardNumber, query.ward))
    }
    if (query.citizen_no) {
      conditions.push(eq(gpCitizens.citizenNo, query.citizen_no))
    }
    if (query.q) {
      const q = `%${query.q}%`
      conditions.push(
        or(
          ilike(gpWaterConnections.consumerNo, q),
          ilike(gpCitizens.nameMr, q),
          ilike(gpCitizens.nameEn, q)
        )!
      )
    }

    const rows = await db
      .select({
        demandId: gpWaterConnectionDemands.id,
        waterConnectionId: gpWaterConnections.id,
        fiscalYear: gpWaterConnectionDemands.fiscalYear,
        generatedAt: gpWaterConnectionDemands.generatedAt,
        consumerNo: gpWaterConnections.consumerNo,
        connectionType: gpWaterConnections.connectionType,
        pipeSizeInch: sql<number>`${gpWaterConnections.pipeSizeInch}::float8`,
        citizenId: gpCitizens.id,
        citizenNo: gpCitizens.citizenNo,
        citizenNameMr: gpCitizens.nameMr,
        citizenNameEn: gpCitizens.nameEn,
        wardNumber: gpCitizens.wardNumber,
        lineId: gpWaterConnectionDemandLines.id,
        previousPaise: gpWaterConnectionDemandLines.previousPaise,
        currentPaise: gpWaterConnectionDemandLines.currentPaise,
        paidPaise: gpWaterConnectionDemandLines.paidPaise,
        totalDuePaise: gpWaterConnectionDemandLines.totalDuePaise,
        status: gpWaterConnectionDemandLines.status,
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
      .where(and(...conditions))
      .orderBy(asc(gpWaterConnections.consumerNo))

    const totals = { previousPaise: 0, currentPaise: 0, paidPaise: 0, totalDuePaise: 0 }
    const items = (rows as WaterDemandRow[]).map((row) => {
      const lineTotalDuePaise =
        row.totalDuePaise ?? Math.max(0, row.previousPaise + row.currentPaise - row.paidPaise)
      totals.previousPaise += row.previousPaise
      totals.currentPaise += row.currentPaise
      totals.paidPaise += row.paidPaise
      totals.totalDuePaise += lineTotalDuePaise

      return {
        demandKind: 'water' as const,
        id: row.demandId,
        fiscalYear: row.fiscalYear,
        generatedAt: row.generatedAt,
        waterConnection: {
          id: row.waterConnectionId,
          consumerNo: row.consumerNo,
          connectionType: row.connectionType,
          pipeSizeInch: row.pipeSizeInch,
        },
        citizen: {
          id: row.citizenId,
          citizenNo: row.citizenNo,
          nameMr: row.citizenNameMr,
          nameEn: row.citizenNameEn,
          wardNumber: row.wardNumber,
        },
        line: {
          id: row.lineId,
          previousPaise: row.previousPaise,
          currentPaise: row.currentPaise,
          paidPaise: row.paidPaise,
          totalDuePaise: lineTotalDuePaise,
          status: normalizeStatus(row.status),
        },
        status: normalizeStatus(row.status),
      }
    })

    return {
      fiscal_year: fiscalYear,
      items,
      count: items.length,
      totals,
    }
  },
}
