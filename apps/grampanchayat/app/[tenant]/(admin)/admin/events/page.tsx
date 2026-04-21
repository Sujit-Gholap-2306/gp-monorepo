import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { deleteEvent, toggleEventPublished } from '@/lib/actions/events'

export default async function AdminEventsPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const supabase = await createSupabaseServerClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('gp_id', tenant.id)
    .order('event_date', { ascending: false })

  const list = events ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">कार्यक्रम</h1>
          <p className="text-sm text-gp-muted">Events — {list.length} नोंदी</p>
        </div>
        <Link
          href={`/${subdomain}/admin/events/new`}
          className="rounded-md bg-gp-primary text-white px-4 py-2 text-sm font-medium hover:bg-gp-primary-hover transition-colors"
        >
          + नवीन कार्यक्रम
        </Link>
      </div>

      {!list.length ? (
        <p className="text-gp-muted text-sm">अद्याप कोणतेही कार्यक्रम नाहीत</p>
      ) : (
        <div className="bg-card rounded-lg border border-gp-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gp-surface border-b border-gp-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">शीर्षक</th>
                <th className="text-left px-4 py-3 font-medium">तारीख</th>
                <th className="text-left px-4 py-3 font-medium">ठिकाण</th>
                <th className="text-left px-4 py-3 font-medium">स्थिती</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gp-border">
              {list.map((ev) => (
                <tr key={ev.id} className="hover:bg-gp-surface/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{ev.title_mr}</p>
                    <p className="text-xs text-gp-muted">{ev.title_en}</p>
                  </td>
                  <td className="px-4 py-3 text-gp-muted">{ev.event_date}</td>
                  <td className="px-4 py-3 text-gp-muted">{ev.location_mr ?? '—'}</td>
                  <td className="px-4 py-3">
                    <form
                      action={async () => {
                        'use server'
                        await toggleEventPublished(subdomain, ev.id, !ev.is_published)
                      }}
                    >
                      <button
                        type="submit"
                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                          ev.is_published
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                      >
                        {ev.is_published ? 'प्रकाशित' : 'मसुदा'}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      <Link href={`/${subdomain}/admin/events/${ev.id}/media`} className="text-sm text-gp-primary hover:underline">
                        मीडिया
                      </Link>
                      <Link href={`/${subdomain}/admin/events/${ev.id}/edit`} className="text-sm text-gp-primary hover:underline">
                        संपादित
                      </Link>
                      <form
                        action={async () => {
                          'use server'
                          await deleteEvent(subdomain, ev.id)
                        }}
                      >
                        <button type="submit" className="text-sm text-destructive hover:underline">
                          हटवा
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
