import { cn } from "../../../lib/utils"

import type { AmountProps } from "./types"

export type { AmountProps } from "./types"

const localeTag: Record<NonNullable<AmountProps["locale"]>, string> = {
  mr: "mr-IN",
  en: "en-IN",
}

export function formatInrAmount(value: number, locale: NonNullable<AmountProps["locale"]> = "mr"): string {
  return new Intl.NumberFormat(localeTag[locale], {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function Amount({ value, locale = "mr", className }: AmountProps) {
  return (
    <span className={cn("tabular-nums", className)} data-slot="amount">
      {formatInrAmount(value, locale)}
    </span>
  )
}
