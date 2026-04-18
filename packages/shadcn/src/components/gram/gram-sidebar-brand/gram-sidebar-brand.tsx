'use client'

import { SidebarHeader } from '../../ui/sidebar'
import { cn } from '../../../lib/utils'

import type { GramSidebarBrandProps } from './types'
import { sidebarBrandCardVariants, sidebarBrandIconWrapVariants } from './variants'

export { sidebarBrandCardVariants, sidebarBrandIconWrapVariants } from './variants'

export function GramSidebarBrand({ title, subtitle, icon: Icon, className }: GramSidebarBrandProps) {
  return (
    <SidebarHeader
      className={cn(
        'border-b border-sidebar-border px-2.5 py-3',
        /* Icon rail is 3rem wide — drop horizontal padding so the logo isn’t clipped */
        'group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1.5',
        className,
      )}
    >
      <div
        className={cn(
          sidebarBrandCardVariants(),
          'group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0',
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/[0.07] via-transparent to-accent/6 group-data-[collapsible=icon]:hidden"
          aria-hidden
        />
        <div
          className={cn(
            'relative flex items-center gap-2.5',
            'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0',
          )}
        >
          <div
            className={cn(
              sidebarBrandIconWrapVariants(),
              'group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:shadow-none',
            )}
          >
            <Icon className="size-[18px] group-data-[collapsible=icon]:size-4" strokeWidth={2.5} aria-hidden />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">{title}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </SidebarHeader>
  )
}

export type { GramSidebarBrandProps }
