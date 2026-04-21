import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react'

/**
 * CivicCard — the canonical "paper card" surface for the preview portal.
 *
 * Every section that sits cards on the cream bg has been duplicating the
 * same handful of classes:
 *
 *     "rounded-3xl border border-(--civic-border) bg-(--civic-paper) p-8"
 *     + a matching civic shadow
 *
 * Centralising it gives us one place to:
 *   - keep the paper/border/shadow combo in lockstep with the theme,
 *   - tune the card rhythm across sections without hunting for copies,
 *   - give SSR-friendly sections a primitive that isn't a client component.
 *
 * The default element is <div>. Pass `as="article" | "li" | …` when the
 * surrounding HTML demands it (announcements use <article>, progress grid
 * uses <article>, etc.).
 */

type CardElevation = 'none' | 'card' | 'cardStrong' | 'hoverCard' | 'hoverCardStrong'
type CardSurface = 'paper' | 'bg' | 'bgSoft' | 'ink'
type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'
type CardRadius = 'sm' | 'md' | 'lg' | 'xl'

/** The editorial aesthetic uses hard-edged corners (`rounded-sm`). Keep a
 *  handful of rounder variants for blocks that look nicer with more radius. */
const radiusClass: Record<CardRadius, string> = {
  sm: 'rounded-sm',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
}

const surfaceClass: Record<CardSurface, string> = {
  paper: 'bg-(--civic-paper)',
  bg: 'bg-(--civic-bg)',
  bgSoft: 'bg-(--civic-bg-soft)',
  ink: 'bg-(--civic-ink) text-(--civic-bg)',
}

const paddingClass: Record<CardPadding, string> = {
  none: '',
  sm: 'p-5',
  md: 'p-6',
  lg: 'p-7',
  xl: 'p-8 lg:p-10',
}

/** `hoverCard*` variants pair with `transition-shadow` so the shadow only
 *  materialises on hover — cheaper than painting it on every card at rest. */
const elevationClass: Record<CardElevation, string> = {
  none: '',
  card: 'shadow-(--civic-shadow-card)',
  cardStrong: 'shadow-(--civic-shadow-card-strong)',
  hoverCard: 'transition-shadow hover:shadow-(--civic-shadow-card)',
  hoverCardStrong: 'transition-shadow hover:shadow-(--civic-shadow-card-strong)',
}

/** `border` defaults to the standard civic border. Pass `border="none"` for
 *  surfaces (e.g. dark-ink cards) that don't want one. */
type CardBorder = 'default' | 'strong' | 'none'
const borderClass: Record<CardBorder, string> = {
  default: 'border border-(--civic-border)',
  strong: 'border border-(--civic-border-strong)',
  none: '',
}

export interface CivicCardOptions {
  elevation?: CardElevation
  surface?: CardSurface
  padding?: CardPadding
  radius?: CardRadius
  border?: CardBorder
  className?: string
}

/**
 * Public class-name builder so components that must be motion.* (for variants
 * / layout / whileHover) can still opt into the exact same recipe without
 * duplicating the recipe string in three files.
 */
export function civicCardClass({
  elevation = 'hoverCard',
  surface = 'paper',
  padding = 'xl',
  radius = 'sm',
  border = 'default',
  className = '',
}: CivicCardOptions = {}): string {
  return [
    radiusClass[radius],
    borderClass[border],
    surfaceClass[surface],
    paddingClass[padding],
    elevationClass[elevation],
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

type CivicCardProps<E extends ElementType = 'div'> = {
  as?: E
} & CivicCardOptions &
  Omit<ComponentPropsWithoutRef<E>, 'as' | 'className'>

export const CivicCard = forwardRef<HTMLElement, CivicCardProps>(
  function CivicCard(
    { as, elevation, surface, padding, radius, border, className, ...rest },
    ref,
  ) {
    const Tag = (as ?? 'div') as ElementType
    return (
      <Tag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        className={civicCardClass({
          elevation,
          surface,
          padding,
          radius,
          border,
          className,
        })}
        {...rest}
      />
    )
  },
)
