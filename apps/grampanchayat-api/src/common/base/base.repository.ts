import { eq } from 'drizzle-orm'
import type { PgTable, PgColumn } from 'drizzle-orm/pg-core'
import { db } from '../../db/index.ts'

export abstract class BaseRepository<TSelect, TInsert> {
  protected abstract readonly table: PgTable
  protected abstract readonly idColumn: PgColumn

  async findById(id: string): Promise<TSelect | undefined> {
    const [row] = await db
      .select()
      .from(this.table)
      .where(eq(this.idColumn, id))
      .limit(1)
    return row as TSelect | undefined
  }

  async create(data: TInsert): Promise<TSelect> {
    const [row] = await db.insert(this.table).values(data as never).returning()
    return row as TSelect
  }

  async update(id: string, data: Partial<TInsert>): Promise<TSelect | undefined> {
    const [row] = await db
      .update(this.table)
      .set({ ...(data as Record<string, unknown>), updatedAt: new Date() })
      .where(eq(this.idColumn, id))
      .returning()
    return row as TSelect | undefined
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(this.table)
      .where(eq(this.idColumn, id))
      .returning({ id: this.idColumn })
    return result.length > 0
  }
}
