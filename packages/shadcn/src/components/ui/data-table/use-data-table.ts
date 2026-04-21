"use client"

import { useMemo } from "react"
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type TableOptions,
} from "@tanstack/react-table"

export type UseDataTableOptions<TData extends RowData> = {
  data: TData[]
  columns: ColumnDef<TData, any>[]
  getRowId?: TableOptions<TData>["getRowId"]
  /** Default `true` — wires `getSortedRowModel`; click headers to sort. */
  enableSorting?: boolean
}

/**
 * Shared TanStack Table instance for {@link DataTable}.
 * Apps can use this directly when they need the table API outside the default shell.
 */
export function useDataTable<TData extends RowData>({
  data,
  columns,
  getRowId,
  enableSorting = true,
}: UseDataTableOptions<TData>) {
  const columnDefs = useMemo(() => columns, [columns])

  return useReactTable({
    data,
    columns: columnDefs,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
    enableSorting,
  })
}
