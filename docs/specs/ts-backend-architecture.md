# TypeScript Express Backend Architecture
## NestJS-inspired MVC — Drizzle + PostgreSQL + Supabase

> Reference: chai-backend patterns → class-based SOLID architecture
> Last updated: 2026-04-18
> Source: https://github.com/hiteshchoudhary/chai-backend

---

## Design Philosophy

Inspired by NestJS but without NestJS. We adopt its organizational patterns — modules, class-based layers, interfaces, DI via constructor injection — while keeping vanilla Express as the HTTP layer. No `@Injectable()`, no decorators, no IoC container overhead.

**SOLID mapping:**

| Principle | How it applies |
|---|---|
| **S** — Single Responsibility | Repository = DB only. Service = logic only. Controller = HTTP only. |
| **O** — Open/Closed | `BaseRepository<T>` open for extension, closed for modification. |
| **L** — Liskov Substitution | Any `UserRepository` mock can replace the real one if it implements `IUserRepository`. |
| **I** — Interface Segregation | `IUserRepository` defines only what `UserService` needs — not the full Drizzle API. |
| **D** — Dependency Inversion | `UserService` depends on `IUserRepository` interface, not the concrete class. |

---

## Folder Structure

```
src/
├── index.ts                         ← bootstrap: env → db ping → app.listen
├── app.ts                           ← express: cors, body-parser, cookie-parser, routes
├── config/
│   └── index.ts                     ← typed env config (zod-validated)
│
├── common/                          ← shared across all modules (NestJS "common" module)
│   ├── base/
│   │   ├── base.controller.ts       ← ok(), created(), noContent(), fail()
│   │   ├── base.repository.ts       ← generic CRUD: findById, create, update, delete
│   │   └── base.service.ts          ← (thin — shared service helpers if needed)
│   ├── exceptions/
│   │   ├── http.exception.ts        ← ApiError (extends Error)
│   │   └── exception.filter.ts      ← global Express error handler
│   ├── interceptors/
│   │   └── response.interceptor.ts  ← ApiResponse wrapper (used by BaseController)
│   ├── guards/
│   │   └── auth.guard.ts            ← class-based verifyJWT middleware
│   └── pipes/
│       └── validation.pipe.ts       ← zod parse helper used in controllers
│
├── modules/                         ← feature modules (NestJS module pattern)
│   ├── auth/
│   │   ├── auth.module.ts           ← composes AuthService singleton
│   │   ├── auth.service.ts          ← AuthService: hash, compare, generateTokens, verify
│   │   └── interfaces/
│   │       └── auth.interface.ts    ← ITokenPayload, IAuthService
│   │
│   ├── user/
│   │   ├── user.module.ts           ← composes repo → service → controller
│   │   ├── user.controller.ts       ← extends BaseController
│   │   ├── user.service.ts          ← UserService implements IUserService
│   │   ├── user.repository.ts       ← extends BaseRepository, implements IUserRepository
│   │   ├── user.routes.ts           ← Express Router, wires to userController
│   │   ├── dto/
│   │   │   ├── register.dto.ts      ← zod schema + inferred type
│   │   │   └── login.dto.ts
│   │   └── interfaces/
│   │       ├── user.interface.ts    ← IUserRepository, IUserService
│   │       └── index.ts
│   │
│   ├── video/
│   │   ├── video.module.ts
│   │   ├── video.controller.ts
│   │   ├── video.service.ts
│   │   ├── video.repository.ts
│   │   ├── video.routes.ts
│   │   └── dto/
│   │
│   └── storage/
│       ├── storage.module.ts
│       └── storage.service.ts       ← StorageService: upload, delete, getPublicUrl
│
├── db/
│   ├── index.ts                     ← drizzle(pool) singleton
│   └── schema/
│       ├── users.ts
│       ├── videos.ts
│       └── index.ts
│
└── routes/
    └── index.ts                     ← mounts all module routers under /api/v1
```

---

## Layer Contracts

### 1. BaseRepository

