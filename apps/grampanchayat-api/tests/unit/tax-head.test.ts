import { describe, it, expect } from 'vitest'
import { isTaxHead, TAX_HEADS } from '../../src/lib/tax-head.ts'

describe('isTaxHead', () => {
  it('accepts all valid tax heads', () => {
    for (const head of TAX_HEADS) {
      expect(isTaxHead(head), head).toBe(true)
    }
  })

  it('rejects invalid values', () => {
    expect(isTaxHead('property_tax_house')).toBe(false)
    expect(isTaxHead('')).toBe(false)
    expect(isTaxHead('House')).toBe(false)
    expect(isTaxHead('HOUSE')).toBe(false)
    expect(isTaxHead('unknown')).toBe(false)
  })

  it('narrows type (TS type guard)', () => {
    const value: string = 'house'
    if (isTaxHead(value)) {
      const _check: typeof TAX_HEADS[number] = value
      expect(_check).toBe('house')
    }
  })
})
