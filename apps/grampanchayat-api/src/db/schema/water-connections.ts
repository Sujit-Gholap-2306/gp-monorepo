import { sql } from 'drizzle-orm'
import {
  check,
  date,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { gpCitizens } from './citizens.ts'
import { gpTenants } from './tenants.ts'

export const WATER_CONNECTION_TYPES = ['regular', 'specialized'] as const
export type WaterConnectionType = (typeof WATER_CONNECTION_TYPES)[number]

export const WATER_CONNECTION_STATUSES = ['active', 'disconnected'] as const
export type WaterConnectionStatus = (typeof WATER_CONNECTION_STATUSES)[number]

export const PIPE_SIZES_INCH = [1.0, 1.5, 2.0, 2.5] as const
export type PipeSizeInch = (typeof PIPE_SIZES_INCH)[number]

export const gpWaterConnections = pgTable(
  'gp_water_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gpId: uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    citizenId: uuid('citizen_id')
      .notNull()
      .references(() => gpCitizens.id, { onDelete: 'restrict' }),
    consumerNo: text('consumer_no').notNull(),
    connectionType: text('connection_type').notNull(),
    pipeSizeInch: numeric('pipe_size_inch', { precision: 3, scale: 1 }).notNull(),
    status: text('status').notNull().default('active'),
    connectedAt: date('connected_at'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpConsumerNoUidx: uniqueIndex('gp_water_connections_gp_consumer_no_uidx').on(t.gpId, t.consumerNo),
    gpCitizenUidx: uniqueIndex('gp_water_connections_gp_citizen_uidx').on(t.gpId, t.citizenId),
    gpStatusIdx: index('gp_water_connections_gp_status_idx').on(t.gpId, t.status),
    connectionTypeCheck: check(
      'gp_water_connections_connection_type_check',
      sql`${t.connectionType} IN ('regular', 'specialized')`
    ),
    statusCheck: check(
      'gp_water_connections_status_check',
      sql`${t.status} IN ('active', 'disconnected')`
    ),
    pipeSizeCheck: check(
      'gp_water_connections_pipe_size_check',
      sql`${t.pipeSizeInch} IN (1.0, 1.5, 2.0, 2.5)`
    ),
  })
)

export type GpWaterConnection = typeof gpWaterConnections.$inferSelect
export type NewGpWaterConnection = typeof gpWaterConnections.$inferInsert
