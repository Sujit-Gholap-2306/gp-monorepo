import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ArrowRight, Megaphone, Calendar, Image as ImageIcon, Users } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SiteHero } from '@/components/public/site-hero'
import type { Locale } from '@/lib/types'

export default async function HomePage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const locale = (cookieStore.get('locale')?.value ?? 'mr') as Locale

  const supabase = await createSupabaseServerClient()

  const [
    { data: announcements, count: annCount },
    { data: events, count: evCount },
    { count: galleryCount },
    { count: phCount },
  ] = await Promise.all([
    supabase
      .from('announcements')
      .select('id, title_mr, title_en, category, published_at', { count: 'exact' })
      .eq('gp_id', tenant.id)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('events')
      .select('id, title_mr, title_en, event_date, location_mr, location_en', { count: 'exact' })
      .eq('gp_id', tenant.id)
      .eq('is_published', true)
      .gte('event_date', new Date().toISOString().slice(0, 10))
      .order('event_date', { ascending: true })
      .limit(3),
    supabase.from('gallery').select('id', { count: 'exact', head: true }).eq('gp_id', tenant.id),
    supabase
      .from('post_holders')
      .select('id', { count: 'exact', head: true })
      .eq('gp_id', tenant.id)
      .eq('is_active', true),
  ])

  const hasContent =
    (annCount ?? 0) > 0 || (evCount ?? 0) > 0

  return (
    <>
      <SiteHero
        tenant={tenant}
        locale={locale}
        stats={{
          announcements: annCount ?? 0,
          events:        evCount ?? 0,
          gallery:       galleryCount ?? 0,
          postHolders:   phCount ?? 0,
        }}
      />

      {hasContent ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid gap-10 lg:grid-cols-2">
          {/* Latest Announcements */}
          <Section
            icon={<Megaphone className="h-5 w-5" />}
            title={locale === 'mr' ? 'ताज्या घोषणा' : 'Latest Announcements'}
            viewAllHref={`/${subdomain}/announcements`}
            locale={locale}
            empty={!announcements?.length}
            emptyText={locale === 'mr' ? 'कोणतीही घोषणा नाही' : 'No announcements yet'}
          >
            <ul className="grid gap-3">
              {announcements?.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/${subdomain}/announcements`}
                    className="block rounded-lg border border-gp-border bg-card p-4 hover:border-gp-primary/30 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-foreground line-clamp-2">
                        {locale === 'mr' ? a.title_mr : a.title_en}
                      </p>
                      <span className="shrink-0 text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gp-surface text-gp-muted border border-gp-border">
                        {a.category}
                      </span>
                    </div>
                    {a.published_at && (
                      <p className="mt-1.5 text-xs text-gp-muted">
                        {new Date(a.published_at).toLocaleDateString(
                          locale === 'mr' ? 'mr-IN' : 'en-IN',
                          { day: 'numeric', month: 'short', year: 'numeric' },
                        )}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          {/* Upcoming Events */}
          <Section
            icon={<Calendar className="h-5 w-5" />}
            title={locale === 'mr' ? 'येणारे कार्यक्रम' : 'Upcoming Events'}
            viewAllHref={`/${subdomain}/events`}
            locale={locale}
            empty={!events?.length}
            emptyText={locale === 'mr' ? 'कोणताही कार्यक्रम नाही' : 'No upcoming events'}
          >
            <ul className="grid gap-3">
              {events?.map((ev) => {
                const date = new Date(ev.event_date)
                return (
                  <li key={ev.id}>
                    <Link
                      href={`/${subdomain}/events`}
                      className="block rounded-lg border border-gp-border bg-card p-4 hover:border-gp-primary/30 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-14 text-center rounded-md bg-gp-primary text-gp-primary-fg py-1.5">
                          <p className="text-[10px] uppercase tracking-wider font-semibold">
                            {date.toLocaleDateString(locale === 'mr' ? 'mr-IN' : 'en-IN', { month: 'short' })}
                          </p>
                          <p className="font-display text-xl font-bold leading-none mt-0.5">
                            {date.getDate()}
                          </p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground line-clamp-2">
                            {locale === 'mr' ? ev.title_mr : ev.title_en}
                          </p>
                          {(ev.location_mr || ev.location_en) && (
                            <p className="mt-1 text-xs text-gp-muted line-clamp-1">
                              {locale === 'mr' ? ev.location_mr ?? ev.location_en : ev.location_en ?? ev.location_mr}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Section>

          {/* Media & People — compact cards */}
          <QuickLinkCard
            icon={<ImageIcon className="h-5 w-5" />}
            title={locale === 'mr' ? 'दालन पहा' : 'Browse Gallery'}
            count={galleryCount ?? 0}
            countLabel={locale === 'mr' ? 'फोटो व व्हिडिओ' : 'photos & videos'}
            href={`/${subdomain}/gallery`}
            locale={locale}
          />
          <QuickLinkCard
            icon={<Users className="h-5 w-5" />}
            title={locale === 'mr' ? 'पदाधिकारी भेटा' : 'Meet Post Holders'}
            count={phCount ?? 0}
            countLabel={locale === 'mr' ? 'सक्रिय पदाधिकारी' : 'active members'}
            href={`/${subdomain}/post-holders`}
            locale={locale}
          />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="rounded-2xl border border-dashed border-gp-border bg-card/50 p-10 text-center">
            <p className="font-display text-lg font-semibold text-foreground">
              {locale === 'mr'
                ? 'लवकरच सामग्री येत आहे'
                : 'Content coming soon'}
            </p>
            <p className="mt-2 text-sm text-gp-muted max-w-md mx-auto">
              {locale === 'mr'
                ? 'आमची ग्रामपंचायत लवकरच घोषणा, कार्यक्रम आणि छायाचित्रे प्रकाशित करेल.'
                : 'Our Gram Panchayat will publish announcements, events, and photos shortly.'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function Section({
  icon,
  title,
  viewAllHref,
  locale,
  empty,
  emptyText,
  children,
}: {
  icon: React.ReactNode
  title: string
  viewAllHref: string
  locale: Locale
  empty: boolean
  emptyText: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5 text-foreground">
          <span className="text-gp-primary">{icon}</span>
          <h2 className="font-display text-xl font-bold">{title}</h2>
        </div>
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-gp-primary hover:text-gp-primary-hover transition-colors cursor-pointer"
        >
          <span>{locale === 'mr' ? 'सर्व पाहा' : 'View all'}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      {empty ? (
        <div className="rounded-lg border border-dashed border-gp-border p-6 text-center">
          <p className="text-sm text-gp-muted">{emptyText}</p>
        </div>
      ) : (
        children
      )}
    </div>
  )
}

function QuickLinkCard({
  icon,
  title,
  count,
  countLabel,
  href,
  locale,
}: {
  icon: React.ReactNode
  title: string
  count: number
  countLabel: string
  href: string
  locale: Locale
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-gp-border bg-card p-6 hover:border-gp-primary/30 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gp-primary/10 text-gp-primary">
            {icon}
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-foreground">{title}</h3>
          <p className="mt-0.5 text-sm text-gp-muted">
            <span className="font-semibold text-foreground">
              {count.toLocaleString(locale === 'mr' ? 'mr-IN' : 'en-IN')}
            </span>{' '}
            {countLabel}
          </p>
        </div>
        <ArrowRight
          className="h-5 w-5 text-gp-muted group-hover:text-gp-primary group-hover:translate-x-0.5 transition-all"
          aria-hidden="true"
        />
      </div>
    </Link>
  )
}
