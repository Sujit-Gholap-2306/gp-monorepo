import { and, eq, ilike, or } from 'drizzle-orm'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { db } from '../db/index.ts'
import { gpCitizens, gpProperties, gpPropertyTypeRates } from '../db/schema/index.ts'
import { PROPERTY_TYPE_KEYS } from '../db/schema/property-type-rates.ts'
import { calcPropertyTax, SQFT_PER_SQM } from '../lib/tax-calc.ts'
import type { Namuna8ListQuery } from '../types/namuna8.dto.ts'

type PropertyRateRow = {
  propertyId: string
  propertyNo: string
  propertyType: string
  surveyNumber: string | null
  plotOrGat: string | null
  lengthFt: number | null
  widthFt: number | null
  ageBracket: string | null
  occupantName: string
  resolutionRef: string | null
  assessmentDate: string | null
  assessmentInputs: Record<string, unknown> | null
  lightingTaxPaise: number | null
  sanitationTaxPaise: number | null
  waterTaxPaise: number | null
  ownerCitizenId: string
  ownerNameMr: string
  ownerNameEn: string | null
  ownerCitizenNo: number
  wardNumber: string
  ratePropertyType: string | null
  landRatePerSqft: string | null
  constructionRatePerSqft: string | null
  newConstructionRatePerSqft: string | null
  defaultLightingPaise: number | null
  defaultSanitationPaise: number | null
  defaultWaterPaise: number | null
}

const RECOMMENDED_TAX_RATE_PAISE = 0.7

type RateMasterStatus = {
  isComplete: boolean
  missingPropertyTypes: string[]
  incompletePropertyTypes: string[]
}

