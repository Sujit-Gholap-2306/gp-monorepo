# TypeScript Express Backend Architecture
## Reference: chai-backend patterns → Drizzle + PostgreSQL + Supabase

> Research doc. Last updated: 2026-04-18
> Source repo: https://github.com/hiteshchoudhary/chai-backend

---

## 1. chai-backend — What We Learned

### Folder Structure
```
src/
├── index.js              ← entry: dotenv → connectDB() → app.listen
├── app.js                ← express: cors, body-parser, cookie-parser, routes
├── constants.js          ← DB_NAME, app-wide constants
├── db/index.js           ← connectDB() — mongoose singleton
├── models/               ← Schema + hooks + instance methods
├── controllers/          ← business logic per resource
├── routes/               ← Express Router per resource
├── middlewares/          ← verifyJWT, multer
└── utils/
    ├── asyncHandler.js   ← HOF: Promise.resolve(fn).catch(next)
    ├── ApiError.js       ← extends Error: statusCode, errors[], success:false
    ├── ApiResponse.js    ← { statusCode, data, message, success: code<400 }
    └── cloudinary.js     ← upload + local temp cleanup
```

### The 3 Core Utils (keep verbatim, just add types)

**asyncHandler** eliminates try/catch in every controller:
```ts
const asyncHandler = (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next)
```

**ApiError** — standardised error shape:
```ts
class ApiError extends Error {
  statusCode: number; data: null; success: false; errors: unknown[]
}
```

**ApiResponse** — standardised success shape:
```ts
class ApiResponse<T> {
  statusCode: number; data: T; message: string; success: boolean
  // success = statusCode < 400
}
```

### Controller Pattern
```ts
const registerUser = asyncHandler(async (req, res) => {
  // 1. extract + zod-validate input
  // 2. check DB for existing record
  // 3. side effects (hash password, upload file)
  // 4. db.insert(users).values(...)
  // 5. fetch clean record (omit password/refreshToken)
  // 6. return res.status(201).json(new ApiResponse(201, user, "Registered"))
})
```

### Route Pattern
```ts
router.post('/register', upload.fields([...]), registerUser)
router.use(verifyJWT) // everything below is protected
router.get('/current-user', getCurrentUser)
router.patch('/avatar', upload.single('avatar'), updateAvatar)
```

### Auth Pattern (keep as-is)
- Access token (short TTL, 15m) + Refresh token (long TTL, 7d, stored in DB)
- Both in httpOnly cookies; Authorization Bearer header as fallback
- `verifyJWT` middleware extracts user, attaches to `req.user`
- Refresh token rotation on `/refresh-token`

### What Mongoose Gave Us (and how we replace it)

| Mongoose feature | Our TypeScript replacement |
|---|---|
| `pre('save')` bcrypt hook | Explicit call in `auth.service.ts` before insert |
| `schema.methods.isPasswordCorrect()` | `auth.service.ts → comparePassword(plain, hash)` |
| `schema.methods.generateAccessToken()` | `auth.service.ts → generateTokens(userId)` |
| `isValidObjectId()` | UUID validation via zod `z.string().uuid()` |
| `$lookup` aggregation pipeline | Drizzle `leftJoin()` or `db.execute(sql\`...\`)` |
| `.select('-password -refreshToken')` | Drizzle column selection or `omit()` helper |

---

## 2. Stack Decision

### Drizzle ORM over Prisma — why

| | Drizzle | Prisma |
|---|---|---|
| TypeScript-first | Yes — schema is plain TS | Requires `prisma generate` codegen |
| Query style | SQL-like, explicit | DSL, abstracted |
| Bundle size | ~7kb | ~50kb + query engine binary |
| Supabase integration | Native (official docs) | Supported but heavier |
| Raw SQL escape hatch | `sql\`...\`` inline | `$queryRaw` |
| Migrations | `drizzle-kit push/generate` | `prisma migrate` |

### Final Stack
```
Express 5        — HTTP framework
TypeScript 5     — language
Drizzle ORM      — database access layer
PostgreSQL        — database (hosted on Supabase)
Supabase Storage  — file uploads (replaces Cloudinary)
Supabase Auth     — optional; we use manual JWT to match chai-backend style
zod               — request validation (replaces manual if/else checks)
bcryptjs          — password hashing
jsonwebtoken      — JWT access + refresh tokens
multer            — multipart parsing before Supabase upload
```

---

## 3. Proposed Folder Structure

```
src/
├── index.ts                    ← entry: env → db check → app.listen
├── app.ts                      ← express setup
├── constants.ts                ← PORT, TOKEN_EXPIRY, BUCKET names
│
├── db/
│   ├── index.ts                ← drizzle(pool) singleton export
│   └── schema/
│       ├── users.ts            ← pgTable('users', {...})
│       ├── videos.ts
│       ├── subscriptions.ts
│       └── index.ts            ← re-export all tables
│
├── controllers/                ← one file per resource, same as chai
│   ├── user.controller.ts
│   ├── video.controller.ts
│   └── ...
│
├── routes/                     ← one file per resource
│   ├── user.routes.ts
│   ├── video.routes.ts
│   └── index.ts                ← mounts all routers on app
│
├── middlewares/
│   ├── auth.middleware.ts      ← verifyJWT
│   └── upload.middleware.ts    ← multer config
│
├── services/                   ← NEW: extracted model methods live here
│   ├── auth.service.ts         ← hashPassword, comparePassword, generateTokens
│   └── storage.service.ts      ← uploadToSupabase, deleteFromSupabase
│
└── utils/
    ├── asyncHandler.ts
    ├── ApiError.ts
    ├── ApiResponse.ts
    └── validators/             ← zod schemas per resource
        ├── user.validator.ts
        └── video.validator.ts
```

