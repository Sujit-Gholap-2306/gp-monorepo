import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Calendar,
  Megaphone,
  Users,
  Image as ImageIcon,
  ArrowRight,
  Plus,
  TrendingUp,
} from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { AdminPageHeader } from '@/components/admin/page-header'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const today = new Date().toISOString().split('T')[0]

  const cookieStore = await (await import('next/headers')).cookies()
  const init = { headers: { cookie: cookieStore.toString() } }

  const { listEvents } = await import('@/lib/api/events')
  const { listAnnouncements } = await import('@/lib/api/announcements')
  const { listPostHolders } = await import('@/lib/api/post-holders')
  const { listGallery } = await import('@/lib/api/gallery')

  const [
    allEvents,
    allAnnouncements,
    allPostHolders,
    allGallery,
  ] = await Promise.all([
    listEvents(subdomain, false, init),
    listAnnouncements(subdomain, false, init),
    listPostHolders(subdomain, init),
    listGallery(subdomain, init),
  ])

  const eventCount = allEvents.length
  const upcomingEventsAll = allEvents.filter((ev: any) => ev.event_date >= today)
  const upcomingEventCount = upcomingEventsAll.length
  const upcomingEvents = upcomingEventsAll.slice(0, 5)

  const announcementCount = allAnnouncements.length
  const publishedAnnouncementCount = allAnnouncements.filter((a: any) => a.is_published).length
  const recentAnnouncements = allAnnouncements.slice(0, 5)

  const postHolderCount = allPostHolders.filter((p: any) => p.is_active).length
  const galleryCount = allGallery.length

  const stats = [
    {
      label: 'कार्यक्रम',
      count: eventCount ?? 0,
      subtitle: `${upcomingEventCount ?? 0} येणारे`,
      href: `/${subdomain}/admin/events`,
      Icon: Calendar,
    },
    {
      label: 'घोषणा',
      count: announcementCount ?? 0,
      subtitle: `${publishedAnnouncementCount ?? 0} प्रकाशित`,
      href: `/${subdomain}/admin/announcements`,
      Icon: Megaphone,
    },
    {
      label: 'पदाधिकारी',
      count: postHolderCount ?? 0,
      subtitle: 'सक्रिय',
      href: `/${subdomain}/admin/post-holders`,
      Icon: Users,
    },
    {
      label: 'दालन',
      count: galleryCount ?? 0,
      subtitle: 'फोटो व व्हिडिओ',
      href: `/${subdomain}/admin/gallery`,
      Icon: ImageIcon,
    },
  ]

  return (
    <div>
      <AdminPageHeader
        title={tenant.name_mr}
        description={`${tenant.name_en} — डॅशबोर्ड`}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group relative overflow-hidden rounded-xl border border-gp-border bg-card p-5 hover:border-gp-primary/30 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-gp-primary/10 text-gp-primary flex items-center justify-center">
                <s.Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <ArrowRight className="h-4 w-4 text-gp-muted group-hover:text-gp-primary group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold text-foreground leading-none">
              {s.count.toLocaleString('mr-IN')}
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{s.label}</p>
            <p className="text-xs text-gp-muted mt-0.5">{s.subtitle}</p>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityCard
          title="अलीकडील घोषणा"
          icon={<Megaphone className="h-4 w-4" />}
          viewAllHref={`/${subdomain}/admin/announcements`}
          createHref={`/${subdomain}/admin/announcements/new`}
          empty={!recentAnnouncements?.length}
          emptyText="अद्याप कोणत्याही घोषणा नाहीत"
        >
          <ul className="divide-y divide-gp-border">
            {recentAnnouncements?.map((ann) => (
              <li key={ann.id}>
                <Link
                  href={`/${subdomain}/admin/announcements/${ann.id}/edit`}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gp-surface/60 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {ann.title_mr}
                    </p>
                    <p className="text-xs text-gp-muted mt-0.5">
                      {new Date(ann.created_at).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' })}
                      {' · '}
                      {ann.category}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                      ann.is_published
                        ? 'bg-success/10 text-success'
                        : 'bg-gp-muted/10 text-gp-muted'
                    }`}
                  >
                    {ann.is_published ? 'प्रकाशित' : 'मसुदा'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </ActivityCard>

        <ActivityCard
          title="येणारे कार्यक्रम"
          icon={<TrendingUp className="h-4 w-4" />}
          viewAllHref={`/${subdomain}/admin/events`}
          createHref={`/${subdomain}/admin/events/new`}
          empty={!upcomingEvents?.length}
          emptyText="सध्या कोणताही कार्यक्रम नाही"
        >
          <ul className="divide-y divide-gp-border">
            {upcomingEvents?.map((ev) => {
              const date = new Date(ev.event_date)
              return (
                <li key={ev.id}>
                  <Link
                    href={`/${subdomain}/admin/events/${ev.id}/edit`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-gp-surface/60 transition-colors cursor-pointer"
                  >
                    <div className="shrink-0 w-12 text-center rounded-md bg-gp-primary/10 text-gp-primary py-1.5">
                      <p className="text-[10px] uppercase tracking-wider font-semibold">
                        {date.toLocaleDateString('mr-IN', { month: 'short' })}
                      </p>
                      <p className="font-display text-base font-bold leading-none mt-0.5">
                        {date.getDate()}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {ev.title_mr}
                      </p>
                      {ev.location_mr && (
                        <p className="text-xs text-gp-muted mt-0.5 line-clamp-1">{ev.location_mr}</p>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </ActivityCard>
      </div>
    </div>
  )
}

function ActivityCard({
  title,
  icon,
  viewAllHref,
  createHref,
  empty,
  emptyText,
  children,
}: {
  title: string
  icon: React.ReactNode
  viewAllHref: string
  createHref: string
  empty: boolean
  emptyText: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gp-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gp-border">
        <div className="flex items-center gap-2 text-foreground">
          <span className="text-gp-primary">{icon}</span>
          <h2 className="font-display text-sm font-bold">{title}</h2>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={createHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-gp-primary hover:text-gp-primary-hover transition-colors cursor-pointer px-2 py-1 rounded"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>नवीन</span>
          </Link>
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-gp-muted hover:text-foreground transition-colors cursor-pointer px-2 py-1 rounded"
          >
            <span>सर्व</span>
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
      {empty ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-gp-muted">{emptyText}</p>
          <Link
            href={createHref}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gp-primary hover:text-gp-primary-hover transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>नवीन जोडा</span>
          </Link>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
