import { notFound, redirect } from 'next/navigation'
import { MastersPropertyForm } from '@/components/admin/masters-property-form'
import { TaxFeatureLocked } from '@/components/admin/tax-feature-locked'
import { fetchMastersPropertyById } from '@/lib/masters-bulk-api'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'

export default async function AdminMastersPropertyDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant: subdomain, id } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()
  if (!canAccess(tenant.tier, 'namune')) {
    return <TaxFeatureLocked title="मास्टर्स — मालमत्ता" />
  }

  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) redirect(`/${subdomain}/login`)

  let property
  try {
    property = await fetchMastersPropertyById(subdomain, id, accessToken)
  } catch {
    notFound()
  }

  return <MastersPropertyForm subdomain={subdomain} mode="edit" initial={property} />
}
