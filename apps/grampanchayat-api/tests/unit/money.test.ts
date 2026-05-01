import { describe, it, expect } from 'vitest'
import {
  toPaise,
  fromPaise,
  assertNonNegativePaise,
} from '../../src/lib/money.ts'

describe('toPaise', () => {
  it('converts whole rupees', () => {
    expect(toPaise(1)).toBe(100)
    expect(toPaise(100)).toBe(10000)
    expect(toPaise(0)).toBe(0)
  })

  it('converts decimal rupees with Math.round rounding', () => {
    // JS float: 1.005 * 100 = 100.49999... → rounds to 100
    expect(toPaise(1.005)).toBe(100)
    expect(toPaise(1.004)).toBe(100)
    expect(toPaise(1.006)).toBe(101)
    // Spec example: 136.4063 → 13641
    expect(toPaise(136.4063)).toBe(13641)
    expect(toPaise(0.505)).toBe(51)
    expect(toPaise(0.504)).toBe(50)
  })

  it('converts string input', () => {
    expect(toPaise('25.50')).toBe(2550)
    expect(toPaise('  10  ')).toBe(1000)
  })

  it('throws on invalid input', () => {
    expect(() => toPaise('abc')).toThrow('Invalid rupee amount')
    expect(() => toPaise(NaN)).toThrow('Invalid rupee amount')
    expect(() => toPaise(Infinity)).toThrow('Invalid rupee amount')
  })

  it('handles negative rupees', () => {
    expect(toPaise(-1)).toBe(-100)
    expect(toPaise(-0.5)).toBe(-50)
  })
})

describe('fromPaise', () => {
  it('converts paise to rupees', () => {
    expect(fromPaise(100)).toBe(1)
    expect(fromPaise(0)).toBe(0)
    expect(fromPaise(2550)).toBe(25.5)
    expect(fromPaise(13641)).toBeCloseTo(136.41, 2)
  })

  it('handles bigint input', () => {
    expect(fromPaise(100n)).toBe(1)
    expect(fromPaise(10000n)).toBe(100)
    expect(fromPaise(0n)).toBe(0)
  })

  it('throws on infinite input', () => {
    expect(() => fromPaise(Infinity)).toThrow('Invalid paise amount')
    expect(() => fromPaise(-Infinity)).toThrow('Invalid paise amount')
  })
})

describe('assertNonNegativePaise', () => {
  it('passes for zero and positive', () => {
    expect(() => assertNonNegativePaise(0)).not.toThrow()
    expect(() => assertNonNegativePaise(100)).not.toThrow()
    expect(() => assertNonNegativePaise(0n)).not.toThrow()
    expect(() => assertNonNegativePaise(99999n)).not.toThrow()
  })

  it('throws for negative values', () => {
    expect(() => assertNonNegativePaise(-1)).toThrow('>= 0')
    expect(() => assertNonNegativePaise(-1n)).toThrow('>= 0')
  })

  it('includes field name in error', () => {
    expect(() => assertNonNegativePaise(-1, 'discount_paise')).toThrow('discount_paise')
  })
})
