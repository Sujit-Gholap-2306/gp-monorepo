import { and, asc, eq, ilike, inArray, ne, or, sql } from 'drizzle-orm'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { db } from '../db/index.ts'
import {
  gpCitizens,
  gpNamuna9DemandLines,
  gpNamuna9Demands,
  gpProperties,
  gpPropertyTypeRates,
} from '../db/schema/index.ts'
import { currentFiscalYear } from '../lib/fiscal.ts'
import { calcPropertyTax } from '../lib/tax-calc.ts'
import { TAX_HEADS, type TaxHead } from '../lib/tax-head.ts'
import type { Namuna9ListQuery, Namuna9Status } from '../types/namuna9.dto.ts'

type GenerateDemandArgs = {
  gpId: string
  generatedBy: string | null
  fiscalYear?: string
}

type PropertyRateRow = {
  id: string
  propertyType: string
  lengthFt: number | null
  widthFt: number | null
  lightingTaxPaise: number | null
  sanitationTaxPaise: number | null
  landRatePerSqft: string | null
  constructionRatePerSqft: string | null
  newConstructionRatePerSqft: string | null
  defaultLightingPaise: number | null
  defaultSanitationPaise: number | null
}

type DemandLineRow = {
  lineId: string
  demandId: string
  generatedAt: Date
  propertyId: string
  propertyNo: string
  propertyType: string
  ownerCitizenNo: number
  ownerNameMr: string
  ownerNameEn: string | null
  wardNumber: string
  taxHead: string
  previousPaise: number
  currentPaise: number
  paidPaise: number
  totalDuePaise: number | null
  status: string | null
}

type DemandLine = {
  id: string
  taxHead: TaxHead
  previousPaise: number
  currentPaise: number
  paidPaise: number
  totalDuePaise: number
  status: Namuna9Status
}

type DemandTotals = {
  previousPaise: number
  currentPaise: number
  paidPaise: number
  totalDuePaise: number
}

type DemandSummary = {
  id: string
  fiscalYear: string
  generatedAt: Date
  property: {
    id: string
    propertyNo: string
    propertyType: string
    wardNumber: string
  }
  owner: {
    citizenNo: number
    nameMr: string
    nameEn: string | null
  }
  lines: DemandLine[]
  totals: DemandTotals
  status: Namuna9Status
}

type CitizenSummary = {
  citizenNo: number
  nameMr: string
  nameEn: string | null
  wardNumber: string
  propertyCount: number
  totals: DemandTotals
  status: Namuna9Status
}

type CitizenAggregateRow = {
  citizenNo: number
  nameMr: string
  nameEn: string | null
  wardNumber: string
  propertyCount: number | string
  previousPaise: number | string
  currentPaise: number | string
  paidPaise: number | string
  totalDuePaise: number | string
}

function isTaxHeadValue(value: string): value is TaxHead {
  return (TAX_HEADS as readonly string[]).includes(value)
}

function rollupStatus(totals: DemandTotals): Namuna9Status {
  const billedPaise = totals.previousPaise + totals.currentPaise
  if (billedPaise <= 0) return 'paid'
  if (totals.paidPaise <= 0) return 'pending'
  if (totals.paidPaise >= billedPaise) return 'paid'
  return 'partial'
}

function groupDemandRows(rows: DemandLineRow[], fiscalYear: string): DemandSummary[] {
  const byDemand = new Map<string, DemandSummary>()

  for (const row of rows) {
    let demand = byDemand.get(row.demandId)
    if (!demand) {
      demand = {
        id: row.demandId,
        fiscalYear,
        generatedAt: row.generatedAt,
        property: {
          id: row.propertyId,
          propertyNo: row.propertyNo,
          propertyType: row.propertyType,
          wardNumber: row.wardNumber,
        },
        owner: {
          citizenNo: row.ownerCitizenNo,
          nameMr: row.ownerNameMr,
          nameEn: row.ownerNameEn,
        },
        lines: [],
        totals: {
          previousPaise: 0,
          currentPaise: 0,
          paidPaise: 0,
          totalDuePaise: 0,
        },
        status: 'pending',
      }
      byDemand.set(row.demandId, demand)
    }

    if (!isTaxHeadValue(row.taxHead)) continue

    const line: DemandLine = {
      id: row.lineId,
      taxHead: row.taxHead,
      previousPaise: row.previousPaise,
      currentPaise: row.currentPaise,
      paidPaise: row.paidPaise,
      totalDuePaise: row.totalDuePaise ?? Math.max(0, row.previousPaise + row.currentPaise - row.paidPaise),
      status: (row.status === 'paid' || row.status === 'partial' || row.status === 'pending')
        ? row.status
        : 'pending',
    }

    demand.lines.push(line)
    demand.totals.previousPaise += line.previousPaise
    demand.totals.currentPaise += line.currentPaise
    demand.totals.paidPaise += line.paidPaise
    demand.totals.totalDuePaise += line.totalDuePaise
  }

  return [...byDemand.values()].map((demand) => ({
    ...demand,
    lines: TAX_HEADS.map((head) => (
      demand.lines.find((line) => line.taxHead === head) ?? {
        id: `${demand.id}:${head}`,
        taxHead: head,
        previousPaise: 0,
        currentPaise: 0,
        paidPaise: 0,
        totalDuePaise: 0,
        status: 'paid' as Namuna9Status,
      }
    )),
    status: rollupStatus(demand.totals),
  }))
}

