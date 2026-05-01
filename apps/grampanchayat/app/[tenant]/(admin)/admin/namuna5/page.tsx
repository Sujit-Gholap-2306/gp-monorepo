import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { listNamuna5 } from '@/lib/api/namuna56'
import { type GpAccountHead, isAccountHead } from '@/lib/tax/heads'
import { accountHeadLabel, ACCOUNT_HEAD_LABELS } from '@/lib/tax/labels'
import { rupeesFromPaise as rupees } from '@/lib/tax/format'

type PageProps = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{
    fiscalYear?: string
    from?: string
    to?: string
    head?: string
  }>
}

export default async function AdminNamuna5Page({ params, searchParams }: PageProps) {
  const { tenant: subdomain } = await params
  const filters = await searchParams
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-lg border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना ५ (दैनिक रोख नोंदवही)</h1>
        <p className="mt-2 text-sm text-gp-muted">
          हा विभाग Pro योजनेत उपलब्ध आहे. कृपया योजना उन्नत करा.
        </p>
      </div>
    )
  }

  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) redirect(`/${subdomain}/login`)

  const fiscalYear = typeof filters.fiscalYear === 'string' ? filters.fiscalYear : undefined
  const from = typeof filters.from === 'string' ? filters.from : undefined
  const to = typeof filters.to === 'string' ? filters.to : undefined
  const headRaw = typeof filters.head === 'string' ? filters.head : undefined
  const head = headRaw && isAccountHead(headRaw) ? headRaw : undefined

  let data: Awaited<ReturnType<typeof listNamuna5>> | null = null
  let loadError: string | null = null
  try {
    data = await listNamuna5(
      subdomain,
      { fiscalYear, from, to, head, limit: 300 },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'नमुना ५ लोड अयशस्वी'
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">नमुना ५ — दैनिक रोख नोंदवही</h1>
          <p className="text-sm text-gp-muted">
            आर्थिक वर्ष: {data?.fiscalYear ?? fiscalYear ?? 'चालू'} · नोंदी: {data?.count ?? 0}
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <div className="rounded-md border border-gp-border bg-card px-3 py-1.5">
            जमा: <span className="font-semibold text-green-700">₹{rupees(data?.totals.creditPaise ?? 0)}</span>
          </div>
          <div className="rounded-md border border-gp-border bg-card px-3 py-1.5">
            खर्च: <span className="font-semibold text-red-700">₹{rupees(data?.totals.debitPaise ?? 0)}</span>
          </div>
          <div className="rounded-md border border-gp-border bg-card px-3 py-1.5">
            निव्वळ: <span className="font-semibold">₹{rupees(data?.totals.netPaise ?? 0)}</span>
          </div>
        </div>
      </div>

      <form method="GET" className="grid gap-3 rounded-lg border border-gp-border bg-card p-3 md:grid-cols-[160px_150px_150px_220px_auto]">
        <label className="text-xs text-gp-muted">
          आर्थिक वर्ष
          <input
            name="fiscalYear"
            defaultValue={fiscalYear ?? data?.fiscalYear ?? ''}
            placeholder="2026-27"
            className="mt-1 h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
          />
        </label>
        <label className="text-xs text-gp-muted">
          पासून
          <input
            type="date"
            name="from"
            defaultValue={from ?? ''}
            className="mt-1 h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
          />
        </label>
        <label className="text-xs text-gp-muted">
          पर्यंत
          <input
            type="date"
            name="to"
            defaultValue={to ?? ''}
            className="mt-1 h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
          />
        </label>
        <label className="text-xs text-gp-muted">
          लेखाशीर्ष
          <select
            name="head"
            defaultValue={head ?? ''}
            className="mt-1 h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
          >
            <option value="">सर्व</option>
            {Object.entries(ACCOUNT_HEAD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
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
            href={`/${subdomain}/admin/namuna5`}
            className="h-9 rounded-md border border-gp-border px-3 text-sm leading-9 hover:bg-gp-surface"
          >
            साफ करा
          </Link>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-gp-border bg-card">
        <table className="min-w-[1150px] w-full text-sm">
          <thead className="bg-gp-surface text-left">
            <tr>
              <th className="px-3 py-2 font-medium">दिनांक</th>
              <th className="px-3 py-2 font-medium">लेखाशीर्ष</th>
              <th className="px-3 py-2 font-medium">तपशील</th>
              <th className="px-3 py-2 text-right font-medium">जमा</th>
              <th className="px-3 py-2 text-right font-medium">खर्च</th>
              <th className="px-3 py-2 text-right font-medium">शिल्लक</th>
              <th className="px-3 py-2 font-medium">स्रोत</th>
            </tr>
          </thead>
          <tbody>
            {loadError && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-red-700">
                  नमुना ५ लोड अयशस्वी — {loadError}
                </td>
              </tr>
            )}
            {!loadError && !data?.items.length && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-gp-muted">
                  निवडलेल्या कालावधीत नोंदी नाहीत.
                </td>
              </tr>
            )}
            {data?.items.map((row) => (
              <tr key={row.id} className="border-t border-gp-border">
                <td className="px-3 py-2">{row.entryDate.split('-').reverse().join('/')}</td>
                <td className="px-3 py-2">{accountHeadLabel(row.accountHead)}</td>
                <td className="px-3 py-2">{row.description || '—'}</td>
                <td className="px-3 py-2 text-right">
                  {row.entryType === 'credit' ? `₹${rupees(row.amountPaise)}` : '—'}
                </td>
                <td className="px-3 py-2 text-right">
                  {row.entryType === 'debit' ? `₹${rupees(row.amountPaise)}` : '—'}
                </td>
                <td className="px-3 py-2 text-right font-semibold">₹{rupees(row.runningBalancePaise)}</td>
                <td className="px-3 py-2 text-xs uppercase text-gp-muted">{row.sourceType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
