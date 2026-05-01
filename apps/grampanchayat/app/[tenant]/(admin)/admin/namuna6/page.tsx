import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { listNamuna6 } from '@/lib/api/namuna56'
import { accountHeadLabel, FY_MONTH_OPTIONS } from '@/lib/tax/labels'
import { rupeesFromPaise as rupees } from '@/lib/tax/format'

type PageProps = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{
    fiscalYear?: string
    month?: string
  }>
}

export default async function AdminNamuna6Page({ params, searchParams }: PageProps) {
  const { tenant: subdomain } = await params
  const filters = await searchParams
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-lg border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना ६ (वर्गीकृत जमा)</h1>
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
  const monthRaw = typeof filters.month === 'string' ? Number(filters.month) : undefined
  const month = Number.isInteger(monthRaw) && monthRaw != null && monthRaw >= 1 && monthRaw <= 12
    ? monthRaw
    : undefined

  let data: Awaited<ReturnType<typeof listNamuna6>> | null = null
  let loadError: string | null = null
  try {
    data = await listNamuna6(
      subdomain,
      { fiscalYear, month },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'नमुना ६ लोड अयशस्वी'
  }

  const totalMonthPaise = data?.items.reduce((sum, row) => sum + row.monthTotalPaise, 0) ?? 0
  const visibleDays = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">नमुना ६ — वर्गीकृत जमा नोंदवही</h1>
          <p className="text-sm text-gp-muted">
            आर्थिक वर्ष: {data?.fiscalYear ?? fiscalYear ?? 'चालू'} · महिना: {data?.monthLabel ?? '—'}
          </p>
        </div>
        <div className="rounded-md border border-gp-border bg-card px-3 py-1.5 text-sm">
          महिन्याची एकूण रक्कम: <span className="font-semibold">₹{rupees(totalMonthPaise)}</span>
        </div>
      </div>

      <form method="GET" className="grid gap-3 rounded-lg border border-gp-border bg-card p-3 sm:grid-cols-[160px_180px_auto]">
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
          महिना
          <select
            name="month"
            defaultValue={String(month ?? data?.fyMonthNo ?? '')}
            className="mt-1 h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
          >
            {FY_MONTH_OPTIONS.map(({ no, mr }) => (
              <option key={no} value={no}>{`${no} - ${mr}`}</option>
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
            href={`/${subdomain}/admin/namuna6`}
            className="h-9 rounded-md border border-gp-border px-3 text-sm leading-9 hover:bg-gp-surface"
          >
            साफ करा
          </Link>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-gp-border bg-card">
        <table className="min-w-[2200px] w-full text-xs">
          <thead className="bg-gp-surface text-left">
            <tr>
              <th className="sticky left-0 z-10 bg-gp-surface px-3 py-2 font-medium">लेखाशीर्ष</th>
              {visibleDays.map((day) => (
                <th key={day} className="px-2 py-2 text-right font-medium">{day}</th>
              ))}
              <th className="px-3 py-2 text-right font-medium">महिना एकूण</th>
              <th className="px-3 py-2 text-right font-medium">वार्षिक शिल्लक</th>
            </tr>
          </thead>
          <tbody>
            {loadError && (
              <tr>
                <td colSpan={34} className="px-3 py-8 text-center text-sm text-red-700">
                  नमुना ६ लोड अयशस्वी — {loadError}
                </td>
              </tr>
            )}
            {!loadError && !data?.items.length && (
              <tr>
                <td colSpan={34} className="px-3 py-8 text-center text-sm text-gp-muted">
                  निवडलेल्या महिन्यासाठी नोंदी नाहीत.
                </td>
              </tr>
            )}
            {data?.items.map((row) => (
              <tr key={row.accountHead} className="border-t border-gp-border">
                <td className="sticky left-0 z-10 bg-card px-3 py-2 font-medium">
                  {accountHeadLabel(row.accountHead)}
                </td>
                {visibleDays.map((day) => {
                  const value = row.dayTotalsPaise[day - 1]
                  return (
                    <td key={day} className="px-2 py-2 text-right">
                      {value == null ? '—' : rupees(value)}
                    </td>
                  )
                })}
                <td className="px-3 py-2 text-right font-semibold">{rupees(row.monthTotalPaise)}</td>
                <td className="px-3 py-2 text-right font-semibold">{rupees(row.fyRunningPaise)}</td>
              </tr>
            ))}
          </tbody>
          {!!data?.items.length && (
            <tfoot>
              <tr className="border-t border-gp-border bg-gp-surface/40">
                <td className="sticky left-0 z-10 bg-gp-surface/40 px-3 py-2 font-semibold">एकूण</td>
                {visibleDays.map((day) => {
                  const total = data.items.reduce((sum, row) => {
                    const value = row.dayTotalsPaise[day - 1]
                    return value == null ? sum : sum + value
                  }, 0)
                  return (
                    <td key={day} className="px-2 py-2 text-right font-semibold">
                      {day > data.daysInMonth ? '—' : rupees(total)}
                    </td>
                  )
                })}
                <td className="px-3 py-2 text-right font-bold">{rupees(totalMonthPaise)}</td>
                <td className="px-3 py-2 text-right text-gp-muted">—</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
