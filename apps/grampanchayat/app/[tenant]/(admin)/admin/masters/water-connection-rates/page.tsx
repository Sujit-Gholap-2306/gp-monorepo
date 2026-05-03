import { notFound } from 'next/navigation'
import { MastersWaterConnectionRatesEditor } from '@/components/admin/masters-water-connection-rates-editor'
import { TaxFeatureLocked } from '@/components/admin/tax-feature-locked'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'

export default async function AdminMastersWaterConnectionRatesPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()
  if (!canAccess(tenant.tier, 'tax')) {
    return <TaxFeatureLocked title="मास्टर्स — पाणी दर" />
  }
  return <MastersWaterConnectionRatesEditor subdomain={subdomain} />
}
