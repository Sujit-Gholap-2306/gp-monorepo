import jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { users } from '../../db/schema/index.ts'
import { ApiError } from '../exceptions/http.exception.ts'
import { asyncHandler } from './async-handler.ts'

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
