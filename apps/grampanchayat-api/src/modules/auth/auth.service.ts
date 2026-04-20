import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import type { IAuthService, ITokenPayload, TokenPair } from './interfaces/auth.interface.js'

export class AuthService implements IAuthService {
  hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10)
  }

  comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash)
  }

  generateTokens(userId: string): TokenPair {
    const payload = { id: userId } satisfies ITokenPayload
    return {
      accessToken: jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY ?? '15m' } as SignOptions,
      ),
      refreshToken: jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY ?? '7d' } as SignOptions,
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
