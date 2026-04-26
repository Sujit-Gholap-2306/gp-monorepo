import type { Namuna9DemandTotals } from '@/lib/api/namuna9'
import { rupeesFromPaise as rupees } from '@/lib/tax/format'

type Props = {
  totals: Namuna9DemandTotals
}

export function Namuna9SummaryCards({ totals }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <div className="rounded-lg border border-gp-border bg-card p-3">
        <p className="text-xs text-gp-muted">मागील</p>
        <p className="mt-1 text-lg font-semibold text-foreground">₹{rupees(totals.previousPaise)}</p>
      </div>
      <div className="rounded-lg border border-gp-border bg-card p-3">
        <p className="text-xs text-gp-muted">चालू मागणी</p>
        <p className="mt-1 text-lg font-semibold text-foreground">₹{rupees(totals.currentPaise)}</p>
      </div>
      <div className="rounded-lg border border-gp-border bg-card p-3">
        <p className="text-xs text-gp-muted">वसुली</p>
        <p className="mt-1 text-lg font-semibold text-foreground">₹{rupees(totals.paidPaise)}</p>
      </div>
      <div className="rounded-lg border border-gp-border bg-card p-3">
        <p className="text-xs text-gp-muted">बाकी</p>
        <p className="mt-1 text-lg font-semibold text-gp-primary">₹{rupees(totals.totalDuePaise)}</p>
      </div>
    </div>
  )
}
