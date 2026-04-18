"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

import { cn } from "../../../lib/utils"
import { Button } from "../button"
import { Input } from "../input"

import type { SearchInputProps } from "./types"

export type { SearchInputProps } from "./types"

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    value,
    onChange,
    onDebouncedChange,
    debounceMs = 300,
    placeholder,
    disabled,
    className,
    wrapperClassName,
    onBlur,
    ...rest
  },
  ref
) {
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    },
    []
  )

  const flushDebounce = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = undefined
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    onChange(next)
    if (!onDebouncedChange) return
    flushDebounce()
    debounceRef.current = setTimeout(() => onDebouncedChange(next), debounceMs)
  }

  const clear = () => {
    onChange("")
    flushDebounce()
    onDebouncedChange?.("")
  }

  const showClear = value.length > 0 && !disabled

  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={ref}
        {...rest}
        type="search"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
        autoComplete="off"
        className={cn("pl-9", showClear && "pr-9", className)}
      />
      {showClear ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute right-0.5 top-1/2 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={clear}
          aria-label="Clear search"
        >
          <X className="size-3.5" strokeWidth={2.5} />
        </Button>
      ) : null}
    </div>
  )
})

SearchInput.displayName = "SearchInput"
