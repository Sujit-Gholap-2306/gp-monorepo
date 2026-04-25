'use client'

import Link from 'next/link'
import { Printer } from 'lucide-react'

type Props = {
  backHref: string
}

export function Namuna8PrintActions({ backHref }: Props) {
  return (
    <div className="print:hidden mb-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-md bg-gp-primary px-3 py-2 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover"
      >
        <Printer className="h-4 w-4" aria-hidden="true" />
        Print / Save as PDF
      </button>
      <Link
        href={backHref}
        className="inline-flex items-center rounded-md border border-gp-border px-3 py-2 text-sm hover:bg-gp-surface"
      >
        Back to edit
      </Link>
    </div>
  )
}
