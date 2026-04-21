'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useId, useState } from 'react'
import { StaggerGroup, fadeUp } from '../motion-primitives'
import { SectionHeader } from '../section-header'
import { previewGallery, type PreviewGalleryItem } from '@/lib/preview/mock-data'

export function GallerySection({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  const [lightbox, setLightbox] = useState<PreviewGalleryItem | null>(null)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    // Capture whatever overflow the caller set so we restore it on close —
    // "" would stomp a parent's explicit `overflow: hidden`.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [lightbox])

  return (
    <section id="gallery" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          kicker={locale === 'mr' ? '०६ · दालन' : '06 · Gallery'}
          title={locale === 'mr' ? 'गावाच्या' : 'Glimpses of'}
          italic={locale === 'mr' ? 'छायाचित्रमाला' : 'village life'}
          intro={
            locale === 'mr'
              ? 'उत्सव, सभा, मोहिमा आणि रोजचं गाव — इथे चित्रमय रूपात.'
              : 'Festivals, meetings, drives and everyday village rhythms.'
          }
        />

        <StaggerGroup className="civic-masonry" staggerChildren={0.06}>
          {previewGallery.map((g) => (
            <GalleryCard
              key={g.id}
              item={g}
              onOpen={() => setLightbox(g)}
              locale={locale}
            />
          ))}
        </StaggerGroup>
      </div>

      <AnimatePresence>
        {lightbox && (
          <Lightbox item={lightbox} onClose={() => setLightbox(null)} locale={locale} />
        )}
      </AnimatePresence>
    </section>
  )
}

function GalleryCard({
  item,
  onOpen,
  locale,
}: {
  item: PreviewGalleryItem
  onOpen: () => void
  locale: 'mr' | 'en'
}) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4 }}
      className="group block w-full overflow-hidden rounded-sm border border-(--civic-border) bg-(--civic-paper) text-left"
    >
      <GalleryTile item={item} />
      <div className="flex items-center justify-between px-4 py-3">
        <p className="font-editorial text-sm font-medium text-(--civic-ink)">
          {locale === 'mr' ? item.title_mr : item.title_en}
        </p>
        <span className="text-[10px] uppercase tracking-[0.28em] text-(--civic-gold-ink)">
          {item.type === 'video'
            ? locale === 'mr'
              ? 'व्हि'
              : 'Video'
            : locale === 'mr'
              ? 'छा'
              : 'Photo'}
        </span>
      </div>
    </motion.button>
  )
}

function GalleryTile({
  item,
  large,
}: {
  item: PreviewGalleryItem
  large?: boolean
}) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: item.aspect }}
    >
      {/* Gradient "photo" */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, hsl(${item.hue} 45% 52%) 0%, hsl(${
            item.hue + 20
          } 35% 32%) 60%, hsl(${item.hue - 15} 45% 18%) 100%)`,
        }}
      />
      {/* Subtle grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.75' numOctaves='2'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Ornamental circle — suggests photography composition */}
      {/* Composition-hint circles — deliberately white on colourful tiles. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full text-white"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle
          cx="140"
          cy="60"
          r="35"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.4"
          opacity="0.4"
        />
        <circle
          cx="140"
          cy="60"
          r="22"
          fill="currentColor"
          opacity="0.08"
        />
      </svg>
      {item.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            whileHover={{ scale: 1.1 }}
            className={`flex items-center justify-center rounded-full border border-white/80 bg-black/30 backdrop-blur-md ${
              large ? 'h-20 w-20' : 'h-14 w-14'
            }`}
          >
            <svg viewBox="0 0 24 24" className={`${large ? 'h-8 w-8' : 'h-5 w-5'} text-white`}>
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </motion.span>
        </div>
      )}
    </div>
  )
}

function Lightbox({
  item,
  onClose,
  locale,
}: {
  item: PreviewGalleryItem
  onClose: () => void
  locale: 'mr' | 'en'
}) {
  const titleId = useId()
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-(--civic-ink)/92 p-6 backdrop-blur-lg"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl overflow-hidden rounded-sm bg-(--civic-paper) shadow-2xl"
      >
        <GalleryTile item={item} large />
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-(--civic-gold-ink)">
              {item.type === 'video' ? (locale === 'mr' ? 'व्हिडिओ' : 'Video') : locale === 'mr' ? 'छायाचित्र' : 'Photograph'}
            </p>
            <h3
              id={titleId}
              className="mt-1 font-editorial text-xl font-medium text-(--civic-ink)"
            >
              {locale === 'mr' ? item.title_mr : item.title_en}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--civic-border) text-(--civic-ink) transition-colors hover:border-(--civic-gold) hover:text-(--civic-gold-ink)"
          >
            ×
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
