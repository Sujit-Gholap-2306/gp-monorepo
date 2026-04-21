export type AmountLocale = "mr" | "en"

export type AmountProps = {
  value: number
  /** Default `mr` → `mr-IN` number formatting */
  locale?: AmountLocale
  className?: string
}
