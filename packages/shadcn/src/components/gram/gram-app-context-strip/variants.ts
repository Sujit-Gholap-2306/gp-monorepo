import { cva } from 'class-variance-authority'

export const contextStripRootVariants = cva(
  'shrink-0 border-b border-border bg-gp-surface/80 backdrop-blur-sm px-3 py-2.5 md:px-5',
)

export const contextStripInnerVariants = cva(
  'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
)
