'use client'

import Link from 'next/link'

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../../ui/sidebar'
import { cn } from '../../../lib/utils'
import type { GramSidebarNavProps } from './types'
import { sidebarNavMenuBadgeVariants, sidebarNavItemIconVariants } from './variants'

export { sidebarNavItemIconVariants, sidebarNavMenuBadgeVariants } from './variants'

export function GramSidebarNav({
  items,
  pathname,
  onNavigate,
  groupLabel = 'मुख्य मेनू',
  itemSize = 'lg',
  className,
}: GramSidebarNavProps) {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleNavigate = () => {
    onNavigate?.()
    if (isMobile) setOpenMobile(false)
  }

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
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              const hasBadge = Boolean(item.badge)

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
                      hasBadge && 'pr-10',
                    )}
                  >
                    <Link href={item.href} onClick={handleNavigate} className="flex items-start gap-3">
                      <span className={sidebarNavItemIconVariants({ active })}>
                        <Icon className="size-4" strokeWidth={2} aria-hidden />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                        <span className="text-[13px] font-semibold leading-tight">{item.label}</span>
                        <span className="text-[11px] font-normal leading-snug text-muted-foreground group-data-[active=true]/menu-button:text-sidebar-accent-foreground/90">
                          {item.labelMr}
                        </span>
                      </span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge ? (
                    <SidebarMenuBadge className={sidebarNavMenuBadgeVariants()}>
                      {item.badge}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
