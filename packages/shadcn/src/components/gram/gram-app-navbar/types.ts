import type { ReactNode } from 'react'

export type GramAppNavbarProps = {
  /** Primary page title (English or short label) */
  pageTitle?: string
  /** Secondary line — Marathi subtitle */
  pageSubtitleMr?: string
  /** Location / district badges (existing shell behaviour) */
  contextBadgeEn?: string
  contextBadgeMr?: string
  headerExtra?: ReactNode
  /** Accessible label for menu trigger */
  menuTriggerAriaLabel?: string
  className?: string
}
