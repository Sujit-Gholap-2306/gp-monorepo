import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Search, UserPlus } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { fetchMastersCitizensList, type MastersCitizenRecord } from '@/lib/masters-bulk-api'
import { TaxFeatureLocked } from '@/components/admin/tax-feature-locked'

type Props = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ q?: string; ward?: string }>
}

export default async function AdminMastersCitizensPage({ params, searchParams }: Props) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()
  if (!canAccess(tenant.tier, 'namune')) {
    return <TaxFeatureLocked title="मास्टर्स — नागरिक" />
  }

  const filters = await searchParams
  const q = typeof filters.q === 'string' ? filters.q : ''
  const ward = typeof filters.ward === 'string' ? filters.ward : ''

  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) redirect(`/${subdomain}/login`)

  let rows: MastersCitizenRecord[] = []
  let loadError: string | null = null
  try {
    rows = await fetchMastersCitizensList(subdomain, accessToken, {
      q: q || undefined,
      ward: ward || undefined,
    })
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Citizens load failed'
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">मास्टर्स — नागरिक</h1>
          <p className="text-sm text-gp-muted">नोंदी: {rows.length}</p>
        </div>
        <Link
          href={`/${subdomain}/admin/masters/citizens/new`}
          className="inline-flex items-center gap-2 rounded-md bg-gp-primary px-3 py-2 text-sm font-medium text-gp-primary-fg"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          <span>नवीन नागरिक</span>
        </Link>
      </div>

      <form method="GET" className="rounded-lg border border-gp-border bg-card p-3">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block text-xs text-gp-muted">
            शोधा
            <div className="relative mt-1">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gp-muted" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="नाव / मोबाईल"
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
          <div className="flex items-end gap-2">
            <button type="submit" className="h-9 rounded-md bg-gp-primary px-4 text-sm font-medium text-gp-primary-fg">
              फिल्टर
            </button>
            <Link href={`/${subdomain}/admin/masters/citizens`} className="h-9 rounded-md border border-gp-border px-3 text-sm leading-9 hover:bg-gp-surface">
              साफ करा
            </Link>
          </div>
        </div>
      </form>

      {loadError ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{loadError}</div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-gp-border bg-card px-4 py-8 text-center text-sm text-gp-muted">
          कोणतीही नागरिक नोंद आढळली नाही.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gp-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-gp-surface text-left">
              <tr>
                <th className="px-3 py-2 font-medium">क्र.नं</th>
                <th className="px-3 py-2 font-medium">नाव</th>
                <th className="px-3 py-2 font-medium">वार्ड</th>
                <th className="px-3 py-2 font-medium">मोबाईल</th>
                <th className="px-3 py-2 font-medium">पत्ता</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-gp-border">
                  <td className="px-3 py-2 font-mono text-[12px]">
                    <Link href={`/${subdomain}/admin/masters/citizens/${row.id}`} className="font-medium text-gp-primary hover:underline">
                      {row.citizenNo}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <div>{row.nameMr}</div>
                    <div className="text-xs text-gp-muted">{row.nameEn || '—'}</div>
                  </td>
                  <td className="px-3 py-2">{row.wardNumber}</td>
                  <td className="px-3 py-2">{row.mobile}</td>
                  <td className="px-3 py-2">{row.addressMr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
