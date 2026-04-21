export type DemandStatus = "UNPAID" | "PARTIAL" | "PAID"

export type StatusBadgeLocale = "mr" | "en"

export type StatusBadgeProps = {
  status: DemandStatus
  locale?: StatusBadgeLocale
  className?: string
}
