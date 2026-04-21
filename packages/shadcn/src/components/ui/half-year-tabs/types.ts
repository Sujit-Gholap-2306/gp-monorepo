import type * as React from "react"

import type { HalfYearIndex, HalfYearLocale } from "./half-year-utils"

export type HalfYearTabsProps = {
  value: HalfYearIndex
  onChange: (value: HalfYearIndex) => void
  locale?: HalfYearLocale
  className?: string
  /** Prefix for stable `id` / `aria-controls` (e.g. `demand-fy`) */
  idPrefix?: string
  disabled?: boolean
  /** Visually hidden label for the tablist */
  "aria-label"?: string
} & Omit<React.ComponentProps<"div">, "onChange" | "children" | "role">
