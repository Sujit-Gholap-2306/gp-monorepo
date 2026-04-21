import type { LucideIcon } from "lucide-react"

export type StatCardVariant = "default" | "primary" | "warning" | "success" | "destructive"

export type StatCardProps = {
  label: string
  /** Pre-formatted main value (use {@link Amount} or counts as string) */
  value: string
  sub?: string
  icon?: LucideIcon
  /** Tailwind classes for the icon (e.g. `text-primary`) */
  iconClassName?: string
  variant?: StatCardVariant
  className?: string
}
