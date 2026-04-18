'use client'

import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { Leaf } from 'lucide-react'

import {
  Sidebar,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '../ui/sidebar'
import { Separator } from '../ui/separator'
import { GramSidebarBrand } from './gram-sidebar-brand'
import { GramSidebarNav } from './gram-sidebar-nav'
import { resolveActiveNavItem } from './gram-nav-utils'
import type { GramNavItem, GramSidebarCollapsible, GramSidebarVariant } from './gram-types'

export type { GramNavItem, GramSidebarCollapsible, GramSidebarVariant } from './gram-types'

export type GramAppShellProps = {
  children: React.ReactNode
  navItems: GramNavItem[]
  brandTitleMr?: string
  brandSubtitleMr?: string
  footerTitleMr?: string
  footerSubtitleMr?: string
  contextBadgeMr?: string
  contextBadgeEn?: string
  /** shadcn Sidebar layout */
  sidebarVariant?: GramSidebarVariant
  sidebarCollapsible?: GramSidebarCollapsible
  /** Desktop edge control to expand/collapse (icon mode) */
  showSidebarRail?: boolean
  /** Label above nav links */
  navGroupLabel?: string
  brandIcon?: LucideIcon
  /** Right side of header (notifications, user, etc.) */
  headerExtra?: React.ReactNode
  /** Forwarded to SidebarProvider */
  defaultSidebarOpen?: boolean
}

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
  showSidebarRail = true,
  navGroupLabel = '\u092e\u0941\u0916\u094d\u092f \u092e\u0947\u0928\u0942',
  brandIcon = Leaf,
  headerExtra,
  defaultSidebarOpen = true,
}: GramAppShellProps) {
  const pathname = usePathname()
  const pageMeta = resolveActiveNavItem(navItems, pathname)

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen} className="min-h-svh">
      <Sidebar
        collapsible={sidebarCollapsible}
        variant={sidebarVariant}
        className="border-sidebar-border md:border-r"
      >
        <GramSidebarBrand title={brandTitleMr} subtitle={brandSubtitleMr} icon={brandIcon} />
        <GramSidebarNav items={navItems} pathname={pathname} groupLabel={navGroupLabel} />
        <SidebarSeparator />
        <SidebarFooter className="gap-1 px-4 py-4">
          <p className="text-[11px] font-semibold text-muted-foreground">{footerTitleMr}</p>
          <p className="text-[10px] leading-snug text-muted-foreground/85">{footerSubtitleMr}</p>
        </SidebarFooter>
        {showSidebarRail ? <SidebarRail /> : null}
      </Sidebar>

      <SidebarInset className="flex !h-svh max-h-svh flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/95 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 md:gap-3 md:px-5">
          <SidebarTrigger
            className="shrink-0"
            aria-label="\u092e\u0947\u0928\u0942 \u0915\u093f\u0902\u0935\u093e \u091f\u094b\u0917\u0932"
          />
          <Separator orientation="vertical" className="hidden h-6 md:block" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="hidden h-6 w-1 shrink-0 rounded-full bg-primary md:block" aria-hidden />
              <h1 className="truncate text-[13px] font-semibold text-foreground md:text-sm">
                {pageMeta?.label ?? brandTitleMr}
              </h1>
            </div>
            <p className="truncate text-[11px] text-muted-foreground">{pageMeta?.labelMr}</p>
          </div>

          {headerExtra ? <div className="hidden items-center gap-2 sm:flex">{headerExtra}</div> : null}

          <span className="hidden rounded-md border border-border bg-muted/60 px-2 py-1 text-[10px] font-medium text-muted-foreground sm:inline md:text-[11px]">
            {contextBadgeEn}
          </span>
          <span className="shrink-0 rounded-lg border border-primary/30 bg-primary-light px-2 py-1 text-[10px] font-semibold text-primary shadow-sm md:text-[11px]">
            {contextBadgeMr}
          </span>
        </header>

        <div className="min-h-0 flex-1 overflow-x-hidden">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
