import assert from 'node:assert/strict'
import { currentFiscalYear, fiscalYearRange, fyMonthNo, parseFiscalYear } from '../src/lib/fiscal.ts'
import { toPaise } from '../src/lib/money.ts'
import { accountHeadForTaxHead, ledgerCodeForAccountHead } from '../src/lib/account-heads.ts'
import { TAX_HEADS } from '../src/lib/tax-head.ts'

function run() {
  assert.equal(currentFiscalYear(new Date(Date.UTC(2026, 2, 31, 18, 29))), '2025-26')
  assert.equal(currentFiscalYear(new Date(Date.UTC(2026, 2, 31, 18, 30))), '2026-27')
  assert.equal(currentFiscalYear(new Date(Date.UTC(2026, 3, 1))), '2026-27')

  assert.deepEqual(parseFiscalYear('2026-27'), {
    startYear: 2026,
    endYear:   2027,
  })

  const fy = fiscalYearRange('2026-27')
  assert.equal(fy.startUtc.toISOString(), '2026-03-31T18:30:00.000Z')
  assert.equal(fy.endUtcExclusive.toISOString(), '2027-03-31T18:30:00.000Z')

  assert.equal(fyMonthNo(new Date(Date.UTC(2026, 2, 31, 18, 29))), 12)
  assert.equal(fyMonthNo(new Date(Date.UTC(2026, 2, 31, 18, 30))), 1)
  assert.equal(fyMonthNo(new Date(Date.UTC(2026, 3, 1))), 1)
  assert.equal(fyMonthNo(new Date(Date.UTC(2026, 11, 1))), 9)
  assert.equal(fyMonthNo(new Date(Date.UTC(2027, 2, 31))), 12)

  assert.equal(toPaise(136.4063), 13641)
  assert.equal(toPaise(136.404), 13640)
  assert.equal(toPaise('25.5'), 2550)

  assert.equal(TAX_HEADS.length, 4)
  assert.equal(accountHeadForTaxHead('house'), 'property_tax_house')
  assert.equal(ledgerCodeForAccountHead('property_tax_water'), '0035-104')

  console.log('phase1-smoke: all checks passed')
}

run()
