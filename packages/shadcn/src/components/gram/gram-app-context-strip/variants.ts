import { cva } from 'class-variance-authority'

export const contextStripRootVariants = cva(
  'shrink-0 border-b border-border bg-card/90 backdrop-blur-sm px-2.5 py-2 md:px-4',
)

export const contextStripInnerVariants = cva(
  'flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3',
)
