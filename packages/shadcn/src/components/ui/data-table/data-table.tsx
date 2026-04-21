"use client"

import * as React from "react"
import { flexRender, type RowData } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { cn } from "../../../lib/utils"
import { Skeleton } from "../skeleton"

import { dataTableCellClassName, dataTableHeaderClassName } from "./data-table-utils"
import { DATA_TABLE_DEFAULT_SKELETON_ROWS } from "./types"
import { useDataTable } from "./use-data-table"

import type { DataTableProps } from "./types"

export type { DataTableProps } from "./types"

export function DataTable<TData extends RowData>({
  data,
  columns,
  isLoading = false,
  emptyState,
  getRowId,
  enableSorting = true,
  skeletonRowCount = DATA_TABLE_DEFAULT_SKELETON_ROWS,
  className,
  tableClassName,
}: DataTableProps<TData>) {
  const table = useDataTable({ data, columns, getRowId, enableSorting })
  const colCount = columns.length

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div className="overflow-x-auto">
        <table className={cn("w-full caption-bottom text-sm [&_thead]:text-[11px]", tableClassName)}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-border bg-muted/60">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-3 py-1.5 font-medium text-muted-foreground",
                      dataTableHeaderClassName(header),
                      header.column.getCanSort() && "select-none"
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "inline-flex items-center gap-1",
                          header.column.getCanSort() && "cursor-pointer hover:text-foreground"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (header.column.getCanSort() && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault()
                            header.column.getToggleSortingHandler()?.(e)
                          }
                        }}
                        role={header.column.getCanSort() ? "button" : undefined}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() ? (
                          <span className="text-muted-foreground/80">
                            {header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="size-3" aria-hidden />
                            ) : header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="size-3" aria-hidden />
                            ) : (
                              <ArrowUpDown className="size-3 opacity-50" aria-hidden />
                            )}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: skeletonRowCount }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    {Array.from({ length: colCount }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full max-w-[12rem]" />
                      </td>
                    ))}
                  </tr>
                ))
              : table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={Math.max(colCount, 1)} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        {emptyState ?? "—"}
                      </td>
                    </tr>
                  )
                : table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="transition-colors hover:bg-muted/40">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className={cn("px-4 py-3 text-foreground", dataTableCellClassName(cell))}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
