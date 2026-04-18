'use client'

import { Badge } from '../../ui/badge'
import { Separator } from '../../ui/separator'
import { SidebarTrigger } from '../../ui/sidebar'
import { cn } from '../../../lib/utils'

import type { GramAppNavbarProps } from './types'
import { appNavbarDistrictBadgeVariants, appNavbarVariants } from './variants'

export { appNavbarDistrictBadgeVariants, appNavbarVariants } from './variants'

/**
 * Sticky top bar: shadcn SidebarTrigger + titles + optional actions (navbar).
 */
export function GramAppNavbar({
  pageTitle,
  pageSubtitleMr,
  contextBadgeEn,
  contextBadgeMr,
  headerExtra,
  menuTriggerAriaLabel = 'Toggle navigation menu',
  className,
}: GramAppNavbarProps) {
  return (
    <header className={cn(appNavbarVariants(), className)}>
      <SidebarTrigger
        className="shrink-0 transition-colors duration-200"
        aria-label={menuTriggerAriaLabel}
      />
      <Separator orientation="vertical" className="hidden h-6 md:block" />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="hidden h-6 w-1 shrink-0 rounded-full bg-primary md:block" aria-hidden />
          <h1 className="truncate text-[13px] font-semibold text-foreground md:text-sm">{pageTitle}</h1>
        </div>
        {pageSubtitleMr ? (
          <p className="truncate text-[11px] text-muted-foreground">{pageSubtitleMr}</p>
        ) : null}
      </div>

      {headerExtra ? <div className="hidden items-center gap-2 sm:flex">{headerExtra}</div> : null}

      {contextBadgeEn ? (
        <Badge
          variant="outline"
          className="hidden shrink-0 px-2 py-0.5 text-[10px] font-medium sm:inline md:text-[11px]"
        >
          {contextBadgeEn}
        </Badge>
      ) : null}
      {contextBadgeMr ? (
        <Badge variant="secondary" className={appNavbarDistrictBadgeVariants()}>
          {contextBadgeMr}
        </Badge>
      ) : null}
    </header>
  )
}
