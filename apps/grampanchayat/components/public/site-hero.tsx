import { MapPin, Calendar } from 'lucide-react'
import type { GpTenant } from '@/lib/types'

interface SiteHeroProps {
  tenant: GpTenant
  locale: 'mr' | 'en'
  stats?: {
    announcements?: number
    events?: number
    gallery?: number
    postHolders?: number
  }
}

export function SiteHero({ tenant, locale, stats }: SiteHeroProps) {
  const gpName = locale === 'mr' ? tenant.name_mr : tenant.name_en
  const gpNameAlt = locale === 'mr' ? tenant.name_en : tenant.name_mr
  const village = tenant.village ?? {}
  const established = tenant.established
    ? new Date(tenant.established).getFullYear()
    : null

  const location =
    village.taluka && village.district
      ? locale === 'mr'
        ? `${village.taluka}, ${village.district}`
        : `${village.taluka}, ${village.district}`
      : null

  const statItems = stats
    ? [
        { value: stats.announcements ?? 0, label_mr: 'घोषणा',      label_en: 'Announcements' },
        { value: stats.events ?? 0,        label_mr: 'कार्यक्रम',   label_en: 'Events' },
        { value: stats.gallery ?? 0,       label_mr: 'दालन',        label_en: 'Gallery' },
        { value: stats.postHolders ?? 0,   label_mr: 'पदाधिकारी',   label_en: 'Post Holders' },
      ]
    : []

  return (
    <section className="relative overflow-hidden bg-background border-b border-gp-border">
      {/* Subtle gradient background */}
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--gp-primary) / 0.10), transparent 70%), radial-gradient(ellipse 50% 40% at 100% 30%, hsl(var(--gp-cta) / 0.06), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-20 sm:pb-16">
        <div className="max-w-3xl">
          {/* Location badge */}
          {location && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gp-primary/10 text-gp-primary text-xs font-medium tracking-wide mb-5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{location}</span>
              {established && (
                <>
                  <span className="text-gp-primary/40">·</span>
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {locale === 'mr' ? 'स्थापना' : 'Est.'} {established}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Main heading */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
            {gpName}
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-gp-muted font-display font-medium">
            {gpNameAlt}
          </p>

          {/* Tagline */}
          <p className="mt-6 text-base sm:text-lg text-foreground/80 max-w-2xl leading-relaxed">
            {locale === 'mr'
              ? 'आपल्या गावाची अधिकृत वेबसाइट — घोषणा, कार्यक्रम, पदाधिकारी व माहिती एकाच ठिकाणी.'
              : 'Your village\'s official portal — announcements, events, post holders, and information, all in one place.'}
          </p>
        </div>

        {/* Stats strip */}
        {statItems.length > 0 && (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {statItems.map((s) => (
              <div
                key={s.label_en}
                className="rounded-xl border border-gp-border bg-card px-4 py-3.5 transition-colors hover:border-gp-primary/30"
              >
                <p className="font-display text-2xl sm:text-3xl font-bold text-gp-primary leading-none">
                  {s.value.toLocaleString(locale === 'mr' ? 'mr-IN' : 'en-IN')}
                </p>
                <p className="mt-1.5 text-xs text-gp-muted">
                  {locale === 'mr' ? s.label_mr : s.label_en}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
