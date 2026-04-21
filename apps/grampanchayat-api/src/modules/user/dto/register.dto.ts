import { z } from 'zod'

export const registerDto = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Lowercase, numbers, underscores only'),
  email:    z.string().email(),
  fullName: z.string().min(2).max(100),
  password: z.string().min(8),
})

export type RegisterDto = z.infer<typeof registerDto>
