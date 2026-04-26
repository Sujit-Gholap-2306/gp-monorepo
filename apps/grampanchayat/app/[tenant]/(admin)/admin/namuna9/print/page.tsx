import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { listNamuna9, type Namuna9Status } from '@/lib/api/namuna9'
import { Namuna9PrintActions } from '@/components/admin/namuna9-print-actions'
import { Namuna9RegisterTable } from '@/components/admin/namuna9-register-table'

type PageProps = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{
    fiscalYear?: string
    q?: string
    ward?: string
    status?: Namuna9Status
    paper?: string
  }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const filters = await searchParams
  const fy = (typeof filters.fiscalYear === 'string' && filters.fiscalYear) || 'print'
  return { title: `नमुना-9-${fy}` }
}

function formatReportDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default async function Namuna9PrintPage({ params, searchParams }: PageProps) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-xl border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना ९ प्रिंट</h1>
        <p className="mt-2 text-sm text-gp-muted">हा विभाग Pro योजनेत उपलब्ध आहे.</p>
      </div>
    )
  }

  const filters = await searchParams
  const fiscalYear = typeof filters.fiscalYear === 'string' ? filters.fiscalYear : ''
  const ward = typeof filters.ward === 'string' ? filters.ward : ''
  const q = typeof filters.q === 'string' ? filters.q : ''
  const status = typeof filters.status === 'string' ? filters.status : ''
  const paperRaw = typeof filters.paper === 'string' ? filters.paper.toLowerCase() : ''
  const paper: 'a4' | 'a3' = paperRaw === 'a3' ? 'a3' : 'a4'

  const cookieStore = await cookies()
  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) redirect(`/${subdomain}/login`)

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
        ward: ward || undefined,
        q: q || undefined,
        status: (status || undefined) as Namuna9Status | undefined,
      },
      init
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (/not found|404/i.test(message)) notFound()
    loadError = message || 'नमुना ९ प्रिंट माहिती लोड अयशस्वी'
  }
  if (loadError) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
        {loadError}
      </div>
    )
  }
  if (!data) notFound()

  const baseQuery = new URLSearchParams()
  if (data.fiscalYear) baseQuery.set('fiscalYear', data.fiscalYear)
  if (ward) baseQuery.set('ward', ward)
  if (q) baseQuery.set('q', q)
  if (status) baseQuery.set('status', status)
  const backHref = baseQuery.toString()
    ? `/${subdomain}/admin/namuna9?${baseQuery.toString()}`
    : `/${subdomain}/admin/namuna9`

  const a4Query = new URLSearchParams(baseQuery)
  a4Query.set('paper', 'a4')
  const a3Query = new URLSearchParams(baseQuery)
  a3Query.set('paper', 'a3')
  const a4Href = `/${subdomain}/admin/namuna9/print?${a4Query.toString()}`
  const a3Href = `/${subdomain}/admin/namuna9/print?${a3Query.toString()}`
  const pageSize = `${paper.toUpperCase()} landscape`
  // TODO: chunk/paginate very large registers (1k+ rows) to reduce render pressure.

  return (
    <div className="mx-auto max-w-7xl">
      <style>{`
        @page { size: ${pageSize}; margin: 8mm; }
        @media print {
          html, body { background: white !important; }
          body * { visibility: hidden !important; }
          [data-namuna9-print-root="true"],
          [data-namuna9-print-root="true"] * { visibility: visible !important; }
          [data-namuna9-print-root="true"] {
            position: absolute !important;
            inset: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          [data-namuna9-print-root="true"] table {
            width: 100% !important;
            table-layout: fixed;
          }
          [data-namuna9-print-root="true"] thead {
            display: table-header-group;
          }
          [data-namuna9-print-root="true"] tr {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <Namuna9PrintActions
        backHref={backHref}
        a4Href={a4Href}
        a3Href={a3Href}
        paper={paper}
      />

      <article
        data-namuna9-print-root="true"
        data-print-region="namuna9"
        className="bg-white print:p-0"
      >
        <Namuna9RegisterTable
          items={data.items}
          tenantName={tenant.name_mr}
          fiscalYear={data.fiscalYear}
          reportDateLabel={formatReportDate(new Date())}
        />
      </article>
    </div>
  )
}
