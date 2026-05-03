import { sql } from 'drizzle-orm'
import { bigint, check, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'

export const MASTER_SEQUENCE_ENTITIES = ['citizen', 'property', 'water_connection'] as const
export type MasterSequenceEntity = (typeof MASTER_SEQUENCE_ENTITIES)[number]

export const gpMasterSequences = pgTable(
  'gp_master_sequences',
  {
    gpId: uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    entity: text('entity').notNull(),
    nextNo: bigint('next_no', { mode: 'number' }).notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.gpId, t.entity] }),
    entityCheck: check(
      'gp_master_sequences_entity_check',
      sql`${t.entity} IN ('citizen', 'property', 'water_connection')`
    ),
  })
)

export type GpMasterSequence = typeof gpMasterSequences.$inferSelect
export type NewGpMasterSequence = typeof gpMasterSequences.$inferInsert
