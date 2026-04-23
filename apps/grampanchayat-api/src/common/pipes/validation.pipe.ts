import type { ZodSchema } from 'zod'
import { ApiError } from '../exceptions/http.exception.ts'

export const validate = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data)
  if (!result.success) throw new ApiError(422, 'Validation failed', result.error.issues)
  return result.data
}
