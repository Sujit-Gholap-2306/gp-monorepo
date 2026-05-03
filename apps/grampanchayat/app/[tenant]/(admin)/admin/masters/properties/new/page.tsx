import { notFound } from 'next/navigation'
import { MastersPropertyForm } from '@/components/admin/masters-property-form'
import { TaxFeatureLocked } from '@/components/admin/tax-feature-locked'
import { getTenant } from '@/lib/tenant'
import { canAccess } from '@/lib/tiers'

export default async function AdminMastersPropertyNewPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()
  if (!canAccess(tenant.tier, 'namune')) {
    return <TaxFeatureLocked title="मास्टर्स — नवीन मालमत्ता" />
  }
  return <MastersPropertyForm subdomain={subdomain} mode="create" />
}
