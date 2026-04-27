import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { listReceipts } from '@/lib/api/namuna10'
import { rupeesFromPaise as rupees } from '@/lib/tax/format'

type PageProps = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ q?: string; fiscal_year?: string }>
}

export default async function AdminNamuna10Page({ params, searchParams }: PageProps) {
  const { tenant: subdomain } = await params
  const filters = await searchParams
  const q = typeof filters.q === 'string' ? filters.q : undefined
  const fiscalYear = typeof filters.fiscal_year === 'string' ? filters.fiscal_year : undefined
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-lg border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना १० (वसुली नोंदवही)</h1>
        <p className="mt-2 text-sm text-gp-muted">
          हा विभाग Pro योजनेत उपलब्ध आहे. कृपया योजना उन्नत करा.
        </p>
      </div>
    )
  }

  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) {
    redirect(`/${subdomain}/login`)
  }

  let data: Awaited<ReturnType<typeof listReceipts>> | null = null
  let loadError: string | null = null
  try {
    data = await listReceipts(
      subdomain,
      { q, fiscalYear, limit: 50 },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'पावत्या लोड अयशस्वी'
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">नमुना १० — वसुली नोंदवही</h1>
          <p className="text-sm text-gp-muted">कर वसुली पावत्या</p>
        </div>
        <Link
          href={`/${subdomain}/admin/namuna10/new`}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-gp-primary px-4 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          नवीन पावती
        </Link>
      </div>

      <form method="GET" className="flex flex-col gap-2 sm:flex-row">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="पावती क्र., मालमत्ता क्र., भरणारे नाव"
          className="h-9 flex-1 rounded-md border border-gp-border bg-white px-3 text-sm"
        />
        <button
          type="submit"
          className="h-9 rounded-md bg-gp-primary px-4 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover"
        >
          शोधा
        </button>
        {q && (
          <Link
            href={`/${subdomain}/admin/namuna10`}
            className="inline-flex h-9 items-center rounded-md border border-gp-border px-3 text-sm hover:bg-gp-surface"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-hidden rounded-lg border border-gp-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-gp-surface text-left">
            <tr>
              <th className="px-3 py-2 font-medium">पावती क्र.</th>
              <th className="px-3 py-2 font-medium">मालमत्ता</th>
              <th className="px-3 py-2 font-medium">भरणारे</th>
              <th className="px-3 py-2 text-right font-medium">रक्कम</th>
              <th className="px-3 py-2 font-medium">दिनांक</th>
              <th className="px-3 py-2 font-medium">प्रकार</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {loadError && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-red-700">
                  पावत्या लोड अयशस्वी — {loadError}
                </td>
              </tr>
            )}
            {!loadError && data?.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-gp-muted">
                  {q ? 'कोणतीही पावती सापडली नाही' : 'अद्याप कोणतीही पावती नाही'}
                </td>
              </tr>
            )}
            {data?.items.map((receipt) => (
              <tr
                key={receipt.id}
                className={`border-t border-gp-border ${receipt.isVoid ? 'opacity-50' : ''}`}
              >
                <td className="px-3 py-2 font-medium">
                  <Link
                    href={`/${subdomain}/admin/namuna10/${receipt.id}`}
                    className="text-gp-primary hover:underline"
                  >
                    {receipt.receiptNo}
                  </Link>
                  {receipt.isVoid && (
                    <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-xs text-red-700">Void</span>
                  )}
                </td>
                <td className="px-3 py-2">{receipt.propertyNo}</td>
                <td className="px-3 py-2">{receipt.payerName}</td>
                <td className="px-3 py-2 text-right font-semibold">₹{rupees(receipt.totalPaise)}</td>
                <td className="px-3 py-2 text-gp-muted">
                  {new Date(receipt.paidAt).toLocaleDateString('en-IN')}
                </td>
                <td className="px-3 py-2 text-xs uppercase text-gp-muted">{receipt.paymentMode}</td>
                <td className="px-3 py-2">
                  <Link
                    href={`/${subdomain}/admin/namuna10/${receipt.id}/print`}
                    className="text-xs text-gp-muted hover:text-foreground"
                  >
                    Print
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
