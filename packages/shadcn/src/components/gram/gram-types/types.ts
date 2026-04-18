import type { LucideIcon } from 'lucide-react'

export type GramNavItem = {
  href: string
  label: string
  labelMr: string
  icon: LucideIcon
  /** Namuna reference, e.g. N08 — shown as a muted chip in the sidebar */
  badge?: string
  exact?: boolean
}

export type GramSidebarVariant = 'sidebar' | 'floating' | 'inset'

export type GramSidebarCollapsible = 'offcanvas' | 'icon' | 'none'
