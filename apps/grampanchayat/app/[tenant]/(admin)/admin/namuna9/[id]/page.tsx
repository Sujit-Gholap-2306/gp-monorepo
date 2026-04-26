import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ChevronLeft } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { getNamuna9Demand, type Namuna9Status } from '@/lib/api/namuna9'
import { taxHeadLabel } from '@/lib/tax/labels'
import {
  NAMUNA9_STATUS_CLASSES,
  NAMUNA9_STATUS_LABELS_MR,
  rupeesFromPaise as rupees,
} from '@/lib/tax/format'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ tenant: string, id: string }>
}

function StatusBadge({ status }: { status: Namuna9Status }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${NAMUNA9_STATUS_CLASSES[status]}`}>
      {NAMUNA9_STATUS_LABELS_MR[status]}
    </span>
  )
}

export default async function AdminNamuna9DetailPage({ params }: PageProps) {
  const { tenant: subdomain, id } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-lg border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना ९ (मागणी नोंदवही)</h1>
        <p className="mt-2 text-sm text-gp-muted">
          हा विभाग Pro योजनेत उपलब्ध आहे. कृपया योजना उन्नत करा.
        </p>
      </div>
    )
  }

  const cookieStore = await cookies()
  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) {
    redirect(`/${subdomain}/login`)
  }

  const init = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      cookie: cookieStore.toString(),
    },
  }

  let demand: Awaited<ReturnType<typeof getNamuna9Demand>> | null = null
  let loadError: string | null = null
  try {
    demand = await getNamuna9Demand(subdomain, id, init)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (/not found|404/i.test(message)) notFound()
    loadError = message || 'नमुना ९ माहिती लोड अयशस्वी'
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
        {loadError}
      </div>
    )
  }
  if (!demand) notFound()

  return (
    <div className="space-y-5">
      <Link
        href={`/${subdomain}/admin/namuna9?fiscalYear=${encodeURIComponent(demand.fiscalYear)}`}
        className="inline-flex items-center gap-1 text-sm text-gp-muted hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span>नमुना ९ यादीकडे परत</span>
      </Link>

      <div className="rounded-lg border border-gp-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gp-primary">मागणी नोंद — {demand.property.propertyNo}</h1>
            <p className="mt-1 text-sm text-gp-muted">
              वर्ष {demand.fiscalYear} · वार्ड {demand.property.wardNumber || '—'} · {demand.property.propertyType}
            </p>
          </div>
          <StatusBadge status={demand.status} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-gp-border bg-gp-surface p-3">
            <p className="text-xs text-gp-muted">मालक</p>
            <p className="mt-1 font-medium text-foreground">{demand.owner.nameMr}</p>
            <p className="text-xs text-gp-muted">#{demand.owner.citizenNo}</p>
          </div>
          <div className="rounded-md border border-gp-border bg-gp-surface p-3">
            <p className="text-xs text-gp-muted">मागील</p>
            <p className="mt-1 font-semibold text-foreground">₹{rupees(demand.totals.previousPaise)}</p>
          </div>
          <div className="rounded-md border border-gp-border bg-gp-surface p-3">
            <p className="text-xs text-gp-muted">चालू मागणी</p>
            <p className="mt-1 font-semibold text-foreground">₹{rupees(demand.totals.currentPaise)}</p>
          </div>
          <div className="rounded-md border border-gp-border bg-gp-surface p-3">
            <p className="text-xs text-gp-muted">बाकी</p>
            <p className="mt-1 font-semibold text-gp-primary">₹{rupees(demand.totals.totalDuePaise)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gp-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-gp-surface text-left">
            <tr>
              <th className="px-3 py-2 font-medium">कर प्रकार</th>
              <th className="px-3 py-2 text-right font-medium">मागील</th>
              <th className="px-3 py-2 text-right font-medium">चालू</th>
              <th className="px-3 py-2 text-right font-medium">एकूण मागणी</th>
              <th className="px-3 py-2 text-right font-medium">भरलेले</th>
              <th className="px-3 py-2 text-right font-medium">बाकी</th>
              <th className="px-3 py-2 font-medium">स्थिती</th>
            </tr>
          </thead>
          <tbody>
            {demand.lines.map((line) => (
              <tr key={line.taxHead} className="border-t border-gp-border">
                <td className="px-3 py-2 font-medium">{taxHeadLabel(line.taxHead, 'n09')}</td>
                <td className="px-3 py-2 text-right">₹{rupees(line.previousPaise)}</td>
                <td className="px-3 py-2 text-right">₹{rupees(line.currentPaise)}</td>
                <td className="px-3 py-2 text-right">₹{rupees(line.previousPaise + line.currentPaise)}</td>
                <td className="px-3 py-2 text-right">₹{rupees(line.paidPaise)}</td>
                <td className="px-3 py-2 text-right font-semibold">₹{rupees(line.totalDuePaise)}</td>
                <td className="px-3 py-2"><StatusBadge status={line.status} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gp-border bg-gp-surface font-semibold">
            <tr>
              <td className="px-3 py-2">एकूण</td>
              <td className="px-3 py-2 text-right">₹{rupees(demand.totals.previousPaise)}</td>
              <td className="px-3 py-2 text-right">₹{rupees(demand.totals.currentPaise)}</td>
              <td className="px-3 py-2 text-right">
                ₹{rupees(demand.totals.previousPaise + demand.totals.currentPaise)}
              </td>
              <td className="px-3 py-2 text-right">₹{rupees(demand.totals.paidPaise)}</td>
              <td className="px-3 py-2 text-right text-gp-primary">₹{rupees(demand.totals.totalDuePaise)}</td>
              <td className="px-3 py-2"><StatusBadge status={demand.status} /></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="rounded-lg border border-gp-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">पावती इतिहास</h2>
        <p className="mt-2 text-sm text-gp-muted">नोंदी उपलब्ध नाहीत.</p>
      </div>
    </div>
  )
}
