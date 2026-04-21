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
