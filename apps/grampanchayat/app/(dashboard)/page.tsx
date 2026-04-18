'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ScrollText, FileText, FilePlus, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { Amount } from '@gp/shadcn/ui/amount'
import { StatCard } from '@gp/shadcn/ui/stat-card'
import { StatusBadge } from '@gp/shadcn/ui/status-badge'
import { getAllUtaras } from '@/lib/db'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'
import { formatDate } from '@/lib/utils'

/** नमुना एकूण वार्षिक मागणी (प्रात्यक्षिक) */
const SAMPLE_TOTAL_DEMAND = 124_500

export default function DashboardPage() {
  const { data: utaras = [], isLoading } = useQuery({
    queryKey: ['utaras'],
    queryFn: getAllUtaras,
  })

  const stats = {
    total: utaras.length,
    active: utaras.filter(u => u.status === 'active').length,
    pending: utaras.filter(u => u.status === 'pending').length,
    disputed: utaras.filter(u => u.status === 'disputed').length,
  }

  const recent = utaras.slice(0, 5)

  return (
    <div className="animate-fade-in max-w-5xl space-y-6 p-5 md:p-7">
      <div>
        <h1 className="text-xl font-bold text-foreground">मुख्यपृष्ठ</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">उतारा नोंदींचा आढावा</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="एकूण उतारे"
          value={isLoading ? '—' : String(stats.total)}
          icon={ScrollText}
          iconClassName="text-primary"
          variant="primary"
        />
        <StatCard
          label="चालू"
          value={isLoading ? '—' : String(stats.active)}
          icon={CheckCircle}
          iconClassName="text-success"
          variant="success"
        />
        <StatCard
          label="प्रलंबित"
          value={isLoading ? '—' : String(stats.pending)}
          icon={Clock}
          iconClassName="text-warning"
          variant="warning"
        />
        <StatCard
          label="वादग्रस्त"
          value={isLoading ? '—' : String(stats.disputed)}
          icon={AlertTriangle}
          iconClassName="text-destructive"
          variant="destructive"
        />
      </div>

      <div className="rounded-xl border border-border bg-card/80 px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">नमुना — एकूण कर मागणी (प्रात्यक्षिक)</p>
        <p className="text-lg font-semibold text-foreground">
          <Amount value={SAMPLE_TOTAL_DEMAND} />
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-muted-foreground">भरणा स्थिती:</span>
          <StatusBadge status="UNPAID" locale="mr" />
          <StatusBadge status="PARTIAL" locale="mr" />
          <StatusBadge status="PAID" locale="mr" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/utaras"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <ScrollText className="size-4" />
          सर्व उतारे पाहा
        </Link>
        <Link
          href="/demand"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <FileText className="size-4" />
          कर मागणी (नमुना ९)
        </Link>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">अलीकडील नोंदी</h2>
          <Link href="/utaras" className="flex items-center gap-1 text-xs text-primary hover:underline">
            सर्व पाहा <ArrowRight className="size-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">लोड होत आहे...</div>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
            <ScrollText className="mx-auto mb-2 size-8 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">अद्याप कोणतीही नोंद नाही</p>
            <Link
              href="/utaras/new"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <FilePlus className="size-3.5" />
              पहिली नोंद जोडा
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-left">
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">गट नंबर</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">मालक</th>
                  <th className="hidden px-4 py-2.5 text-xs font-semibold text-muted-foreground sm:table-cell">गाव</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">स्थिती</th>
                  <th className="hidden px-4 py-2.5 text-xs font-semibold text-muted-foreground md:table-cell">दिनांक</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map(u => (
                  <tr key={u.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{u.surveyNumber}</td>
                    <td className="px-4 py-3">
                      <Link href={`/utaras/${u.id}`} className="font-medium text-foreground hover:text-primary">
                        {u.ownerName}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{u.village}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[u.status]}`}>
                        {STATUS_LABELS[u.status]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
