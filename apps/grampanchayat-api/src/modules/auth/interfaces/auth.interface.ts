export interface ITokenPayload { id: string }
export interface TokenPair { accessToken: string; refreshToken: string }

export interface IAuthService {
  hashPassword(plain: string): Promise<string>
  comparePassword(plain: string, hash: string): Promise<boolean>
  generateTokens(userId: string): TokenPair
  verifyAccessToken(token: string): ITokenPayload
  verifyRefreshToken(token: string): ITokenPayload
}
