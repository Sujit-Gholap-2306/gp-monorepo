import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { getEvent } from '@/lib/api/events'
import { listEventMedia } from '@/lib/api/event-media'
import { EventMediaManager } from '@/components/admin/event-media-manager'
import { cookies } from 'next/headers'
import type { GpEvent, EventMedia } from '@/lib/types'

export default async function EventMediaPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant: subdomain, id: eventId } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const init = { headers: { cookie: cookieStore.toString() } }
  const ev = (await getEvent(subdomain, eventId, init)) as GpEvent
  if (!ev) notFound()

  const mediaRaw = await listEventMedia(subdomain, eventId, init)
  const media = (mediaRaw ?? []) as EventMedia[]

  return (
    <div>
      <div className="mb-6">
        <Link href={`/${subdomain}/admin/events`} className="text-sm text-gp-muted hover:text-foreground">
          ← कार्यक्रम
        </Link>
        <h1 className="text-xl font-bold text-gp-primary mt-2">{ev.title_mr} — मीडिया</h1>
      </div>

      <EventMediaManager subdomain={subdomain} eventId={eventId} initialMedia={media} />
    </div>
  )
}
