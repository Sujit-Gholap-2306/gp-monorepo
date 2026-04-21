'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/landing#features',  label: 'वैशिष्ट्ये', labelEn: 'Features' },
  { href: '/pricing',            label: 'किंमत',      labelEn: 'Pricing' },
  { href: '/customers',          label: 'ग्राहक',     labelEn: 'Customers' },
]

export function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-gp-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <Link href="/landing" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-lg bg-gp-primary text-gp-primary-fg flex items-center justify-center font-display font-extrabold shadow-sm">
            ग्रा
          </div>
          <span className="font-display font-bold text-foreground group-hover:text-gp-primary transition-colors">
            GramPanchayat
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3.5 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-gp-surface rounded-md transition-colors cursor-pointer"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/signup"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-gp-primary text-gp-primary-fg px-4 h-10 text-sm font-medium hover:bg-gp-primary-hover transition-colors cursor-pointer shadow-sm"
          >
            <span>सुरू करा</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground/70 hover:bg-gp-surface transition-colors cursor-pointer"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gp-border bg-background">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-sm text-foreground hover:bg-gp-surface rounded-md transition-colors cursor-pointer"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-md bg-gp-primary text-gp-primary-fg h-11 text-sm font-medium hover:bg-gp-primary-hover transition-colors cursor-pointer"
            >
              <span>सुरू करा</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
