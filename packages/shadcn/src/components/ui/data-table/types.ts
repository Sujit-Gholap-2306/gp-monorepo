import type { ReactNode } from "react"
import type { ColumnDef, RowData, TableOptions } from "@tanstack/react-table"

/**
 * Extends TanStack `ColumnMeta` (see module augmentation below).
 * Use on column defs: `meta: { align: 'right' }`.
 */
export type DataTableColumnMeta = {
  align?: "left" | "right"
  headerClassName?: string
  cellClassName?: string
}

export type DataTableProps<TData extends RowData> = {
  data: TData[]
  /** Per-column `TValue` differs (string, number, enums) — `any` matches `createColumnHelper` output. */
  columns: ColumnDef<TData, any>[]
  isLoading?: boolean
  /** Shown when `!isLoading && data.length === 0` */
  emptyState?: ReactNode
  getRowId?: TableOptions<TData>["getRowId"]
  enableSorting?: boolean
  /** Skeleton row count while loading */
  skeletonRowCount?: number
  className?: string
  tableClassName?: string
}

export const DATA_TABLE_DEFAULT_SKELETON_ROWS = 5
