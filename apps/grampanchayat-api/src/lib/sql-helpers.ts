import { sql } from 'drizzle-orm'

/**
 * postgres.js cannot serialize Date objects in raw sql`` template params.
 * Use this whenever passing a timestamp to tx.execute(sql`...`).
 */
export function sqlDate(date: Date) {
  return sql`${date.toISOString()}::timestamptz`
}

/**
 * Build ARRAY[uuid1::uuid, uuid2::uuid, ...] for use in raw sql`` templates.
 * postgres.js does not reliably serialize string[] as uuid[] in raw queries.
 */
export function sqlUuidArray(ids: string[]) {
  return sql`ARRAY[${sql.join(ids.map(id => sql`${id}::uuid`), sql`, `)}]`
}

/**
 * Build ARRAY[val1::bigint, val2::bigint, ...] for use in raw sql`` templates.
 */
export function sqlBigintArray(values: number[]) {
  return sql`ARRAY[${sql.join(values.map(v => sql`${v}::bigint`), sql`, `)}]`
}