function toCitizenSummary(row: CitizenAggregateRow): CitizenSummary {
  const totals: DemandTotals = {
    previousPaise: Number(row.previousPaise),
    currentPaise: Number(row.currentPaise),
    paidPaise: Number(row.paidPaise),
    totalDuePaise: Number(row.totalDuePaise),
  }

  return {
    citizenNo: row.citizenNo,
    nameMr: row.nameMr,
    nameEn: row.nameEn,
    wardNumber: row.wardNumber,
    propertyCount: Number(row.propertyCount),
    totals,
    status: rollupStatus(totals),
  }
}

async function preFilterDemandIdsByStatus(
  gpId: string,
  fiscalYear: string,
  status: Namuna9Status
): Promise<string[]> {
  const prev = gpNamuna9DemandLines.previousPaise
  const curr = gpNamuna9DemandLines.currentPaise
  const paid = gpNamuna9DemandLines.paidPaise

  const havingCond =
    status === 'pending'
      ? sql`SUM(${prev} + ${curr}) > 0 AND SUM(${paid}) <= 0`
      : status === 'paid'
      ? sql`(SUM(${prev} + ${curr}) <= 0 OR SUM(${paid}) >= SUM(${prev} + ${curr}))`
      : sql`SUM(${prev} + ${curr}) > 0 AND SUM(${paid}) > 0 AND SUM(${paid}) < SUM(${prev} + ${curr})`

  const rows = await db
    .select({ demandId: gpNamuna9DemandLines.demandId })
    .from(gpNamuna9DemandLines)
    .innerJoin(gpNamuna9Demands, eq(gpNamuna9DemandLines.demandId, gpNamuna9Demands.id))
    .where(and(eq(gpNamuna9Demands.gpId, gpId), eq(gpNamuna9Demands.fiscalYear, fiscalYear)))
    .groupBy(gpNamuna9DemandLines.demandId)
    .having(havingCond)

  return rows.map((row) => row.demandId)
}

async function selectDemandRows(
  gpId: string,
  fiscalYear: string,
  filters: Pick<Namuna9ListQuery, 'ward' | 'q' | 'citizenNo' | 'propertyId'> & { demandId?: string; demandIds?: string[] } = {}
): Promise<DemandLineRow[]> {
  const conditions = [
    eq(gpNamuna9Demands.gpId, gpId),
    eq(gpNamuna9Demands.fiscalYear, fiscalYear),
  ]

  if (filters.demandId) {
    conditions.push(eq(gpNamuna9Demands.id, filters.demandId))
  }
  if (filters.demandIds) {
    conditions.push(inArray(gpNamuna9Demands.id, filters.demandIds))
  }
  if (filters.ward) {
    conditions.push(eq(gpCitizens.wardNumber, filters.ward))
  }
  if (filters.citizenNo) {
    conditions.push(eq(gpCitizens.citizenNo, filters.citizenNo))
  }
  if (filters.propertyId) {
    conditions.push(eq(gpProperties.id, filters.propertyId))
  }
  if (filters.q) {
    const q = `%${filters.q}%`
    conditions.push(
      or(
        ilike(gpProperties.propertyNo, q),
        ilike(gpCitizens.nameMr, q),
        ilike(gpCitizens.nameEn, q)
      )!
    )
  }

  return db
    .select({
      demandId: gpNamuna9Demands.id,
      lineId: gpNamuna9DemandLines.id,
      generatedAt: gpNamuna9Demands.generatedAt,
      propertyId: gpProperties.id,
      propertyNo: gpProperties.propertyNo,
      propertyType: gpProperties.propertyType,
      ownerCitizenNo: gpCitizens.citizenNo,
      ownerNameMr: gpCitizens.nameMr,
      ownerNameEn: gpCitizens.nameEn,
      wardNumber: gpCitizens.wardNumber,
      taxHead: gpNamuna9DemandLines.taxHead,
      previousPaise: gpNamuna9DemandLines.previousPaise,
      currentPaise: gpNamuna9DemandLines.currentPaise,
      paidPaise: gpNamuna9DemandLines.paidPaise,
      totalDuePaise: gpNamuna9DemandLines.totalDuePaise,
      status: gpNamuna9DemandLines.status,
    })
    .from(gpNamuna9Demands)
    .innerJoin(gpProperties, eq(gpNamuna9Demands.propertyId, gpProperties.id))
    .innerJoin(gpCitizens, eq(gpProperties.ownerCitizenId, gpCitizens.id))
    .innerJoin(gpNamuna9DemandLines, eq(gpNamuna9DemandLines.demandId, gpNamuna9Demands.id))
    .where(and(...conditions))
    .orderBy(asc(gpProperties.propertyNo), asc(gpNamuna9DemandLines.taxHead))
}

