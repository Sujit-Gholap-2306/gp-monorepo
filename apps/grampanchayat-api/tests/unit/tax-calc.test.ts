import { describe, it, expect } from 'vitest'
import { calcPropertyTax } from '../../src/lib/tax-calc.ts'

const BASE_RATES = {
  landRatePerSqft: 120,
  constructionRatePerSqft: 180,
  defaultLightingPaise: 2500,
  defaultSanitationPaise: 2500,
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
    expect(result.totalPaise).toBe(12600 + 2500 + 2500)
  })

  it('totalPaise equals sum of house + lighting + sanitation', () => {
    const result = calcPropertyTax({ lengthFt: 15, widthFt: 25 }, BASE_RATES, BASE_OPTIONS)
    expect(result.totalPaise).toBe(
      result.houseTaxPaise + result.lightingPaise + result.sanitationPaise
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
      { lengthFt: 10, widthFt: 10, sanitationTaxPaise: 0 },
      { ...BASE_RATES, defaultSanitationPaise: 500 },
      BASE_OPTIONS,
    )
    expect(result.sanitationPaise).toBe(0)
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

describe('calcPropertyTax — property type rate selection', () => {
  it('standard type uses constructionRatePerSqft', () => {
    const result = calcPropertyTax(
      { lengthFt: 10, widthFt: 10 },
      { ...BASE_RATES, newConstructionRatePerSqft: 300 },
      { ...BASE_OPTIONS, useNewConstructionRate: false },
    )
    // buildingValue = 100 × 180 = 18000; capitalValue = 100×120 + 18000 = 30000
    expect(result.buildingValueRupees).toBe(18000)
    expect(result.capitalValueRupees).toBe(30000)
  })

  it('navi_rcc (useNewConstructionRate) uses newConstructionRatePerSqft', () => {
    const result = calcPropertyTax(
      { lengthFt: 10, widthFt: 10 },
      { ...BASE_RATES, newConstructionRatePerSqft: 300 },
      { ...BASE_OPTIONS, useNewConstructionRate: true },
    )
    // buildingValue = 100 × 300 = 30000; capitalValue = 12000 + 30000 = 42000
    expect(result.buildingValueRupees).toBe(30000)
    expect(result.capitalValueRupees).toBe(42000)
  })

  it('navi_rcc house tax is higher than standard for same area', () => {
    const standard = calcPropertyTax(
      { lengthFt: 10, widthFt: 10 },
      { ...BASE_RATES, newConstructionRatePerSqft: 300 },
      { ...BASE_OPTIONS, useNewConstructionRate: false },
    )
    const naviRcc = calcPropertyTax(
      { lengthFt: 10, widthFt: 10 },
      { ...BASE_RATES, newConstructionRatePerSqft: 300 },
      { ...BASE_OPTIONS, useNewConstructionRate: true },
    )
    expect(naviRcc.houseTaxPaise).toBeGreaterThan(standard.houseTaxPaise)
  })

  it('missing newConstructionRatePerSqft falls back to 0 building value for that path', () => {
    const result = calcPropertyTax(
      { lengthFt: 10, widthFt: 10 },
      { ...BASE_RATES, newConstructionRatePerSqft: null },
      { ...BASE_OPTIONS, useNewConstructionRate: true },
    )
    // newConstructionRatePerSqft null → toNumber returns 0 → buildingValue = 0
    expect(result.buildingValueRupees).toBe(0)
    expect(result.capitalValueRupees).toBe(100 * 120) // land only
  })
})

describe('calcPropertyTax — depreciation + usage weightage', () => {
  it('depreciation factor reduces building value proportionally', () => {
    const full = calcPropertyTax({ lengthFt: 10, widthFt: 10 }, BASE_RATES, { ...BASE_OPTIONS, depreciationFactor: 1 })
    const half = calcPropertyTax({ lengthFt: 10, widthFt: 10 }, BASE_RATES, { ...BASE_OPTIONS, depreciationFactor: 0.5 })
    // building value halved; land value unchanged
    expect(half.buildingValueRupees).toBeCloseTo(full.buildingValueRupees * 0.5, 2)
    expect(half.landValueRupees).toBe(full.landValueRupees)
    expect(half.houseTaxPaise).toBeLessThan(full.houseTaxPaise)
  })

  it('usageWeightage scales building value like depreciation', () => {
    const full = calcPropertyTax({ lengthFt: 10, widthFt: 10 }, BASE_RATES, { ...BASE_OPTIONS, usageWeightage: 1 })
    const commercial = calcPropertyTax({ lengthFt: 10, widthFt: 10 }, BASE_RATES, { ...BASE_OPTIONS, usageWeightage: 1.5 })
    expect(commercial.buildingValueRupees).toBeCloseTo(full.buildingValueRupees * 1.5, 2)
    expect(commercial.houseTaxPaise).toBeGreaterThan(full.houseTaxPaise)
  })

  it('depreciation × usageWeightage both apply to building value', () => {
    const result = calcPropertyTax(
      { lengthFt: 10, widthFt: 10 },
      BASE_RATES,
      { ...BASE_OPTIONS, depreciationFactor: 0.8, usageWeightage: 1.25 },
    )
    // buildingValue = 100 × 180 × 0.8 × 1.25 = 18000 (factors cancel out to 1)
    expect(result.buildingValueRupees).toBeCloseTo(18000, 2)
  })
})

describe('calcPropertyTax — area boundary cases', () => {
  it('zero length gives zero house tax', () => {
    const result = calcPropertyTax({ lengthFt: 0, widthFt: 30 }, BASE_RATES, BASE_OPTIONS)
    expect(result.areaSqFt).toBe(0)
    expect(result.houseTaxPaise).toBe(0)
  })

  it('null dimensions treated as 0', () => {
    const result = calcPropertyTax({ lengthFt: null, widthFt: null }, BASE_RATES, BASE_OPTIONS)
    expect(result.areaSqFt).toBe(0)
    expect(result.houseTaxPaise).toBe(0)
  })

  it('negative dimensions treated as 0 area', () => {
    const result = calcPropertyTax({ lengthFt: -10, widthFt: 20 }, BASE_RATES, BASE_OPTIONS)
    // -10 × 20 = -200; Math.max(0, ...) clamps to 0
    expect(result.areaSqFt).toBe(0)
    expect(result.houseTaxPaise).toBe(0)
  })

  it('very small area (1×1 ft) computes without throwing', () => {
    expect(() =>
      calcPropertyTax({ lengthFt: 1, widthFt: 1 }, BASE_RATES, BASE_OPTIONS)
    ).not.toThrow()
  })

  it('large area (1000×1000 ft) computes without overflow', () => {
    const result = calcPropertyTax({ lengthFt: 1000, widthFt: 1000 }, BASE_RATES, BASE_OPTIONS)
    expect(result.areaSqFt).toBe(1_000_000)
    expect(result.houseTaxPaise).toBeGreaterThan(0)
    expect(Number.isFinite(result.houseTaxPaise)).toBe(true)
  })
})

describe('calcPropertyTax — string + invalid inputs', () => {
  it('string numeric dimensions accepted', () => {
    const result = calcPropertyTax(
      { lengthFt: '20', widthFt: '30' },
      { ...BASE_RATES, landRatePerSqft: '120', constructionRatePerSqft: '180' },
      { ...BASE_OPTIONS, taxRatePaise: '0.7' },
    )
    expect(result.houseTaxPaise).toBe(12600)
  })

  it('NaN dimension treated as 0', () => {
    const result = calcPropertyTax({ lengthFt: NaN, widthFt: 20 }, BASE_RATES, BASE_OPTIONS)
    expect(result.areaSqFt).toBe(0)
  })

  it('undefined rates treated as 0 (no throw)', () => {
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
      totalPaise: expect.any(Number),
      totalRupees: expect.any(Number),
    })
  })

  it('waterPaise absent from result after Phase A', () => {
    const result = calcPropertyTax({ lengthFt: 10, widthFt: 10 }, BASE_RATES, BASE_OPTIONS)
    expect(result).not.toHaveProperty('waterPaise')
  })

  it('totalRupees = totalPaise / 100', () => {
    const result = calcPropertyTax({ lengthFt: 20, widthFt: 30 }, BASE_RATES, BASE_OPTIONS)
    expect(result.totalRupees).toBeCloseTo(result.totalPaise / 100, 5)
  })

  it('houseTaxRupees consistent with houseTaxPaise', () => {
    const result = calcPropertyTax({ lengthFt: 20, widthFt: 30 }, BASE_RATES, BASE_OPTIONS)
    expect(result.houseTaxRupees).toBeCloseTo(result.houseTaxPaise / 100, 5)
  })
})
