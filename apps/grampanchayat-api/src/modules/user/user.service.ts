import path from 'path'
import type { IUserRepository, IUserService, SafeUser, LoginResult, RegisterDto, LoginDto } from './interfaces/user.interface.js'
import type { IAuthService, TokenPair } from '../auth/interfaces/auth.interface.js'
import type { IStorageService } from '../storage/interfaces/storage.interface.js'
import { ApiError } from '../../common/exceptions/http.exception.js'
import { BUCKETS } from '../../config/index.js'

export class UserService implements IUserService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly authService: IAuthService,
    private readonly storageService: IStorageService,
  ) {}

  async register(dto: RegisterDto): Promise<SafeUser> {
    const existing = await this.userRepo.findByEmailOrUsername(dto.email)
    if (existing) throw new ApiError(409, 'Email or username already registered')

    const passwordHash = await this.authService.hashPassword(dto.password)
    const user = await this.userRepo.create({ ...dto, passwordHash })
    const { passwordHash: _, refreshToken: __, ...safe } = user
    return safe as SafeUser
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.userRepo.findByEmailOrUsername(dto.usernameOrEmail)
    if (!user) throw new ApiError(404, 'User not found')

    const valid = await this.authService.comparePassword(dto.password, user.passwordHash)
    if (!valid) throw new ApiError(401, 'Invalid credentials')

    const tokens = this.authService.generateTokens(user.id)
    await this.userRepo.updateRefreshToken(user.id, tokens.refreshToken)

    const { passwordHash: _, refreshToken: __, ...safeUser } = user
    return { ...safeUser, ...tokens } as LoginResult
  }

  async logout(userId: string): Promise<void> {
    await this.userRepo.updateRefreshToken(userId, null)
  }

  async refreshTokens(incomingToken: string): Promise<TokenPair> {
    let decoded: { id: string }
    try {
      decoded = this.authService.verifyRefreshToken(incomingToken)
    } catch {
      throw new ApiError(401, 'Invalid refresh token')
    }

    const user = await this.userRepo.findById(decoded.id)
    if (!user || user.refreshToken !== incomingToken) {
      throw new ApiError(401, 'Refresh token mismatch or expired')
    }

    const tokens = this.authService.generateTokens(user.id)
    await this.userRepo.updateRefreshToken(user.id, tokens.refreshToken)
    return tokens
  }

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await this.userRepo.findSafe(userId)
    if (!user) throw new ApiError(404, 'User not found')
    return user
  }

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    const dest = `${userId}/avatar-${Date.now()}${path.extname(file.originalname)}`
    const url  = await this.storageService.upload(file.path, BUCKETS.AVATARS, dest, file.mimetype)
    if (!url) throw new ApiError(500, 'Avatar upload failed')
    await this.userRepo.update(userId, { avatarUrl: url })
    return url
  }
}
