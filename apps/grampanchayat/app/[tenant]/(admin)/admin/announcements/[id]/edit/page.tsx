import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AnnouncementForm } from '@/components/admin/announcement-form'
import { updateAnnouncement } from '@/lib/actions/announcements'
import type { Announcement } from '@/lib/types'

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant: subdomain, id } = await params
  const [tenant, supabase] = [await getTenant(subdomain), await createSupabaseServerClient()]
  if (!tenant) notFound()

  const { data: raw } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .eq('gp_id', tenant.id)
    .single()

  if (!raw) notFound()
  const ann = raw as Announcement

  return (
    <div>
      <div className="mb-6">
        <Link href={`/${subdomain}/announcements`} className="text-sm text-gp-muted hover:text-foreground">
          ← घोषणा
        </Link>
        <h1 className="text-xl font-bold text-gp-primary mt-2">{ann.title_mr} संपादित करा</h1>
      </div>
      <AnnouncementForm
        action={async (formData) => {
          'use server'
          await updateAnnouncement(subdomain, id, formData)
        }}
        defaultValues={ann}
      />
    </div>
  )
}
