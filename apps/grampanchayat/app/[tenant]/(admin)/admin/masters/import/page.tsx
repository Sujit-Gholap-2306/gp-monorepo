import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { MastersBulkImport } from '@/components/admin/masters-bulk-import'

export default async function AdminMastersImportPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  return (
    <div className="w-full min-w-0">
      <h1 className="mb-6 text-xl font-bold text-gp-primary">मास्टर आयात</h1>
      <MastersBulkImport subdomain={subdomain} />
    </div>
  )
}
