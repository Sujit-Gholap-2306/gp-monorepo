import { cva } from 'class-variance-authority'

export const sidebarBrandCardVariants = cva(
  'relative overflow-hidden rounded-xl border border-sidebar-border/80 bg-sidebar-accent/40 px-3 py-3',
)

export const sidebarBrandIconWrapVariants = cva(
  'flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm',
)
