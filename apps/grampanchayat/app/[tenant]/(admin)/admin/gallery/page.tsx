import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { listGallery } from '@/lib/api/gallery'
import { GalleryManager } from '@/components/admin/gallery-manager'
import { cookies } from 'next/headers'
import type { Gallery } from '@/lib/types'

export default async function AdminGalleryPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const items = (await listGallery(subdomain, {
    headers: { cookie: cookieStore.toString() },
  })) as Gallery[]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gp-primary">दालन</h1>
        <p className="text-sm text-gp-muted">Gallery — {items.length} फाइल्स</p>
      </div>

      <GalleryManager subdomain={subdomain} initialItems={items} />
    </div>
  )
}