```ts
// src/common/base/base.repository.ts
import { eq, type SQL } from 'drizzle-orm'
import type { PgTable, PgColumn } from 'drizzle-orm/pg-core'
import { db } from '../../db'

export abstract class BaseRepository<TSelect, TInsert> {
  protected abstract readonly table: PgTable
  protected abstract readonly idColumn: PgColumn

  async findById(id: string): Promise<TSelect | undefined> {
    const [row] = await db
      .select()
      .from(this.table)
      .where(eq(this.idColumn, id))
      .limit(1)
    return row as TSelect | undefined
  }

  async create(data: TInsert): Promise<TSelect> {
    const [row] = await db.insert(this.table).values(data as any).returning()
    return row as TSelect
  }

  async update(id: string, data: Partial<TInsert>): Promise<TSelect | undefined> {
    const [row] = await db
      .update(this.table)
      .set({ ...data as any, updatedAt: new Date() })
      .where(eq(this.idColumn, id))
      .returning()
    return row as TSelect | undefined
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(this.table)
      .where(eq(this.idColumn, id))
      .returning({ id: this.idColumn })
    return result.length > 0
  }
}
```

### 2. BaseController

```ts
// src/common/base/base.controller.ts
import type { Response } from 'express'
import { ApiResponse } from '../interceptors/response.interceptor'
import { ApiError } from '../exceptions/http.exception'

export abstract class BaseController {
  protected ok<T>(res: Response, data: T, message = 'Success'): Response {
    return res.status(200).json(new ApiResponse(200, data, message))
  }

  protected created<T>(res: Response, data: T, message = 'Created'): Response {
    return res.status(201).json(new ApiResponse(201, data, message))
  }

  protected noContent(res: Response): Response {
    return res.status(204).send()
  }

  protected fail(statusCode: number, message: string, errors?: unknown[]): never {
    throw new ApiError(statusCode, message, errors)
  }
}
```

### 3. Interface-driven Repository

```ts
// src/modules/user/interfaces/user.interface.ts
import type { User, NewUser } from '../../../db/schema/users'

export interface IUserRepository {
  findById(id: string): Promise<User | undefined>
  findByEmailOrUsername(value: string): Promise<User | undefined>
  create(data: NewUser): Promise<User>
  update(id: string, data: Partial<NewUser>): Promise<User | undefined>
  updateRefreshToken(id: string, token: string | null): Promise<void>
}

export interface IUserService {
  register(dto: RegisterDto): Promise<SafeUser>
  login(dto: LoginDto): Promise<LoginResult>
  logout(userId: string): Promise<void>
  refreshTokens(incomingToken: string): Promise<TokenPair>
  getCurrentUser(userId: string): Promise<SafeUser>
  updateAvatar(userId: string, file: Express.Multer.File): Promise<string>
}
```

### 4. UserRepository

```ts
// src/modules/user/user.repository.ts
import { eq, or } from 'drizzle-orm'
import { BaseRepository } from '../../common/base/base.repository'
import { users } from '../../db/schema'
import type { User, NewUser } from '../../db/schema/users'
import type { IUserRepository } from './interfaces/user.interface'
import { db } from '../../db'

export class UserRepository
  extends BaseRepository<User, NewUser>
  implements IUserRepository
{
  protected readonly table  = users
  protected readonly idColumn = users.id

  async findByEmailOrUsername(value: string): Promise<User | undefined> {
    const [row] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, value), eq(users.username, value)))
      .limit(1)
    return row
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await db.update(users).set({ refreshToken: token }).where(eq(users.id, id))
  }

  async findSafe(id: string): Promise<SafeUser | undefined> {
    const [row] = await db
      .select({
        id:       users.id,
        username: users.username,
        email:    users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        coverUrl:  users.coverUrl,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return row
  }
}
```

### 5. UserService

