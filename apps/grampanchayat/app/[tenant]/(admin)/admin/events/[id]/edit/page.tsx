import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EventForm } from '@/components/admin/event-form'
import { updateEvent } from '@/lib/actions/events'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant: subdomain, id } = await params
  const [tenant, supabase] = [await getTenant(subdomain), await createSupabaseServerClient()]
  if (!tenant) notFound()

  const { data: ev } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('gp_id', tenant.id)
    .single()

  if (!ev) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href={`/${subdomain}/admin/events`} className="text-sm text-gp-muted hover:text-foreground">
          ← कार्यक्रम
        </Link>
        <h1 className="text-xl font-bold text-gp-primary mt-2">{ev.title_mr} संपादित करा</h1>
      </div>
      <EventForm
        action={async (formData) => {
          'use server'
          await updateEvent(subdomain, id, formData)
        }}
        defaultValues={ev}
      />
    </div>
  )
}
