import type { ComponentProps } from 'react'

import type { SidebarMenuButton } from '../../ui/sidebar'

import type { GramNavItem } from '../gram-types'

export type GramSidebarNavProps = {
  items: GramNavItem[]
  pathname: string
  onNavigate?: () => void
  /** Shown above the menu (e.g. “कार्य”) */
  groupLabel?: string
  /** Use larger rows (two-line labels) */
  itemSize?: ComponentProps<typeof SidebarMenuButton>['size']
  className?: string
}