---

## 4. Key File Templates

### db/index.ts
```ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool, { schema })
```

### db/schema/users.ts
```ts
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  username:     text('username').notNull().unique(),
  email:        text('email').notNull().unique(),
  fullName:     text('full_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  refreshToken: text('refresh_token'),
  avatarUrl:    text('avatar_url'),
  coverUrl:     text('cover_url'),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
})

export type User    = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

### services/auth.service.ts
```ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const hashPassword  = (plain: string) => bcrypt.hash(plain, 10)
export const comparePassword = (plain: string, hash: string) => bcrypt.compare(plain, hash)

export const generateTokens = (userId: string) => ({
  accessToken: jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY ?? '15m' }
  ),
  refreshToken: jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY ?? '7d' }
  ),
})
```

### utils/asyncHandler.ts
```ts
import type { Request, Response, NextFunction, RequestHandler } from 'express'

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
```

### utils/ApiError.ts
```ts
export class ApiError extends Error {
  statusCode: number
  data: null = null
  success: false = false
  errors: unknown[]

  constructor(statusCode: number, message = 'Something went wrong', errors: unknown[] = []) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }
}
```

### utils/ApiResponse.ts
```ts
export class ApiResponse<T> {
  statusCode: number
  data: T
  message: string
  success: boolean

  constructor(statusCode: number, data: T, message = 'Success') {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.success = statusCode < 400
  }
}
```

### utils/validators/user.validator.ts
```ts
import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string().min(3).max(30).toLowerCase(),
  email:    z.string().email(),
  fullName: z.string().min(1).max(100),
  password: z.string().min(8),
})

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1),
  password:        z.string().min(1),
})
```

### middlewares/auth.middleware.ts
```ts
import jwt from 'jsonwebtoken'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { ApiError } from '../utils/ApiError'
import { asyncHandler } from '../utils/asyncHandler'

export const verifyJWT = asyncHandler(async (req, _res, next) => {
  const token =
    req.cookies?.accessToken ??
    req.headers.authorization?.replace('Bearer ', '')

  if (!token) throw new ApiError(401, 'Unauthorized')

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { id: string }

  const [user] = await db
    .select({ id: users.id, username: users.username, email: users.email, fullName: users.fullName })
    .from(users)
    .where(eq(users.id, decoded.id))
    .limit(1)

  if (!user) throw new ApiError(401, 'Invalid access token')

  req.user = user
  next()
})
```

### services/storage.service.ts (replaces cloudinary.js)
```ts
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const uploadToSupabase = async (
  localPath: string,
  bucket: string,
  destPath: string
): Promise<string | null> => {
  try {
    const file = fs.readFileSync(localPath)
    const { error } = await supabase.storage
      .from(bucket)
      .upload(destPath, file, { upsert: true })

    if (error) throw error

    const { data } = supabase.storage.from(bucket).getPublicUrl(destPath)
    return data.publicUrl
  } catch {
    return null
  } finally {
    fs.existsSync(localPath) && fs.unlinkSync(localPath) // always clean temp
  }
}
```

---

## 5. Migration Cheatsheet (Mongoose → Drizzle)

| Task | Mongoose | Drizzle |
|---|---|---|
| Find by ID | `User.findById(id)` | `db.select().from(users).where(eq(users.id, id))` |
| Find one | `User.findOne({ email })` | `db.select().from(users).where(eq(users.email, email)).limit(1)` |
| Insert | `User.create({...})` | `db.insert(users).values({...}).returning()` |
| Update | `User.findByIdAndUpdate(id, {$set:{...}})` | `db.update(users).set({...}).where(eq(users.id, id)).returning()` |
| Delete | `User.findByIdAndDelete(id)` | `db.delete(users).where(eq(users.id, id))` |
| Join (lookup) | `$lookup` pipeline | `db.select().from(users).leftJoin(videos, eq(users.id, videos.ownerId))` |
| Raw SQL | `mongoose.connection.db.command(...)` | `db.execute(sql\`SELECT ...\`)` |
| Pagination | `mongoose-aggregate-paginate-v2` | `.limit(pageSize).offset((page-1)*pageSize)` |
| Exclude fields | `.select('-password')` | Explicit column list in `.select({...})` |

---

## 6. Environment Variables

```env
DATABASE_URL=postgresql://...    # Supabase connection string (Transaction mode)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...      # service_role key (server only, never expose)
ACCESS_TOKEN_SECRET=...
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=...
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
PORT=8000
```

---

## 7. drizzle.config.ts

```ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema/index.ts',
  out:    './drizzle',
  driver: 'pg',
  dbCredentials: { connectionString: process.env.DATABASE_URL! },
} satisfies Config
```

Commands:
```bash
pnpm drizzle-kit generate  # generate SQL migration files
pnpm drizzle-kit push      # push schema directly (dev only)
pnpm drizzle-kit studio    # browser-based DB viewer
```
