import type { Cell, Header } from "@tanstack/react-table"

import { cn } from "../../../lib/utils"

/** Tailwind classes for `<th>` content alignment + optional `meta.headerClassName`. */
export function dataTableHeaderClassName<TData, TValue>(header: Header<TData, TValue>): string {
  const meta = header.column.columnDef.meta
  const align = meta?.align === "right" ? "text-right" : "text-left"
  return cn(align, meta?.headerClassName)
}

/** Tailwind classes for `<td>` alignment + optional `meta.cellClassName`. */
export function dataTableCellClassName<TData, TValue>(cell: Cell<TData, TValue>): string {
  const meta = cell.column.columnDef.meta
  const align = meta?.align === "right" ? "text-right tabular-nums" : "text-left"
  return cn(align, meta?.cellClassName)
}
