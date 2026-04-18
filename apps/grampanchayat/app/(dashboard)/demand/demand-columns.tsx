'use client'

import { Amount } from '@gp/shadcn/ui/amount'
import { createColumnHelper } from '@gp/shadcn/ui/data-table'
import { StatusBadge, type DemandStatus } from '@gp/shadcn/ui/status-badge'
import type { HalfYearIndex } from '@gp/shadcn/ui/half-year-tabs'

export type DemandMockRow = {
  id: string
  surveyNumber: string
  ownerMr: string
  demandTotal: number
  status: DemandStatus
  /** FY half-year (नमुना ९) */
  halfYear: HalfYearIndex
}

const columnHelper = createColumnHelper<DemandMockRow>()

export const demandColumns = [
  columnHelper.accessor('surveyNumber', {
    header: 'गट',
    cell: info => <span className="font-mono text-xs">{info.getValue()}</span>,
  }),
  columnHelper.accessor('ownerMr', {
    header: 'मालक',
  }),
  columnHelper.accessor('demandTotal', {
    header: 'मागणी',
    meta: { align: 'right' },
    cell: info => <Amount value={info.getValue()} />,
  }),
  columnHelper.accessor('status', {
    header: 'स्थिती',
    enableSorting: false,
    cell: info => <StatusBadge status={info.getValue()} locale="mr" />,
  }),
]
