---
name: ts-express-backend
description: Build and scaffold TypeScript Express backends using a NestJS-inspired class-based architecture with Drizzle ORM, PostgreSQL (via Supabase), Supabase Storage, zod, and JWT auth. Use this skill whenever: scaffolding a new Node.js/TypeScript API, creating controllers/services/repositories, defining Drizzle schemas or relations, implementing JWT auth with refresh tokens, setting up Supabase Storage for file uploads, writing BaseController/BaseRepository/asyncHandler utilities, designing a service layer with interface-driven DI, validating requests with zod, adding a new resource module (users, videos, posts, etc.) to an Express TS backend. Trigger even if the user just says "add a controller for X", "create a schema for Y", or "add a new module" without explicitly naming the stack.
---

# TypeScript Express Backend (NestJS-inspired class-based MVC)

A production-ready TypeScript Express backend following NestJS organizational patterns — modules, class-based layers, interface-driven DI via constructor injection — while keeping vanilla Express as the HTTP layer. No `@Injectable()`, no decorators, no IoC container overhead.

## Stack
- **Express 5** + TypeScript 5
- **Drizzle ORM** — type-safe SQL, no codegen step
- **PostgreSQL** via Supabase (connection string)
- **Supabase Storage** — file uploads (replaces Cloudinary)
- **zod** — request validation via `validate()` pipe
- **bcryptjs** + **jsonwebtoken** — auth (manual JWT, full control)
- **multer** — multipart parsing before Supabase upload

---

## SOLID Mapping

| Principle | How it applies |
|---|---|
| **S** — Single Responsibility | Repository = DB only. Service = logic only. Controller = HTTP only. |
| **O** — Open/Closed | `BaseRepository<T>` open for extension, closed for modification. |
| **L** — Liskov Substitution | Any repository mock can replace the real one if it implements `IUserRepository`. |
| **I** — Interface Segregation | `IUserRepository` defines only what `UserService` needs. |
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
├── common/                          ← shared across all modules
│   ├── base/
│   │   ├── base.controller.ts       ← ok(), created(), noContent(), fail()
│   │   ├── base.repository.ts       ← generic CRUD: findById, create, update, delete
│   │   └── base.service.ts          ← (shared service helpers if needed)
│   ├── exceptions/
│   │   ├── http.exception.ts        ← ApiError (extends Error)
│   │   └── exception.filter.ts      ← global Express error handler
│   ├── interceptors/
│   │   └── response.interceptor.ts  ← ApiResponse wrapper
│   ├── guards/
│   │   ├── auth.guard.ts            ← class-based verifyJWT middleware
│   │   └── async-handler.ts         ← asyncHandler helper
│   └── pipes/
│       └── validation.pipe.ts       ← validate(schema, data) → throws ApiError
│
├── modules/                         ← feature modules (NestJS module pattern)
│   ├── auth/
│   │   ├── auth.module.ts           ← exports authService singleton
│   │   ├── auth.service.ts          ← AuthService: hash, compare, generateTokens, verify
│   │   └── interfaces/
│   │       └── auth.interface.ts    ← ITokenPayload, IAuthService, TokenPair
│   │
│   ├── user/
│   │   ├── user.module.ts           ← composes repo → service → controller singletons
│   │   ├── user.controller.ts       ← extends BaseController
│   │   ├── user.service.ts          ← UserService implements IUserService
│   │   ├── user.repository.ts       ← extends BaseRepository, implements IUserRepository
│   │   ├── user.routes.ts           ← Express Router, uses userController singleton
│   │   ├── dto/
│   │   │   ├── register.dto.ts      ← zod schema + inferred type
│   │   │   └── login.dto.ts
│   │   └── interfaces/
│   │       └── user.interface.ts    ← IUserRepository, IUserService
│   │
│   ├── video/                       ← same structure as user/
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

## Core Principles