async function selectCitizenAggregateRows(
  gpId: string,
  fiscalYear: string,
  filters: Pick<Namuna9ListQuery, 'ward' | 'q' | 'status'>
): Promise<CitizenAggregateRow[]> {
  const billedExpr = sql<number>`SUM(${gpNamuna9DemandLines.previousPaise} + ${gpNamuna9DemandLines.currentPaise})`
  const paidExpr = sql<number>`SUM(${gpNamuna9DemandLines.paidPaise})`

  const conditions = [
    eq(gpNamuna9Demands.gpId, gpId),
    eq(gpNamuna9Demands.fiscalYear, fiscalYear),
  ]

  if (filters.ward) {
    conditions.push(eq(gpCitizens.wardNumber, filters.ward))
  }
  if (filters.q) {
    const q = `%${filters.q}%`
    conditions.push(
      or(
        ilike(gpCitizens.nameMr, q),
        ilike(gpCitizens.nameEn, q)
      )!
    )
  }

  let havingClause
  if (filters.status === 'pending') {
    havingClause = sql`${billedExpr} > 0 AND ${paidExpr} <= 0`
  } else if (filters.status === 'paid') {
    havingClause = sql`(${billedExpr} <= 0 OR ${paidExpr} >= ${billedExpr})`
  } else if (filters.status === 'partial') {
    havingClause = sql`${billedExpr} > 0 AND ${paidExpr} > 0 AND ${paidExpr} < ${billedExpr}`
  }

  const baseQuery = db
    .select({
      citizenNo: gpCitizens.citizenNo,
      nameMr: gpCitizens.nameMr,
      nameEn: gpCitizens.nameEn,
      wardNumber: gpCitizens.wardNumber,
      propertyCount: sql<number>`COUNT(DISTINCT ${gpProperties.id})`,
      previousPaise: sql<number>`COALESCE(SUM(${gpNamuna9DemandLines.previousPaise}), 0)`,
      currentPaise: sql<number>`COALESCE(SUM(${gpNamuna9DemandLines.currentPaise}), 0)`,
      paidPaise: sql<number>`COALESCE(SUM(${gpNamuna9DemandLines.paidPaise}), 0)`,
      totalDuePaise: sql<number>`COALESCE(SUM(${gpNamuna9DemandLines.totalDuePaise}), 0)`,
    })
    .from(gpNamuna9Demands)
    .innerJoin(gpProperties, eq(gpNamuna9Demands.propertyId, gpProperties.id))
    .innerJoin(gpCitizens, eq(gpProperties.ownerCitizenId, gpCitizens.id))
    .innerJoin(gpNamuna9DemandLines, eq(gpNamuna9DemandLines.demandId, gpNamuna9Demands.id))
    .where(and(...conditions))
    .groupBy(gpCitizens.id, gpCitizens.citizenNo, gpCitizens.nameMr, gpCitizens.nameEn, gpCitizens.wardNumber)

  if (havingClause) {
    return baseQuery.having(havingClause).orderBy(asc(gpCitizens.citizenNo))
  }

  return baseQuery.orderBy(asc(gpCitizens.citizenNo))
}

