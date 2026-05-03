import { notFound, redirect } from 'next/navigation'
import { MastersCitizenForm } from '@/components/admin/masters-citizen-form'
import { TaxFeatureLocked } from '@/components/admin/tax-feature-locked'
import { fetchMastersCitizenById } from '@/lib/masters-bulk-api'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'

export default async function AdminMastersCitizenDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant: subdomain, id } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()
  if (!canAccess(tenant.tier, 'namune')) {
    return <TaxFeatureLocked title="मास्टर्स — नागरिक" />
  }

  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) redirect(`/${subdomain}/login`)

  let citizen
  try {
    citizen = await fetchMastersCitizenById(subdomain, id, accessToken)
  } catch {
    notFound()
  }

  return <MastersCitizenForm subdomain={subdomain} mode="edit" initial={citizen} />
}
