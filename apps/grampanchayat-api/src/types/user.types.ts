import type { User } from '../db/schema/users.ts'
import { z } from 'zod'

export type SafeUser = Pick<User, 'id' | 'username' | 'email' | 'fullName' | 'avatarUrl' | 'coverUrl'>

export const registerSchema = z.object({
  username: z.string().min(1),
  email:    z.string().email(),
  fullName: z.string().min(1),
  password: z.string().min(6),
})

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1),
  password:        z.string().min(1),
})

export type RegisterDto = z.infer<typeof registerSchema>
export type LoginDto = z.infer<typeof loginSchema>

export type LoginResult = SafeUser & { accessToken: string; refreshToken: string }

export const registerDto = registerSchema
export const loginDto = loginSchema
