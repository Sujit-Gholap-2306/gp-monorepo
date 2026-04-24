import type { Response } from 'express'
import { ApiResponse } from '../interceptors/response.interceptor.ts'
import { ApiError } from '../exceptions/http.exception.ts'
import { keysToSnake } from '../serialize/keys-to-snake.ts'

export abstract class BaseController {
  protected ok<T>(res: Response, data: T, message = 'Success'): Response {
    return res.status(200).json(new ApiResponse(200, keysToSnake(data), message))
  }

  protected created<T>(res: Response, data: T, message = 'Created'): Response {
    return res.status(201).json(new ApiResponse(201, keysToSnake(data), message))
  }

  protected noContent(res: Response): Response {
    return res.status(204).send()
  }

  protected fail(statusCode: number, message: string, errors?: unknown[]): never {
    throw new ApiError(statusCode, message, errors)
  }
}
