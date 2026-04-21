import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../../lib/utils"
import { Badge } from "../badge"

import type { DemandStatus, StatusBadgeProps } from "./types"

export type { DemandStatus, StatusBadgeProps } from "./types"

export const statusBadgeVariants = cva("border font-medium", {
  variants: {
    status: {
      UNPAID: "border-gp-status-unpaid/30 bg-gp-status-unpaid-bg text-gp-status-unpaid",
      PARTIAL: "border-gp-status-partial/30 bg-gp-status-partial-bg text-gp-status-partial",
      PAID: "border-gp-status-paid/30 bg-gp-status-paid-bg text-gp-status-paid",
    },
  },
  defaultVariants: {
    status: "UNPAID",
  },
})

export type StatusBadgeVariantProps = VariantProps<typeof statusBadgeVariants>

const LABELS: Record<DemandStatus, { mr: string; en: string }> = {
  UNPAID: { mr: "न भरलेले", en: "Unpaid" },
  PARTIAL: { mr: "अंशतः", en: "Partial" },
  PAID: { mr: "भरलेले", en: "Paid" },
}

export function StatusBadge({ status, locale = "mr", className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusBadgeVariants({ status }), "shadow-none", className)}>
      {LABELS[status][locale]}
    </Badge>
  )
}
