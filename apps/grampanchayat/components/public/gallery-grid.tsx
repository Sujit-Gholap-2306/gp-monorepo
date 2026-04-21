'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import type { Gallery } from '@/lib/types'

interface GalleryGridProps {
  items: Gallery[]
  locale: 'mr' | 'en'
}

export function GalleryGrid({ items, locale }: GalleryGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length],
  )
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length)),
    [items.length],
  )

  useEffect(() => {
    if (openIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [openIndex, close, next, prev])

  const active = openIndex !== null ? items[openIndex] : null
  const caption = (item: Gallery) =>
    (locale === 'mr' ? item.caption_mr : item.caption_en) ?? item.caption_mr ?? item.caption_en

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-gp-border bg-gp-surface transition-all hover:shadow-md hover:border-gp-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gp-primary focus-visible:ring-offset-2 cursor-pointer"
            aria-label={caption(item) ?? (locale === 'mr' ? 'फोटो पहा' : 'View photo')}
          >
            {item.type === 'photo' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt={caption(item) ?? ''}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />
            ) : (
              <>
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  preload="metadata"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 group-hover:bg-foreground/10 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-background/90 flex items-center justify-center shadow-md">
                    <Play className="h-5 w-5 text-gp-primary fill-gp-primary ml-0.5" aria-hidden="true" />
                  </div>
                </div>
              </>
            )}
            {caption(item) && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white line-clamp-2">{caption(item)}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-foreground/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={locale === 'mr' ? 'फोटो दृश्य' : 'Photo viewer'}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              close()
            }}
            className="absolute top-4 right-4 h-11 w-11 rounded-full bg-background/10 hover:bg-background/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label={locale === 'mr' ? 'बंद करा' : 'Close'}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-background/10 hover:bg-background/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label={locale === 'mr' ? 'मागील' : 'Previous'}
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-background/10 hover:bg-background/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label={locale === 'mr' ? 'पुढील' : 'Next'}
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </>
          )}

          <div
            className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {active.type === 'photo' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.url}
                alt={caption(active) ?? ''}
                className="max-h-[85vh] w-auto object-contain rounded-lg"
              />
            ) : (
              <video
                src={active.url}
                controls
                autoPlay
                className="max-h-[85vh] w-auto rounded-lg"
              />
            )}
            {caption(active) && (
              <p className="mt-4 text-center text-sm text-white/90 max-w-2xl">
                {caption(active)}
              </p>
            )}
            {items.length > 1 && (
              <p className="mt-2 text-xs text-white/60">
                {(openIndex! + 1).toLocaleString(locale === 'mr' ? 'mr-IN' : 'en-IN')} / {items.length.toLocaleString(locale === 'mr' ? 'mr-IN' : 'en-IN')}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
