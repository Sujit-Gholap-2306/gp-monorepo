import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PostHolderForm } from '@/components/admin/post-holder-form'
import { updatePostHolder } from '@/lib/actions/post-holders'

export default async function EditPostHolderPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant: subdomain, id } = await params
  const [tenant, supabase] = [await getTenant(subdomain), await createSupabaseServerClient()]
  if (!tenant) notFound()

  const { data: ph } = await supabase
    .from('post_holders')
    .select('*')
    .eq('id', id)
    .eq('gp_id', tenant.id)
    .single()

  if (!ph) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href={`/${subdomain}/admin/post-holders`} className="text-sm text-gp-muted hover:text-foreground">
          ← पदाधिकारी
        </Link>
        <h1 className="text-xl font-bold text-gp-primary mt-2">{ph.name_mr} संपादित करा</h1>
      </div>
      <PostHolderForm
        action={async (formData) => {
          'use server'
          await updatePostHolder(subdomain, id, formData)
        }}
        defaultValues={ph}
        submitLabel="जतन करा"
      />
    </div>
  )
}
