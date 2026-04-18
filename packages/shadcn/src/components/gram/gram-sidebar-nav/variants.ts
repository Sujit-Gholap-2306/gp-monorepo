import { cva } from 'class-variance-authority'

export const sidebarNavItemIconVariants = cva(
  'flex size-8 shrink-0 items-center justify-center rounded-md',
  {
    variants: {
      active: {
        true: 'bg-primary text-primary-foreground',
        false: 'bg-muted/80 text-muted-foreground',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)

export const sidebarNavMenuBadgeVariants = cva(
  'bg-muted/90 text-[10px] font-semibold text-muted-foreground peer-data-[active=true]/menu-button:bg-primary/15 peer-data-[active=true]/menu-button:text-primary',
)
