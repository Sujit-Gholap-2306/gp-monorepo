import path from 'path'
import { userModel } from '../models/user.model.ts'
import { authService } from './auth.service.ts'
import { storageService } from './storage.service.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { BUCKETS } from '../config/index.ts'
import type { SafeUser, LoginResult, RegisterDto, LoginDto } from '../types/user.types.ts'

export const userService = {
  async register(dto: RegisterDto): Promise<SafeUser> {
    const existing = await userModel.findByEmailOrUsername(dto.email)
    if (existing) throw new ApiError(409, 'Email or username already registered')

    const passwordHash = await authService.hashPassword(dto.password)
    const user = await userModel.create({ ...dto, passwordHash })
    const { passwordHash: _, refreshToken: __, ...safe } = user
    return safe as SafeUser
  },

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await userModel.findByEmailOrUsername(dto.usernameOrEmail)
    if (!user) throw new ApiError(404, 'User not found')

    const valid = await authService.comparePassword(dto.password, user.passwordHash)
    if (!valid) throw new ApiError(401, 'Invalid credentials')

    const tokens = authService.generateTokens(user.id)
    await userModel.updateRefreshToken(user.id, tokens.refreshToken)

    const { passwordHash: _, refreshToken: __, ...safeUser } = user
    return { ...safeUser, ...tokens } as LoginResult
  },

  async logout(userId: string): Promise<void> {
    await userModel.updateRefreshToken(userId, null)
  },

  async refreshTokens(
    incomingToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let decoded: { id: string }
    try {
      decoded = authService.verifyRefreshToken(incomingToken)
    } catch {
      throw new ApiError(401, 'Invalid refresh token')
    }

    const user = await userModel.findById(decoded.id)
    if (!user) throw new ApiError(404, 'User not found')

    const tokens = authService.generateTokens(user.id)
    await userModel.updateRefreshToken(user.id, tokens.refreshToken)

    return tokens
  },

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await userModel.findSafe(userId)
    if (!user) throw new ApiError(404, 'User not found')
    return user
  },

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    const dest = `${userId}/avatar-${Date.now()}${path.extname(file.originalname)}`
    const url = await storageService.upload(file.path, BUCKETS.AVATARS, dest, file.mimetype)
    if (!url) throw new ApiError(500, 'Avatar upload failed')

    await userModel.update(userId, { avatarUrl: url })
    return url
  }
}
