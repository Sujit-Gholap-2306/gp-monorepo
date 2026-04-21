'use client'

import { motion } from 'framer-motion'
import { useState, type ReactElement } from 'react'
import { Reveal } from '../motion-primitives'
import { SectionHeader } from '../section-header'
import { useTheme } from '../theme-provider'
import { type PreviewTheme } from '@/lib/preview/theme'
import { previewMapPins, type PreviewMapPin } from '@/lib/preview/mock-data'

/* Illustrated SVG village map — hand-composed, with animated pins */

const PIN_ICON: Record<PreviewMapPin['kind'], ReactElement> = {
  office: (
    <path
      d="M -4 2 L -4 -4 L 4 -4 L 4 2 M -2 2 L -2 -1 L 2 -1 L 2 2"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      strokeLinejoin="round"
    />
  ),
  school: (
    <path
      d="M -5 0 L 0 -4 L 5 0 M -3 0 L -3 3 L 3 3 L 3 0"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      strokeLinejoin="round"
    />
  ),
  temple: (
    <path
      d="M -4 3 L -4 -1 L 0 -5 L 4 -1 L 4 3 M 0 -5 L 0 -6.5"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      strokeLinejoin="round"
    />
  ),
  health: (
    <path
      d="M -3 0 H 3 M 0 -3 V 3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  ),
  water: (
    <path
      d="M 0 -4 C -3 -1, -3 1, 0 4 C 3 1, 3 -1, 0 -4 Z"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
  ),
  market: (
    <g>
      <path d="M -4 -1 H 4 L 3 3 H -3 Z" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M -3 -1 L -2 -3 L 2 -3 L 3 -1" stroke="currentColor" strokeWidth="1" fill="none" />
    </g>
  ),
}

export function MapSection({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  const [active, setActive] = useState<string | null>(null)
  const activePin = previewMapPins.find((p) => p.id === active)
  const theme = useTheme()

  return (
    <section
      id="map"
      className="relative overflow-hidden bg-(--civic-ink) py-28 text-(--civic-bg) lg:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          variant="on-ink"
          kicker={locale === 'mr' ? '०८ · गावाचा नकाशा' : '08 · Village Map'}
          title={locale === 'mr' ? 'एका नजरेत' : 'The village,'}
          italic={locale === 'mr' ? 'संपूर्ण गाव' : 'at a glance'}
          intro={
            locale === 'mr'
              ? 'कार्यालय, शाळा, आरोग्यकेंद्र, पाणी टाक्या आणि बाजार — गावातील महत्त्वाचे ठिकाण एकाच नकाशात. बिंदूंवर जा आणि माहिती पहा.'
              : 'Office, schools, health sub-centre, water tanks and weekly market — pan across, hover to explore.'
          }
        />

        <Reveal className="mt-12 grid gap-8 lg:grid-cols-12">
          {/* Map */}
          <div
            className="relative aspect-16/11 overflow-hidden rounded-sm border border-(--civic-gold-soft)/20 lg:col-span-8"
            style={{ background: theme.illustration.mapLandFrom }}
          >
            <VillageMapSvg active={active} onSelect={setActive} locale={locale} theme={theme} />

            {/* Compass rose */}
            <svg
              aria-hidden="true"
              viewBox="0 0 60 60"
              className="absolute left-5 top-5 h-12 w-12 text-(--civic-gold-soft)"
            >
              <circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6" />
              <path d="M 30 6 L 33 28 L 30 30 L 27 28 Z" fill="currentColor" opacity="0.9" />
              <path d="M 30 54 L 27 32 L 30 30 L 33 32 Z" fill="currentColor" opacity="0.35" />
              <text x="30" y="5" textAnchor="middle" fontSize="5" fill="currentColor" fontFamily="Fraunces, serif">
                N
              </text>
            </svg>

            {/* Scale hairline */}
            <div className="absolute bottom-5 left-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-(--civic-gold-soft)/80">
              <div className="h-px w-16 bg-(--civic-gold-soft)/60" />
              <span className="tabular">500 m</span>
            </div>
          </div>

          {/* Legend / active details */}
          <div className="lg:col-span-4">
            <div className="rounded-sm border border-(--civic-gold-soft)/20 bg-black/30 p-6 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.34em] text-(--civic-gold-soft)">
                {locale === 'mr' ? 'महत्त्वाची ठिकाणे' : 'Key locations'}
              </p>

              {activePin ? (
                <motion.div
                  key={activePin.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mt-5"
                >
                  <h3 className="font-editorial text-2xl font-light leading-tight">
                    {locale === 'mr' ? activePin.name_mr : activePin.name_en}
                  </h3>
                  <p className="mt-2 font-editorial-italic italic text-(--civic-gold-soft)">
                    {labelKind(activePin.kind, locale)}
                  </p>
                </motion.div>
              ) : (
                <p className="mt-5 font-editorial-italic italic text-(--civic-bg)/60">
                  {locale === 'mr' ? 'बिंदूवर फिरा →' : 'Hover a pin →'}
                </p>
              )}

              <ul className="mt-7 space-y-2.5">
                {previewMapPins.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(p.id)}
                      onFocus={() => setActive(p.id)}
                      onClick={() => setActive(p.id)}
                      onMouseLeave={() => setActive(null)}
                      className={`flex w-full items-center gap-3 rounded-sm border-l-2 px-3 py-2 text-left text-sm transition-colors ${
                        active === p.id
                          ? 'border-(--civic-gold-soft) bg-(--civic-gold-soft)/10 text-(--civic-bg)'
                          : 'border-transparent text-(--civic-bg)/70 hover:border-(--civic-gold-soft)/50 hover:text-(--civic-bg)'
                      }`}
                    >
                      <span className="text-(--civic-gold-soft)">
                        <svg viewBox="-6 -6 12 12" className="h-4 w-4">
                          {PIN_ICON[p.kind]}
                        </svg>
                      </span>
                      <span>{locale === 'mr' ? p.name_mr : p.name_en}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function labelKind(kind: PreviewMapPin['kind'], locale: 'mr' | 'en') {
  const map: Record<PreviewMapPin['kind'], { mr: string; en: string }> = {
    office: { mr: 'ग्रामपंचायत कार्यालय', en: 'Panchayat Office' },
    school: { mr: 'शिक्षण संस्था', en: 'School' },
    temple: { mr: 'धार्मिक स्थळ', en: 'Place of worship' },
    health: { mr: 'आरोग्य उपकेंद्र', en: 'Health sub-centre' },
    water: { mr: 'जलसंसाधन', en: 'Water resource' },
    market: { mr: 'आठवडा बाजार', en: 'Weekly market' },
  }
  return map[kind][locale]
}

/* The SVG map — 1000×700 viewBox. Hand-composed paths.
   All fills/strokes read from `theme` so each tenant paints their own
   village (farmland palette, river tone, road colour, etc.). */
function VillageMapSvg({
  active,
  onSelect,
  locale,
  theme,
}: {
  active: string | null
  onSelect: (id: string | null) => void
  locale: 'mr' | 'en'
  theme: PreviewTheme
}) {
  const illus = theme.illustration
  const accent = theme.accent.soft
  const fields = [illus.mapField1, illus.mapField2, illus.mapField3, illus.mapField1]
  const fieldsRow2 = [illus.mapField3, illus.mapField1, illus.mapField2]
  return (
    <svg
      viewBox="0 0 1000 700"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={locale === 'mr' ? 'गावाचा नकाशा' : 'Village map'}
    >
      <defs>
        <linearGradient id="land" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={illus.mapLandFrom} />
          <stop offset="100%" stopColor={illus.mapLandTo} />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={accent} strokeOpacity="0.05" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect width="1000" height="700" fill="url(#land)" />
      <rect width="1000" height="700" fill="url(#grid)" />
      <rect width="1000" height="700" fill="url(#glow)" />

      {/* Farmland parcels */}
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, delay: 0.1 }}
      >
        <path d="M 50 70 L 290 60 L 310 200 L 70 220 Z" fill={fields[0]} stroke={accent} strokeOpacity="0.15" strokeWidth="1" />
        <path d="M 310 60 L 540 55 L 560 190 L 310 200 Z" fill={fields[1]} stroke={accent} strokeOpacity="0.15" strokeWidth="1" />
        <path d="M 560 55 L 820 60 L 830 190 L 560 190 Z" fill={fields[2]} stroke={accent} strokeOpacity="0.15" strokeWidth="1" />
        <path d="M 830 70 L 950 80 L 940 210 L 830 190 Z" fill={fields[3]} stroke={accent} strokeOpacity="0.15" strokeWidth="1" />

        <path d="M 80 500 L 340 500 L 360 650 L 100 640 Z" fill={fieldsRow2[0]} stroke={accent} strokeOpacity="0.15" strokeWidth="1" />
        <path d="M 360 500 L 620 500 L 640 650 L 360 650 Z" fill={fieldsRow2[1]} stroke={accent} strokeOpacity="0.15" strokeWidth="1" />
        <path d="M 640 500 L 910 495 L 920 650 L 640 650 Z" fill={fieldsRow2[2]} stroke={accent} strokeOpacity="0.15" strokeWidth="1" />
      </motion.g>

      {/* River — a curving blue-ish hairline */}
      <motion.path
        d="M -20 360 C 200 340, 300 420, 500 380 S 820 340, 1020 410"
        fill="none"
        stroke={illus.mapRiverBody}
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.55"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M -20 360 C 200 340, 300 420, 500 380 S 820 340, 1020 410"
        fill="none"
        stroke={illus.mapRiverGlint}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />

      {/* Main roads */}
      <motion.g
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      >
        {/* Horizontal main road */}
        <motion.path
          d="M 30 330 L 970 330"
          fill="none"
          stroke={accent}
          strokeOpacity="0.5"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="0 1"
        />
        {/* Vertical main road */}
        <motion.path
          d="M 500 30 L 500 670"
          fill="none"
          stroke={accent}
          strokeOpacity="0.5"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Cross roads */}
        <path d="M 150 100 L 260 550" stroke={accent} strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
        <path d="M 850 90 L 740 580" stroke={accent} strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      </motion.g>

      {/* Central settlement cluster — subtle building dots */}
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.7 }}
      >
        {Array.from({ length: 28 }).map((_, idx) => {
          const angle = (idx / 28) * Math.PI * 2
          const r = 80 + (idx % 3) * 30
          const x = 500 + Math.cos(angle) * r
          const y = 340 + Math.sin(angle) * r * 0.7
          return (
            <rect
              key={idx}
              x={x - 2}
              y={y - 2}
              width={4}
              height={4}
              fill={accent}
              opacity={0.4 + (idx % 3) * 0.15}
            />
          )
        })}
      </motion.g>

      {/* Pins */}
      {previewMapPins.map((p, i) => {
        const cx = (p.x / 100) * 1000
        const cy = (p.y / 100) * 700
        const isActive = active === p.id
        return (
          <motion.g
            key={p.id}
            initial={{ opacity: 0, y: -12, scale: 0.6 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 1 + i * 0.1,
            }}
            onMouseEnter={() => onSelect(p.id)}
            onFocus={() => onSelect(p.id)}
            onMouseLeave={() => onSelect(null)}
            style={{ cursor: 'pointer' }}
            tabIndex={0}
          >
            {/* Pulse ring */}
            <motion.circle
              cx={cx}
              cy={cy}
              r={isActive ? 30 : 18}
              fill="none"
              stroke={accent}
              strokeWidth="1"
              opacity={0.4}
              animate={{
                r: [12, 28, 12],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeOut',
                delay: i * 0.3,
              }}
            />
            {/* Glow */}
            {isActive && (
              <motion.circle
                cx={cx}
                cy={cy}
                r={40}
                fill="url(#glow)"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            )}
            {/* Pin body */}
            <motion.g
              animate={{
                scale: isActive ? 1.35 : 1,
                y: isActive ? -6 : 0,
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              style={{ originX: cx, originY: cy }}
            >
              <circle
                cx={cx}
                cy={cy}
                r={11}
                fill={isActive ? accent : illus.mapPinDark}
                stroke={accent}
                strokeWidth="1.2"
              />
              <g transform={`translate(${cx},${cy})`} color={isActive ? illus.mapPinDark : accent}>
                {PIN_ICON[p.kind]}
              </g>
            </motion.g>

            {/* Label on hover */}
            {isActive && (
              <motion.g
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <rect
                  x={cx - 80}
                  y={cy - 44}
                  width="160"
                  height="24"
                  rx="2"
                  fill={illus.mapLabelBg}
                  stroke={accent}
                  strokeOpacity="0.4"
                />
                <text
                  x={cx}
                  y={cy - 28}
                  textAnchor="middle"
                  fontFamily="Fraunces, serif"
                  fontSize="11"
                  fill={accent}
                >
                  {locale === 'mr' ? p.name_mr : p.name_en}
                </text>
              </motion.g>
            )}
          </motion.g>
        )
      })}
    </svg>
  )
}
