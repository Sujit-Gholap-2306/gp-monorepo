import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { getEvent } from '@/lib/api/events'
import { EventForm } from '@/components/admin/event-form'
import { cookies } from 'next/headers'
import type { GpEvent } from '@/lib/types'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant: subdomain, id } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const ev = (await getEvent(subdomain, id, {
    headers: { cookie: cookieStore.toString() },
  })) as GpEvent
  if (!ev) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href={`/${subdomain}/admin/events`} className="text-sm text-gp-muted hover:text-foreground">
          ← कार्यक्रम
        </Link>
        <h1 className="text-xl font-bold text-gp-primary mt-2">{ev.title_mr} संपादित करा</h1>
      </div>
      <EventForm subdomain={subdomain} eventId={id} defaultValues={ev} />
    </div>
  )
}
