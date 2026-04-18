'use client'

import { Leaf } from 'lucide-react'
import { usePathname } from 'next/navigation'

import {
  Sidebar,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
} from '../../ui/sidebar'
import { GramAppContextStrip } from '../gram-app-context-strip'
import { GramAppNavbar } from '../gram-app-navbar'
import { GramSidebarBrand } from '../gram-sidebar-brand'
import { GramSidebarNav } from '../gram-sidebar-nav'
import { resolveActiveNavItem } from '../gram-nav-utils'

import type { GramAppShellProps } from './types'

export function GramAppShell({
  children,
  navItems,
  brandTitleMr,
  brandSubtitleMr,
  footerTitleMr,
  footerSubtitleMr,
  contextBadgeMr,
  contextBadgeEn,
  sidebarVariant = 'sidebar',
  sidebarCollapsible = 'icon',
  showSidebarRail = false,
  navGroupLabel,
  brandIcon = Leaf,
  headerExtra,
  defaultSidebarOpen = true,
  contextStripGpNameMr,
  contextStripFinancialYearMr,
  contextStripTrailing,
  menuTriggerAriaLabel = 'Toggle menu',
}: GramAppShellProps) {
  const pathname = usePathname()
  const pageMeta = resolveActiveNavItem(navItems, pathname)

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen} className="h-svh">
      <Sidebar
        collapsible={sidebarCollapsible}
        variant={sidebarVariant}
        className="border-sidebar-border md:border-r"
      >
        <GramSidebarBrand title={brandTitleMr ?? ''} subtitle={brandSubtitleMr ?? ''} icon={brandIcon} />
        <GramSidebarNav items={navItems} pathname={pathname} groupLabel={navGroupLabel} />
        <SidebarSeparator className="group-data-[collapsible=icon]:mx-1" />
        <SidebarFooter className="gap-0.5 px-3 py-3 group-data-[collapsible=icon]:hidden">
          {footerTitleMr ? <p className="text-[11px] font-semibold text-muted-foreground">{footerTitleMr}</p> : null}
          {footerSubtitleMr ? <p className="text-[10px] leading-snug text-muted-foreground/85">{footerSubtitleMr}</p> : null}
        </SidebarFooter>
        {showSidebarRail ? <SidebarRail /> : null}
      </Sidebar>

      <SidebarInset className="flex flex-col overflow-hidden">
        <GramAppContextStrip
          gpNameMr={contextStripGpNameMr}
          financialYearMr={contextStripFinancialYearMr}
          trailing={contextStripTrailing}
        />
        <GramAppNavbar
          pageTitle={pageMeta?.label ?? brandTitleMr ?? ''}
          pageSubtitleMr={pageMeta?.labelMr}
          contextBadgeEn={contextBadgeEn}
          contextBadgeMr={contextBadgeMr}
          headerExtra={headerExtra}
          menuTriggerAriaLabel={menuTriggerAriaLabel}
        />

        <div className="min-h-0 flex-1 overflow-x-hidden">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
