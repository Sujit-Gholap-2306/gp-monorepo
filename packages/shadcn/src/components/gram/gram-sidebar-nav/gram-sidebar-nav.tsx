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
      <SidebarGroup className="p-1.5 group-data-[collapsible=icon]:p-1">
        <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground group-data-[collapsible=icon]:px-0">
          {groupLabel}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="px-1.5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
            {items.map(item => {
              const Icon = item.icon
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              const hasBadge = Boolean(item.badge)

              return (
                <SidebarMenuItem
                  key={item.href}
                  className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                >
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    size={itemSize}
                    tooltip={item.label}
                    className={cn(
                      'h-auto min-h-10 py-1.5 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-sm',
                      'data-[active=true]:ring-1 data-[active=true]:ring-primary/25',
                      hasBadge && 'pr-10',
                      'group-data-[collapsible=icon]:h-8! group-data-[collapsible=icon]:min-h-8! group-data-[collapsible=icon]:w-8! group-data-[collapsible=icon]:min-w-8! group-data-[collapsible=icon]:p-0!',
                      'group-data-[collapsible=icon]:data-[active=true]:ring-inset',
                      hasBadge && 'group-data-[collapsible=icon]:pr-0!',
                    )}
                  >
                    <Link
                      href={item.href}
                      onClick={handleNavigate}
                      className={cn(
                        'flex items-start gap-2.5',
                        'group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0',
                      )}
                    >
                      {/* Expanded: colored square wrapper */}
                      <span
                        className={cn(
                          sidebarNavItemIconVariants({ active }),
                          'group-data-[collapsible=icon]:hidden',
                        )}
                      >
                        <Icon className="size-4" strokeWidth={2} aria-hidden />
                      </span>
                      {/* Collapsed: bare icon, no wrapper box */}
                      <Icon
                        className="hidden size-4 shrink-0 group-data-[collapsible=icon]:block"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left group-data-[collapsible=icon]:hidden">
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
