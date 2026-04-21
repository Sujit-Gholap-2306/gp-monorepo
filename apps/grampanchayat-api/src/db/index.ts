import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.ts'
import { env } from '../config/index.ts'

// prepare: false is required for Supabase Transaction Mode pooler (port 6543)
// For direct connection (port 5432), prepare can be omitted
const client = postgres(env.DATABASE_URL, {
  prepare:     false,
  max:         10,
  idle_timeout: 20,
  connect_timeout: 10,
})

export const db = drizzle(client, { schema })
export { client as pgClient }
