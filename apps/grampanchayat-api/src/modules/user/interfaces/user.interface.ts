import type { User, NewUser } from '../../../db/schema/users.js'
import type { TokenPair } from '../../auth/interfaces/auth.interface.js'

export type SafeUser = Pick<User, 'id' | 'username' | 'email' | 'fullName' | 'avatarUrl' | 'coverUrl'>
export type LoginResult = SafeUser & TokenPair

export interface IUserRepository {
  findById(id: string): Promise<User | undefined>
  findByEmailOrUsername(value: string): Promise<User | undefined>
  findSafe(id: string): Promise<SafeUser | undefined>
  create(data: NewUser): Promise<User>
  update(id: string, data: Partial<NewUser>): Promise<User | undefined>
  updateRefreshToken(id: string, token: string | null): Promise<void>
}

export interface IUserService {
  register(dto: RegisterDto): Promise<SafeUser>
  login(dto: LoginDto): Promise<LoginResult>
  logout(userId: string): Promise<void>
  refreshTokens(incomingToken: string): Promise<TokenPair>
  getCurrentUser(userId: string): Promise<SafeUser>
  updateAvatar(userId: string, file: Express.Multer.File): Promise<string>
}

export interface RegisterDto {
  username: string
  email: string
  fullName: string
  password: string
}

export interface LoginDto {
  usernameOrEmail: string
  password: string
}
