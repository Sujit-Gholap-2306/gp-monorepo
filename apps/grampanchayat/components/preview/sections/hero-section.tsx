'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { previewVillage } from '@/lib/preview/mock-data'
import { RangoliMotif } from '../rangoli-motif'
import { GoldUnderline, SplitText } from '../motion-primitives'

export function HeroSection({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const motifY = useTransform(scrollYProgress, [0, 1], [0, 160])
  const motifRotate = useTransform(scrollYProgress, [0, 1], [0, 40])
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120])

  const name = locale === 'mr' ? previewVillage.name_mr : previewVillage.name_en
  const tagline = locale === 'mr' ? previewVillage.tagline_mr : previewVillage.tagline_en
  const taluka = locale === 'mr' ? previewVillage.taluka : previewVillage.taluka_en
  const district = locale === 'mr' ? previewVillage.district : previewVillage.district_en

  return (
    <section
      ref={ref}
      id="top"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28 lg:pt-36"
    >
      {/* Warm paper gradient backdrop */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{ y: bgY }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 65% 45% at 50% 20%, var(--civic-glow-accent-low), transparent 70%), radial-gradient(ellipse 80% 60% at 50% 110%, var(--civic-glow-secondary-low), transparent 70%)',
          }}
        />
      </motion.div>

      {/* Animated rangoli behind the headline */}
      <motion.div
        className="pointer-events-none absolute right-[-8%] top-[12%] -z-10 lg:right-[6%] lg:top-[10%]"
        style={{ y: motifY, rotate: motifRotate }}
      >
        <RangoliMotif size={680} opacity={0.22} />
      </motion.div>

      {/* Kiran (ray) hairlines — subtle verticals */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="mx-auto flex h-full max-w-7xl justify-between px-6 lg:px-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-full w-px"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, var(--civic-glow-ink-faint) 30%, var(--civic-glow-ink-faint) 70%, transparent)',
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.4, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10"
        style={{ y: titleY, opacity: titleOpacity }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center gap-4"
        >
          <div className="h-px w-12 bg-(--civic-gold)" />
          <span className="font-editorial text-[11px] uppercase tracking-[0.42em] text-(--civic-gold-ink)">
            {locale === 'mr' ? 'महाराष्ट्र · जि. ' : 'Maharashtra · Dist. '}
            {district}
          </span>
          <div className="h-px flex-1 bg-(--civic-border-strong)" />
        </motion.div>

        {/* Title — editorial serif with SplitText */}
        <h1 className="mt-8 font-editorial text-[clamp(2.75rem,8.5vw,7.25rem)] font-light leading-[0.98] tracking-[-0.015em] text-(--civic-ink)">
          <SplitText text={name} variant="word" className="block" delay={0.35} />
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 block font-editorial-italic text-[0.5em] font-light italic text-(--civic-gold-ink)"
          >
            — {tagline}
          </motion.span>
        </h1>

        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-12 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4"
        >
          {[
            {
              k: locale === 'mr' ? 'स्थापना' : 'Established',
              v: String(previewVillage.established),
            },
            {
              k: locale === 'mr' ? 'तालुका' : 'Taluka',
              v: taluka,
            },
            {
              k: locale === 'mr' ? 'प्रभाग' : 'Wards',
              v: String(previewVillage.wards),
            },
            {
              k: locale === 'mr' ? 'लोकसंख्या' : 'Population',
              v: previewVillage.population.toLocaleString('en-IN'),
            },
          ].map((m) => (
            <div key={m.k}>
              <p className="text-[10px] uppercase tracking-[0.24em] text-(--civic-muted)">
                {m.k}
              </p>
              <p className="mt-1 font-editorial text-xl font-medium text-(--civic-ink) tabular">
                {m.v}
              </p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.35 }}
          className="mt-14 flex flex-wrap items-center gap-5"
        >
          <a
            href="#about"
            className="group inline-flex items-center gap-3 rounded-full bg-(--civic-ink) px-7 py-3.5 text-[12px] font-semibold tracking-[0.22em] text-(--civic-bg) uppercase transition-all hover:bg-(--civic-gold-ink)"
          >
            <span>{locale === 'mr' ? 'अधिक जाणून घ्या' : 'Discover'}</span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-(--civic-bg)/40 transition-transform group-hover:translate-x-1">
              ↓
            </span>
          </a>

          <a
            href="#announcements"
            className="inline-flex items-center gap-2 border-b border-transparent pb-1 font-editorial text-sm italic text-(--civic-ink-soft) transition-colors hover:border-(--civic-gold) hover:text-(--civic-ink)"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--civic-gold)" />
            {locale === 'mr' ? 'ताजी घोषणा पहा' : 'See latest announcement'}
          </a>
        </motion.div>

        <div className="mt-16">
          <GoldUnderline width={120} />
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.2, delay: 1.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] text-(--civic-muted)">
          scroll
        </span>
        <motion.div
          className="h-10 w-px"
          style={{
            background:
              'linear-gradient(to bottom, var(--civic-gold), transparent)',
          }}
          animate={{ scaleY: [0.2, 1, 0.2] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          initial={{ transformOrigin: 'top' }}
        />
      </motion.div>
    </section>
  )
}
