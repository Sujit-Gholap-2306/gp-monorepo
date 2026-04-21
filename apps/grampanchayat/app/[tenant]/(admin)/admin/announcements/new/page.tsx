import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { AnnouncementForm } from '@/components/admin/announcement-form'
import { createAnnouncement } from '@/lib/actions/announcements'

export default async function NewAnnouncementPage({
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
        <Link href={`/${subdomain}/admin/announcements`} className="text-sm text-gp-muted hover:text-foreground">
          ← घोषणा
        </Link>
        <h1 className="text-xl font-bold text-gp-primary mt-2">नवीन घोषणा</h1>
      </div>
      <AnnouncementForm
        action={async (formData) => {
          'use server'
          await createAnnouncement(subdomain, formData)
        }}
        submitLabel="जोडा"
      />
    </div>
  )
}
