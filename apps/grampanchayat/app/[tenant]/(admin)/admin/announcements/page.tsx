import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { listAnnouncements } from '@/lib/api/announcements'
import { DeleteAnnouncementButton } from '@/components/admin/delete-announcement-button'
import type { Announcement } from '@/lib/types'

const CATEGORY_LABEL: Record<string, string> = {
  general: 'सामान्य',
  scheme: 'योजना',
  notice: 'सूचना',
}

export default async function AdminAnnouncementsPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await (await import('next/headers')).cookies()
  const list = await listAnnouncements(subdomain, false, {
    headers: { cookie: cookieStore.toString() }
  })



  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gp-primary">घोषणा</h1>
          <p className="text-sm text-gp-muted">Announcements — {list.length} नोंदी</p>
        </div>
        <Link
          href={`/${subdomain}/admin/announcements/new`}
          className="rounded-md bg-gp-primary text-white px-4 py-2 text-sm font-medium hover:bg-gp-primary-hover transition-colors"
        >
          + नवीन घोषणा
        </Link>
      </div>

      {!list.length ? (
        <p className="text-gp-muted text-sm">अद्याप कोणत्याही घोषणा नाहीत</p>
      ) : (
        <div className="bg-card rounded-lg border border-gp-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gp-surface border-b border-gp-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">शीर्षक</th>
                <th className="text-left px-4 py-3 font-medium">प्रकार</th>
                <th className="text-left px-4 py-3 font-medium">तारीख</th>
                <th className="text-left px-4 py-3 font-medium">स्थिती</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gp-border">
              {list.map((ann) => (
                <tr key={ann.id} className="hover:bg-gp-surface/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{ann.title_mr}</p>
                    <p className="text-xs text-gp-muted">{ann.title_en}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs border border-gp-border rounded px-2 py-0.5">
                      {CATEGORY_LABEL[ann.category] ?? ann.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gp-muted text-xs">
                    {ann.published_at
                      ? new Date(ann.published_at).toLocaleDateString('mr-IN')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ann.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ann.is_published ? 'प्रकाशित' : 'मसुदा'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-3 justify-end">
                    <Link href={`/${subdomain}/admin/announcements/${ann.id}/edit`} className="text-sm text-gp-primary hover:underline">
                      संपादित
                    </Link>
                    <DeleteAnnouncementButton subdomain={subdomain} id={ann.id} />
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
