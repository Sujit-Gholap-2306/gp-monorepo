'use client'

import { motion } from 'framer-motion'
import { civicCardClass } from '../civic-card'
import { MagneticHover, StaggerGroup, fadeUp } from '../motion-primitives'
import { SectionHeader } from '../section-header'
import { previewMembers, type PreviewMember } from '@/lib/preview/mock-data'

export function MembersSection({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  return (
    <section
      id="members"
      className="relative bg-(--civic-bg-soft) py-28 lg:py-36"
    >
      {/* Rule above */}
      <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-7xl bg-(--civic-border-strong)" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          kicker={locale === 'mr' ? '०२ · पदाधिकारी' : '02 · Members'}
          title={locale === 'mr' ? 'लोकांनी निवडलेले' : 'Elected by the people,'}
          italic={locale === 'mr' ? 'लोकांसाठी काम करणारे' : 'working for the people'}
          intro={
            locale === 'mr'
              ? 'ग्रामसभेच्या आदेशाने चालणारी नऊ प्रभागांची समिती — निर्णयांमध्ये पारदर्शकता आणि उत्तरदायित्व यांची एकत्रित हमी.'
              : 'A committee from nine wards, guided by the Gram Sabha — transparency and accountability held together.'
          }
        />

        <StaggerGroup
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          staggerChildren={0.07}
        >
          {previewMembers.map((m, i) => (
            <MemberCard key={m.id} member={m} locale={locale} featured={i === 0} />
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}

function MemberCard({
  member,
  locale,
  featured,
}: {
  member: PreviewMember
  locale: 'mr' | 'en'
  featured?: boolean
}) {
  return (
    <motion.div variants={fadeUp}>
      <MagneticHover strength={10}>
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={civicCardClass({
            className: `group relative overflow-hidden ${
              featured ? 'sm:col-span-2 lg:col-span-1' : ''
            }`,
          })}
        >
          {/* Gold hairline top */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[2px] origin-left bg-(--civic-gold)"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.1 }}
          />

          {/* Portrait placeholder — geometric monogram */}
          <div className="relative mx-auto mb-8 h-32 w-32">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 130deg, hsl(${member.accentHue} 30% 65%), hsl(${member.accentHue} 45% 45%), hsl(${member.accentHue} 30% 65%))`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-(--civic-paper)">
              <div className="flex h-full w-full items-center justify-center rounded-full border border-(--civic-border) bg-(--civic-bg)">
                <span className="font-editorial text-4xl font-light text-(--civic-ink)">
                  {member.initials}
                </span>
              </div>
            </div>
            {/* Tiny gold seal */}
            <motion.div
              className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-(--civic-ink) text-[9px] font-semibold uppercase tracking-wider text-(--civic-gold-soft)"
              initial={{ scale: 0, rotate: -30 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 220, damping: 12, delay: 0.3 }}
            >
              {member.ward > 0 ? `W${member.ward}` : '★'}
            </motion.div>
          </div>

          {/* Role kicker */}
          <p className="text-center text-[10px] uppercase tracking-[0.32em] text-(--civic-gold-ink)">
            {locale === 'mr' ? member.role_mr : member.role_en}
          </p>

          {/* Name */}
          <h3 className="mt-3 text-center font-editorial text-xl font-medium leading-tight text-(--civic-ink)">
            {locale === 'mr' ? member.name_mr : member.name_en}
          </h3>

          {/* Meta */}
          <div className="mt-5 flex items-center justify-center gap-4 text-[11px] tabular text-(--civic-muted)">
            {member.ward > 0 && (
              <>
                <span>
                  {locale === 'mr' ? 'प्रभाग' : 'Ward'}{' '}
                  <span className="text-(--civic-ink)">{member.ward}</span>
                </span>
                <span className="h-3 w-px bg-(--civic-border-strong)" />
              </>
            )}
            <span>{member.tenure}</span>
          </div>
        </motion.div>
      </MagneticHover>
    </motion.div>
  )
}
