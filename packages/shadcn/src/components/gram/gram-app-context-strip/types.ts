import type { ReactNode } from 'react'

export type GramAppContextStripProps = {
  /** Large Marathi line — GP legal name */
  gpNameMr?: string
  /** e.g. आर्थिक वर्ष: २०२५-२६ */
  financialYearMr?: string
  /** Right side: locale toggle, user menu, etc. */
  trailing?: ReactNode
  className?: string
}
