'use client'

import Link from 'next/link'
import { Printer } from 'lucide-react'

type Props = {
  backHref: string
  a4Href: string
  a3Href: string
  paper: 'a4' | 'a3'
}

export function Namuna9PrintActions({ backHref, a4Href, a3Href, paper }: Props) {
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
      <div className="inline-flex overflow-hidden rounded-md border border-gp-border">
        <Link
          href={a4Href}
          className={`px-3 py-2 text-sm ${paper === 'a4' ? 'bg-gp-primary text-gp-primary-fg' : 'hover:bg-gp-surface'}`}
        >
          A4
        </Link>
        <Link
          href={a3Href}
          className={`border-l border-gp-border px-3 py-2 text-sm ${paper === 'a3' ? 'bg-gp-primary text-gp-primary-fg' : 'hover:bg-gp-surface'}`}
        >
          A3
        </Link>
      </div>
      <Link
        href={backHref}
        className="inline-flex items-center rounded-md border border-gp-border px-3 py-2 text-sm hover:bg-gp-surface"
      >
        Back to list
      </Link>
    </div>
  )
}
