'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Printer } from 'lucide-react'

type Props = {
  backHref: string
  detailHref: string
}

export function Namuna10PrintActions({ backHref, detailHref }: Props) {
  useEffect(() => {
    const id = window.setTimeout(() => window.print(), 150)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-md bg-gp-primary px-3 py-2 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover"
      >
        <Printer className="h-4 w-4" aria-hidden="true" />
        Print / Save as PDF
      </button>
      <Link
        href={detailHref}
        className="inline-flex items-center rounded-md border border-gp-border px-3 py-2 text-sm hover:bg-gp-surface"
      >
        Receipt detail
      </Link>
      <Link
        href={backHref}
        className="inline-flex items-center rounded-md border border-gp-border px-3 py-2 text-sm hover:bg-gp-surface"
      >
        Back to desk
      </Link>
    </div>
  )
}
