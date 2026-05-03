import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Droplets, Search } from 'lucide-react'
import { TaxFeatureLocked } from '@/components/admin/tax-feature-locked'
import { fetchMastersWaterConnectionsList, type MastersWaterConnectionRecord } from '@/lib/masters-bulk-api'
import { pipeSizeLabel, waterConnectionStatusLabel, waterConnectionTypeLabel } from '@/lib/tax/labels'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'

type Props = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ q?: string; status?: string; connectionType?: string; citizenNo?: string }>
}

export default async function AdminMastersWaterConnectionsPage({ params, searchParams }: Props) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()
  if (!canAccess(tenant.tier, 'tax')) {
    return <TaxFeatureLocked title="मास्टर्स — पाणी जोडण्या" />
  }

  const filters = await searchParams
  const q = typeof filters.q === 'string' ? filters.q : ''
  const status = typeof filters.status === 'string' ? filters.status : ''
  const connectionType = typeof filters.connectionType === 'string' ? filters.connectionType : ''
  const citizenNo = typeof filters.citizenNo === 'string' ? filters.citizenNo : ''

  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) redirect(`/${subdomain}/login`)

  let rows: MastersWaterConnectionRecord[] = []
  let loadError: string | null = null
  try {
    rows = await fetchMastersWaterConnectionsList(subdomain, accessToken, {
      q: q || undefined,
      status: status || undefined,
      connectionType: connectionType || undefined,
      citizenNo: citizenNo || undefined,
    })
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Water connections load failed'
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">मास्टर्स — पाणी जोडण्या</h1>
          <p className="text-sm text-gp-muted">नोंदी: {rows.length}</p>
        </div>
        <Link
          href={`/${subdomain}/admin/masters/water-connections/new`}
          className="inline-flex items-center gap-2 rounded-md bg-gp-primary px-3 py-2 text-sm font-medium text-gp-primary-fg"
        >
          <Droplets className="h-4 w-4" aria-hidden="true" />
          <span>नवीन जोडणी</span>
        </Link>
      </div>

      <form method="GET" className="rounded-lg border border-gp-border bg-card p-3">
        <div className="grid gap-3 md:grid-cols-5">
          <label className="block text-xs text-gp-muted">
            शोधा
            <div className="relative mt-1">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gp-muted" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                className="h-9 w-full rounded-md border border-gp-border bg-white pl-7 pr-2 text-sm"
              />
            </div>
          </label>
          <label className="block text-xs text-gp-muted">
            स्थिती
            <input name="status" defaultValue={status} className="mt-1 h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm" />
          </label>
          <label className="block text-xs text-gp-muted">
            प्रकार
            <input name="connectionType" defaultValue={connectionType} className="mt-1 h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm" />
          </label>
          <label className="block text-xs text-gp-muted">
            Citizen no
            <input name="citizenNo" defaultValue={citizenNo} className="mt-1 h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm" />
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="h-9 rounded-md bg-gp-primary px-4 text-sm font-medium text-gp-primary-fg">फिल्टर</button>
            <Link href={`/${subdomain}/admin/masters/water-connections`} className="h-9 rounded-md border border-gp-border px-3 text-sm leading-9 hover:bg-gp-surface">साफ करा</Link>
          </div>
        </div>
      </form>

      {loadError ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{loadError}</div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-gp-border bg-card px-4 py-8 text-center text-sm text-gp-muted">कोणतीही पाणी जोडणी नोंद आढळली नाही.</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gp-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-gp-surface text-left">
              <tr>
                <th className="px-3 py-2 font-medium">ग्राहक क्र.</th>
                <th className="px-3 py-2 font-medium">नागरिक</th>
                <th className="px-3 py-2 font-medium">प्रकार</th>
                <th className="px-3 py-2 font-medium">आकार</th>
                <th className="px-3 py-2 font-medium">स्थिती</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-gp-border">
                  <td className="px-3 py-2 font-mono text-[12px]">
                    <Link href={`/${subdomain}/admin/masters/water-connections/${row.id}`} className="font-medium text-gp-primary hover:underline">
                      {row.consumerNo}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{row.citizen.nameMr}</td>
                  <td className="px-3 py-2">{waterConnectionTypeLabel(row.connectionType)}</td>
                  <td className="px-3 py-2">{pipeSizeLabel(row.pipeSizeInch)}</td>
                  <td className="px-3 py-2">{waterConnectionStatusLabel(row.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
