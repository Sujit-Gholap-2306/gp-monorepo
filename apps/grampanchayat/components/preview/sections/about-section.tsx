'use client'

import { motion } from 'framer-motion'
import { AnimatedCounter, Reveal, StaggerGroup, fadeUp } from '../motion-primitives'
import { SectionHeader } from '../section-header'
import { useTheme } from '../theme-provider'
import { previewVillage } from '@/lib/preview/mock-data'

const COUNTERS = [
  {
    label_mr: 'एकूण क्षेत्रफळ',
    label_en: 'Total Area',
    unit_mr: 'हेक्टर',
    unit_en: 'hectares',
    value: previewVillage.area_hectares,
  },
  {
    label_mr: 'कुटुंबे',
    label_en: 'Households',
    unit_mr: 'नोंदणीकृत',
    unit_en: 'registered',
    value: previewVillage.households,
  },
  {
    label_mr: 'लोकसंख्या',
    label_en: 'Population',
    unit_mr: '२०२५',
    unit_en: '2025 census',
    value: previewVillage.population,
  },
  {
    label_mr: 'साक्षरता',
    label_en: 'Literacy',
    unit_mr: '%',
    unit_en: '%',
    value: previewVillage.literacy_pct,
    decimals: 1,
  },
]

export function AboutSection({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  const theme = useTheme()
  return (
    <section id="about" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          kicker={locale === 'mr' ? '०१ · ग्रामपरिचय' : '01 · About the Village'}
          title={locale === 'mr' ? 'एका गावाची' : 'A village story'}
          italic={locale === 'mr' ? 'शांत कहाणी' : 'told in numbers'}
          intro={
            locale === 'mr'
              ? 'सह्याद्रीच्या कुशीत वसलेलं आमचं देशमुखवाडी — शेती, संस्कृती आणि सहकार्याच्या परंपरेला आधुनिक प्रगतीची जोड देत असलेलं गाव. १९५२ मध्ये स्थापन झालेली ग्रामपंचायत आजही गावकर्‍यांच्या विश्वासाचं केंद्र आहे.'
              : 'Nestled in the Sahyadri ranges, Deshmukhwadi blends its legacy of farming, culture, and cooperation with the calm ambitions of modern governance. Founded in 1952, our Gram Panchayat remains a quiet centre of trust.'
          }
        />

        <div className="grid gap-10 lg:grid-cols-12">
          {/* Editorial image placeholder — rendered as a tinted gradient card */}
          <Reveal className="lg:col-span-5" variants={fadeUp}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] overflow-hidden rounded-sm bg-(--civic-ink)"
              style={{ boxShadow: 'var(--civic-shadow-portrait)' }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, var(--civic-illus-portrait-from) 0%, var(--civic-illus-portrait-mid1) 40%, var(--civic-illus-portrait-mid2) 70%, var(--civic-illus-portrait-to) 100%)',
                }}
              />
              {/* Decorative ornament */}
              <svg
                aria-hidden="true"
                viewBox="0 0 400 500"
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <linearGradient id="about-ornament" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.accent.ink} stopOpacity="0.0" />
                    <stop offset="50%" stopColor={theme.accent.soft} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={theme.accent.ink} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Mountain silhouettes */}
                <path
                  d="M 0 340 L 60 290 L 110 310 L 170 250 L 230 300 L 290 240 L 350 280 L 400 260 L 400 500 L 0 500 Z"
                  fill={theme.illustration.portraitMid2}
                  opacity="0.8"
                />
                <path
                  d="M 0 380 L 80 330 L 150 360 L 220 310 L 300 350 L 400 320 L 400 500 L 0 500 Z"
                  fill={theme.illustration.portraitMid1}
                  opacity="0.9"
                />
                {/* Sun disc */}
                <circle cx="200" cy="160" r="80" fill="url(#about-ornament)" />
                <circle
                  cx="200"
                  cy="160"
                  r="60"
                  fill="none"
                  stroke={theme.accent.soft}
                  strokeWidth="0.6"
                  opacity="0.5"
                />
                <motion.circle
                  cx="200"
                  cy="160"
                  r="40"
                  fill="none"
                  stroke={theme.accent.soft}
                  strokeWidth="0.4"
                  opacity="0.8"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>

              {/* Caption overlay */}
              <div className="absolute inset-x-0 bottom-0 p-8">
                <p className="font-editorial-italic italic text-(--civic-gold-soft)">
                  {locale === 'mr' ? '"सह्याद्रीच्या कुशीत —"' : '"In the arms of Sahyadri —"'}
                </p>
                <p className="mt-2 font-editorial text-2xl font-light text-white">
                  {locale === 'mr' ? 'एक स्वयंपूर्ण गाव' : 'a self-reliant village'}
                </p>
              </div>
            </motion.div>
          </Reveal>

          {/* Right: intro + counters */}
          <div className="space-y-12 lg:col-span-7">
            <Reveal variants={fadeUp}>
              <p className="font-editorial text-2xl font-light leading-[1.4] text-(--civic-ink)">
                {locale === 'mr'
                  ? '"माझे गाव — माझी जबाबदारी" या तत्त्वावर चालणारी ग्रामपंचायत. प्रत्येक निर्णय ग्रामसभेत पारदर्शक चर्चेतून होतो, आणि प्रत्येक रुपया सार्वजनिक खतावणीत नोंदवला जातो.'
                  : '"My village — my responsibility." Every decision is debated in the open Gram Sabha, every rupee recorded in the public register.'}
              </p>
            </Reveal>

            <Reveal variants={fadeUp}>
              <dl className="grid grid-cols-2 gap-x-10 gap-y-8 border-t border-(--civic-border) pt-10">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.28em] text-(--civic-muted)">
                    {locale === 'mr' ? 'सरपंच' : 'Sarpanch'}
                  </dt>
                  <dd className="mt-2 font-editorial text-lg font-medium text-(--civic-ink)">
                    {locale === 'mr' ? previewVillage.sarpanch_name_mr : previewVillage.sarpanch_name_en}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.28em] text-(--civic-muted)">
                    {locale === 'mr' ? 'पिनकोड' : 'PIN Code'}
                  </dt>
                  <dd className="mt-2 font-editorial text-lg font-medium text-(--civic-ink) tabular">
                    {previewVillage.pincode}
                  </dd>
                </div>
              </dl>
            </Reveal>

            <StaggerGroup className="grid grid-cols-2 gap-6 pt-4">
              {COUNTERS.map((c) => (
                <motion.div
                  key={c.label_en}
                  variants={fadeUp}
                  className="border-l border-(--civic-border-strong) pl-5"
                >
                  <p className="text-[10px] uppercase tracking-[0.28em] text-(--civic-muted)">
                    {locale === 'mr' ? c.label_mr : c.label_en}
                  </p>
                  <p className="mt-3 font-editorial text-5xl font-light text-(--civic-ink) tabular">
                    <AnimatedCounter
                      value={c.value}
                      decimals={c.decimals ?? 0}
                      locale={locale === 'mr' ? 'mr-IN' : 'en-IN'}
                    />
                  </p>
                  <p className="mt-1 text-xs text-(--civic-muted)">
                    {locale === 'mr' ? c.unit_mr : c.unit_en}
                  </p>
                </motion.div>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </div>
    </section>
  )
}
