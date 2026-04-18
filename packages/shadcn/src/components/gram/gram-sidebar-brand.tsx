'use client'

import type { LucideIcon } from 'lucide-react'

import { SidebarHeader } from '../ui/sidebar'
import { cn } from '../../lib/utils'

export type GramSidebarBrandProps = {
  title: string
  subtitle: string
  icon: LucideIcon
  className?: string
}

export function GramSidebarBrand({ title, subtitle, icon: Icon, className }: GramSidebarBrandProps) {
  return (
    <SidebarHeader className={cn('border-b border-sidebar-border px-3 py-4', className)}>
      <div className="relative overflow-hidden rounded-xl border border-sidebar-border/80 bg-sidebar-accent/40 px-3 py-3">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-accent/[0.06]"
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Icon className="size-[18px]" strokeWidth={2.5} aria-hidden />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">{title}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </SidebarHeader>
  )
}
