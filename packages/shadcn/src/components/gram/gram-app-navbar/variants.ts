import { cva } from 'class-variance-authority'

export const appNavbarVariants = cva(
  'sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/95 backdrop-blur-md supports-backdrop-filter:bg-card/80 px-3 md:gap-3 md:px-5',
)

export const appNavbarDistrictBadgeVariants = cva(
  'shrink-0 border-primary/30 bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary shadow-sm md:text-[11px]',
)
