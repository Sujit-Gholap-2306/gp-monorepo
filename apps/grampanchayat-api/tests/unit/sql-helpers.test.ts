import { describe, it, expect } from 'vitest'
import { sqlUuidArray, sqlBigintArray, sqlDate } from '../../src/lib/sql-helpers.ts'

// These tests verify function contracts and edge cases.
// Correctness of generated SQL is verified by integration tests (real DB execution).

describe('sqlUuidArray', () => {
  it('returns a SQL object for empty input (no throw, typed cast)', () => {
    const result = sqlUuidArray([])
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })

  it('does not throw for single UUID', () => {
    expect(() => sqlUuidArray(['7dcd9da3-f806-4aab-a3f4-993129a41eed'])).not.toThrow()
  })

  it('does not throw for multiple UUIDs', () => {
    expect(() => sqlUuidArray([
      '7dcd9da3-f806-4aab-a3f4-993129a41eed',
      'd6e5c6be-cc08-4764-9e02-424a8af3d2be',
    ])).not.toThrow()
  })

  it('empty and non-empty return same object shape', () => {
    const empty = sqlUuidArray([])
    const nonEmpty = sqlUuidArray(['7dcd9da3-f806-4aab-a3f4-993129a41eed'])
    expect(Object.keys(empty)).toEqual(Object.keys(nonEmpty))
  })
})

describe('sqlBigintArray', () => {
  it('returns a SQL object for empty input (no throw, typed cast)', () => {
    const result = sqlBigintArray([])
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })

  it('does not throw for single value', () => {
    expect(() => sqlBigintArray([100])).not.toThrow()
  })

  it('does not throw for multiple values', () => {
    expect(() => sqlBigintArray([100, 200, 300])).not.toThrow()
  })

  it('handles 0', () => {
    expect(() => sqlBigintArray([0])).not.toThrow()
  })

  it('empty and non-empty return same object shape', () => {
    const empty = sqlBigintArray([])
    const nonEmpty = sqlBigintArray([100])
    expect(Object.keys(empty)).toEqual(Object.keys(nonEmpty))
  })
})

describe('sqlDate', () => {
  it('returns a SQL object (no throw)', () => {
    expect(() => sqlDate(new Date('2026-04-01T00:00:00.000Z'))).not.toThrow()
  })

  it('result is defined and object-shaped', () => {
    const result = sqlDate(new Date())
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })

  it('handles any valid Date', () => {
    expect(() => sqlDate(new Date('1970-01-01T00:00:00Z'))).not.toThrow()
    expect(() => sqlDate(new Date('2099-12-31T23:59:59Z'))).not.toThrow()
  })
})
