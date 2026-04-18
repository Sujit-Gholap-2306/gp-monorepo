'use client'

import { SidebarHeader } from '../../ui/sidebar'
import { cn } from '../../../lib/utils'

import type { GramSidebarBrandProps } from './types'
import { sidebarBrandCardVariants, sidebarBrandIconWrapVariants } from './variants'

export { sidebarBrandCardVariants, sidebarBrandIconWrapVariants } from './variants'

export function GramSidebarBrand({ title, subtitle, icon: Icon, className }: GramSidebarBrandProps) {
  return (
    <SidebarHeader className={cn('border-b border-sidebar-border px-3 py-4', className)}>
      <div className={sidebarBrandCardVariants()}>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-accent/[0.06]"
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <div className={sidebarBrandIconWrapVariants()}>
            <Icon className="size-[18px]" strokeWidth={2.5} aria-hidden />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 leading-tight">
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
