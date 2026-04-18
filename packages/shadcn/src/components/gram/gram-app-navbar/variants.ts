import { cva } from 'class-variance-authority'

export const appNavbarVariants = cva(
  'sticky top-0 z-30 flex min-h-12 shrink-0 items-center gap-1.5 border-b border-border bg-card/95 py-2 backdrop-blur-md supports-backdrop-filter:bg-card/80 px-2.5 transition-colors duration-200 md:gap-2.5 md:px-4 md:py-2.5',
)

export const appNavbarDistrictBadgeVariants = cva(
  'shrink-0 border-primary/30 bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary shadow-sm md:text-[11px]',
)
