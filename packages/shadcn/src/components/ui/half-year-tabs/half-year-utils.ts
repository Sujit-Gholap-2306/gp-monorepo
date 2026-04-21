/**
 * Indian financial year half-years (Maharashtra GP demand registers).
 * H1: April–September · H2: October–March
 */

export const HALF_YEAR_INDICES = [1, 2] as const

export type HalfYearIndex = (typeof HALF_YEAR_INDICES)[number]

export type HalfYearLocale = "mr" | "en"

export type HalfYearOption = {
  value: HalfYearIndex
  /** Primary label (e.g. सहामाही १) */
  title: string
  /** Range hint (e.g. एप्रिल - सप्टेंबर) */
  subtitle: string
}

const COPY: Record<
  HalfYearLocale,
  Record<HalfYearIndex, { title: string; subtitle: string }>
> = {
  mr: {
    1: { title: "सहामाही १", subtitle: "एप्रिल - सप्टेंबर" },
    2: { title: "सहामाही २", subtitle: "ऑक्टोबर - मार्च" },
  },
  en: {
    1: { title: "Half-year 1", subtitle: "April – September" },
    2: { title: "Half-year 2", subtitle: "October – March" },
  },
} as const

export function isHalfYearIndex(value: unknown): value is HalfYearIndex {
  return value === 1 || value === 2
}

/** Runtime guard for controlled props / query parsers. */
export function assertHalfYearIndex(value: unknown): asserts value is HalfYearIndex {
  if (!isHalfYearIndex(value)) {
    throw new TypeError(`Expected HalfYearIndex (1 | 2), received: ${String(value)}`)
  }
}

export function getHalfYearOption(index: HalfYearIndex, locale: HalfYearLocale): HalfYearOption {
  const row = COPY[locale][index]
  return { value: index, title: row.title, subtitle: row.subtitle }
}

/** Stable tuple for iteration — avoids allocating each render. */
export function getHalfYearOptions(locale: HalfYearLocale): readonly [HalfYearOption, HalfYearOption] {
  return [getHalfYearOption(1, locale), getHalfYearOption(2, locale)] as const
}

/**
 * Map calendar month to FY half-year.
 * @param month 1 = January … 12 = December
 */
export function getHalfYearIndexForCalendarMonth(month: number): HalfYearIndex {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`month must be integer 1–12, got ${month}`)
  }
  if (month >= 4 && month <= 9) return 1
  return 2
}
