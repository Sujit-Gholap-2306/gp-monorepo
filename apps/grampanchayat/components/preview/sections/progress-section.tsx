'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { civicCardClass } from '../civic-card'
import { AnimatedCounter, Reveal, StaggerGroup, fadeUp } from '../motion-primitives'
import { SectionHeader } from '../section-header'
import { previewProgress, type PreviewProgress } from '@/lib/preview/mock-data'

/* Icon set — hand-made SVG, warm gold strokes */
const ICONS: Record<PreviewProgress['icon'], (p: { stroke: string }) => React.ReactElement> = {
  road: ({ stroke }) => (
    <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" stroke={stroke} strokeWidth="1.4">
      <path d="M14 6 L20 42" />
      <path d="M34 6 L28 42" />
      <path d="M24 10 L24 14 M24 20 L24 26 M24 32 L24 38" strokeDasharray="4 3" />
    </svg>
  ),
  water: ({ stroke }) => (
    <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" stroke={stroke} strokeWidth="1.4">
      <path d="M24 6 C 14 20, 10 28, 10 34 a 14 14 0 0 0 28 0 c 0 -6 -4 -14 -14 -28 Z" />
      <path d="M18 30 c 2 3 4 3 6 1" strokeLinecap="round" />
    </svg>
  ),
  solar: ({ stroke }) => (
    <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" stroke={stroke} strokeWidth="1.4">
      <circle cx="24" cy="24" r="7" />
      <path d="M24 6 V12 M24 36 V42 M6 24 H12 M36 24 H42 M11 11 L15 15 M33 33 L37 37 M37 11 L33 15 M15 33 L11 37" strokeLinecap="round" />
    </svg>
  ),
  school: ({ stroke }) => (
    <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" stroke={stroke} strokeWidth="1.4">
      <path d="M6 22 L24 12 L42 22" strokeLinejoin="round" />
      <path d="M10 22 V40 H38 V22" />
      <path d="M20 40 V30 H28 V40" />
      <path d="M24 12 V6" />
    </svg>
  ),
  health: ({ stroke }) => (
    <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" stroke={stroke} strokeWidth="1.4">
      <rect x="8" y="10" width="32" height="30" rx="2" />
      <path d="M24 18 V32 M17 25 H31" strokeLinecap="round" />
    </svg>
  ),
  drain: ({ stroke }) => (
    <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" stroke={stroke} strokeWidth="1.4">
      <path d="M4 20 C 14 14, 34 14, 44 20" />
      <path d="M4 30 C 14 24, 34 24, 44 30" />
      <path d="M4 40 C 14 34, 34 34, 44 40" />
    </svg>
  ),
}

export function ProgressSection({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  return (
    <section id="progress" className="relative bg-(--civic-bg-soft) py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          kicker={locale === 'mr' ? '०७ · प्रगती' : '07 · Progress'}
          title={locale === 'mr' ? 'चालू' : 'Work'}
          italic={locale === 'mr' ? 'विकास कामांचा आढावा' : 'in motion'}
          intro={
            locale === 'mr'
              ? 'प्रत्येक विकास कामाची स्थिती — अर्थसंकल्प, खर्च आणि पूर्णतेची टक्केवारी — सार्वजनिकरित्या खुली.'
              : 'Every development project — budget, spend, and progress — kept in public view.'
          }
        />

        {/* Summary band */}
        <Reveal>
          <div className="mb-12 grid grid-cols-2 gap-0 overflow-hidden rounded-sm border border-(--civic-border-strong) bg-(--civic-paper) md:grid-cols-4">
            {[
              {
                label_mr: 'एकूण प्रकल्प',
                label_en: 'Total Projects',
                value: previewProgress.length,
                suffix: '',
              },
              {
                label_mr: 'पूर्ण झालेले',
                label_en: 'Completed',
                value: previewProgress.filter((p) => p.progress === 100).length,
                suffix: '',
              },
              {
                label_mr: 'एकूण अर्थसंकल्प',
                label_en: 'Total Budget',
                value: previewProgress.reduce((a, b) => a + b.budget_lakh, 0),
                suffix: ' L',
              },
              {
                label_mr: 'खर्च केलेला',
                label_en: 'Utilised',
                value: previewProgress.reduce((a, b) => a + b.spent_lakh, 0),
                suffix: ' L',
              },
            ].map((s) => (
              <div
                key={s.label_en}
                className="border-r border-(--civic-border) px-6 py-8 last:border-r-0"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-(--civic-gold-ink)">
                  {locale === 'mr' ? s.label_mr : s.label_en}
                </p>
                <p className="mt-3 font-editorial text-4xl font-light text-(--civic-ink) tabular">
                  <AnimatedCounter
                    value={s.value}
                    suffix={s.suffix}
                    locale={locale === 'mr' ? 'mr-IN' : 'en-IN'}
                  />
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <StaggerGroup className="grid gap-5 md:grid-cols-2" staggerChildren={0.06}>
          {previewProgress.map((p) => (
            <ProgressCard key={p.id} item={p} locale={locale} />
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}

function ProgressCard({
  item,
  locale,
}: {
  item: PreviewProgress
  locale: 'mr' | 'en'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const Icon = ICONS[item.icon]
  const complete = item.progress === 100

  return (
    <motion.div
      variants={fadeUp}
      ref={ref}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.4 }}
      className={civicCardClass({
        padding: 'lg',
        className: 'group relative overflow-hidden',
      })}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-(--civic-border-strong) bg-(--civic-bg)">
            <Icon stroke="var(--civic-gold-ink)" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-medium leading-tight text-(--civic-ink)">
              {locale === 'mr' ? item.title_mr : item.title_en}
            </h3>
            <p className="mt-1 text-[11px] uppercase tracking-[0.26em] text-(--civic-muted)">
              {locale === 'mr' ? 'अर्थसंकल्प' : 'Budget'}{' '}
              <span className="text-(--civic-ink) tabular">
                ₹{item.budget_lakh}L
              </span>
              <span className="mx-2 opacity-40">·</span>
              {locale === 'mr' ? 'खर्च' : 'Spent'}{' '}
              <span className="text-(--civic-ink) tabular">
                ₹{item.spent_lakh}L
              </span>
            </p>
          </div>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] ${
            complete
              ? 'border-(--civic-gold) bg-(--civic-gold)/10 text-(--civic-gold-ink)'
              : 'border-(--civic-border-strong) text-(--civic-ink-soft)'
          }`}
        >
          {complete
            ? locale === 'mr'
              ? 'पूर्ण'
              : 'Done'
            : locale === 'mr'
              ? 'चालू'
              : 'Ongoing'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-7">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] uppercase tracking-[0.3em] text-(--civic-muted)">
            {locale === 'mr' ? 'पूर्णता' : 'Progress'}
          </p>
          <p className="font-editorial text-3xl font-light text-(--civic-ink) tabular">
            <AnimatedCounter
              value={item.progress}
              suffix="%"
              locale={locale === 'mr' ? 'mr-IN' : 'en-IN'}
            />
          </p>
        </div>
        <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-(--civic-border)">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: complete
                ? 'linear-gradient(90deg, var(--civic-gold-ink), var(--civic-gold-soft))'
                : 'linear-gradient(90deg, var(--civic-ink) 0%, var(--civic-gold-ink) 100%)',
            }}
            initial={{ width: '0%' }}
            animate={inView ? { width: `${item.progress}%` } : undefined}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </motion.div>
  )
}
