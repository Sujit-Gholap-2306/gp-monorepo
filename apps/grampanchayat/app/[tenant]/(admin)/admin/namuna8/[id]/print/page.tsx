import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { getNamuna8Property } from '@/lib/api/namuna8'
import { Namuna8PrintActions } from '@/components/admin/namuna8-print-actions'
import { Namuna8PrintDraftTable } from '@/components/admin/namuna8-print-draft-table'

type PageProps = {
  params: Promise<{ tenant: string, id: string }>
}

function formatReportDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default async function Namuna8PrintPage({ params }: PageProps) {
  const { tenant: subdomain, id } = await params

  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-xl border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना ८ प्रिंट</h1>
        <p className="mt-2 text-sm text-gp-muted">हा विभाग Pro योजनेत उपलब्ध आहे.</p>
      </div>
    )
  }

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

  let base: Awaited<ReturnType<typeof getNamuna8Property>> | null = null
  try {
    base = await getNamuna8Property(subdomain, id, init)
  } catch {
    notFound()
  }
  if (!base) notFound()

  const reportDateLabel = base.assessmentDate
    ? formatReportDate(new Date(`${base.assessmentDate}T12:00:00`))
    : formatReportDate(new Date())

  return (
    <div className="mx-auto max-w-7xl">
      <style>{`
        @page { size: A3 landscape; margin: 8mm; }
        @media print {
          html, body { background: white !important; }
          body * { visibility: hidden !important; }
          [data-namuna8-print-root="true"],
          [data-namuna8-print-root="true"] * { visibility: visible !important; }
          [data-namuna8-print-root="true"] {
            position: absolute !important;
            inset: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          [data-namuna8-print-root="true"] table {
            min-width: 0 !important;
            width: 100% !important;
            table-layout: fixed;
          }
        }
      `}</style>
      <Namuna8PrintActions backHref={`/${subdomain}/admin/namuna8/${id}`} />

      <article data-namuna8-print-root="true" className="bg-white print:p-0">
        <Namuna8PrintDraftTable
          data={base}
          tenantName={tenant.name_mr}
          reportDateLabel={reportDateLabel}
        />
      </article>
    </div>
  )
}
