/** Recursively map plain object keys from camelCase to snake_case for JSON clients expecting DB-shaped rows. */
export function keysToSnake<T>(value: T): T {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) {
    return value.map((v) => keysToSnake(v)) as T
  }
  if (typeof value !== 'object') return value
  if (value instanceof Date) return value
  const proto = Object.getPrototypeOf(value)
  if (proto !== null && proto !== Object.prototype) {
    return value
  }
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[camelToSnakeKey(k)] = keysToSnake(v)
  }
  return out as T
}

function camelToSnakeKey(key: string): string {
  return key
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_/, '')
}
