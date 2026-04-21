'use client'

import { motion } from 'framer-motion'
import { civicCardClass } from '../civic-card'
import { Reveal, StaggerGroup, fadeUp } from '../motion-primitives'
import { SectionHeader } from '../section-header'
import { previewAnnouncements } from '@/lib/preview/mock-data'

export function AnnouncementsSection({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  const tickerText =
    locale === 'mr'
      ? 'ताज्या सूचना · ग्रामसभा २ मे · घरपट्टी सूट ३० एप्रिल · सौर पथदिवे कार्यान्वित · स्वच्छता अभियान मे महिना'
      : 'Latest notices · Gram Sabha 2 May · Tax rebate 30 April · Solar lights live · Swachhata drive every Sunday'

  return (
    <section id="announcements" className="relative py-28 lg:py-36">
      {/* Marquee ticker */}
      <div className="absolute inset-x-0 top-0 overflow-hidden border-y border-(--civic-border) bg-(--civic-ink) py-3">
        <motion.div
          className="flex whitespace-nowrap font-editorial text-[12px] uppercase tracking-[0.32em] text-(--civic-gold-soft)"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-8 pr-8">
              <span className="inline-block h-1 w-1 rounded-full bg-(--civic-gold)" />
              <span>{tickerText}</span>
            </span>
          ))}
        </motion.div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-24 lg:px-10">
        <SectionHeader
          kicker={locale === 'mr' ? '०३ · घोषणा' : '03 · Announcements'}
          title={locale === 'mr' ? 'ताज्या सूचना व' : 'Fresh notices and'}
          italic={locale === 'mr' ? 'अद्ययावत निर्णय' : 'current decisions'}
          intro={
            locale === 'mr'
              ? 'प्रत्येक महत्त्वाची सूचना ग्रामसभेच्या मान्यतेनंतर इथे प्रकाशित केली जाते.'
              : 'Every notice of significance, published here after Gram Sabha approval.'
          }
        />

        <StaggerGroup className="grid gap-5 lg:grid-cols-2" staggerChildren={0.06}>
          {previewAnnouncements.map((a, i) => {
            const d = new Date(a.date)
            return (
              <motion.article
                key={a.id}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4 }}
                className={civicCardClass({
                  elevation: 'hoverCardStrong',
                  padding: 'md',
                  className: 'group relative flex items-start gap-6 lg:p-8',
                })}
              >
                {/* Date block */}
                <div className="shrink-0 border-r border-(--civic-border) pr-6 text-right">
                  <p className="font-editorial text-4xl font-light leading-none tabular text-(--civic-ink)">
                    {d.getDate()}
                  </p>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.3em] text-(--civic-gold-ink)">
                    {d.toLocaleDateString(locale === 'mr' ? 'mr-IN' : 'en-IN', {
                      month: 'short',
                    })}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-(--civic-muted) tabular">
                    {d.getFullYear()}
                  </p>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        a.priority === 'high'
                          ? 'bg-(--civic-gold)'
                          : 'bg-(--civic-border-strong)'
                      }`}
                    />
                    <span className="text-[10px] uppercase tracking-[0.32em] text-(--civic-gold-ink)">
                      {locale === 'mr' ? a.category_mr : a.category_en}
                    </span>
                    {a.priority === 'high' && (
                      <span className="rounded-full border border-(--civic-gold) px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-(--civic-gold-ink)">
                        {locale === 'mr' ? 'तातडी' : 'Priority'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-editorial text-xl font-medium leading-snug text-(--civic-ink) transition-colors group-hover:text-(--civic-gold-ink)">
                    {locale === 'mr' ? a.title_mr : a.title_en}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-(--civic-ink-soft)">
                    {locale === 'mr' ? a.summary_mr : a.summary_en}
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-(--civic-ink)">
                    <span>{locale === 'mr' ? 'वाचा' : 'Read'}</span>
                    <motion.span
                      className="inline-block"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                    >
                      →
                    </motion.span>
                  </div>
                </div>

                {/* Number marker */}
                <span className="absolute right-4 top-4 font-editorial-italic text-xs italic text-(--civic-border-strong) tabular">
                  № {String(i + 1).padStart(2, '0')}
                </span>
              </motion.article>
            )
          })}
        </StaggerGroup>

        <Reveal className="mt-12 text-center">
          <a
            href="#"
            className="group inline-flex items-center gap-3 border-b border-(--civic-border-strong) pb-2 font-editorial text-sm uppercase tracking-[0.28em] text-(--civic-ink) transition-colors hover:border-(--civic-gold)"
          >
            {locale === 'mr' ? 'सर्व घोषणा पहा' : 'View all announcements'}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
