'use client'

/**
 * Shared motion primitives for the preview portal.
 *
 * Design notes:
 *  - Every primitive honours `prefers-reduced-motion`. framer-motion's
 *    `useReducedMotion()` returns true when the user asks for no motion,
 *    and we collapse the animation to an instant state change. We never
 *    cut animation entirely — the content still needs to become visible.
 *  - Variants use a single shared easing curve so the portal feels
 *    coherent. Don't add new easings unless the design deliberately wants
 *    a different feel for that beat.
 */

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion'
import {
  forwardRef,
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'

/* --------------------------------------------------------- */
/*  Easing + variants                                        */
/* --------------------------------------------------------- */

const EASE = [0.22, 1, 0.36, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay: i * 0.08 },
  }),
}

export const stagger = (delayChildren = 0.1, staggerChildren = 0.08): Variants => ({
  hidden: {},
  visible: {
    transition: { delayChildren, staggerChildren },
  },
})

/* --------------------------------------------------------- */
/*  Reveal — scroll-triggered container                      */
/* --------------------------------------------------------- */

type RevealProps = ComponentPropsWithoutRef<typeof motion.div> & {
  variants?: Variants
  once?: boolean
  amount?: number
}

export function Reveal({
  variants = fadeUp,
  once = true,
  amount = 0.25,
  children,
  ...rest
}: RevealProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={reduced ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/* --------------------------------------------------------- */
/*  StaggerGroup — animates each direct child in sequence    */
/* --------------------------------------------------------- */

export function StaggerGroup({
  children,
  amount = 0.2,
  delayChildren = 0.05,
  staggerChildren = 0.08,
  className,
}: {
  children: ReactNode
  amount?: number
  delayChildren?: number
  staggerChildren?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={stagger(
        reduced ? 0 : delayChildren,
        reduced ? 0 : staggerChildren,
      )}
    >
      {children}
    </motion.div>
  )
}

/* --------------------------------------------------------- */
/*  AnimatedCounter — tweens a number once in view           */
/* --------------------------------------------------------- */
/*  Uses a MotionValue + transform so the DOM text updates   */
/*  without triggering React re-renders on every frame.      */

export function AnimatedCounter({
  value,
  duration = 1.6,
  decimals = 0,
  suffix = '',
  prefix = '',
  locale = 'en-IN',
  className,
}: {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  prefix?: string
  locale?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduced = useReducedMotion()
  const mv = useMotionValue(0)
  const formatted = useTransform(mv, (v) =>
    `${prefix}${v.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`,
  )

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      mv.set(value)
      return
    }
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      mv.set(value * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration, reduced, mv])

  return (
    <span ref={ref} className={className}>
      <motion.span>{formatted}</motion.span>
    </span>
  )
}

/* --------------------------------------------------------- */
/*  MagneticHover — pointer-follow micro-interaction         */
/* --------------------------------------------------------- */

type MagneticProps = ComponentPropsWithoutRef<typeof motion.div> & {
  strength?: number
  children: ReactNode
}

export const MagneticHover = forwardRef<HTMLDivElement, MagneticProps>(
  function MagneticHover({ strength = 18, children, style, ...rest }, ref) {
    const reduced = useReducedMotion()
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const sx = useSpring(x, { stiffness: 180, damping: 15, mass: 0.3 })
    const sy = useSpring(y, { stiffness: 180, damping: 15, mass: 0.3 })

    function handleMove(e: React.PointerEvent<HTMLDivElement>) {
      if (reduced) return
      const rect = e.currentTarget.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      x.set((dx / rect.width) * strength)
      y.set((dy / rect.height) * strength)
    }
    function handleLeave() {
      x.set(0)
      y.set(0)
    }

    return (
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={{ x: sx, y: sy, ...style }}
        {...rest}
      >
        {children}
      </motion.div>
    )
  },
)

/* --------------------------------------------------------- */
/*  SplitText — character / word reveal                      */
/* --------------------------------------------------------- */

export function SplitText({
  text,
  className,
  delay = 0,
  variant = 'word',
}: {
  text: string
  className?: string
  delay?: number
  variant?: 'char' | 'word'
}) {
  const reduced = useReducedMotion()
  const parts = variant === 'char' ? [...text] : text.split(' ')
  return (
    <motion.span
      className={className}
      initial={reduced ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      variants={stagger(
        reduced ? 0 : delay,
        reduced ? 0 : variant === 'char' ? 0.015 : 0.05,
      )}
      aria-label={text}
    >
      {parts.map((p, i) => (
        <motion.span
          aria-hidden="true"
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: '60%', filter: 'blur(6px)' },
            visible: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.7, ease: EASE },
            },
          }}
        >
          {p}
          {variant === 'word' && i < parts.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </motion.span>
  )
}

/* --------------------------------------------------------- */
/*  GoldUnderline — hairline accent line drawn on in-view    */
/* --------------------------------------------------------- */

export function GoldUnderline({ width = 80 }: { width?: number }) {
  const reduced = useReducedMotion()
  return (
    <motion.span
      aria-hidden="true"
      className="block bg-(--civic-gold)"
      initial={reduced ? { width, opacity: 1 } : { width: 0, opacity: 0 }}
      whileInView={{ width, opacity: 1 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.9, ease: EASE }}
      style={{ height: 1.5 }}
    />
  )
}
