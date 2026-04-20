import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  action?: React.ReactNode
}

export function AdminPageHeader({
  title,
  description,
  backHref,
  backLabel,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-gp-muted hover:text-foreground transition-colors cursor-pointer mb-3"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>{backLabel ?? 'मागे'}</span>
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gp-muted">{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  )
}
