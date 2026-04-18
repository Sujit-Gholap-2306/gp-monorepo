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
  brandTitleMr = '\u0917\u094d\u0930\u093e\u092e\u092a\u0902\u091a\u093e\u092f\u0924',
  brandSubtitleMr = '\u0909\u0924\u093e\u0930\u093e \u0935\u094d\u092f\u0935\u0938\u094d\u0925\u093e\u092a\u0928',
  footerTitleMr = '\u092e\u0939\u093e\u0930\u093e\u0937\u094d\u091f\u094d\u0930 \u0936\u093e\u0938\u0928',
  footerSubtitleMr = '\u0917\u094d\u0930\u093e\u092e \u0935\u093f\u0915\u093e\u0938 \u0935\u093f\u092d\u093e\u0917',
  contextBadgeMr = '\u092c\u0933\u0938\u093e\u0923\u0947',
  contextBadgeEn = 'Sakri \u00b7 Dhule',
  sidebarVariant = 'sidebar',
  sidebarCollapsible = 'icon',
  /** Off by default: the rail also toggles the sidebar and reads as a second control beside {@link SidebarTrigger}. */
  showSidebarRail = false,
  navGroupLabel = '\u092e\u0941\u0916\u094d\u092f \u092e\u0947\u0928\u0942',
  brandIcon = Leaf,
  headerExtra,
  defaultSidebarOpen = true,
  contextStripGpNameMr,
  contextStripFinancialYearMr,
  contextStripTrailing,
  menuTriggerAriaLabel = '\u092e\u0947\u0928\u0942 \u0915\u093f\u0902\u0935\u093e \u091f\u094b\u0917\u0932',
}: GramAppShellProps) {
  const pathname = usePathname()
  const pageMeta = resolveActiveNavItem(navItems, pathname)

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen} className="min-h-svh">
      <Sidebar
        collapsible={sidebarCollapsible}
        variant={sidebarVariant}
        className="border-sidebar-border md:border-r "
      >
        <GramSidebarBrand title={brandTitleMr} subtitle={brandSubtitleMr} icon={brandIcon} />
        <GramSidebarNav items={navItems} pathname={pathname} groupLabel={navGroupLabel} />
        <SidebarSeparator className="group-data-[collapsible=icon]:mx-1" />
        <SidebarFooter className="gap-0.5 px-3 py-3 group-data-[collapsible=icon]:hidden">
          <p className="text-[11px] font-semibold text-muted-foreground">{footerTitleMr}</p>
          <p className="text-[10px] leading-snug text-muted-foreground/85">{footerSubtitleMr}</p>
        </SidebarFooter>
        {showSidebarRail ? <SidebarRail /> : null}
      </Sidebar>

      <SidebarInset className="flex h-svh! max-h-svh flex-col overflow-hidden">
        <GramAppContextStrip
          gpNameMr={contextStripGpNameMr}
          financialYearMr={contextStripFinancialYearMr}
          trailing={contextStripTrailing}
        />
        <GramAppNavbar
          pageTitle={pageMeta?.label ?? brandTitleMr}
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