function assertCurrentFiscalYearOnly(requestedFiscalYear: string): void {
  const currentFy = currentFiscalYear()
  if (requestedFiscalYear !== currentFy) {
    throw new ApiError(422, `सध्या फक्त चालू आर्थिक वर्षासाठी (${currentFy}) मागणी तयार करता येते`)
  }
}

/**
 * Carry-forward of `previous_paise` from prior-FY demand-lines is not yet
 * implemented (planned in tax-chain plan §3B.2 step 2). Until then, refuse
 * to generate a new FY if any prior-FY demand-line exists for this GP —
 * otherwise we would silently zero out arrears.
 */
async function assertNoPriorFyDemands(
  gpId: string,
  targetFiscalYear: string
): Promise<void> {
  const [prior] = await db
    .select({ id: gpNamuna9Demands.id })
    .from(gpNamuna9Demands)
    .where(
      and(
        eq(gpNamuna9Demands.gpId, gpId),
        ne(gpNamuna9Demands.fiscalYear, targetFiscalYear)
      )
    )
    .limit(1)
  if (prior) {
    throw new ApiError(
      409,
      'मागील वर्षाच्या मागण्या सापडल्या; carry-forward अंमलबजावणी होईपर्यंत नवीन वर्ष तयार करता येणार नाही'
    )
  }
}

