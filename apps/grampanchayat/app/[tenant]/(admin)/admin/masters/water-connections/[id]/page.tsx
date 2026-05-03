import { notFound, redirect } from 'next/navigation'
import { MastersWaterConnectionForm } from '@/components/admin/masters-water-connection-form'
import { TaxFeatureLocked } from '@/components/admin/tax-feature-locked'
import { fetchMastersWaterConnectionById } from '@/lib/masters-bulk-api'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'

export default async function AdminMastersWaterConnectionDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant: subdomain, id } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()
  if (!canAccess(tenant.tier, 'tax')) {
    return <TaxFeatureLocked title="मास्टर्स — पाणी जोडणी" />
  }

  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) redirect(`/${subdomain}/login`)

  let connection
  try {
    connection = await fetchMastersWaterConnectionById(subdomain, id, accessToken)
  } catch {
    notFound()
  }

  return <MastersWaterConnectionForm subdomain={subdomain} mode="edit" initial={connection} />
}
