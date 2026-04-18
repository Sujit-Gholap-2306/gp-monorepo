import type { Response } from 'express'
import { ApiResponse } from '../interceptors/response.interceptor.js'
import { ApiError } from '../exceptions/http.exception.js'

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
