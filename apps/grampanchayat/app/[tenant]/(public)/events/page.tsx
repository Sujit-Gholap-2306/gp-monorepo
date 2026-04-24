import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Calendar, MapPin } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { listEvents } from '@/lib/api/events'
import { PageHeader } from '@/components/public/page-header'
import { EmptyState } from '@/components/public/empty-state'
import type { GpEvent, Locale } from '@/lib/types'

export default async function EventsPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const locale = (cookieStore.get('locale')?.value ?? 'mr') as Locale

  const allEvents = await listEvents(subdomain, true)
  const today = new Date().toISOString().slice(0, 10)

  const upcomingData = allEvents.filter((e: any) => e.event_date >= today)
  const pastData = allEvents.filter((e: any) => e.event_date < today)
    .sort((a: any, b: any) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
    .slice(0, 20)

  const upcoming = (upcomingData ?? []) as GpEvent[]
  const past = (pastData ?? []) as GpEvent[]

  return (
    <>
      <PageHeader
        eyebrow={locale === 'mr' ? 'उपक्रम' : 'Activities'}
        title={locale === 'mr' ? 'कार्यक्रम' : 'Events'}
        subtitle={
          locale === 'mr'
            ? 'ग्रामपंचायतीचे येणारे आणि पूर्ण झालेले कार्यक्रम.'
            : 'Upcoming and past events from the Gram Panchayat.'
        }
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        <section>
          <SectionTitle locale={locale} mr="येणारे कार्यक्रम" en="Upcoming" count={upcoming.length} />
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-6 w-6" />}
              title={locale === 'mr' ? 'सध्या कोणताही कार्यक्रम नाही' : 'No upcoming events'}
              description={
                locale === 'mr'
                  ? 'नवीन कार्यक्रमांसाठी येथे भेट देत रहा.'
                  : 'Check back soon for upcoming events.'
              }
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {upcoming.map((ev) => (
                <EventCard key={ev.id} event={ev} locale={locale} upcoming />
              ))}
            </ul>
          )}
        </section>

        {past.length > 0 && (
          <section>
            <SectionTitle locale={locale} mr="मागील कार्यक्रम" en="Past Events" count={past.length} />
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {past.map((ev) => (
                <EventCard key={ev.id} event={ev} locale={locale} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}

function SectionTitle({
  locale,
  mr,
  en,
  count,
}: {
  locale: Locale
  mr: string
  en: string
  count: number
}) {
  return (
    <div className="flex items-end justify-between mb-5">
      <h2 className="font-display text-2xl font-bold text-foreground">
        {locale === 'mr' ? mr : en}
      </h2>
      <span className="text-sm text-gp-muted">
        {count.toLocaleString(locale === 'mr' ? 'mr-IN' : 'en-IN')}
      </span>
    </div>
  )
}

function EventCard({
  event,
  locale,
  upcoming = false,
}: {
  event: GpEvent
  locale: Locale
  upcoming?: boolean
}) {
  const date = new Date(event.event_date)
  const title = locale === 'mr' ? event.title_mr : event.title_en
  const description =
    locale === 'mr' ? event.description_mr : event.description_en
  const location = locale === 'mr' ? event.location_mr : event.location_en

  return (
    <li className="group relative bg-card rounded-xl border border-gp-border p-5 hover:border-gp-primary/30 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        <div
          className={`shrink-0 w-16 text-center rounded-lg py-2 ${
            upcoming
              ? 'bg-gp-primary text-gp-primary-fg'
              : 'bg-gp-surface border border-gp-border text-foreground'
          }`}
        >
          <p className="text-[10px] uppercase tracking-wider font-semibold">
            {date.toLocaleDateString(locale === 'mr' ? 'mr-IN' : 'en-IN', {
              month: 'short',
            })}
          </p>
          <p className="font-display text-2xl font-bold leading-none mt-1">
            {date.getDate()}
          </p>
          <p className="text-[10px] opacity-70 mt-1">{date.getFullYear()}</p>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold text-foreground leading-snug">
            {title}
          </h3>
          {location && (
            <p className="mt-1.5 text-sm text-gp-muted flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{location}</span>
            </p>
          )}
          {description && (
            <p className="mt-3 text-sm text-foreground/80 line-clamp-3 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </li>
  )
}
