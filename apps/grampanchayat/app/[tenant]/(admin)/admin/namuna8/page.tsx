import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ClipboardList, Search } from 'lucide-react'
import { cookies } from 'next/headers'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'
import { listNamuna8, type Namuna8PropertyType } from '@/lib/api/namuna8'
import { NAMUNA8_PROPERTY_TYPE_OPTIONS } from '@/lib/namuna8/property-type-options'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { RateMasterWarning } from '@/components/admin/rate-master-warning'

function fromPaise(value: number): number {
  return value / 100
}

type Namuna8PageProps = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{
    q?: string
    ward?: string
    propertyType?: Namuna8PropertyType
  }>
}

export default async function AdminNamuna8Page({ params, searchParams }: Namuna8PageProps) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  if (!canAccess(tenant.tier, 'tax')) {
    return (
      <div className="rounded-xl border border-gp-border bg-card p-8">
        <h1 className="text-xl font-bold text-gp-primary">नमुना ८ (कर आकारणी)</h1>
        <p className="mt-2 text-sm text-gp-muted">
          हा विभाग Pro योजनेत उपलब्ध आहे. कृपया योजना उन्नत करा.
        </p>
      </div>
    )
  }

  const filters = await searchParams
  const q = typeof filters.q === 'string' ? filters.q : ''
  const ward = typeof filters.ward === 'string' ? filters.ward : ''
  const propertyType = typeof filters.propertyType === 'string' ? filters.propertyType : ''

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

  let data: Awaited<ReturnType<typeof listNamuna8>> | null = null
  let loadError: string | null = null
  try {
    data = await listNamuna8(
      subdomain,
      {
        q: q || undefined,
        ward: ward || undefined,
        propertyType: (propertyType || undefined) as Namuna8PropertyType | undefined,
      },
      init
    )
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'नमुना ८ माहिती लोड अयशस्वी'
  }

  const items = data?.items ?? []
  const hasFilters = Boolean(q || ward || propertyType)
  const rateMaster = data?.rateMaster ?? {
    isComplete: false,
    missingPropertyTypes: [],
    incompletePropertyTypes: [],
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">नमुना ८ — कर आकारणी यादी</h1>
          <p className="text-sm text-gp-muted">
            मालमत्ता: {data?.count ?? 0}
          </p>
        </div>
        <Link
          href={`/${subdomain}/admin/masters/import`}
          className="inline-flex items-center gap-2 rounded-md border border-gp-border bg-card px-3 py-2 text-sm hover:bg-gp-surface"
        >
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          <span>Rate Master तपासा</span>
        </Link>
      </div>

      {!loadError && (
        <RateMasterWarning
          rateMaster={rateMaster}
          variant="list"
          allTypesMissingAndNoProperties={
            rateMaster.missingPropertyTypes.length === NAMUNA8_PROPERTY_TYPE_OPTIONS.length
            && !items.length
          }
        />
      )}

      <form method="GET" className="rounded-lg border border-gp-border bg-card p-3">
        <div className="grid gap-3 md:grid-cols-4">
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
            मालमत्ता प्रकार
            <select
              name="propertyType"
              defaultValue={propertyType}
              className="mt-1 h-9 w-full rounded-md border border-gp-border bg-white px-2 text-sm"
            >
              <option value="">सर्व प्रकार</option>
              {NAMUNA8_PROPERTY_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
              href={`/${subdomain}/admin/namuna8`}
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
            ? 'दिलेल्या फिल्टरनुसार कोणतीही नोंद आढळली नाही.'
            : 'या GP साठी properties/rates data उपलब्ध नाही. आधी मास्टर आयात करा.'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gp-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-gp-surface text-left">
              <tr>
                <th className="px-3 py-2 font-medium">मालमत्ता</th>
                <th className="px-3 py-2 font-medium">मालकाचे नाव</th>
                <th className="px-3 py-2 font-medium">Owner Name (EN)</th>
                <th className="px-3 py-2 font-medium">वार्ड</th>
                <th className="px-3 py-2 font-medium">घरपट्टी</th>
                <th className="px-3 py-2 font-medium">दिवाबत्ती</th>
                <th className="px-3 py-2 font-medium">स्वच्छता</th>
                <th className="px-3 py-2 font-medium">एकूण</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-t border-gp-border">
                  <td className="px-3 py-2">
                    <Link
                      href={`/${subdomain}/admin/namuna8/${row.id}`}
                      className="font-medium text-gp-primary hover:underline"
                    >
                      {row.propertyNo}
                    </Link>
                    <div className="text-xs text-gp-muted">{row.propertyType}</div>
                    {!row.rateConfigured && (
                      <div className="mt-1 text-[11px] text-amber-700">rate missing</div>
                    )}
                  </td>
                  <td className="px-3 py-2">{row.owner.nameMr}</td>
                  <td className="px-3 py-2">{row.owner.nameEn || '—'}</td>
                  <td className="px-3 py-2">{row.wardNumber || '—'}</td>
                  <td className="px-3 py-2">{fromPaise(row.heads.housePaise).toLocaleString('en-IN')}</td>
                  <td className="px-3 py-2">{fromPaise(row.heads.lightingPaise).toLocaleString('en-IN')}</td>
                  <td className="px-3 py-2">{fromPaise(row.heads.sanitationPaise).toLocaleString('en-IN')}</td>
                  <td className="px-3 py-2 font-semibold">{fromPaise(row.heads.totalPaise).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