export const namuna9Service = {
  async list(gpId: string, filters: Namuna9ListQuery) {
    const fiscalYear = filters.fiscalYear ?? currentFiscalYear()
    const emptyTotals: DemandTotals = { previousPaise: 0, currentPaise: 0, paidPaise: 0, totalDuePaise: 0 }

    let demandIds: string[] | undefined
    if (filters.status) {
      demandIds = await preFilterDemandIdsByStatus(gpId, fiscalYear, filters.status)
      if (demandIds.length === 0) {
        return { fiscalYear, items: [], count: 0, totals: emptyTotals }
      }
    }

    const rows = await selectDemandRows(gpId, fiscalYear, { ...filters, demandIds })
    const items = groupDemandRows(rows, fiscalYear)

    return {
      fiscalYear,
      items,
      count: items.length,
      totals: items.reduce<DemandTotals>(
        (acc, item) => ({
          previousPaise: acc.previousPaise + item.totals.previousPaise,
          currentPaise: acc.currentPaise + item.totals.currentPaise,
          paidPaise: acc.paidPaise + item.totals.paidPaise,
          totalDuePaise: acc.totalDuePaise + item.totals.totalDuePaise,
        }),
        emptyTotals
      ),
    }
  },

  async getById(gpId: string, demandId: string) {
    const [header] = await db
      .select({ fiscalYear: gpNamuna9Demands.fiscalYear })
      .from(gpNamuna9Demands)
      .where(and(eq(gpNamuna9Demands.gpId, gpId), eq(gpNamuna9Demands.id, demandId)))
      .limit(1)

    if (!header) {
      throw new ApiError(404, 'Namuna 9 demand not found')
    }

    const rows = await selectDemandRows(gpId, header.fiscalYear, { demandId })
    const [demand] = groupDemandRows(rows, header.fiscalYear)
    if (!demand) {
      throw new ApiError(404, 'Namuna 9 demand lines not found')
    }

    return demand
  },

  async listCitizens(gpId: string, filters: Namuna9ListQuery) {
    const fiscalYear = filters.fiscalYear ?? currentFiscalYear()
    const emptyTotals: DemandTotals = { previousPaise: 0, currentPaise: 0, paidPaise: 0, totalDuePaise: 0 }
    const rows = await selectCitizenAggregateRows(gpId, fiscalYear, filters)
    const items = rows.map(toCitizenSummary)

    return {
      fiscalYear,
      items,
      count: items.length,
      totals: items.reduce<DemandTotals>(
        (acc, item) => ({
          previousPaise: acc.previousPaise + item.totals.previousPaise,
          currentPaise: acc.currentPaise + item.totals.currentPaise,
          paidPaise: acc.paidPaise + item.totals.paidPaise,
          totalDuePaise: acc.totalDuePaise + item.totals.totalDuePaise,
        }),
        emptyTotals
      ),
    }
  },

  async generate({ gpId, generatedBy, fiscalYear }: GenerateDemandArgs) {
    const targetFiscalYear = fiscalYear ?? currentFiscalYear()
    assertCurrentFiscalYearOnly(targetFiscalYear)
    await assertNoPriorFyDemands(gpId, targetFiscalYear)

    const result = await db.transaction(async (tx) => {
      const properties = await tx
        .select({
          id: gpProperties.id,
          propertyType: gpProperties.propertyType,
          lengthFt: gpProperties.lengthFt,
          widthFt: gpProperties.widthFt,
          lightingTaxPaise: gpProperties.lightingTaxPaise,
          sanitationTaxPaise: gpProperties.sanitationTaxPaise,
          landRatePerSqft: gpPropertyTypeRates.landRatePerSqft,
          constructionRatePerSqft: gpPropertyTypeRates.constructionRatePerSqft,
          newConstructionRatePerSqft: gpPropertyTypeRates.newConstructionRatePerSqft,
          defaultLightingPaise: gpPropertyTypeRates.defaultLightingPaise,
          defaultSanitationPaise: gpPropertyTypeRates.defaultSanitationPaise,
        })
        .from(gpProperties)
        .leftJoin(
          gpPropertyTypeRates,
          and(
            eq(gpPropertyTypeRates.gpId, gpId),
            eq(gpPropertyTypeRates.propertyType, gpProperties.propertyType)
          )
        )
        .where(eq(gpProperties.gpId, gpId))

      if (properties.length === 0) {
        return { fiscalYear: targetFiscalYear, headersGenerated: 0, headersSkipped: 0, totalDemandPaise: 0 }
      }

      // Batch-insert all demand headers in one round-trip.
      // onConflictDoNothing only returns actually-inserted rows, so
      // headersSkipped = properties.length - insertedHeaders.length.
      const insertedHeaders = await tx
        .insert(gpNamuna9Demands)
        .values(
          (properties as PropertyRateRow[]).map((row) => ({
            gpId,
            propertyId: row.id,
            fiscalYear: targetFiscalYear,
            generatedBy,
          }))
        )
        .onConflictDoNothing({
          target: [gpNamuna9Demands.gpId, gpNamuna9Demands.propertyId, gpNamuna9Demands.fiscalYear],
        })
        .returning({ id: gpNamuna9Demands.id, propertyId: gpNamuna9Demands.propertyId })

      const headersGenerated = insertedHeaders.length
      const headersSkipped = properties.length - headersGenerated

      if (headersGenerated === 0) {
        return { fiscalYear: targetFiscalYear, headersGenerated: 0, headersSkipped, totalDemandPaise: 0 }
      }

      // Calculate tax for each new demand in memory (pure), then batch-insert
      // all lines in one round-trip.
      const demandIdByPropertyId = new Map(insertedHeaders.map((h) => [h.propertyId, h.id]))
      const allLines: Array<{
        demandId: string
        taxHead: string
        previousPaise: number
        currentPaise: number
        paidPaise: number
      }> = []
      let totalDemandPaise = 0

      for (const row of properties as PropertyRateRow[]) {
        const demandId = demandIdByPropertyId.get(row.id)
        if (!demandId) continue

        const breakdown = calcPropertyTax(
          {
            lengthFt: row.lengthFt,
            widthFt: row.widthFt,
            lightingTaxPaise: row.lightingTaxPaise,
            sanitationTaxPaise: row.sanitationTaxPaise,
          },
          {
            landRatePerSqft: row.landRatePerSqft,
            constructionRatePerSqft: row.constructionRatePerSqft,
            newConstructionRatePerSqft: row.newConstructionRatePerSqft,
            defaultLightingPaise: row.defaultLightingPaise,
            defaultSanitationPaise: row.defaultSanitationPaise,
          },
          { useNewConstructionRate: row.propertyType === 'navi_rcc' }
        )

        totalDemandPaise += breakdown.totalPaise
        allLines.push(
          { demandId, taxHead: TAX_HEADS[0], previousPaise: 0, currentPaise: breakdown.houseTaxPaise, paidPaise: 0 },
          { demandId, taxHead: TAX_HEADS[1], previousPaise: 0, currentPaise: breakdown.lightingPaise, paidPaise: 0 },
          { demandId, taxHead: TAX_HEADS[2], previousPaise: 0, currentPaise: breakdown.sanitationPaise, paidPaise: 0 },
        )
      }

      await tx.insert(gpNamuna9DemandLines).values(allLines)

      return {
        fiscalYear: targetFiscalYear,
        headersGenerated,
        headersSkipped,
        totalDemandPaise,
      }
    })

    return result
  },
}
