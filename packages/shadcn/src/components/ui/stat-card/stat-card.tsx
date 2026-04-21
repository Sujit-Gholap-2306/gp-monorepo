import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../../lib/utils"

import type { StatCardProps } from "./types"

export type { StatCardProps } from "./types"

export const statCardVariants = cva("rounded-xl border p-4 shadow-xs", {
  variants: {
    variant: {
      default: "border-border bg-card text-card-foreground",
      primary: "border-primary/20 bg-primary-light/80 text-card-foreground",
      success: "border-success/25 bg-success-bg text-card-foreground",
      warning: "border-warning/25 bg-warning-bg text-card-foreground",
      destructive: "border-destructive/25 bg-destructive-bg text-card-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export type StatCardVariantProps = VariantProps<typeof statCardVariants>

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClassName,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div className={cn(statCardVariants({ variant }), className)} data-slot="stat-card">
      <div className="flex items-start justify-between gap-2">
        {Icon ? (
          <Icon className={cn("size-5 shrink-0", iconClassName ?? "text-muted-foreground")} aria-hidden />
        ) : null}
        <span className="min-w-0 text-right text-2xl font-bold tabular-nums text-card-foreground">{value}</span>
      </div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">{label}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-muted-foreground/90">{sub}</p> : null}
    </div>
  )
}