**1. Three-layer separation — no cross-layer leakage:**
```
Repository  → DB queries only (extends BaseRepository)
Service     → Business logic only (constructor-injected deps)
Controller  → HTTP only (extends BaseController, uses asyncHandler)
```

**2. Module composition via `*.module.ts`** — no IoC container:
```ts
// user.module.ts
const userRepository = new UserRepository()
const userService    = new UserService(userRepository, authService, storageService)
export const userController = new UserController(userService)
```

**3. Interface-driven dependencies** — services depend on interfaces, not concrete classes:
```ts
class UserService implements IUserService {
  constructor(
    private readonly userRepo: IUserRepository,   // interface
    private readonly authService: IAuthService,   // interface
  ) {}
}
```

**4. asyncHandler wraps class arrow methods:**
```ts
// Arrow method so `this` is correctly bound — do NOT use regular methods
register = asyncHandler(async (req, res) => {
  const dto = validate(registerDto, req.body)
  const user = await this.userService.register(dto)
  return this.created(res, user, 'Registered')
})
```

**5. validate() pipe — parse before any DB call:**
```ts
const dto = validate(registerDto, req.body)  // throws ApiError(422) on failure
```

**6. Drizzle schema = source of truth** — infer types, never manually type DB rows:
```ts
export type User    = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

---

## Reference Files

| File | When to read |
|---|---|
| `references/core-utils.md` | BaseController, asyncHandler, ApiError, ApiResponse, ValidationPipe, ExceptionFilter |
| `references/repository-pattern.md` | BaseRepository, IUserRepository, UserRepository implementation |
| `references/drizzle-schema.md` | Defining tables, relations, indexes, migrations |
| `references/auth-patterns.md` | AuthService class, IAuthService, AuthGuard, auth.module.ts |
| `references/controller-route.md` | Class-based controller, module composition, route wiring |
| `references/supabase-storage.md` | StorageService, multer config, bucket setup |

---

## Quick Reference: Mongoose → Drizzle

| Operation | Mongoose | Drizzle |
|---|---|---|
| Find by ID | `Model.findById(id)` | `db.select().from(t).where(eq(t.id, id)).limit(1)` |
| Insert + return | `Model.create({...})` | `db.insert(t).values({...}).returning()` |
| Update | `Model.findByIdAndUpdate(id, {$set})` | `db.update(t).set({...}).where(eq(t.id, id)).returning()` |
| Delete | `Model.findByIdAndDelete(id)` | `db.delete(t).where(eq(t.id, id))` |
| Join | `$lookup` pipeline | `db.select().from(a).leftJoin(b, eq(a.bId, b.id))` |
| Exclude fields | `.select('-password')` | Explicit column object in `.select({...})` |
| Pagination | `mongoose-aggregate-paginate-v2` | `.limit(size).offset((page-1)*size)` |
| Pre-save hook | `schema.pre('save', fn)` | Explicit call in service before `db.insert()` |
| Instance method | `user.generateToken()` | `authService.generateTokens(user.id)` |

---

## New Module Checklist

When adding a new resource (e.g. `post`):
- [ ] `db/schema/posts.ts` — `pgTable` definition, export `Post` and `NewPost`
- [ ] Add export to `db/schema/index.ts`
- [ ] `modules/post/interfaces/post.interface.ts` — `IPostRepository`, `IPostService`
- [ ] `modules/post/dto/create-post.dto.ts` — zod schema + inferred type
- [ ] `modules/post/post.repository.ts` — extends `BaseRepository<Post, NewPost>`, implements `IPostRepository`
- [ ] `modules/post/post.service.ts` — implements `IPostService`, constructor-injected deps
- [ ] `modules/post/post.controller.ts` — extends `BaseController`, arrow methods via `asyncHandler`
- [ ] `modules/post/post.module.ts` — composes and exports `postController` singleton
- [ ] `modules/post/post.routes.ts` — Express Router pointing to `postController` methods
- [ ] Mount in `routes/index.ts` under `/api/v1/posts`
- [ ] Run `drizzle-kit generate` + `drizzle-kit push`
