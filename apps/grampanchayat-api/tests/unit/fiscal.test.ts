import { describe, it, expect } from 'vitest'
import {
  currentFiscalYear,
  fiscalYearStartYear,
  parseFiscalYear,
  fiscalYearRange,
  formatFiscalYear,
  fyMonthNo,
} from '../../src/lib/fiscal.ts'

// IST is UTC+5:30. April 1 IST 00:00 = March 31 UTC 18:30.
const IST = (dateStr: string) => new Date(dateStr)

describe('fiscalYearStartYear', () => {
  it('April 1 IST → new FY start', () => {
    // UTC 18:30 Mar 31 = IST Apr 1 00:00
    expect(fiscalYearStartYear(new Date('2026-03-31T18:30:00Z'))).toBe(2026)
  })

  it('March 31 IST 23:59 → previous FY', () => {
    // UTC 18:29 Mar 31 = IST Mar 31 23:59
    expect(fiscalYearStartYear(new Date('2026-03-31T18:29:59Z'))).toBe(2025)
  })

  it('mid-year dates', () => {
    expect(fiscalYearStartYear(new Date('2026-01-15T00:00:00Z'))).toBe(2025) // Jan IST
    expect(fiscalYearStartYear(new Date('2026-07-01T00:00:00Z'))).toBe(2026) // July IST
  })
})

describe('currentFiscalYear', () => {
  it('returns YYYY-YY format', () => {
    expect(currentFiscalYear(new Date('2026-04-01T00:00:00Z'))).toBe('2026-27')
    expect(currentFiscalYear(new Date('2026-01-01T00:00:00Z'))).toBe('2025-26')
    expect(currentFiscalYear(new Date('2025-04-01T00:00:00Z'))).toBe('2025-26')
  })

  it('FY boundary exact (IST midnight Apr 1)', () => {
    expect(currentFiscalYear(new Date('2026-03-31T18:29:59Z'))).toBe('2025-26')
    expect(currentFiscalYear(new Date('2026-03-31T18:30:00Z'))).toBe('2026-27')
  })

  it('century boundary: 1999-2000', () => {
    expect(currentFiscalYear(new Date('1999-06-15T00:00:00Z'))).toBe('1999-00')
  })
})

describe('formatFiscalYear', () => {
  it('formats correctly', () => {
    expect(formatFiscalYear(2025)).toBe('2025-26')
    expect(formatFiscalYear(2099)).toBe('2099-00')
    expect(formatFiscalYear(1999)).toBe('1999-00')
  })

  it('throws for invalid start years', () => {
    expect(() => formatFiscalYear(1899)).toThrow()
    expect(() => formatFiscalYear(10000)).toThrow()
    expect(() => formatFiscalYear(2025.5)).toThrow()
  })
})

describe('parseFiscalYear', () => {
  it('parses valid FY strings', () => {
    expect(parseFiscalYear('2025-26')).toEqual({ startYear: 2025, endYear: 2026 })
    expect(parseFiscalYear('2099-00')).toEqual({ startYear: 2099, endYear: 2100 })
    expect(parseFiscalYear('  2026-27  ')).toEqual({ startYear: 2026, endYear: 2027 })
  })

  it('throws on invalid format', () => {
    expect(() => parseFiscalYear('2025-27')).toThrow('Invalid fiscal year range')
    expect(() => parseFiscalYear('25-26')).toThrow('Invalid fiscal year format')
    expect(() => parseFiscalYear('2025/26')).toThrow('Invalid fiscal year format')
    expect(() => parseFiscalYear('')).toThrow('Invalid fiscal year format')
  })
})

describe('fiscalYearRange', () => {
  it('start is IST April 1 00:00 = UTC March 31 18:30', () => {
    const { startUtc } = fiscalYearRange('2025-26')
    expect(startUtc.toISOString()).toBe('2025-03-31T18:30:00.000Z')
  })

  it('end is exclusive — IST April 1 next year', () => {
    const { endUtcExclusive } = fiscalYearRange('2025-26')
    expect(endUtcExclusive.toISOString()).toBe('2026-03-31T18:30:00.000Z')
  })

  it('range spans exactly 1 year', () => {
    const { startUtc, endUtcExclusive } = fiscalYearRange('2025-26')
    const msInYear = endUtcExclusive.getTime() - startUtc.getTime()
    const days = msInYear / (1000 * 60 * 60 * 24)
    expect(days).toBe(365) // 2025-26 is not a leap year
  })

  it('leap year FY spans 366 days', () => {
    // 2027-28: Feb 2028 is a leap year
    const { startUtc, endUtcExclusive } = fiscalYearRange('2027-28')
    const days = (endUtcExclusive.getTime() - startUtc.getTime()) / (1000 * 60 * 60 * 24)
    expect(days).toBe(366)
  })
})

describe('fyMonthNo', () => {
  it('April = 1 (FY month 1)', () => {
    expect(fyMonthNo(new Date('2026-04-15T00:00:00Z'))).toBe(1)
  })

  it('March = 12 (last FY month)', () => {
    expect(fyMonthNo(new Date('2026-03-15T00:00:00Z'))).toBe(12)
  })

  it('all 12 months map correctly', () => {
    const cases: Array<[string, number]> = [
      ['2026-04-01', 1],  // April
      ['2026-05-01', 2],  // May
      ['2026-06-01', 3],  // June
      ['2026-07-01', 4],  // July
      ['2026-08-01', 5],  // August
      ['2026-09-01', 6],  // September
      ['2026-10-01', 7],  // October
      ['2026-11-01', 8],  // November
      ['2026-12-01', 9],  // December
      ['2027-01-01', 10], // January
      ['2027-02-01', 11], // February
      ['2027-03-01', 12], // March
    ]
    for (const [date, expected] of cases) {
      expect(fyMonthNo(new Date(date + 'T00:00:00Z')), date).toBe(expected)
    }
  })

  it('IST boundary: UTC 18:29 Mar 31 = IST Mar 31 → month 12', () => {
    expect(fyMonthNo(new Date('2026-03-31T18:29:59Z'))).toBe(12)
  })

  it('IST boundary: UTC 18:30 Mar 31 = IST Apr 1 → month 1', () => {
    expect(fyMonthNo(new Date('2026-03-31T18:30:00Z'))).toBe(1)
  })
})
