'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar'
import { cn } from '../../lib/utils'
import type { GramNavItem } from './gram-types'

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

export function GramSidebarNav({
  items,
  pathname,
  onNavigate,
  groupLabel = 'मुख्य मेनू',
  itemSize = 'lg',
  className,
}: GramSidebarNavProps) {
  return (
    <SidebarContent className={cn('px-0', className)}>
      <SidebarGroup>
        <SidebarGroupLabel className="px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {groupLabel}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="px-2">
            {items.map(item => {
              const Icon = item.icon
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    size={itemSize}
                    tooltip={item.label}
                    className={cn(
                      'h-auto min-h-11 py-2 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-sm',
                      'data-[active=true]:ring-1 data-[active=true]:ring-primary/25',
                    )}
                  >
                    <Link href={item.href} onClick={onNavigate} className="flex items-start gap-3">
                      <span
                        className={cn(
                          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md',
                          active
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/80 text-muted-foreground',
                        )}
                      >
                        <Icon className="size-4" strokeWidth={2} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block text-[13px] font-semibold leading-tight">{item.label}</span>
                        <span className="mt-0.5 block text-[11px] font-normal leading-snug text-muted-foreground group-data-[active=true]/menu-button:text-sidebar-accent-foreground/90">
                          {item.labelMr}
                        </span>
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
