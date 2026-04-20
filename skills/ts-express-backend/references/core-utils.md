# Core Utilities

## File Locations

```
src/common/
├── guards/
│   └── async-handler.ts         ← asyncHandler
├── exceptions/
│   ├── http.exception.ts        ← ApiError
│   └── exception.filter.ts      ← exceptionFilter (global error handler)
├── interceptors/
│   └── response.interceptor.ts  ← ApiResponse
├── base/
│   └── base.controller.ts       ← BaseController: ok(), created(), noContent(), fail()
└── pipes/
    └── validation.pipe.ts       ← validate(schema, data)
```

---

## asyncHandler

Wraps async route handlers (or class arrow methods) so errors propagate to Express error middleware.

```ts
// src/common/guards/async-handler.ts
import type { RequestHandler } from 'express'

export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
```

Used in controllers as arrow methods so `this` is correctly bound:
```ts
register = asyncHandler(async (req, res) => {
  // `this.userService` works because arrow function captures class `this`
})
```

---

## ApiError

Custom error class with HTTP status code. Throw anywhere — `asyncHandler` passes it to `exceptionFilter`.

```ts
// src/common/exceptions/http.exception.ts
export class ApiError extends Error {
  statusCode: number
  data: null = null
  success: false = false
  errors: unknown[]

  constructor(
    statusCode: number,
    message = 'Something went wrong',
    errors: unknown[] = [],
  ) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }
}
```

Common throws:
```ts
throw new ApiError(400, 'Email already registered')
throw new ApiError(401, 'Unauthorized')
throw new ApiError(403, 'Forbidden')
throw new ApiError(404, 'User not found')
throw new ApiError(409, 'Conflict — resource already exists')
throw new ApiError(422, 'Validation failed', zodError.issues)
```

---

## ApiResponse

Consistent response envelope. BaseController methods use this internally — controllers rarely call it directly.

```ts
// src/common/interceptors/response.interceptor.ts
export class ApiResponse<T> {
  success: boolean

  constructor(
    public statusCode: number,
    public data: T,
    public message = 'Success',
  ) {
    this.success = statusCode < 400
  }
}
```

---

## BaseController

All controllers extend this. Use `this.ok()`, `this.created()`, `this.fail()` instead of writing `res.status(...).json(new ApiResponse(...))` each time.

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

Usage in a controller:
```ts
export class PostController extends BaseController {
  getOne = asyncHandler(async (req, res) => {
    const post = await this.postService.findById(req.params.id)
    if (!post) this.fail(404, 'Post not found')
    return this.ok(res, post)
  })

  create = asyncHandler(async (req, res) => {
    const dto  = validate(createPostDto, req.body)
    const post = await this.postService.create(dto)
    return this.created(res, post)
  })
}
```

---

## ValidationPipe

Parses and validates request bodies against a zod schema. Throws `ApiError(422)` on failure — no `try/catch` needed in controllers.

```ts
// src/common/pipes/validation.pipe.ts
import type { ZodSchema } from 'zod'
import { ApiError } from '../exceptions/http.exception'

export const validate = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data)
  if (!result.success) throw new ApiError(422, 'Validation failed', result.error.issues)
  return result.data
}
```

Usage:
```ts
const dto = validate(createVideoSchema, req.body)
// dto is fully typed; throws before any DB call if invalid
```

---

## ExceptionFilter (Global Error Handler)

Mount last in `app.ts`. Handles `ApiError`, and unexpected errors.

```ts
// src/common/exceptions/exception.filter.ts
import type { Request, Response, NextFunction } from 'express'
import { ApiError } from './http.exception'
import { ApiResponse } from '../interceptors/response.interceptor'

export const exceptionFilter = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, null, err.message))
  }

  console.error(err)
  return res.status(500).json(new ApiResponse(500, null, 'Internal server error'))
}
```

In `app.ts`, mount after all routes:
```ts
import { exceptionFilter } from './common/exceptions/exception.filter'
// ... all routes ...
app.use(exceptionFilter)
```

---

## TypeScript augmentation for req.user

```ts
// src/types/express.d.ts
import type { User } from '../db/schema/users'

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'username' | 'email' | 'fullName'>
    }
  }
}
```
