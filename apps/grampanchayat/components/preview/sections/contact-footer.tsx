'use client'

import { motion } from 'framer-motion'
import { Reveal, GoldUnderline } from '../motion-primitives'
import { Toran } from '../rangoli-motif'
import { previewVillage } from '@/lib/preview/mock-data'

export function ContactFooter({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  return (
    <footer id="contact" className="relative bg-(--civic-bg) pt-20">
      <Toran className="pointer-events-none -mt-2" />

      <div className="mx-auto max-w-7xl px-6 pb-14 pt-16 lg:px-10">
        <Reveal>
          <div className="grid gap-12 border-b border-(--civic-border) pb-16 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="font-editorial text-[11px] uppercase tracking-[0.38em] text-(--civic-gold-ink)">
                {locale === 'mr' ? 'संपर्क' : 'Get in touch'}
              </p>
              <h2 className="mt-5 font-editorial text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.04] tracking-[-0.012em] text-(--civic-ink)">
                {locale === 'mr' ? 'आमच्याशी ' : 'Reach the '}
                <span className="font-editorial-italic italic text-(--civic-gold-ink)">
                  {locale === 'mr' ? 'बोला' : 'Panchayat'}
                </span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-(--civic-ink-soft)">
                {locale === 'mr'
                  ? 'प्रत्येक कार्यदिवशी सकाळी १० ते संध्याकाळी ५ यादरम्यान ग्रामपंचायत कार्यालय खुले असते. तक्रार, सूचना किंवा सहकार्यासाठी थेट संपर्क साधा.'
                  : 'Our office is open every working day from 10 AM to 5 PM. Reach out for concerns, suggestions or to volunteer.'}
              </p>
              <div className="mt-6">
                <GoldUnderline width={96} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:col-span-6">
              <ContactBlock
                label={locale === 'mr' ? 'पत्ता' : 'Address'}
                lines={[
                  locale === 'mr' ? previewVillage.name_mr : previewVillage.name_en,
                  `${locale === 'mr' ? previewVillage.taluka : previewVillage.taluka_en}, ${
                    locale === 'mr' ? previewVillage.district : previewVillage.district_en
                  }`,
                  `Maharashtra — ${previewVillage.pincode}`,
                ]}
              />
              <ContactBlock
                label={locale === 'mr' ? 'कार्यालयीन वेळ' : 'Office hours'}
                lines={[
                  locale === 'mr' ? 'सोम — शुक्र' : 'Mon — Fri',
                  '10:00 — 17:00',
                  locale === 'mr' ? 'शनि · ग्रामसभेनुसार' : 'Sat · per Gram Sabha',
                ]}
              />
              <ContactBlock
                label={locale === 'mr' ? 'दूरध्वनी' : 'Phone'}
                lines={['+91 2164 00 00 00', '+91 98 00 00 00 00']}
                muted
              />
              <ContactBlock
                label={locale === 'mr' ? 'ईमेल' : 'Email'}
                lines={['office@gp-deshmukhwadi.in', 'sarpanch@gp-deshmukhwadi.in']}
                muted
              />
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-12 flex flex-wrap items-center justify-between gap-6">
          <p className="font-editorial-italic italic text-(--civic-ink-soft)">
            {locale === 'mr'
              ? '— "सेवा व सहकार्य, हाच पंचायतीचा धर्म."'
              : '— "Service and cooperation are the Panchayat\u2019s dharma."'}
          </p>
          <div className="flex items-center gap-3">
            {['FB', 'IG', 'YT', 'X'].map((s) => (
              <motion.a
                key={s}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.3 }}
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-(--civic-border-strong) text-[11px] font-semibold tracking-[0.18em] text-(--civic-ink) transition-colors hover:border-(--civic-gold) hover:text-(--civic-gold-ink)"
              >
                {s}
              </motion.a>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Tiny credit strip */}
      <div className="border-t border-(--civic-border) bg-(--civic-ink) py-5 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-(--civic-gold-soft)">
          © {new Date().getFullYear()} {locale === 'mr' ? previewVillage.name_mr : previewVillage.name_en}
          &nbsp;·&nbsp;{locale === 'mr' ? 'अधिकृत संकेतस्थळ' : 'Official Portal'}
          &nbsp;·&nbsp;Maharashtra
        </p>
      </div>
    </footer>
  )
}

function ContactBlock({
  label,
  lines,
  muted,
}: {
  label: string
  lines: string[]
  muted?: boolean
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-(--civic-gold-ink)">
        {label}
      </p>
      <div className={`mt-3 space-y-1 font-editorial leading-relaxed ${muted ? 'tabular' : ''}`}>
        {lines.map((l, i) => (
          <p
            key={i}
            className={i === 0 ? 'text-lg text-(--civic-ink)' : 'text-sm text-(--civic-ink-soft)'}
          >
            {l}
          </p>
        ))}
      </div>
    </div>
  )
}
