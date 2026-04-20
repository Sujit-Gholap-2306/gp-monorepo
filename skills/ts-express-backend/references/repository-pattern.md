# Repository Pattern

## Overview

Three components work together:
1. `BaseRepository<TSelect, TInsert>` — abstract class with generic CRUD in `common/base/`
2. `IUserRepository` — interface that defines what `UserService` needs
3. `UserRepository` — concrete class extends `BaseRepository`, implements `IUserRepository`

The service depends on the **interface**, not the concrete class — enabling easy mocking in tests.

---

## BaseRepository

```ts
// src/common/base/base.repository.ts
import { eq } from 'drizzle-orm'
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
      .set({ ...(data as any), updatedAt: new Date() })
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

The `table` and `idColumn` properties are declared abstract — subclasses must provide them. The `any` casts are intentional at the base level to keep the generic signature clean; concrete classes remain fully typed.

---

## IUserRepository (Interface)

```ts
// src/modules/user/interfaces/user.interface.ts
import type { User, NewUser } from '../../../db/schema/users'

export interface IUserRepository {
  findById(id: string): Promise<User | undefined>
  findByEmailOrUsername(value: string): Promise<User | undefined>
  findSafe(id: string): Promise<SafeUser | undefined>
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

// Shared types used across the module
export type SafeUser = Pick<User, 'id' | 'username' | 'email' | 'fullName' | 'avatarUrl' | 'coverUrl'>
export type TokenPair = { accessToken: string; refreshToken: string }
export type LoginResult = SafeUser & TokenPair
```

---

## UserRepository

```ts
// src/modules/user/user.repository.ts
import { eq, or } from 'drizzle-orm'
import { BaseRepository } from '../../common/base/base.repository'
import { users } from '../../db/schema'
import type { User, NewUser } from '../../db/schema/users'
import type { IUserRepository, SafeUser } from './interfaces/user.interface'
import { db } from '../../db'

export class UserRepository
  extends BaseRepository<User, NewUser>
  implements IUserRepository
{
  protected readonly table    = users
  protected readonly idColumn = users.id

  async findByEmailOrUsername(value: string): Promise<User | undefined> {
    const [row] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, value), eq(users.username, value)))
      .limit(1)
    return row
  }

  async findSafe(id: string): Promise<SafeUser | undefined> {
    const [row] = await db
      .select({
        id:        users.id,
        username:  users.username,
        email:     users.email,
        fullName:  users.fullName,
        avatarUrl: users.avatarUrl,
        coverUrl:  users.coverUrl,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return row
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await db.update(users).set({ refreshToken: token }).where(eq(users.id, id))
  }
}
```

---

## UserService (using the interface)

```ts
// src/modules/user/user.service.ts
import type { IUserRepository, IUserService, SafeUser, LoginResult, TokenPair } from './interfaces/user.interface'
import type { IAuthService } from '../auth/interfaces/auth.interface'
import type { IStorageService } from '../storage/interfaces/storage.interface'
import { ApiError } from '../../common/exceptions/http.exception'
import type { RegisterDto, LoginDto } from './dto'
import { BUCKETS } from '../../config'
import path from 'path'

export class UserService implements IUserService {
  constructor(
    private readonly userRepo: IUserRepository,     // interface, not UserRepository
    private readonly authService: IAuthService,     // interface, not AuthService
    private readonly storageService: IStorageService,
  ) {}

  async register(dto: RegisterDto): Promise<SafeUser> {
    const existing = await this.userRepo.findByEmailOrUsername(dto.email)
    if (existing) throw new ApiError(409, 'Email or username already registered')

    const passwordHash = await this.authService.hashPassword(dto.password)
    const user = await this.userRepo.create({ ...dto, passwordHash })
    const { passwordHash: _, ...safe } = user
    return safe as SafeUser
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.userRepo.findByEmailOrUsername(dto.usernameOrEmail)
    if (!user) throw new ApiError(404, 'User not found')

    const valid = await this.authService.comparePassword(dto.password, user.passwordHash)
    if (!valid) throw new ApiError(401, 'Invalid credentials')

    const tokens = this.authService.generateTokens(user.id)
    await this.userRepo.updateRefreshToken(user.id, tokens.refreshToken)

    const { passwordHash: _, refreshToken: __, ...safeUser } = user
    return { ...safeUser, ...tokens } as LoginResult
  }

  async logout(userId: string): Promise<void> {
    await this.userRepo.updateRefreshToken(userId, null)
  }

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await this.userRepo.findSafe(userId)
    if (!user) throw new ApiError(404, 'User not found')
    return user
  }

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    const dest = `${userId}/avatar-${Date.now()}${path.extname(file.originalname)}`
    const url  = await this.storageService.upload(file.path, BUCKETS.AVATARS, dest, file.mimetype)
    if (!url) throw new ApiError(500, 'Avatar upload failed')
    await this.userRepo.update(userId, { avatarUrl: url })
    return url
  }
}
```

---

## Module Composition (user.module.ts)

```ts
// src/modules/user/user.module.ts
import { UserRepository }  from './user.repository'
import { UserService }     from './user.service'
import { UserController }  from './user.controller'
import { authService }     from '../auth/auth.module'       // singleton import
import { storageService }  from '../storage/storage.module' // singleton import

// Compose once — exported singleton used by routes
const userRepository = new UserRepository()
const userService    = new UserService(userRepository, authService, storageService)
export const userController = new UserController(userService)
```

Routes import `userController` and call its methods directly — the whole composition graph is hidden inside `user.module.ts`.

---

## Testing (mocking via interface)

```ts
// tests/user.service.test.ts
const mockUserRepo: IUserRepository = {
  findById:              jest.fn(),
  findByEmailOrUsername: jest.fn(),
  findSafe:              jest.fn(),
  create:                jest.fn(),
  update:                jest.fn(),
  updateRefreshToken:    jest.fn(),
}

const service = new UserService(mockUserRepo, mockAuthService, mockStorageService)
// No database needed in unit tests
```
