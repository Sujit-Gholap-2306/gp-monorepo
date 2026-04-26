import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { listNamuna9, type Namuna9Demand, type Namuna9Status } from '@/lib/api/namuna9'
import { TAX_HEADS, type TaxHead } from '@/lib/tax/heads'
import { taxHeadLabel } from '@/lib/tax/labels'
import { getNamuna9LineByHead, rupeesFromPaise as rupees } from '@/lib/tax/format'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { Namuna9StatusBadge } from '@/components/admin/namuna9-status-badge'
import { Namuna9SummaryCards } from '@/components/admin/namuna9-summary-cards'
import { Namuna9Tabs } from '@/components/admin/namuna9-tabs'

type PageProps = {
  params: Promise<{ tenant: string, citizenNo: string }>
  searchParams: Promise<{ fiscalYear?: string }>
}

function lineCurrentPaise(demand: Namuna9Demand, taxHead: TaxHead): number {
  return getNamuna9LineByHead(demand, taxHead).currentPaise
}

export default async function AdminNamuna9CitizenDetailPage({ params, searchParams }: PageProps) {
  const { tenant: subdomain, citizenNo: citizenNoRaw } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-lg border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना ९ (नागरिक तपशील)</h1>
        <p className="mt-2 text-sm text-gp-muted">
          हा विभाग Pro योजनेत उपलब्ध आहे. कृपया योजना उन्नत करा.
        </p>
      </div>
    )
  }

  if (!/^\d+$/.test(citizenNoRaw)) notFound()
  const citizenNo = Number(citizenNoRaw)
  const filters = await searchParams
  const fiscalYear = typeof filters.fiscalYear === 'string' ? filters.fiscalYear : ''

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

  let data: Awaited<ReturnType<typeof listNamuna9>> | null = null
  let loadError: string | null = null
  try {
    data = await listNamuna9(
      subdomain,
      {
        fiscalYear: fiscalYear || undefined,
        citizenNo,
      },
      init
    )
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'नागरिक तपशील लोड अयशस्वी'
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
        {loadError}
      </div>
    )
  }

  const items = data?.items ?? []
  if (!items.length) notFound()

  const citizen = items[0]!.owner
  const wards = [...new Set(items.map((item) => item.property.wardNumber).filter(Boolean))]
  const wardLabel = wards.length === 1 ? wards[0] : wards.length > 1 ? 'अनेक' : '—'
  const shownFiscalYear = data?.fiscalYear ?? fiscalYear

  return (
    <div className="space-y-5">
      <Namuna9Tabs subdomain={subdomain} active="citizens" fiscalYear={shownFiscalYear || undefined} />

      <Link
        href={`/${subdomain}/admin/namuna9/citizens?fiscalYear=${encodeURIComponent(shownFiscalYear)}`}
        className="inline-flex items-center gap-1 text-sm text-gp-muted hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span>नागरिक यादीकडे परत</span>
      </Link>

      <div className="rounded-lg border border-gp-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gp-primary">{citizen.nameMr}</h1>
            <p className="mt-1 text-sm text-gp-muted">
              नागरिक क्र. {citizen.citizenNo}
              {citizen.nameEn ? ` · ${citizen.nameEn}` : ''}
              {' · '}वार्ड {wardLabel}
            </p>
          </div>
          <div className="rounded-md border border-gp-border bg-gp-surface px-3 py-2 text-sm text-gp-muted">
            मालमत्ता: <span className="font-medium text-foreground">{items.length}</span>
          </div>
        </div>
      </div>

      <Namuna9SummaryCards totals={data!.totals} />

      <div className="overflow-x-auto rounded-lg border border-gp-border bg-card">
        <table className="min-w-[1220px] w-full text-sm">
          <thead className="bg-gp-surface text-left">
            <tr>
              <th className="px-3 py-2 font-medium">मालमत्ता क्र.</th>
              {TAX_HEADS.map((head) => (
                <th key={head} className="px-3 py-2 text-right font-medium">
                  {taxHeadLabel(head, 'n09')}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-medium">मागील</th>
              <th className="px-3 py-2 text-right font-medium">चालू</th>
              <th className="px-3 py-2 text-right font-medium">भरलेले</th>
              <th className="px-3 py-2 text-right font-medium">बाकी</th>
              <th className="px-3 py-2 font-medium">स्थिती</th>
              <th className="px-3 py-2 font-medium" aria-label="Open" />
            </tr>
          </thead>
          <tbody>
            {items.map((demand) => (
              <tr key={demand.id} className="border-t border-gp-border">
                <td className="px-3 py-2">
                  <div className="font-medium text-gp-primary">{demand.property.propertyNo}</div>
                  <div className="text-xs text-gp-muted">{demand.property.propertyType}</div>
                </td>
                {TAX_HEADS.map((head) => (
                  <td key={head} className="px-3 py-2 text-right">
                    ₹{rupees(lineCurrentPaise(demand, head))}
                  </td>
                ))}
                <td className="px-3 py-2 text-right">₹{rupees(demand.totals.previousPaise)}</td>
                <td className="px-3 py-2 text-right">₹{rupees(demand.totals.currentPaise)}</td>
                <td className="px-3 py-2 text-right">₹{rupees(demand.totals.paidPaise)}</td>
                <td className="px-3 py-2 text-right font-semibold">₹{rupees(demand.totals.totalDuePaise)}</td>
                <td className="px-3 py-2"><Namuna9StatusBadge status={demand.status} /></td>
                <td className="px-3 py-2">
                  <Link
                    href={`/${subdomain}/admin/namuna9/${demand.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gp-border hover:bg-gp-surface"
                    aria-label="मागणी नोंद उघडा"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gp-border bg-gp-surface font-semibold">
            <tr>
              <td className="px-3 py-2">एकूण</td>
              {TAX_HEADS.map((head) => (
                <td key={head} className="px-3 py-2 text-right">
                  ₹{rupees(items.reduce((sum, demand) => sum + lineCurrentPaise(demand, head), 0))}
                </td>
              ))}
              <td className="px-3 py-2 text-right">₹{rupees(data!.totals.previousPaise)}</td>
              <td className="px-3 py-2 text-right">₹{rupees(data!.totals.currentPaise)}</td>
              <td className="px-3 py-2 text-right">₹{rupees(data!.totals.paidPaise)}</td>
              <td className="px-3 py-2 text-right text-gp-primary">₹{rupees(data!.totals.totalDuePaise)}</td>
              <td className="px-3 py-2">—</td>
              <td className="px-3 py-2">—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