```ts
// src/modules/user/user.service.ts
import type { IUserRepository, IUserService } from './interfaces/user.interface'
import type { IAuthService } from '../auth/interfaces/auth.interface'
import type { IStorageService } from '../storage/interfaces/storage.interface'
import { ApiError } from '../../common/exceptions/http.exception'
import type { RegisterDto, LoginDto } from './dto'
import { BUCKETS } from '../../config'
import path from 'path'

export class UserService implements IUserService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly authService: IAuthService,
    private readonly storageService: IStorageService,
  ) {}

  async register(dto: RegisterDto): Promise<SafeUser> {
    const existing = await this.userRepo.findByEmailOrUsername(dto.email)
    if (existing) throw new ApiError(409, 'Email or username already registered')

    const passwordHash = await this.authService.hashPassword(dto.password)
    return this.userRepo.create({ ...dto, passwordHash })
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.userRepo.findByEmailOrUsername(dto.usernameOrEmail)
    if (!user) throw new ApiError(404, 'User not found')

    const valid = await this.authService.comparePassword(dto.password, user.passwordHash)
    if (!valid) throw new ApiError(401, 'Invalid credentials')

    const tokens = this.authService.generateTokens(user.id)
    await this.userRepo.updateRefreshToken(user.id, tokens.refreshToken)

    const { passwordHash: _, refreshToken: __, ...safeUser } = user
    return { user: safeUser, ...tokens }
  }

  async logout(userId: string): Promise<void> {
    await this.userRepo.updateRefreshToken(userId, null)
  }

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    const dest     = `${userId}/avatar-${Date.now()}${path.extname(file.originalname)}`
    const url      = await this.storageService.upload(file.path, BUCKETS.AVATARS, dest, file.mimetype)
    if (!url) throw new ApiError(500, 'Avatar upload failed')

    await this.userRepo.update(userId, { avatarUrl: url })
    return url
  }
}
```

### 6. UserController

```ts
// src/modules/user/user.controller.ts
import { asyncHandler } from '../../common/guards/async-handler'
import { BaseController } from '../../common/base/base.controller'
import { validate } from '../../common/pipes/validation.pipe'
import { registerDto, loginDto } from './dto'
import type { IUserService } from './interfaces/user.interface'
import { COOKIE_OPTIONS } from '../../config'

export class UserController extends BaseController {
  constructor(private readonly userService: IUserService) {
    super()
  }

  register = asyncHandler(async (req, res) => {
    const dto  = validate(registerDto, req.body)
    const user = await this.userService.register(dto)
    return this.created(res, user, 'User registered successfully')
  })

  login = asyncHandler(async (req, res) => {
    const dto    = validate(loginDto, req.body)
    const result = await this.userService.login(dto)
    return res
      .cookie('accessToken',  result.accessToken,  COOKIE_OPTIONS)
      .cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS)
      .status(200)
      .json({ statusCode: 200, data: result, success: true })
  })

  logout = asyncHandler(async (req, res) => {
    await this.userService.logout(req.user!.id)
    return res
      .clearCookie('accessToken',  COOKIE_OPTIONS)
      .clearCookie('refreshToken', COOKIE_OPTIONS)
      .status(200)
      .json({ statusCode: 200, data: {}, message: 'Logged out', success: true })
  })

  getCurrentUser = asyncHandler(async (req, res) => {
    return this.ok(res, req.user)
  })

  updateAvatar = asyncHandler(async (req, res) => {
    if (!req.file) this.fail(400, 'Avatar file required')
    const url = await this.userService.updateAvatar(req.user!.id, req.file!)
    return this.ok(res, { avatarUrl: url }, 'Avatar updated')
  })
}
```

### 7. Module Composition (replaces DI container)

```ts
// src/modules/user/user.module.ts
import { UserRepository }  from './user.repository'
import { UserService }     from './user.service'
import { UserController }  from './user.controller'
import { authService }     from '../auth/auth.module'      // singleton
import { storageService }  from '../storage/storage.module' // singleton

const userRepository = new UserRepository()
const userService    = new UserService(userRepository, authService, storageService)

export const userController = new UserController(userService)
```

### 8. Routes (unchanged from chai-backend style)

```ts
// src/modules/user/user.routes.ts
import { Router } from 'express'
import { authGuard }    from '../../common/guards/auth.guard'
import { upload }       from '../../common/guards/upload.guard'
import { userController } from './user.module'

const router = Router()

router.post('/register', upload.fields([
  { name: 'avatar',     maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]), userController.register)

router.post('/login',  userController.login)

router.use(authGuard)
router.post('/logout',           userController.logout)
router.get('/current-user',      userController.getCurrentUser)
router.patch('/avatar', upload.single('avatar'), userController.updateAvatar)

export default router
```

---

## Common Module

### ApiError (http.exception.ts)
```ts
export class ApiError extends Error {
  statusCode: number; data: null = null; success: false = false; errors: unknown[]
  constructor(statusCode: number, message = 'Something went wrong', errors: unknown[] = []) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }
}
```

