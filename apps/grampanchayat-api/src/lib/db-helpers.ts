/**
 * Strip undefined values before passing to Drizzle .set().
 *
 * Drizzle skips undefined keys by design, but the postgres-js adapter has had
 * bugs (issue #4465) where undefined values cause silent SQL omission. Stripping
 * explicitly makes partial updates safe across adapter versions.
 *
 * undefined → key removed (column not updated)
 * null      → key kept   (column set to NULL — must be intentional)
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>
}
