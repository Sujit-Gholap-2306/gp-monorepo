import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { getAnnouncement } from '@/lib/api/announcements'
import { AnnouncementForm } from '@/components/admin/announcement-form'
import { cookies } from 'next/headers'
import type { Announcement } from '@/lib/types'

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant: subdomain, id } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const raw = await getAnnouncement(subdomain, id, { headers: { cookie: cookieStore.toString() } })
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
      <AnnouncementForm subdomain={subdomain} announcementId={id} defaultValues={ann} />
    </div>
  )
}
