'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { fadeUp } from '../motion-primitives'
import { SectionHeader } from '../section-header'
import { useTheme } from '../theme-provider'
import { medalColor, withAlpha } from '@/lib/preview/theme'
import { previewAchievements, type PreviewAchievement } from '@/lib/preview/mock-data'

export function AchievementsSection({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section
      id="achievements"
      className="relative overflow-hidden bg-(--civic-ink) py-28 text-(--civic-bg) lg:py-36"
    >
      {/* Warm glow background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 20% 30%, var(--civic-glow-accent-mid), transparent 70%), radial-gradient(ellipse 40% 50% at 90% 70%, var(--civic-glow-accent-low), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          variant="on-ink"
          kicker={locale === 'mr' ? '०४ · यशोगाथा' : '04 · Achievements'}
          title={locale === 'mr' ? 'गावाचा' : 'A quiet record of'}
          italic={locale === 'mr' ? 'गौरवशाली प्रवास' : 'civic excellence'}
          intro={
            locale === 'mr'
              ? 'प्रत्येक पुरस्कार एका सामूहिक परिश्रमाची खूण आहे — आणि एक नवी जबाबदारी.'
              : 'Each accolade marks collective effort — and a new responsibility.'
          }
        />

        <div ref={ref} className="relative mt-12">
          {/* Vertical timeline line — draws in on scroll */}
          <motion.div
            aria-hidden="true"
            className="absolute bottom-0 left-[22px] top-0 w-px origin-top bg-gradient-to-b from-transparent via-(--civic-gold) to-transparent md:left-1/2"
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : undefined}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          />

          <ul className="space-y-14">
            {previewAchievements.map((a, i) => (
              <TimelineItem key={a.year} item={a} index={i} locale={locale} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function TimelineItem({
  item,
  index,
  locale,
}: {
  item: PreviewAchievement
  index: number
  locale: 'mr' | 'en'
}) {
  const theme = useTheme()
  const right = index % 2 === 1
  const medal = medalColor(theme, item.medal)

  return (
    <motion.li
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={`relative grid items-center gap-6 md:grid-cols-2 md:gap-10 ${
        right ? 'md:[&>div:nth-child(1)]:order-2' : ''
      }`}
    >
      {/* Dot on the timeline */}
      <motion.div
        aria-hidden="true"
        className="absolute left-[22px] top-8 -translate-x-1/2 md:left-1/2"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.2 }}
      >
        <div className="relative flex h-5 w-5 items-center justify-center">
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-30"
            style={{ background: medal }}
          />
          <span
            className="relative h-3 w-3 rounded-full"
            style={{ background: medal, boxShadow: `0 0 10px ${withAlpha(medal, '88')}` }}
          />
        </div>
      </motion.div>

      {/* Content side */}
      <div className={`pl-16 md:pl-0 ${right ? 'md:pl-10 md:text-left' : 'md:pr-10 md:text-right'}`}>
        <p className="font-editorial-italic italic text-(--civic-gold-soft)">
          {locale === 'mr' ? item.title_mr : item.title_en}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-(--civic-bg)/70">
          {locale === 'mr' ? item.body_mr : item.body_en}
        </p>
      </div>

      {/* Year side — giant */}
      <div className={`pl-16 md:pl-10 ${right ? 'md:order-1 md:pl-0 md:pr-10 md:text-right' : ''}`}>
        <div
          className={`inline-flex flex-col ${
            right ? 'md:items-end' : 'md:items-start'
          }`}
        >
          <span className="text-[10px] uppercase tracking-[0.36em] text-(--civic-gold-soft)/70">
            {locale === 'mr' ? 'वर्ष' : 'Year'}
          </span>
          <span className="mt-2 font-editorial text-6xl font-light tabular text-(--civic-bg) lg:text-7xl">
            <span className="foil">{item.year}</span>
          </span>
          {/* Medal badge */}
          <span
            className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
            style={{
              borderColor: withAlpha(medal, '55'),
              color: medal,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: medal }}
            />
            {item.medal}
          </span>
        </div>
      </div>
    </motion.li>
  )
}

