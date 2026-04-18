import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import type { GramNavItem, GramSidebarCollapsible, GramSidebarVariant } from '../gram-types'

export type GramAppShellProps = {
  children: ReactNode
  navItems: GramNavItem[]
  brandTitleMr?: string
  brandSubtitleMr?: string
  footerTitleMr?: string
  footerSubtitleMr?: string
  contextBadgeMr?: string
  contextBadgeEn?: string
  sidebarVariant?: GramSidebarVariant
  sidebarCollapsible?: GramSidebarCollapsible
  showSidebarRail?: boolean
  navGroupLabel?: string
  brandIcon?: LucideIcon
  headerExtra?: ReactNode
  defaultSidebarOpen?: boolean
  contextStripGpNameMr?: string
  contextStripFinancialYearMr?: string
  contextStripTrailing?: ReactNode
  menuTriggerAriaLabel?: string
}

export type { GramNavItem, GramSidebarCollapsible, GramSidebarVariant } from '../gram-types'
