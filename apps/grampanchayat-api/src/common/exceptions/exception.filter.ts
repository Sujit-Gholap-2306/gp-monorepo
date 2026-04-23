import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { ApiError } from './http.exception.ts'
import { ApiResponse } from '../interceptors/response.interceptor.ts'

export const exceptionFilter = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const requestId = req.id

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      ...new ApiResponse(err.statusCode, null, err.message),
      ...(err.errors.length ? { errors: err.errors } : {}),
      requestId,
    })
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      ...new ApiResponse(422, null, 'Validation failed'),
      errors: err.issues,
      requestId,
    })
  }

  console.error('[unhandled error]', err)
  return res.status(500).json({
    ...new ApiResponse(500, null, 'Internal server error'),
    requestId,
  })
}
