'use client'

import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTheme } from './theme-provider'

const SECTIONS = [
  { id: 'about', label: 'ग्राम परिचय', label_en: 'About' },
  { id: 'members', label: 'पदाधिकारी', label_en: 'Members' },
  { id: 'announcements', label: 'घोषणा', label_en: 'News' },
  { id: 'achievements', label: 'यशोगाथा', label_en: 'Awards' },
  { id: 'events', label: 'कार्यक्रम', label_en: 'Events' },
  { id: 'gallery', label: 'दालन', label_en: 'Gallery' },
  { id: 'progress', label: 'प्रगती', label_en: 'Progress' },
  { id: 'map', label: 'गावाचा नकाशा', label_en: 'Map' },
] as const

export function PreviewNav({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.3 })
  const [active, setActive] = useState<string>('')
  const [condensed, setCondensed] = useState(false)

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        setActive(visible[0]!.target.id)
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <>
      {/* Scroll progress bar — gold hairline across the top */}
      <motion.div
        aria-hidden="true"
        className="fixed left-0 right-0 top-0 z-50 h-[2px] origin-left"
        style={{
          scaleX,
          background:
            'linear-gradient(90deg, var(--civic-gold) 0%, var(--civic-gold-soft) 50%, var(--civic-gold) 100%)',
        }}
      />

      {/* Top brand bar */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="fixed left-0 right-0 top-0 z-40"
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-500 lg:px-10 ${
            condensed ? 'pt-3' : 'pt-6'
          }`}
        >
          <motion.a
            href="#top"
            className="flex items-center gap-3"
            whileHover={{ opacity: 0.85 }}
          >
            <SealLogo />
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="font-editorial text-[13px] font-semibold tracking-[0.18em] text-(--civic-ink) uppercase">
                {locale === 'mr' ? 'ग्रामपंचायत' : 'Gram\u00A0Panchayat'}
              </span>
              <span className="text-[10px] uppercase tracking-[0.32em] text-(--civic-muted)">
                {locale === 'mr'
                  ? 'देशमुखवाडी · est. 1952'
                  : 'Deshmukhwadi · est. 1952'}
              </span>
            </div>
          </motion.a>

          <div className="hidden items-center gap-1 rounded-full border border-(--civic-border) bg-white/70 px-2 py-1.5 backdrop-blur-md lg:flex">
            {SECTIONS.map((s) => {
              const label = locale === 'mr' ? s.label : s.label_en
              const isActive = active === s.id
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  className="relative px-3 py-1.5 text-[12px] font-medium tracking-wide text-(--civic-ink-soft) transition-colors hover:text-(--civic-ink)"
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-(--civic-ink)"
                      transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                    />
                  )}
                  <span
                    className={`relative z-10 ${
                      isActive ? 'text-(--civic-bg)' : ''
                    }`}
                  >
                    {label}
                  </span>
                </a>
              )
            })}
          </div>

          <a
            href="#contact"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-(--civic-ink) bg-(--civic-ink) px-5 py-2.5 text-[12px] font-semibold tracking-[0.15em] text-(--civic-bg) uppercase transition-colors hover:bg-(--civic-gold-ink)"
          >
            <span>{locale === 'mr' ? 'संपर्क' : 'Contact'}</span>
            <motion.span
              aria-hidden="true"
              className="inline-block"
              initial={false}
              whileHover={{ x: 4 }}
            >
              →
            </motion.span>
          </a>
        </div>
      </motion.header>

      {/* Ambient section indicator pill — mobile */}
      <AnimatePresence>
        {active && condensed && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-(--civic-border) bg-white/90 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-(--civic-ink) uppercase backdrop-blur-lg shadow-lg lg:hidden"
          >
            {SECTIONS.find((s) => s.id === active)?.[locale === 'mr' ? 'label' : 'label_en']}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function SealLogo() {
  const theme = useTheme()
  return (
    <motion.span
      whileHover={{ rotate: 12 }}
      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full"
    >
      <svg viewBox="0 0 48 48" className="h-full w-full">
        <defs>
          <linearGradient id="seal-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.accent.ink} />
            <stop offset="50%" stopColor={theme.accent.highlight} />
            <stop offset="100%" stopColor={theme.accent.ink} />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="22" fill="var(--civic-ink)" />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="url(#seal-gold)"
          strokeWidth="0.8"
        />
        <circle
          cx="24"
          cy="24"
          r="15"
          fill="none"
          stroke="url(#seal-gold)"
          strokeWidth="0.5"
          strokeDasharray="1 2"
        />
        <text
          x="24"
          y="29"
          textAnchor="middle"
          fontFamily="Fraunces, serif"
          fontSize="15"
          fontWeight="700"
          fill="url(#seal-gold)"
        >
          ग्रा
        </text>
      </svg>
    </motion.span>
  )
}
