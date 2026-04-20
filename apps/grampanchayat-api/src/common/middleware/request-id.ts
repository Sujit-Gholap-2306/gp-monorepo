import { randomUUID } from 'crypto'
import type { Request, Response, NextFunction } from 'express'

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const id = (req.headers['x-request-id'] as string | undefined) ?? randomUUID()
  req.id = id
  res.setHeader('x-request-id', id)
  next()
}
