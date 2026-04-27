import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { BadgeIndianRupee, ChevronRight, Printer, Search } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { listNamuna9, type Namuna9Demand, type Namuna9Status } from '@/lib/api/namuna9'
import { TAX_HEADS, type TaxHead } from '@/lib/tax/heads'
import { taxHeadLabel } from '@/lib/tax/labels'
import {
  getNamuna9LineByHead,
  rupeesFromPaise as rupees,
} from '@/lib/tax/format'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { Namuna9GenerateButton } from '@/components/admin/namuna9-generate-button'
import { Namuna9OpeningImport } from '@/components/admin/namuna9-opening-import'
import { Namuna9StatusBadge } from '@/components/admin/namuna9-status-badge'
import { Namuna9SummaryCards } from '@/components/admin/namuna9-summary-cards'
import { Namuna9Tabs } from '@/components/admin/namuna9-tabs'

type Namuna9PageProps = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{
    fiscalYear?: string
    q?: string
    ward?: string
    status?: Namuna9Status
    citizenNo?: string
  }>
}

function lineCurrentPaise(demand: Namuna9Demand, taxHead: TaxHead): number {
  return getNamuna9LineByHead(demand, taxHead).currentPaise
}

export default async function AdminNamuna9Page({ params, searchParams }: Namuna9PageProps) {
  const { tenant: subdomain } = await params
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

  const filters = await searchParams
  const fiscalYear = typeof filters.fiscalYear === 'string' ? filters.fiscalYear : ''
  const q = typeof filters.q === 'string' ? filters.q : ''
  const ward = typeof filters.ward === 'string' ? filters.ward : ''
  const status = typeof filters.status === 'string' ? filters.status : ''
  const citizenNoRaw = typeof filters.citizenNo === 'string' ? filters.citizenNo : ''
  const citizenNo = citizenNoRaw && /^\d+$/.test(citizenNoRaw) ? Number(citizenNoRaw) : undefined

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
        q: q || undefined,
        ward: ward || undefined,
        status: (status || undefined) as Namuna9Status | undefined,
        citizenNo,
      },
      init
    )
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'नमुना ९ माहिती लोड अयशस्वी'
  }

  const items = data?.items ?? []
  const shownFiscalYear = data?.fiscalYear ?? fiscalYear
  const hasFilters = Boolean(q || ward || status || citizenNo)
  const citizenBanner = citizenNo && items.length > 0 ? items[0]!.owner : null
  const printQuery = new URLSearchParams()
  if (shownFiscalYear) printQuery.set('fiscalYear', shownFiscalYear)
  if (q) printQuery.set('q', q)
  if (ward) printQuery.set('ward', ward)
  if (status) printQuery.set('status', status)
  if (citizenNo) printQuery.set('citizenNo', String(citizenNo))
  const printHref = printQuery.toString()
    ? `/${subdomain}/admin/namuna9/print?${printQuery.toString()}`
    : `/${subdomain}/admin/namuna9/print`

  return (
    <div className="space-y-5">
      <Namuna9Tabs subdomain={subdomain} active="register" fiscalYear={shownFiscalYear || undefined} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">नमुना ९ — मागणी नोंदवही</h1>
          <p className="text-sm text-gp-muted">
            वर्ष: {shownFiscalYear || 'चालू'} · नोंदी: {data?.count ?? 0}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/${subdomain}/admin/namuna8`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-gp-border bg-card px-3 text-sm transition-colors hover:bg-gp-surface"
          >
            <BadgeIndianRupee className="h-4 w-4" aria-hidden="true" />
            <span>नमुना ८ पहा</span>
          </Link>
          <Link
            href={printHref}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-gp-border bg-card px-3 text-sm transition-colors hover:bg-gp-surface"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>Print Register</span>
          </Link>
          <Namuna9GenerateButton
            subdomain={subdomain}
            fiscalYear={shownFiscalYear || undefined}
          />
        </div>
      </div>

      <Namuna9SummaryCards
        totals={data?.totals ?? { previousPaise: 0, currentPaise: 0, paidPaise: 0, totalDuePaise: 0 }}
      />

      {citizenBanner && (
        <div className="rounded-lg border border-gp-border bg-gp-surface px-4 py-3 text-sm">
          <span className="font-medium text-gp-primary">{citizenBanner.nameMr}</span>
          {citizenBanner.nameEn && (
            <span className="ml-2 text-gp-muted">({citizenBanner.nameEn})</span>
          )}
          <span className="ml-3 text-gp-muted">नागरिक क्र. {citizenBanner.citizenNo}</span>
          <span className="ml-3 text-gp-muted">· {data?.count ?? 0} मालमत्ता</span>
          <span className="ml-3 font-medium text-gp-primary">बाकी ₹{rupees(data?.totals.totalDuePaise ?? 0)}</span>
        </div>
      )}

      <Namuna9OpeningImport
        subdomain={subdomain}
        fiscalYear={shownFiscalYear || undefined}
      />

      <form method="GET" className="rounded-lg border border-gp-border bg-card p-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
          <label className="block text-xs text-gp-muted">
            आर्थिक वर्ष
            <input
              type="text"
              name="fiscalYear"
              defaultValue={shownFiscalYear}
              placeholder="2026-27"
              className="mt-1 h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
            />
          </label>
          <label className="block text-xs text-gp-muted">
            शोधा
            <div className="relative mt-1">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gp-muted" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="मालक / मालमत्ता क्रमांक"
                className="h-9 w-full rounded-md border border-gp-border bg-white pl-7 pr-2 text-sm"
              />
            </div>
          </label>
          <label className="block text-xs text-gp-muted">
            वार्ड
            <input
              type="text"
              name="ward"
              defaultValue={ward}
              placeholder="उदा. १"
              className="mt-1 h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
            />
          </label>
          <label className="block text-xs text-gp-muted">
            नागरिक क्रमांक
            <input
              type="number"
              name="citizenNo"
              defaultValue={citizenNoRaw}
              placeholder="उदा. 42"
              min="1"
              className="mt-1 h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
            />
          </label>
          <label className="block text-xs text-gp-muted">
            स्थिती
            <select
              name="status"
              defaultValue={status}
              className="mt-1 h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
            >
              <option value="">सर्व</option>
              <option value="pending">बाकी</option>
              <option value="partial">अंशतः भरले</option>
              <option value="paid">पूर्ण</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="h-9 rounded-md bg-gp-primary px-4 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover"
            >
              फिल्टर
            </button>
            <Link
              href={`/${subdomain}/admin/namuna9`}
              className="h-9 rounded-md border border-gp-border px-3 text-sm leading-9 hover:bg-gp-surface"
            >
              साफ करा
            </Link>
          </div>
        </div>
      </form>

      {loadError ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      ) : !items.length ? (
        <div className="rounded-lg border border-gp-border bg-card px-4 py-8 text-center text-sm text-gp-muted">
          {hasFilters
            ? 'दिलेल्या फिल्टरनुसार कोणतीही मागणी नोंद आढळली नाही.'
            : 'या वर्षासाठी नमुना ९ मागणी तयार केलेली नाही.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gp-border bg-card">
          <table className="min-w-[1120px] w-full text-sm">
            <thead className="bg-gp-surface text-left">
              <tr>
                <th className="px-3 py-2 font-medium">मालमत्ता</th>
                <th className="px-3 py-2 font-medium">मालक</th>
                <th className="px-3 py-2 font-medium">वार्ड</th>
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
                <th className="px-3 py-2 font-medium">वसुली</th>
                <th className="px-3 py-2 font-medium" aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {items.map((demand) => (
                <tr key={demand.id} className="border-t border-gp-border">
                  <td className="px-3 py-2">
                    <Link
                      href={`/${subdomain}/admin/namuna9/${demand.id}`}
                      className="font-medium text-gp-primary hover:underline"
                    >
                      {demand.property.propertyNo}
                    </Link>
                    <div className="text-xs text-gp-muted">{demand.property.propertyType}</div>
                  </td>
                  <td className="px-3 py-2">
                    {demand.owner.nameMr}
                    <div className="text-xs text-gp-muted">#{demand.owner.citizenNo}</div>
                  </td>
                  <td className="px-3 py-2">{demand.property.wardNumber || '—'}</td>
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
                    {demand.status !== 'paid' && (
                      <Link
                        href={`/${subdomain}/admin/namuna10/new?propertyId=${encodeURIComponent(demand.property.id)}`}
                        className="inline-flex h-8 items-center rounded-md border border-gp-border px-3 text-xs font-medium hover:bg-gp-surface"
                      >
                        वसुली नोंदवा
                      </Link>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/${subdomain}/admin/namuna9/${demand.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gp-border hover:bg-gp-surface"
                      aria-label="नोंद उघडा"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
