import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/index.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET || 'default_access_secret_change_me'
const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET || 'default_refresh_secret_change_me'

export const authService = {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  },

  generateTokens(userId: string) {
    const accessOpts = { expiresIn: env.ACCESS_TOKEN_EXPIRY } as SignOptions
    const refreshOpts = { expiresIn: env.REFRESH_TOKEN_EXPIRY } as SignOptions

    const accessToken = jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, accessOpts)
    const refreshToken = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, refreshOpts)

    return { accessToken, refreshToken }
  },

  verifyRefreshToken(token: string): { id: string } {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET) as { id: string }
    } catch (err) {
      throw new ApiError(401, 'Invalid refresh token')
    }
  }
}
