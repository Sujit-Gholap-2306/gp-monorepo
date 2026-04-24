import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { listEvents } from '@/lib/api/events'
import { EventPublishedToggle, EventRowEndActions } from '@/components/admin/event-row-actions'
import { cookies } from 'next/headers'

export default async function AdminEventsPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const list = await listEvents(subdomain, false, {
    headers: { cookie: cookieStore.toString() },
  })

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
                    <EventPublishedToggle
                      subdomain={subdomain}
                      ev={{ id: ev.id, is_published: ev.is_published }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <EventRowEndActions
                      subdomain={subdomain}
                      ev={{ id: ev.id, is_published: ev.is_published }}
                    />
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