function parseAssessmentNumber(
  input: Record<string, unknown> | null,
  key: string
): number | undefined {
  if (!input || !(key in input)) return undefined
  const value = input[key]
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function toRateNumber(value: string | null | undefined): number {
  if (value == null || value === '') return 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

/** RR in ₹ per m² (workbook: rate is stored per ft² in DB). */
function perSqMFromPerSqft(perSqft: string | null | undefined): number {
  return toRateNumber(perSqft) * SQFT_PER_SQM
}

function mapNamuna8Row(row: PropertyRateRow) {
  const depreciationFactor = parseAssessmentNumber(row.assessmentInputs, 'depreciation_factor')
  const usageWeightage = parseAssessmentNumber(row.assessmentInputs, 'usage_weightage')
  const taxRatePaise = parseAssessmentNumber(row.assessmentInputs, 'tax_rate_paise')
  const effTaxRatePaise = taxRatePaise ?? RECOMMENDED_TAX_RATE_PAISE

  const breakdown = calcPropertyTax(
    {
      lengthFt: row.lengthFt,
      widthFt: row.widthFt,
      lightingTaxPaise: row.lightingTaxPaise,
      sanitationTaxPaise: row.sanitationTaxPaise,
      waterTaxPaise: row.waterTaxPaise,
    },
    {
      landRatePerSqft: row.landRatePerSqft,
      constructionRatePerSqft: row.constructionRatePerSqft,
      newConstructionRatePerSqft: row.newConstructionRatePerSqft,
      defaultLightingPaise: row.defaultLightingPaise,
      defaultSanitationPaise: row.defaultSanitationPaise,
      defaultWaterPaise: row.defaultWaterPaise,
    },
    {
      depreciationFactor,
      usageWeightage,
      taxRatePaise: effTaxRatePaise,
      useNewConstructionRate: row.propertyType === 'navi_rcc',
    }
  )

  const landRrPerSqM = perSqMFromPerSqft(row.landRatePerSqft)
  const imaratRrPerSqM = perSqMFromPerSqft(row.constructionRatePerSqft)
  const newCons = toRateNumber(row.newConstructionRatePerSqft)
  const bandhkamRrPerSqM = newCons > 0 ? newCons * SQFT_PER_SQM : null

  return {
    id: row.propertyId,
    propertyNo: row.propertyNo,
    propertyType: row.propertyType,
    wardNumber: row.wardNumber,
    owner: {
      citizenId: row.ownerCitizenId,
      citizenNo: row.ownerCitizenNo,
      nameMr: row.ownerNameMr,
      nameEn: row.ownerNameEn,
    },
    occupantName: row.occupantName,
    surveyNumber: row.surveyNumber,
    plotOrGat: row.plotOrGat,
    resolutionRef: row.resolutionRef,
    assessmentDate: row.assessmentDate,
    ageBracket: row.ageBracket,
    dimensions: {
      lengthFt: row.lengthFt,
      widthFt: row.widthFt,
    },
    readyReckonerPerSqM: {
      land: landRrPerSqM,
      imarat: imaratRrPerSqM,
      bandhkam: bandhkamRrPerSqM,
    },
    assessment: {
      depreciationFactor: depreciationFactor ?? 1,
      usageWeightage: usageWeightage ?? 1,
      taxRatePaise: effTaxRatePaise,
    },
    area: {
      sqFt: breakdown.areaSqFt,
      sqM: breakdown.areaSqM,
    },
    valuation: {
      landValueRupees: breakdown.landValueRupees,
      buildingValueRupees: breakdown.buildingValueRupees,
      capitalValueRupees: breakdown.capitalValueRupees,
    },
    heads: {
      housePaise: breakdown.houseTaxPaise,
      lightingPaise: breakdown.lightingPaise,
      sanitationPaise: breakdown.sanitationPaise,
      waterPaise: breakdown.waterPaise,
      totalPaise: breakdown.totalPaise,
      houseRupees: breakdown.houseTaxRupees,
      totalRupees: breakdown.totalRupees,
    },
    rateConfigured: Boolean(row.ratePropertyType),
  }
}

function isNullish(value: unknown): boolean { //
  return value === null || value === undefined
}

type RateRowForStatus = {
  propertyType: string
  landRatePerSqft: string | null
  constructionRatePerSqft: string | null
  newConstructionRatePerSqft: string | null
  defaultLightingPaise: number | null
  defaultSanitationPaise: number | null
  defaultWaterPaise: number | null
}

/** True when a rate-master row is missing a field required for that property type. */
function isIncompleteRateRow(r: RateRowForStatus): boolean {
  if (
    isNullish(r.landRatePerSqft)
    || isNullish(r.constructionRatePerSqft)
    || isNullish(r.defaultLightingPaise)
    || isNullish(r.defaultSanitationPaise)
    || isNullish(r.defaultWaterPaise)
  ) {
    return true
  }
  // N08 uses new-construction per sqft for imarat (building) for navi_rcc — same as tax-calc.
  if (r.propertyType === 'navi_rcc') {
    if (isNullish(r.newConstructionRatePerSqft)) return true
    if (toRateNumber(r.newConstructionRatePerSqft) <= 0) return true
  }
  return false
}

async function getRateMasterStatus(gpId: string): Promise<RateMasterStatus> {
  const rows = await db
    .select({
      propertyType: gpPropertyTypeRates.propertyType,
      landRatePerSqft: gpPropertyTypeRates.landRatePerSqft,
      constructionRatePerSqft: gpPropertyTypeRates.constructionRatePerSqft,
      newConstructionRatePerSqft: gpPropertyTypeRates.newConstructionRatePerSqft,
      defaultLightingPaise: gpPropertyTypeRates.defaultLightingPaise,
      defaultSanitationPaise: gpPropertyTypeRates.defaultSanitationPaise,
      defaultWaterPaise: gpPropertyTypeRates.defaultWaterPaise,
    })
    .from(gpPropertyTypeRates)
    .where(eq(gpPropertyTypeRates.gpId, gpId))

  const configured = new Set(rows.map((r) => r.propertyType))
  const missing = PROPERTY_TYPE_KEYS.filter((key) => !configured.has(key))

  const incomplete = rows
    .filter((r) => isIncompleteRateRow(r as RateRowForStatus))
    .map((r) => r.propertyType)

  return {
    isComplete: missing.length === 0 && incomplete.length === 0,
    missingPropertyTypes: missing,
    incompletePropertyTypes: incomplete,
  }
}

const baseSelect = {
  propertyId: gpProperties.id,
  propertyNo: gpProperties.propertyNo,
  propertyType: gpProperties.propertyType,
  surveyNumber: gpProperties.surveyNumber,
  plotOrGat: gpProperties.plotOrGat,
  lengthFt: gpProperties.lengthFt,
  widthFt: gpProperties.widthFt,
  ageBracket: gpProperties.ageBracket,
  occupantName: gpProperties.occupantName,
  resolutionRef: gpProperties.resolutionRef,
  assessmentDate: gpProperties.assessmentDate,
  assessmentInputs: gpProperties.assessmentInputs,
  lightingTaxPaise: gpProperties.lightingTaxPaise,
  sanitationTaxPaise: gpProperties.sanitationTaxPaise,
  waterTaxPaise: gpProperties.waterTaxPaise,
  ownerCitizenId: gpCitizens.id,
  ownerNameMr: gpCitizens.nameMr,
  ownerNameEn: gpCitizens.nameEn,
  ownerCitizenNo: gpCitizens.citizenNo,
  wardNumber: gpCitizens.wardNumber,
  ratePropertyType: gpPropertyTypeRates.propertyType,
  landRatePerSqft: gpPropertyTypeRates.landRatePerSqft,
  constructionRatePerSqft: gpPropertyTypeRates.constructionRatePerSqft,
  newConstructionRatePerSqft: gpPropertyTypeRates.newConstructionRatePerSqft,
  defaultLightingPaise: gpPropertyTypeRates.defaultLightingPaise,
  defaultSanitationPaise: gpPropertyTypeRates.defaultSanitationPaise,
  defaultWaterPaise: gpPropertyTypeRates.defaultWaterPaise,
}

export const namuna8Service = {
  async list(gpId: string, filters: Namuna8ListQuery) {
    const rateMaster = await getRateMasterStatus(gpId)

    const conditions = [eq(gpProperties.gpId, gpId)]
    if (filters.ward) {
      conditions.push(eq(gpCitizens.wardNumber, filters.ward))
    }
    if (filters.propertyType) {
      conditions.push(eq(gpProperties.propertyType, filters.propertyType))
    }
    if (filters.q) {
      const q = `%${filters.q}%`
      conditions.push(
        or(
          ilike(gpProperties.propertyNo, q),
          ilike(gpCitizens.nameMr, q),
          ilike(gpProperties.occupantName, q)
        )!
      )
    }

    const rows = await db
      .select(baseSelect)
      .from(gpProperties)
      .innerJoin(gpCitizens, eq(gpProperties.ownerCitizenId, gpCitizens.id))
      .leftJoin(
        gpPropertyTypeRates,
        and(
          eq(gpPropertyTypeRates.gpId, gpId),
          eq(gpPropertyTypeRates.propertyType, gpProperties.propertyType)
        )
      )
      .where(and(...conditions))

    return {
      items: rows.map((row) => mapNamuna8Row(row as PropertyRateRow)),
      count: rows.length,
      rateMaster,
    }
  },

  async getByPropertyId(gpId: string, propertyId: string) {
    const rateMaster = await getRateMasterStatus(gpId)

    const [row] = await db
      .select(baseSelect)
      .from(gpProperties)
      .innerJoin(gpCitizens, eq(gpProperties.ownerCitizenId, gpCitizens.id))
      .leftJoin(
        gpPropertyTypeRates,
        and(
          eq(gpPropertyTypeRates.gpId, gpId),
          eq(gpPropertyTypeRates.propertyType, gpProperties.propertyType)
        )
      )
      .where(and(eq(gpProperties.gpId, gpId), eq(gpProperties.id, propertyId)))

    if (!row) {
      throw new ApiError(404, 'Property not found')
    }

    return {
      ...mapNamuna8Row(row as PropertyRateRow),
      rateMaster,
    }
  },
}
