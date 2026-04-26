import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { BadgeIndianRupee, Search } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { listNamuna9Citizens, type Namuna9Status } from '@/lib/api/namuna9'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { Namuna9CitizenTable } from '@/components/admin/namuna9-citizen-table'
import { Namuna9SummaryCards } from '@/components/admin/namuna9-summary-cards'
import { Namuna9Tabs } from '@/components/admin/namuna9-tabs'

type PageProps = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{
    fiscalYear?: string
    q?: string
    ward?: string
    status?: Namuna9Status
  }>
}

export default async function AdminNamuna9CitizensPage({ params, searchParams }: PageProps) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-lg border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना ९ (नागरिक दृश्य)</h1>
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

  let data: Awaited<ReturnType<typeof listNamuna9Citizens>> | null = null
  let loadError: string | null = null
  try {
    data = await listNamuna9Citizens(
      subdomain,
      {
        fiscalYear: fiscalYear || undefined,
        q: q || undefined,
        ward: ward || undefined,
        status: (status || undefined) as Namuna9Status | undefined,
      },
      init
    )
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'नागरिक मागणी माहिती लोड अयशस्वी'
  }

  const shownFiscalYear = data?.fiscalYear ?? fiscalYear
  const items = data?.items ?? []
  const hasFilters = Boolean(q || ward || status)

  return (
    <div className="space-y-5">
      <Namuna9Tabs subdomain={subdomain} active="citizens" fiscalYear={shownFiscalYear || undefined} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">नमुना ९ — नागरिक दृश्य</h1>
          <p className="text-sm text-gp-muted">
            वर्ष: {shownFiscalYear || 'चालू'} · नागरिक: {data?.count ?? 0}
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
        </div>
      </div>

      <Namuna9SummaryCards
        totals={data?.totals ?? { previousPaise: 0, currentPaise: 0, paidPaise: 0, totalDuePaise: 0 }}
      />

      <form method="GET" className="rounded-lg border border-gp-border bg-card p-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
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
                placeholder="नागरिक नाव"
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
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="submit"
            className="h-9 rounded-md bg-gp-primary px-4 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover"
          >
            फिल्टर
          </button>
          <Link
            href={`/${subdomain}/admin/namuna9/citizens`}
            className="h-9 rounded-md border border-gp-border px-3 text-sm leading-9 hover:bg-gp-surface"
          >
            साफ करा
          </Link>
        </div>
      </form>

      {loadError ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      ) : !items.length ? (
        <div className="rounded-lg border border-gp-border bg-card px-4 py-8 text-center text-sm text-gp-muted">
          {hasFilters
            ? 'दिलेल्या फिल्टरनुसार कोणतीही नागरिक नोंद आढळली नाही.'
            : 'या वर्षासाठी नमुना ९ नागरिक नोंदी उपलब्ध नाहीत.'}
        </div>
      ) : (
        <Namuna9CitizenTable
          subdomain={subdomain}
          fiscalYear={shownFiscalYear}
          items={items}
        />
      )}
    </div>
  )
}
