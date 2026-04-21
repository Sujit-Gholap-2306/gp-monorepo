import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { EventForm } from '@/components/admin/event-form'
import { createEvent } from '@/lib/actions/events'

export default async function NewEventPage({
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
        <Link href={`/${subdomain}/admin/events`} className="text-sm text-gp-muted hover:text-foreground">
          ← कार्यक्रम
        </Link>
        <h1 className="text-xl font-bold text-gp-primary mt-2">नवीन कार्यक्रम</h1>
      </div>
      <EventForm
        action={async (formData) => {
          'use server'
          await createEvent(subdomain, formData)
        }}
        submitLabel="जोडा व मीडिया अपलोड करा"
      />
    </div>
  )
}
