import type * as React from "react"

export type SearchInputProps = Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: string
  onChange: (value: string) => void
  onDebouncedChange?: (value: string) => void
  debounceMs?: number
  wrapperClassName?: string
}
