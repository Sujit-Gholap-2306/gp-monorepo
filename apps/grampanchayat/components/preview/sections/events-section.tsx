'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { StaggerGroup, fadeUp } from '../motion-primitives'
import { SectionHeader } from '../section-header'
import { previewEvents, type PreviewEvent } from '@/lib/preview/mock-data'

export function EventsSection({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  // `!` is safe — we're the owners of the mock list and guarantee it's non-empty.
  // Empty-list support isn't a requirement of the preview portal.
  const [active, setActive] = useState<string>(() => previewEvents[0]!.id)
  const current = previewEvents.find((e) => e.id === active) ?? previewEvents[0]!

  return (
    <section id="events" className="relative bg-(--civic-bg-soft) py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          kicker={locale === 'mr' ? '०५ · कार्यक्रम' : '05 · Events'}
          title={locale === 'mr' ? 'येणारे' : 'What\u2019s'}
          italic={locale === 'mr' ? 'सोहळे व शिबिरे' : 'coming up'}
          intro={
            locale === 'mr'
              ? 'सण, ग्रामसभा, आरोग्य शिबिरे आणि सामूहिक कार्यक्रमांचे वेळापत्रक.'
              : 'Festivals, Gram Sabhas, health camps and community gatherings.'
          }
        />

        <div className="grid gap-10 lg:grid-cols-12">
          {/* Event list */}
          <StaggerGroup className="space-y-3 lg:col-span-7" staggerChildren={0.05}>
            {previewEvents.map((e) => (
              <EventRow
                key={e.id}
                event={e}
                active={e.id === active}
                onHover={() => setActive(e.id)}
                locale={locale}
              />
            ))}
          </StaggerGroup>

          {/* Big featured card, driven by hover/active */}
          <motion.div
            layout
            className="relative overflow-hidden rounded-sm bg-(--civic-ink) p-8 text-(--civic-bg) lg:col-span-5 lg:p-10"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 80% 20%, var(--civic-glow-accent-mid), transparent 60%)',
              }}
            />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.38em] text-(--civic-gold-soft)">
                {locale === 'mr' ? 'पुढील कार्यक्रम' : 'Up next'}
              </p>

              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <EventDateBlock
                  date={current.date}
                  time={current.time}
                  locale={locale}
                />

                <h3 className="mt-6 font-editorial text-3xl font-light leading-tight">
                  {locale === 'mr' ? current.title_mr : current.title_en}
                </h3>
                <p className="mt-3 font-editorial-italic italic text-(--civic-gold-soft)">
                  {locale === 'mr' ? current.venue_mr : current.venue_en}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-(--civic-gold-soft)/40 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-(--civic-gold-soft)">
                  <span className="h-1.5 w-1.5 rounded-full bg-(--civic-gold-soft)" />
                  {locale === 'mr' ? current.tag_mr : current.tag_en}
                </div>

                <button
                  type="button"
                  className="group mt-10 inline-flex items-center gap-3 border-b border-(--civic-gold-soft)/40 pb-2 text-xs font-semibold uppercase tracking-[0.3em] text-(--civic-bg) transition-colors hover:border-(--civic-gold-soft)"
                >
                  {locale === 'mr' ? 'कॅलेंडरमध्ये जोडा' : 'Add to calendar'}
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function EventRow({
  event,
  active,
  onHover,
  locale,
}: {
  event: PreviewEvent
  active: boolean
  onHover: () => void
  locale: 'mr' | 'en'
}) {
  const d = new Date(event.date)
  return (
    <motion.button
      type="button"
      variants={fadeUp}
      onMouseEnter={onHover}
      onFocus={onHover}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex w-full items-center justify-between gap-6 border-b py-5 text-left transition-colors ${
        active
          ? 'border-(--civic-gold)'
          : 'border-(--civic-border) hover:border-(--civic-border-strong)'
      }`}
    >
      {/* Active indicator */}
      {active && (
        <motion.span
          layoutId="event-indicator"
          aria-hidden="true"
          className="absolute -left-4 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-(--civic-gold)"
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        />
      )}

      <div className="flex items-center gap-6">
        <div className="w-16 shrink-0 border-r border-(--civic-border) pr-5 text-center">
          <p className="font-editorial text-3xl font-light leading-none tabular text-(--civic-ink)">
            {d.getDate()}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-(--civic-gold-ink)">
            {d.toLocaleDateString(locale === 'mr' ? 'mr-IN' : 'en-IN', { month: 'short' })}
          </p>
        </div>

        <div>
          <p className="font-editorial text-lg font-medium text-(--civic-ink)">
            {locale === 'mr' ? event.title_mr : event.title_en}
          </p>
          <p className="mt-1 text-xs text-(--civic-muted)">
            <span className="tabular">{event.time}</span>
            <span className="mx-2 opacity-40">·</span>
            <span>{locale === 'mr' ? event.venue_mr : event.venue_en}</span>
          </p>
        </div>
      </div>

      <span className="hidden rounded-full border border-(--civic-border-strong) px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-(--civic-gold-ink) md:inline-block">
        {locale === 'mr' ? event.tag_mr : event.tag_en}
      </span>
    </motion.button>
  )
}

function EventDateBlock({
  date,
  time,
  locale,
}: {
  date: string
  time: string
  locale: 'mr' | 'en'
}) {
  const d = new Date(date)
  const bcp47 = locale === 'mr' ? 'mr-IN' : 'en-IN'
  return (
    <div className="mt-6 flex items-baseline gap-4">
      <span className="font-editorial text-[5rem] font-light leading-none tabular">
        {d.getDate()}
      </span>
      <div>
        <p className="font-editorial text-xl font-light text-(--civic-gold-soft)">
          {d.toLocaleDateString(bcp47, { month: 'long', year: 'numeric' })}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-(--civic-bg)/60 tabular">
          {time}
        </p>
      </div>
    </div>
  )
}
