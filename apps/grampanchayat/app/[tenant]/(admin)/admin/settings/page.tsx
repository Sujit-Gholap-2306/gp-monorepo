import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { GpSettingsForm } from '@/components/admin/gp-settings-form'

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gp-primary">सेटिंग्ज</h1>
        <p className="text-sm text-gp-muted">ग्रामपंचायत माहिती</p>
      </div>
      <GpSettingsForm subdomain={subdomain} tenant={tenant} />
    </div>
  )
}