### ApiResponse (response.interceptor.ts)
```ts
export class ApiResponse<T> {
  success: boolean
  constructor(public statusCode: number, public data: T, public message = 'Success') {
    this.success = statusCode < 400
  }
}
```

### asyncHandler (guards/async-handler.ts)
```ts
import type { RequestHandler } from 'express'
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
```

### ValidationPipe (pipes/validation.pipe.ts)
```ts
import type { ZodSchema } from 'zod'
import { ApiError } from '../exceptions/http.exception'

export const validate = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data)
  if (!result.success) throw new ApiError(422, 'Validation failed', result.error.issues)
  return result.data
}
```

### ExceptionFilter (exceptions/exception.filter.ts)
```ts
import type { Request, Response, NextFunction } from 'express'
import { ApiError } from './http.exception'
import { ApiResponse } from '../interceptors/response.interceptor'

export const exceptionFilter = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(new ApiResponse(err.statusCode, null, err.message))
  }
  console.error(err)
  return res.status(500).json(new ApiResponse(500, null, 'Internal server error'))
}
```

### AuthGuard (guards/auth.guard.ts)
```ts
import jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schema'
import { ApiError } from '../exceptions/http.exception'
import { asyncHandler } from './async-handler'

export const authGuard = asyncHandler(async (req, _res, next) => {
  const token =
    req.cookies?.accessToken ??
    req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new ApiError(401, 'Unauthorized')

  let decoded: { id: string }
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { id: string }
  } catch {
    throw new ApiError(401, 'Invalid or expired access token')
  }

  const [user] = await db
    .select({ id: users.id, username: users.username, email: users.email, fullName: users.fullName })
    .from(users).where(eq(users.id, decoded.id)).limit(1)

  if (!user) throw new ApiError(401, 'User not found')
  req.user = user
  next()
})
```

---

## Auth Module

```ts
// src/modules/auth/auth.service.ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { IAuthService, ITokenPayload, TokenPair } from './interfaces/auth.interface'

export class AuthService implements IAuthService {
  hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10)
  }

  comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash)
  }

  generateTokens(userId: string): TokenPair {
    return {
      accessToken: jwt.sign(
        { id: userId } satisfies ITokenPayload,
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY ?? '15m' }
      ),
      refreshToken: jwt.sign(
        { id: userId } satisfies ITokenPayload,
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY ?? '7d' }
      ),
    }
  }

  verifyAccessToken(token: string): ITokenPayload {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as ITokenPayload
  }

  verifyRefreshToken(token: string): ITokenPayload {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as ITokenPayload
  }
}

// src/modules/auth/auth.module.ts
export const authService = new AuthService()
```

---

## New Module Checklist

When adding a new resource (e.g. `post`):
- [ ] `db/schema/posts.ts` — `pgTable` definition, export `Post` and `NewPost`
- [ ] Add to `db/schema/index.ts`
- [ ] `modules/post/interfaces/post.interface.ts` — `IPostRepository`, `IPostService`
- [ ] `modules/post/dto/create-post.dto.ts` — zod schema
- [ ] `modules/post/post.repository.ts` — extends `BaseRepository`, implements `IPostRepository`
- [ ] `modules/post/post.service.ts` — implements `IPostService`, constructor-injected deps
- [ ] `modules/post/post.controller.ts` — extends `BaseController`, uses `asyncHandler`
- [ ] `modules/post/post.module.ts` — composes singleton `postController`
- [ ] `modules/post/post.routes.ts` — Express Router
- [ ] Mount in `routes/index.ts` under `/api/v1/posts`
- [ ] Run `drizzle-kit generate` + `drizzle-kit push`

---

## Key Differences from chai-backend

| chai-backend | This architecture |
|---|---|
| Exported functions | Class instances with typed methods |
| `asyncHandler` wraps loose fn | `asyncHandler` wraps class arrow methods |
| No layer separation | Repository → Service → Controller |
| Logic in controllers | Controllers only do HTTP; logic in Services |
| No interfaces | `IUserRepository`, `IUserService` for every module |
| Manual try/catch validation | `validate(schema, data)` pipe throws `ApiError` |
| `cloudinary.js` util fn | `StorageService` class, injected |
| No base classes | `BaseRepository` + `BaseController` reduce duplication |
| Module wiring in routes | `*.module.ts` composes the dependency graph |
