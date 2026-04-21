'use client'

import { useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import { formatInrAmount } from '@gp/shadcn/ui/amount'
import { DataTable } from '@gp/shadcn/ui/data-table'
import { HalfYearTabs, type HalfYearIndex } from '@gp/shadcn/ui/half-year-tabs'
import { StatCard } from '@gp/shadcn/ui/stat-card'
import { demandColumns, type DemandMockRow } from './demand-columns'

const MOCK_DEMAND_ROWS: DemandMockRow[] = [
  { id: '1', surveyNumber: '142/2', ownerMr: 'रामदास पाटील', demandTotal: 2400, status: 'UNPAID', halfYear: 1 },
  { id: '2', surveyNumber: '88/1', ownerMr: 'सुनीता जाधव', demandTotal: 1850.5, status: 'PARTIAL', halfYear: 1 },
  { id: '3', surveyNumber: '15/3', ownerMr: 'गणेश कुलकर्णी', demandTotal: 3200, status: 'PAID', halfYear: 1 },
  { id: '4', surveyNumber: '201/A', ownerMr: 'लक्ष्मण भोसले', demandTotal: 950, status: 'UNPAID', halfYear: 2 },
  { id: '5', surveyNumber: '44/2', ownerMr: 'विद्या शिंदे', demandTotal: 4100, status: 'PARTIAL', halfYear: 2 },
]

export default function DemandPage() {
  const [halfYear, setHalfYear] = useState<HalfYearIndex>(1)

  const rows = useMemo(() => MOCK_DEMAND_ROWS.filter(r => r.halfYear === halfYear), [halfYear])

  const unpaid = rows.filter(r => r.status === 'UNPAID').length
  const partial = rows.filter(r => r.status === 'PARTIAL').length
  const paid = rows.filter(r => r.status === 'PAID').length
  const totalOutstanding = rows.filter(r => r.status !== 'PAID').reduce((s, r) => s + r.demandTotal, 0)

  return (
    <div className="animate-fade-in max-w-5xl space-y-6 p-5 md:p-7">
      <div>
        <h1 className="text-xl font-bold text-foreground">कर मागणी (नमुना ९)</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">सहामाही निवड व मागणी तक्ता</p>
      </div>

      <HalfYearTabs value={halfYear} onChange={setHalfYear} idPrefix="demand-hy" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="न भरलेले नोंदी"
          value={String(unpaid)}
          icon={FileText}
          iconClassName="text-destructive"
          variant="destructive"
        />
        <StatCard
          label="अंशतः भरलेले"
          value={String(partial)}
          icon={FileText}
          iconClassName="text-warning"
          variant="warning"
        />
        <StatCard label="भरलेले" value={String(paid)} icon={FileText} iconClassName="text-success" variant="success" />
        <StatCard
          label="थकबाकी (नमुना)"
          value={formatInrAmount(totalOutstanding)}
          icon={FileText}
          iconClassName="text-primary"
          variant="primary"
        />
      </div>

      <DataTable
        data={rows}
        columns={demandColumns}
        getRowId={row => row.id}
        emptyState={<span>या सहामाहीत कोणतीही मागणी नाही</span>}
      />
    </div>
  )
}
