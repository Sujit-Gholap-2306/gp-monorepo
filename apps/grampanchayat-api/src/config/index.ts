import 'dotenv/config'
import { z } from 'zod'
import type { CookieOptions } from 'express'

const envSchema = z.object({
  NODE_ENV:             z.enum(['development', 'production', 'test']).default('development'),
  PORT:                 z.coerce.number().default(3005),
  DATABASE_URL:         z.string().min(1, 'DATABASE_URL is required'),
  ACCESS_TOKEN_SECRET:  z.string().min(16, 'ACCESS_TOKEN_SECRET must be at least 16 chars'),
  ACCESS_TOKEN_EXPIRY:  z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(16, 'REFRESH_TOKEN_SECRET must be at least 16 chars'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  SUPABASE_URL:         z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),
  CORS_ORIGIN:          z.string().default('http://localhost:3004'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('\n--- Missing / invalid environment variables ---')
  for (const [field, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
    console.error(`  ${field}: ${(messages as string[]).join(', ')}`)
  }
  console.error('-----------------------------------------------\n')
  process.exit(1)
}

export const env = parsed.data

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure:   env.NODE_ENV === 'production',
  sameSite: 'strict',
}

export const BUCKETS = {
  AVATARS:    'avatars',
  COVERS:     'covers',
  VIDEOS:     'videos',
  THUMBNAILS: 'thumbnails',
} as const
