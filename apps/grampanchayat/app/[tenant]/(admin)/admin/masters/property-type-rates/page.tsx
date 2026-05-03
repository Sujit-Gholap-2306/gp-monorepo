import { notFound } from 'next/navigation'
import { MastersPropertyTypeRatesEditor } from '@/components/admin/masters-property-type-rates-editor'
import { TaxFeatureLocked } from '@/components/admin/tax-feature-locked'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'

export default async function AdminMastersPropertyTypeRatesPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()
  if (!canAccess(tenant.tier, 'namune')) {
    return <TaxFeatureLocked title="मास्टर्स — मालमत्ता प्रकार दर" />
  }
  return <MastersPropertyTypeRatesEditor subdomain={subdomain} />
}
