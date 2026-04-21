interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, eyebrow, action }: PageHeaderProps) {
  return (
    <div className="border-b border-gp-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wider text-gp-primary mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-base text-gp-muted max-w-2xl">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  )
}
