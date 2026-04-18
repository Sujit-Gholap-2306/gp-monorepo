import { z } from 'zod'

export const loginDto = z.object({
  usernameOrEmail: z.string().min(1),
  password:        z.string().min(1),
})

export type LoginDto = z.infer<typeof loginDto>
