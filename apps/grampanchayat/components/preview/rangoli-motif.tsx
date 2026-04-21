'use client'

import { motion } from 'framer-motion'

/**
 * RangoliMotif — an animated, geometric rangoli-inspired ornament.
 * Pure SVG, respects prefers-reduced-motion (framer-motion pauses loops).
 * Used behind hero and section headings as a subtle domain signal.
 */

type RangoliMotifProps = {
  size?: number
  stroke?: string
  spin?: boolean
  className?: string
  opacity?: number
}

export function RangoliMotif({
  size = 320,
  stroke = 'var(--civic-gold)',
  spin = true,
  className,
  opacity = 0.4,
}: RangoliMotifProps) {
  const petals = 12
  const ring2 = 8
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={{ opacity }}
      initial={{ opacity: 0, scale: 0.8, rotate: -18 }}
      whileInView={{ opacity, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Rotating outer ring of petals */}
      <motion.g
        style={{ transformOrigin: '100px 100px' }}
        animate={spin ? { rotate: 360 } : undefined}
        transition={spin ? { duration: 90, repeat: Infinity, ease: 'linear' } : undefined}
      >
        {Array.from({ length: petals }).map((_, i) => {
          const a = (i * 360) / petals
          return (
            <g key={`p-${i}`} transform={`rotate(${a} 100 100)`}>
              <path
                d="M 100 18 C 110 40, 110 60, 100 80 C 90 60, 90 40, 100 18 Z"
                fill="none"
                stroke={stroke}
                strokeWidth="0.8"
              />
              <circle cx="100" cy="14" r="1.4" fill={stroke} />
            </g>
          )
        })}
      </motion.g>

      {/* Counter-rotating inner ring */}
      <motion.g
        style={{ transformOrigin: '100px 100px' }}
        animate={spin ? { rotate: -360 } : undefined}
        transition={spin ? { duration: 140, repeat: Infinity, ease: 'linear' } : undefined}
      >
        {Array.from({ length: ring2 }).map((_, i) => {
          const a = (i * 360) / ring2
          return (
            <g key={`r-${i}`} transform={`rotate(${a} 100 100)`}>
              <path
                d="M 100 60 L 108 100 L 100 140 L 92 100 Z"
                fill="none"
                stroke={stroke}
                strokeWidth="0.6"
                opacity="0.7"
              />
            </g>
          )
        })}
      </motion.g>

      {/* Concentric hairlines */}
      <g fill="none" stroke={stroke} strokeWidth="0.5" opacity="0.5">
        <circle cx="100" cy="100" r="82" />
        <circle cx="100" cy="100" r="58" strokeDasharray="1 3" />
        <circle cx="100" cy="100" r="30" />
      </g>

      {/* Central dodecagon */}
      <g fill="none" stroke={stroke} strokeWidth="1">
        <polygon
          points="100,74 113,80 122,91 122,109 113,120 100,126 87,120 78,109 78,91 87,80"
        />
      </g>

      {/* Centre dot */}
      <circle cx="100" cy="100" r="3.5" fill={stroke} />
    </motion.svg>
  )
}

/**
 * Toran — a horizontal festive garland used as a section divider.
 */
export function Toran({ className }: { className?: string }) {
  const beads = 21
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${beads * 24} 40`}
      width="100%"
      height="28"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d={`M 0 8 ${Array.from({ length: beads })
          .map((_, i) => {
            const x = i * 24 + 12
            const dip = i % 2 === 0 ? 22 : 14
            return `Q ${x} ${dip} ${i * 24 + 24} 8`
          })
          .join(' ')}`}
        fill="none"
        stroke="var(--civic-gold)"
        strokeWidth="1"
      />
      {Array.from({ length: beads }).map((_, i) => {
        const x = i * 24 + 12
        const dip = i % 2 === 0 ? 22 : 14
        return (
          <g key={i}>
            <circle cx={x} cy={dip} r="2.4" fill="var(--civic-gold)" />
            <path
              d={`M ${x} ${dip + 3} L ${x - 2} ${dip + 10} L ${x + 2} ${dip + 10} Z`}
              fill="var(--civic-gold-soft)"
              opacity="0.8"
            />
          </g>
        )
      })}
    </svg>
  )
}
