export function TaxFeatureLocked({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-gp-border bg-card p-8">
      <h1 className="text-xl font-bold text-gp-primary">{title}</h1>
      <p className="mt-2 text-sm text-gp-muted">
        हा विभाग Pro योजनेत उपलब्ध आहे. कृपया योजना उन्नत करा.
      </p>
    </div>
  )
}
