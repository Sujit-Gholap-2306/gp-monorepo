import { describe, it, expect } from 'vitest'
import { calcPropertyTax } from '../../src/lib/tax-calc.ts'

const BASE_RATES = {
  landRatePerSqft: 120,
  constructionRatePerSqft: 180,
  defaultLightingPaise: 2500,
  defaultSanitationPaise: 2500,
  defaultWaterPaise: 36000,
}

const BASE_OPTIONS = {
  depreciationFactor: 1,
  usageWeightage: 1,
  taxRatePaise: 0.7,
}

describe('calcPropertyTax — golden master (Balsane row 10-12)', () => {
  it('computes correct house tax for 20×30 ft property', () => {
    const result = calcPropertyTax(
      { lengthFt: 20, widthFt: 30 },
      BASE_RATES,
      BASE_OPTIONS,
    )

    // area = 600 sqft
    // landValue = 600 × 120 = 72000
    // buildingValue = 600 × 180 × 1 × 1 = 108000
    // capitalValue = 180000
    // houseTax rupees = 180000 × 0.7 / 1000 = 126
    // houseTaxPaise = toPaise(126) = 12600
    expect(result.areaSqFt).toBe(600)
    expect(result.capitalValueRupees).toBe(180000)
    expect(result.houseTaxPaise).toBe(12600)
    expect(result.lightingPaise).toBe(2500)
    expect(result.sanitationPaise).toBe(2500)
    expect(result.waterPaise).toBe(36000)
    expect(result.totalPaise).toBe(12600 + 2500 + 2500 + 36000)
  })

  it('totalPaise equals sum of all 4 heads', () => {
    const result = calcPropertyTax({ lengthFt: 15, widthFt: 25 }, BASE_RATES, BASE_OPTIONS)
    expect(result.totalPaise).toBe(
      result.houseTaxPaise + result.lightingPaise + result.sanitationPaise + result.waterPaise
    )
  })
})

describe('calcPropertyTax — property-level override wins over GP default', () => {
  it('property lighting override wins', () => {
    const result = calcPropertyTax(
      { lengthFt: 10, widthFt: 10, lightingTaxPaise: 1000 },
      { ...BASE_RATES, defaultLightingPaise: 2500 },
      BASE_OPTIONS,
    )
    expect(result.lightingPaise).toBe(1000)
  })

  it('property override 0 wins (not coerced to default)', () => {
    const result = calcPropertyTax(
      { lengthFt: 10, widthFt: 10, waterTaxPaise: 0 },
      { ...BASE_RATES, defaultWaterPaise: 500 },
      BASE_OPTIONS,
    )
    expect(result.waterPaise).toBe(0)
  })

  it('null property override falls back to GP default', () => {
    const result = calcPropertyTax(
      { lengthFt: 10, widthFt: 10, sanitationTaxPaise: null },
      { ...BASE_RATES, defaultSanitationPaise: 1500 },
      BASE_OPTIONS,
    )
    expect(result.sanitationPaise).toBe(1500)
  })
})

describe('calcPropertyTax — edge cases', () => {
  it('zero area gives zero house tax', () => {
    const result = calcPropertyTax({ lengthFt: 0, widthFt: 30 }, BASE_RATES, BASE_OPTIONS)
    expect(result.houseTaxPaise).toBe(0)
    expect(result.areaSqFt).toBe(0)
  })

  it('null dimensions treated as 0', () => {
    const result = calcPropertyTax({ lengthFt: null, widthFt: null }, BASE_RATES, BASE_OPTIONS)
    expect(result.areaSqFt).toBe(0)
    expect(result.houseTaxPaise).toBe(0)
  })

  it('string numeric inputs accepted', () => {
    const result = calcPropertyTax(
      { lengthFt: '20', widthFt: '30' },
      { ...BASE_RATES, landRatePerSqft: '120', constructionRatePerSqft: '180' },
      { ...BASE_OPTIONS, taxRatePaise: '0.7' },
    )
    expect(result.houseTaxPaise).toBe(12600)
  })

  it('useNewConstructionRate option switches rate', () => {
    const standard = calcPropertyTax(
      { lengthFt: 10, widthFt: 10 },
      { ...BASE_RATES, newConstructionRatePerSqft: 300 },
      { ...BASE_OPTIONS, useNewConstructionRate: false },
    )
    const newConst = calcPropertyTax(
      { lengthFt: 10, widthFt: 10 },
      { ...BASE_RATES, newConstructionRatePerSqft: 300 },
      { ...BASE_OPTIONS, useNewConstructionRate: true },
    )
    expect(newConst.houseTaxPaise).toBeGreaterThan(standard.houseTaxPaise)
  })

  it('depreciation factor reduces building value', () => {
    const full = calcPropertyTax({ lengthFt: 10, widthFt: 10 }, BASE_RATES, { ...BASE_OPTIONS, depreciationFactor: 1 })
    const half = calcPropertyTax({ lengthFt: 10, widthFt: 10 }, BASE_RATES, { ...BASE_OPTIONS, depreciationFactor: 0.5 })
    expect(half.houseTaxPaise).toBeLessThan(full.houseTaxPaise)
  })

  it('defaults: missing rates treated as 0 (no throw)', () => {
    expect(() => calcPropertyTax(
      { lengthFt: 10, widthFt: 10 },
      { landRatePerSqft: null, constructionRatePerSqft: null },
      {},
    )).not.toThrow()
  })
})

describe('calcPropertyTax — returned shape', () => {
  it('returns all expected fields', () => {
    const result = calcPropertyTax({ lengthFt: 10, widthFt: 10 }, BASE_RATES, BASE_OPTIONS)
    expect(result).toMatchObject({
      areaSqFt: expect.any(Number),
      areaSqM: expect.any(Number),
      landValueRupees: expect.any(Number),
      buildingValueRupees: expect.any(Number),
      capitalValueRupees: expect.any(Number),
      houseTaxRupees: expect.any(Number),
      houseTaxPaise: expect.any(Number),
      lightingPaise: expect.any(Number),
      sanitationPaise: expect.any(Number),
      waterPaise: expect.any(Number),
      totalPaise: expect.any(Number),
      totalRupees: expect.any(Number),
    })
  })

  it('totalRupees = totalPaise / 100', () => {
    const result = calcPropertyTax({ lengthFt: 20, widthFt: 30 }, BASE_RATES, BASE_OPTIONS)
    expect(result.totalRupees).toBeCloseTo(result.totalPaise / 100, 5)
  })
})
