import { fromPaise, toPaise } from './money.ts'

/** 1 m² in ft²; used to convert per-sqft RR rates to per-sq.m display (namuna 8). */
export const SQFT_PER_SQM = 10.7639

type NumberLike = number | string | null | undefined

export type TaxCalcPropertyInput = {
  lengthFt: NumberLike
  widthFt: NumberLike
  lightingTaxPaise?: NumberLike
  sanitationTaxPaise?: NumberLike
  waterTaxPaise?: NumberLike
}

export type TaxCalcRateInput = {
  landRatePerSqft: NumberLike
  constructionRatePerSqft: NumberLike
  newConstructionRatePerSqft?: NumberLike
  defaultLightingPaise?: NumberLike
  defaultSanitationPaise?: NumberLike
  defaultWaterPaise?: NumberLike
}

export type TaxCalcOptions = {
  depreciationFactor?: NumberLike
  usageWeightage?: NumberLike
  taxRatePaise?: NumberLike
  useNewConstructionRate?: boolean
}

export type PropertyTaxBreakdown = {
  areaSqFt: number
  areaSqM: number
  landValueRupees: number
  buildingValueRupees: number
  capitalValueRupees: number
  houseTaxRupees: number
  houseTaxPaise: number
  lightingPaise: number
  sanitationPaise: number
  waterPaise: number
  totalPaise: number
  totalRupees: number
}

function toNumber(value: NumberLike, fallback = 0): number {
  if (value == null) return fallback
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function nonNegativeInt(value: NumberLike, fallback = 0): number {
  const rounded = Math.round(toNumber(value, fallback))
  return rounded >= 0 ? rounded : fallback
}

export function calcPropertyTax(
  property: TaxCalcPropertyInput,
  rates: TaxCalcRateInput,
  options: TaxCalcOptions = {}
): PropertyTaxBreakdown {
  const lengthFt = toNumber(property.lengthFt)
  const widthFt = toNumber(property.widthFt)
  const depreciationFactor = toNumber(options.depreciationFactor, 1)
  const usageWeightage = toNumber(options.usageWeightage, 1)
  const taxRatePaise = toNumber(options.taxRatePaise, 0.7)

  const areaSqFt = Math.max(0, lengthFt * widthFt)
  const areaSqM = areaSqFt / SQFT_PER_SQM

  const landRatePerSqft = Math.max(0, toNumber(rates.landRatePerSqft))
  const constructionRatePerSqft = Math.max(
    0,
    toNumber(
      options.useNewConstructionRate ? rates.newConstructionRatePerSqft : rates.constructionRatePerSqft
    )
  )

  const landValueRupees = areaSqFt * landRatePerSqft
  const buildingValueRupees = areaSqFt * constructionRatePerSqft * depreciationFactor * usageWeightage
  const capitalValueRupees = landValueRupees + buildingValueRupees

  // Workbook-aligned: houseTax = capitalValue * taxRatePaise / 1000
  const houseTaxRupees = (capitalValueRupees * taxRatePaise) / 1000
  const houseTaxPaise = Math.max(0, toPaise(houseTaxRupees))

  const lightingPaise = nonNegativeInt(
    property.lightingTaxPaise ?? rates.defaultLightingPaise ?? 0
  )
  const sanitationPaise = nonNegativeInt(
    property.sanitationTaxPaise ?? rates.defaultSanitationPaise ?? 0
  )
  const waterPaise = nonNegativeInt(property.waterTaxPaise ?? rates.defaultWaterPaise ?? 0)

  const totalPaise = houseTaxPaise + lightingPaise + sanitationPaise + waterPaise

  return {
    areaSqFt,
    areaSqM,
    landValueRupees,
    buildingValueRupees,
    capitalValueRupees,
    houseTaxRupees,
    houseTaxPaise,
    lightingPaise,
    sanitationPaise,
    waterPaise,
    totalPaise,
    totalRupees: fromPaise(totalPaise),
  }
}

