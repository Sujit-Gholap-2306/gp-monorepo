import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { getPostHolder } from '@/lib/api/post-holders'
import { PostHolderForm } from '@/components/admin/post-holder-form'
import { cookies } from 'next/headers'
import type { PostHolder } from '@/lib/types'

export default async function EditPostHolderPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant: subdomain, id } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const ph = (await getPostHolder(subdomain, id, {
    headers: { cookie: cookieStore.toString() },
  })) as PostHolder
  if (!ph) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href={`/${subdomain}/admin/post-holders`} className="text-sm text-gp-muted hover:text-foreground">
          ← पदाधिकारी
        </Link>
        <h1 className="text-xl font-bold text-gp-primary mt-2">{ph.name_mr} संपादित करा</h1>
      </div>
      <PostHolderForm subdomain={subdomain} postHolderId={id} defaultValues={ph} submitLabel="जतन करा" />
    </div>
  )
}
