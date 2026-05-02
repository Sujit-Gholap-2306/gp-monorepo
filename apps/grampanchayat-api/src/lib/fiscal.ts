const FISCAL_YEAR_REGEX = /^(\d{4})-(\d{2})$/
const APRIL_MONTH_INDEX = 3
const INDIA_UTC_OFFSET_MS = 5.5 * 60 * 60 * 1000

export type ParsedFiscalYear = {
  startYear: number
  endYear: number
}

function asUtcDate(input: Date | string | number): Date {
  const date = input instanceof Date ? new Date(input.getTime()) : new Date(input)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date input')
  }
  return date
}

function asIndiaCalendarDate(input: Date | string | number): Date {
  return new Date(asUtcDate(input).getTime() + INDIA_UTC_OFFSET_MS)
}

export function fiscalYearStartYear(input: Date | string | number = new Date()): number {
  const date = asIndiaCalendarDate(input)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  return month >= APRIL_MONTH_INDEX ? year : year - 1
}

export function formatFiscalYear(startYear: number): string {
  if (!Number.isInteger(startYear) || startYear < 1900 || startYear > 9999) {
    throw new Error('startYear must be a 4-digit year')
  }
  const endShort = String((startYear + 1) % 100).padStart(2, '0')
  return `${String(startYear)}-${endShort}`
}

export function currentFiscalYear(input: Date | string | number = new Date()): string {
  return formatFiscalYear(fiscalYearStartYear(input))
}

export function parseFiscalYear(fiscalYear: string): ParsedFiscalYear {
  const match = FISCAL_YEAR_REGEX.exec(fiscalYear.trim())
  if (!match) {
    throw new Error(`Invalid fiscal year format: "${fiscalYear}"`)
  }

  const startYear = Number(match[1])
  const endShort = Number(match[2])
  const expected = (startYear + 1) % 100

  if (endShort !== expected) {
    throw new Error(`Invalid fiscal year range: "${fiscalYear}"`)
  }

  return {
    startYear,
    endYear: startYear + 1,
  }
}

export function fiscalYearRange(fiscalYear: string): { startUtc: Date, endUtcExclusive: Date } {
  const { startYear, endYear } = parseFiscalYear(fiscalYear)
  return {
    startUtc: new Date(Date.UTC(startYear, APRIL_MONTH_INDEX, 1, 0, 0, 0, 0) - INDIA_UTC_OFFSET_MS),
    endUtcExclusive: new Date(Date.UTC(endYear, APRIL_MONTH_INDEX, 1, 0, 0, 0, 0) - INDIA_UTC_OFFSET_MS),
  }
}

export function fyMonthNo(input: Date | string | number): number {
  const month = asIndiaCalendarDate(input).getUTCMonth()
  return month >= APRIL_MONTH_INDEX ? month - 2 : month + 10
}

function fiscalYearZodRefine(val: string): boolean {
  try {
    parseFiscalYear(val)
    return true
  } catch {
    return false
  }
}

import { z } from 'zod'

/** Zod schema for fiscal year strings. Validates format AND semantic range (2026-27 ✓, 2026-99 ✗). */
export const fiscalYearZodSchema = z
  .string()
  .trim()
  .refine(fiscalYearZodRefine, 'fiscal_year must be valid YYYY-YY (e.g. 2026-27)')
