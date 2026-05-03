export function currentFiscalYear(): string {
  const now = new Date()
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  const next = String((year + 1) % 100).padStart(2, '0')
  return `${year}-${next}`
}
