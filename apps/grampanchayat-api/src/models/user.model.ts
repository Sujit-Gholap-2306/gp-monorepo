import { eq, or } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { users } from '../db/schema/index.ts'
import type { User, NewUser } from '../db/schema/users.ts'
import { stripUndefined } from '../lib/db-helpers.ts'

export const userModel = {
  async findById(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return user
  },

  async findByEmailOrUsername(value: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, value), eq(users.username, value)))
      .limit(1)
    return user
  },

  async create(data: NewUser): Promise<User> {
    const [newUser] = await db.insert(users).values(data).returning()
    return newUser
  },

  async update(id: string, data: Partial<NewUser>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...stripUndefined(data), updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return updated
  },

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await db.update(users)
      .set({ refreshToken: token, updatedAt: new Date() })
      .where(eq(users.id, id))
  },

  async findSafe(id: string): Promise<any> {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        coverUrl: users.coverUrl,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return user
  }
}
