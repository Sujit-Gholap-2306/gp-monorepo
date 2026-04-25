/** Shared key casing helpers for API serialization. */
export function camelToSnakeKey(key: string): string {
  return key
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_/, '')
}
