import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Namuna9CitizenSummary } from '@/lib/api/namuna9'
import { Namuna9StatusBadge } from '@/components/admin/namuna9-status-badge'
import { rupeesFromPaise as rupees } from '@/lib/tax/format'

type Props = {
  subdomain: string
  fiscalYear: string
  items: Namuna9CitizenSummary[]
}

export function Namuna9CitizenTable({ subdomain, fiscalYear, items }: Props) {
  const totals = items.reduce(
    (acc, item) => ({
      propertyCount: acc.propertyCount + item.propertyCount,
      previousPaise: acc.previousPaise + item.totals.previousPaise,
      currentPaise: acc.currentPaise + item.totals.currentPaise,
      paidPaise: acc.paidPaise + item.totals.paidPaise,
      totalDuePaise: acc.totalDuePaise + item.totals.totalDuePaise,
    }),
    { propertyCount: 0, previousPaise: 0, currentPaise: 0, paidPaise: 0, totalDuePaise: 0 }
  )

  return (
    <div className="overflow-x-auto rounded-lg border border-gp-border bg-card">
      <table className="min-w-[1080px] w-full text-sm">
        <thead className="bg-gp-surface text-left">
          <tr>
            <th className="px-3 py-2 font-medium">नागरिक क्र.</th>
            <th className="px-3 py-2 font-medium">नाव</th>
            <th className="px-3 py-2 font-medium">वार्ड</th>
            <th className="px-3 py-2 text-right font-medium">मालमत्ता</th>
            <th className="px-3 py-2 text-right font-medium">चालू मागणी</th>
            <th className="px-3 py-2 text-right font-medium">मागील थकबाकी</th>
            <th className="px-3 py-2 text-right font-medium">भरलेले</th>
            <th className="px-3 py-2 text-right font-medium">बाकी</th>
            <th className="px-3 py-2 font-medium">स्थिती</th>
            <th className="px-3 py-2 font-medium" aria-label="Open" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.citizenNo} className="border-t border-gp-border">
              <td className="px-3 py-2 font-medium">{item.citizenNo}</td>
              <td className="px-3 py-2">
                {item.nameMr}
                {item.nameEn ? <div className="text-xs text-gp-muted">{item.nameEn}</div> : null}
              </td>
              <td className="px-3 py-2">{item.wardNumber || '—'}</td>
              <td className="px-3 py-2 text-right">{item.propertyCount}</td>
              <td className="px-3 py-2 text-right">₹{rupees(item.totals.currentPaise)}</td>
              <td className="px-3 py-2 text-right">₹{rupees(item.totals.previousPaise)}</td>
              <td className="px-3 py-2 text-right">₹{rupees(item.totals.paidPaise)}</td>
              <td className="px-3 py-2 text-right font-semibold">₹{rupees(item.totals.totalDuePaise)}</td>
              <td className="px-3 py-2"><Namuna9StatusBadge status={item.status} /></td>
              <td className="px-3 py-2">
                <Link
                  href={`/${subdomain}/admin/namuna9/citizens/${item.citizenNo}?fiscalYear=${encodeURIComponent(fiscalYear)}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gp-border hover:bg-gp-surface"
                  aria-label="नागरिक तपशील उघडा"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-gp-border bg-gp-surface font-semibold">
          <tr>
            <td className="px-3 py-2" colSpan={3}>एकूण</td>
            <td className="px-3 py-2 text-right">{totals.propertyCount}</td>
            <td className="px-3 py-2 text-right">₹{rupees(totals.currentPaise)}</td>
            <td className="px-3 py-2 text-right">₹{rupees(totals.previousPaise)}</td>
            <td className="px-3 py-2 text-right">₹{rupees(totals.paidPaise)}</td>
            <td className="px-3 py-2 text-right text-gp-primary">₹{rupees(totals.totalDuePaise)}</td>
            <td className="px-3 py-2">—</td>
            <td className="px-3 py-2">—</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
