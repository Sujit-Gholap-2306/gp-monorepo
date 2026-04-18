type ClassValue = string | undefined | null | false | Record<string, boolean>

export function cn(...classes: ClassValue[]): string {
  return classes
    .flatMap(c => {
      if (!c) return []
      if (typeof c === 'string') return [c]
      return Object.entries(c)
        .filter(([, v]) => v)
        .map(([k]) => k)
    })
    .join(' ')
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('mr-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function generateId(): string {
  return `utara_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
