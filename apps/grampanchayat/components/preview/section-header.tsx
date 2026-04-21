'use client'

import { Reveal, GoldUnderline } from './motion-primitives'

/**
 * Shared editorial-style section header:
 *   — small uppercase label (kicker)
 *   — large serif title with optional italic kicker line
 *   — gold hairline draw-in
 *
 * Variants:
 *   'on-paper' (default) — for light-bg sections. Ink and gold-ink text.
 *   'on-ink'             — for the dark `--civic-ink` sections (achievements,
 *                          map). Uses inverted ink + gold-soft for kickers
 *                          and lighter paper/muted text for body.
 *
 * Previously this file exported only the light variant and callers hand-rolled
 * their own dark duplicates (SectionHeaderDark, etc.). Variants kill the fork.
 */
type Variant = 'on-paper' | 'on-ink'

const kickerClass: Record<Variant, string> = {
  'on-paper': 'text-(--civic-gold-ink)',
  'on-ink': 'text-(--civic-gold-soft)',
}

const titleClass: Record<Variant, string> = {
  'on-paper': 'text-(--civic-ink)',
  'on-ink': 'text-(--civic-bg)',
}

const italicClass: Record<Variant, string> = {
  'on-paper': 'text-(--civic-gold-ink)',
  'on-ink': 'text-(--civic-gold-soft)',
}

const introClass: Record<Variant, string> = {
  'on-paper': 'text-(--civic-ink-soft)',
  'on-ink': 'text-(--civic-muted)',
}

export function SectionHeader({
  kicker,
  title,
  italic,
  align = 'left',
  intro,
  variant = 'on-paper',
}: {
  kicker: string
  title: string
  italic?: string
  align?: 'left' | 'center'
  intro?: string
  variant?: Variant
}) {
  return (
    <Reveal
      className={`mb-14 ${
        align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-4xl'
      }`}
    >
      <div
        className={`flex items-center gap-4 ${
          align === 'center' ? 'justify-center' : ''
        }`}
      >
        <div className="h-px w-10 bg-(--civic-gold)" />
        <p
          className={`font-editorial text-[11px] uppercase tracking-[0.38em] ${kickerClass[variant]}`}
        >
          {kicker}
        </p>
      </div>
      <h2
        className={`mt-6 font-editorial text-[clamp(2rem,4.4vw,3.75rem)] font-light leading-[1.02] tracking-[-0.012em] ${titleClass[variant]}`}
      >
        {title}
        {italic && (
          <span
            className={`mt-1 block font-editorial-italic italic ${italicClass[variant]}`}
          >
            {italic}
          </span>
        )}
      </h2>
      {intro && (
        <p
          className={`mt-5 max-w-2xl text-base leading-relaxed ${introClass[variant]} ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {intro}
        </p>
      )}
      <div
        className={`mt-7 ${align === 'center' ? 'flex justify-center' : ''}`}
      >
        <GoldUnderline width={72} />
      </div>
    </Reveal>
  )
}
