interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gp-border bg-card/40 p-10 sm:p-16 text-center">
      {icon && (
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gp-primary/10 text-gp-primary mb-4">
          {icon}
        </div>
      )}
      <p className="font-display text-lg font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-gp-muted max-w-md mx-auto">{description}</p>
      )}
    </div>
  )
}
