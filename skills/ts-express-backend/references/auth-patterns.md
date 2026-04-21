# Auth Patterns

## AuthService (class-based)

Owns all auth domain logic. Services call this via `IAuthService` interface — no crypto or JWT in controllers or repositories.

```ts
// src/modules/auth/interfaces/auth.interface.ts
export interface ITokenPayload { id: string }
export interface TokenPair { accessToken: string; refreshToken: string }

export interface IAuthService {
  hashPassword(plain: string): Promise<string>
  comparePassword(plain: string, hash: string): Promise<boolean>
  generateTokens(userId: string): TokenPair
  verifyAccessToken(token: string): ITokenPayload
  verifyRefreshToken(token: string): ITokenPayload
}
```

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
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY ?? '15m' },
      ),
      refreshToken: jwt.sign(
        { id: userId } satisfies ITokenPayload,
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY ?? '7d' },
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
```

```ts
// src/modules/auth/auth.module.ts
import { AuthService } from './auth.service'

export const authService = new AuthService()
```

Other modules import `authService` (the singleton), not the class directly.

---

## AuthGuard (replaces verifyJWT middleware)

```ts
// src/common/guards/auth.guard.ts
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
    .from(users)
    .where(eq(users.id, decoded.id))
    .limit(1)

  if (!user) throw new ApiError(401, 'User not found')
  req.user = user
  next()
})
```

Used in routes:
```ts
router.use(authGuard)          // protect everything below this line
// or per-route:
router.get('/me', authGuard, userController.getCurrentUser)
```

---

## Cookie Helper

Centralise cookie options in config — never inline:

```ts
// src/config/index.ts
import type { CookieOptions } from 'express'

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
}
```

---

## Auth in UserController

Auth operations (register/login/logout/refresh) live on `UserController` — no separate `AuthController`. The `UserService` orchestrates auth logic via injected `IAuthService`.

```ts
// src/modules/user/user.controller.ts
import { asyncHandler }    from '../../common/guards/async-handler'
import { BaseController }  from '../../common/base/base.controller'
import { validate }        from '../../common/pipes/validation.pipe'
import { registerDto, loginDto } from './dto'
import type { IUserService } from './interfaces/user.interface'
import { COOKIE_OPTIONS }  from '../../config'

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

  refreshTokens = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies?.refreshToken ?? req.body.refreshToken
    if (!incomingToken) this.fail(401, 'Unauthorized')
    const tokens = await this.userService.refreshTokens(incomingToken)
    return res
      .cookie('accessToken',  tokens.accessToken,  COOKIE_OPTIONS)
      .cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS)
      .status(200)
      .json({ statusCode: 200, data: tokens, success: true })
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

---

## User Routes

```ts
// src/modules/user/user.routes.ts
import { Router } from 'express'
import { authGuard }      from '../../common/guards/auth.guard'
import { upload }         from '../../common/guards/upload.guard'
import { userController } from './user.module'

const router = Router()

// Public routes
router.post('/register', upload.fields([
  { name: 'avatar',      maxCount: 1 },
  { name: 'coverImage',  maxCount: 1 },
]), userController.register)

router.post('/login',          userController.login)
router.post('/refresh-tokens', userController.refreshTokens)

// Protected routes
router.use(authGuard)
router.post('/logout',       userController.logout)
router.get('/current-user',  userController.getCurrentUser)
router.patch('/avatar', upload.single('avatar'), userController.updateAvatar)

export default router
```

---

## RefreshTokens in UserService

```ts
async refreshTokens(incomingToken: string): Promise<TokenPair> {
  let decoded: ITokenPayload
  try {
    decoded = this.authService.verifyRefreshToken(incomingToken)
  } catch {
    throw new ApiError(401, 'Invalid refresh token')
  }

  const user = await this.userRepo.findById(decoded.id)
  if (!user || user.refreshToken !== incomingToken) {
    throw new ApiError(401, 'Refresh token mismatch or expired')
  }

  const tokens = this.authService.generateTokens(user.id)
  await this.userRepo.updateRefreshToken(user.id, tokens.refreshToken)
  return tokens
}
```
