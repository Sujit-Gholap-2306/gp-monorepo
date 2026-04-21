'use client'

import { cn } from '../../../lib/utils'

import type { GramAppContextStripProps } from './types'
import { contextStripInnerVariants, contextStripRootVariants } from './variants'

export { contextStripInnerVariants, contextStripRootVariants } from './variants'

/**
 * GP identity + FY strip. Marked client because `GramAppShell` is a client component and imports this module directly (Next.js boundary).
 */
export function GramAppContextStrip({
  gpNameMr,
  financialYearMr,
  trailing,
  className,
}: GramAppContextStripProps) {
  if (!gpNameMr && !financialYearMr && !trailing) return null

  const hasText = Boolean(gpNameMr || financialYearMr)

  return (
    <div className={cn(contextStripRootVariants(), className)}>
      <div className={contextStripInnerVariants()}>
        <div className={cn('min-w-0', hasText && 'flex flex-col gap-0.5')}>
          {gpNameMr ? (
            <p className="truncate text-base font-semibold leading-tight text-foreground md:text-lg">{gpNameMr}</p>
          ) : null}
          {financialYearMr ? (
            <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">{financialYearMr}</p>
          ) : null}
        </div>
        {trailing ? <div className="flex shrink-0 items-center gap-1.5">{trailing}</div> : null}
      </div>
    </div>
  )
}
