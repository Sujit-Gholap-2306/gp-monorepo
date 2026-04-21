import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { PostHolderForm } from '@/components/admin/post-holder-form'
import { createPostHolder } from '@/lib/actions/post-holders'

export default async function NewPostHolderPage({
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
        <Link href={`/${subdomain}/admin/post-holders`} className="text-sm text-gp-muted hover:text-foreground">
          ← पदाधिकारी
        </Link>
        <h1 className="text-xl font-bold text-gp-primary mt-2">नवीन पदाधिकारी</h1>
      </div>
      <PostHolderForm
        action={async (formData) => {
          'use server'
          await createPostHolder(subdomain, formData)
        }}
        submitLabel="जोडा"
      />
    </div>
  )
}
