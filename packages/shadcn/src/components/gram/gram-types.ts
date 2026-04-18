import type { LucideIcon } from 'lucide-react'

export type GramNavItem = {
  href: string
  label: string
  labelMr: string
  icon: LucideIcon
  exact?: boolean
}

export type GramSidebarVariant = 'sidebar' | 'floating' | 'inset'

export type GramSidebarCollapsible = 'offcanvas' | 'icon' | 'none'
