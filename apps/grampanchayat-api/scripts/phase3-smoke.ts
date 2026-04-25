import assert from 'node:assert/strict'
import { calcPropertyTax } from '../src/lib/tax-calc.ts'

function run() {
  const row10Like = calcPropertyTax(
    {
      lengthFt: 20,
      widthFt: 30,
      lightingTaxPaise: null,
      sanitationTaxPaise: null,
      waterTaxPaise: null,
    },
    {
      landRatePerSqft: 120,
      constructionRatePerSqft: 180,
      defaultLightingPaise: 2500, // Rs 25
      defaultSanitationPaise: 2500, // Rs 25
      defaultWaterPaise: 36000, // Rs 360
    },
    {
      depreciationFactor: 1,
      usageWeightage: 1,
      taxRatePaise: 0.7,
    }
  )

  // House tax must follow /1000 workbook divisor with HALF-UP rounding.
  const expectedHousePaise = Math.round(
    ((row10Like.capitalValueRupees * 0.7) / 1000) * 100
  )
  assert.equal(row10Like.houseTaxPaise, expectedHousePaise)
  assert.equal(row10Like.lightingPaise, 2500)
  assert.equal(row10Like.sanitationPaise, 2500)
  assert.equal(row10Like.waterPaise, 36000)

  const fallbackCheck = calcPropertyTax(
    {
      lengthFt: 10,
      widthFt: 10,
      lightingTaxPaise: 1000,
      sanitationTaxPaise: null,
      waterTaxPaise: 0,
    },
    {
      landRatePerSqft: 100,
      constructionRatePerSqft: 100,
      defaultLightingPaise: 2500,
      defaultSanitationPaise: 1500,
      defaultWaterPaise: 500,
    },
    {
      depreciationFactor: 1,
      usageWeightage: 1,
      taxRatePaise: 1,
    }
  )

  assert.equal(fallbackCheck.lightingPaise, 1000) // property override wins
  assert.equal(fallbackCheck.sanitationPaise, 1500) // fallback to rate default
  assert.equal(fallbackCheck.waterPaise, 0) // explicit property override 0
  assert.equal(
    fallbackCheck.totalPaise,
    fallbackCheck.houseTaxPaise + fallbackCheck.lightingPaise + fallbackCheck.sanitationPaise + fallbackCheck.waterPaise
  )

  console.log('phase3-smoke: all checks passed')
}

run()

