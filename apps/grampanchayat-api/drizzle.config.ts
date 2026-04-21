import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

export default defineConfig({
  schema:      './src/db/schema/index.ts',
  out:         './drizzle/migrations',
  dialect:     'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
  // Always use direct connection (port 5432) for migrations, not the pooler
  // Set DATABASE_URL to direct URL when running drizzle-kit commands
  verbose: true,
  strict:  true,
})
