import { eq, or } from 'drizzle-orm'
import { BaseRepository } from '../../common/base/base.repository.js'
import { users } from '../../db/schema/index.js'
import type { User, NewUser } from '../../db/schema/users.js'
import type { IUserRepository, SafeUser } from './interfaces/user.interface.js'
import { db } from '../../db/index.js'

export class UserRepository
  extends BaseRepository<User, NewUser>
  implements IUserRepository
{
  protected readonly table    = users
  protected readonly idColumn = users.id

  async findByEmailOrUsername(value: string): Promise<User | undefined> {
    const [row] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, value), eq(users.username, value)))
      .limit(1)
    return row
  }

  async findSafe(id: string): Promise<SafeUser | undefined> {
    const [row] = await db
      .select({
        id:        users.id,
        username:  users.username,
        email:     users.email,
        fullName:  users.fullName,
        avatarUrl: users.avatarUrl,
        coverUrl:  users.coverUrl,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return row
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await db.update(users).set({ refreshToken: token }).where(eq(users.id, id))
  }
}
