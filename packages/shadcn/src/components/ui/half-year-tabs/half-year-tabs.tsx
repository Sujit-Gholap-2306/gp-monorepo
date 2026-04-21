"use client"

import * as React from "react"

import { cn } from "../../../lib/utils"
import { getHalfYearOptions, type HalfYearIndex, type HalfYearLocale } from "./half-year-utils"

import type { HalfYearTabsProps } from "./types"

export type { HalfYearTabsProps } from "./types"

const OPTIONS_MR = getHalfYearOptions("mr")
const OPTIONS_EN = getHalfYearOptions("en")

function optionsForLocale(locale: HalfYearLocale): readonly [typeof OPTIONS_MR[0], typeof OPTIONS_MR[1]] {
  return locale === "en" ? OPTIONS_EN : OPTIONS_MR
}

export function HalfYearTabs({
  value,
  onChange,
  locale = "mr",
  className,
  idPrefix = "half-year",
  disabled = false,
  "aria-label": ariaLabel,
  ...rest
}: HalfYearTabsProps) {
  const options = optionsForLocale(locale)
  const listLabel =
    ariaLabel ?? (locale === "mr" ? "आर्थिक वर्ष सहामाही निवड" : "Select financial year half")

  const tabIds = React.useMemo((): Record<HalfYearIndex, string> => {
    return { 1: `${idPrefix}-tab-1`, 2: `${idPrefix}-tab-2` }
  }, [idPrefix])

  const focusIndex = value === 1 ? 0 : 1

  const moveFocus = React.useCallback(
    (delta: -1 | 1) => {
      if (disabled) return
      const next = (focusIndex + delta + 2) % 2
      onChange(next === 0 ? 1 : 2)
    },
    [disabled, focusIndex, onChange]
  )

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault()
          moveFocus(-1)
          break
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault()
          moveFocus(1)
          break
        case "Home":
          e.preventDefault()
          onChange(1)
          break
        case "End":
          e.preventDefault()
          onChange(2)
          break
        default:
          break
      }
    },
    [disabled, moveFocus, onChange]
  )

  return (
    <div
      role="tablist"
      aria-label={listLabel}
      onKeyDown={onKeyDown}
      className={cn(
        "flex w-full max-w-md gap-0.5 rounded-lg border border-border bg-linear-to-b from-muted/50 to-muted/30 p-0.5 shadow-xs",
        className
      )}
      {...rest}
    >
      {options.map(opt => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            id={tabIds[opt.value]}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            onClick={() => !disabled && onChange(opt.value)}
            className={cn(
              "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-px rounded-md px-2 py-1.5 text-center",
              "transition-[color,background-color,box-shadow] duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 ring-1 ring-primary/20"
                : "text-muted-foreground hover:bg-card/90 hover:text-foreground hover:shadow-sm",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <span className="text-[11px] font-semibold leading-none tracking-tight sm:text-xs">
              {opt.title}
            </span>
            <span
              className={cn(
                "max-w-[9.5rem] text-[9px] font-medium leading-tight sm:text-[10px]",
                selected ? "text-primary-foreground/85" : "text-muted-foreground/90"
              )}
            >
              {opt.subtitle}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Screen-reader-only panels for `aria-controls` pairing; mount next to tabs if you show conditional content. */
export function HalfYearTabPanel({
  halfYear,
  idPrefix = "half-year",
  children,
  className,
  hidden,
  ...props
}: {
  halfYear: HalfYearIndex
  idPrefix?: string
  hidden?: boolean
} & React.ComponentProps<"div">) {
  const panelId = `${idPrefix}-panel-${halfYear}`
  const tabId = `${idPrefix}-tab-${halfYear}`
  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={hidden}
      className={cn(hidden && "hidden", className)}
      {...props}
    >
      {children}
    </div>
  )
}
