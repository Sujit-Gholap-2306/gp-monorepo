import { describe, it, expect } from 'vitest'
import {
  GP_ACCOUNT_HEADS,
  TAX_HEAD_TO_ACCOUNT_HEAD,
  ACCOUNT_HEAD_LEDGER_CODE,
  accountHeadForTaxHead,
  ledgerCodeForAccountHead,
} from '../../src/lib/account-heads.ts'
import { TAX_HEADS } from '../../src/lib/tax-head.ts'

describe('account-heads', () => {
  it('has unique account heads', () => {
    expect(new Set(GP_ACCOUNT_HEADS).size).toBe(GP_ACCOUNT_HEADS.length)
  })

  it('maps every tax head exactly once', () => {
    expect(Object.keys(TAX_HEAD_TO_ACCOUNT_HEAD).sort()).toEqual([...TAX_HEADS].sort())
  })

  it('returns expected account head for each tax head', () => {
    expect(accountHeadForTaxHead('house')).toBe('property_tax_house')
    expect(accountHeadForTaxHead('lighting')).toBe('property_tax_lighting')
    expect(accountHeadForTaxHead('sanitation')).toBe('property_tax_sanitation')
    expect(accountHeadForTaxHead('water')).toBe('property_tax_water')
  })

  it('has ledger code for every account head', () => {
    for (const accountHead of GP_ACCOUNT_HEADS) {
      const code = ledgerCodeForAccountHead(accountHead)
      expect(typeof code).toBe('string')
      expect(code).toMatch(/^\d{4}-\d{3}$/)
    }
  })

  it('uses unique ledger codes across account heads', () => {
    const codes = GP_ACCOUNT_HEADS.map((head) => ACCOUNT_HEAD_LEDGER_CODE[head])
    expect(new Set(codes).size).toBe(codes.length)
  })
})
