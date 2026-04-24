/**
 * gp_citizens — Citizen master per GP (Namuna alignment: owner identity for N08/N09).
 * citizen_no: per-GP serial (1, 2, 3, …), unique with gp_id; links property bulk rows via owner_citizen_no.
 */
import { pgTable, uuid, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'

export const gpCitizens = pgTable(
  'gp_citizens',
  {
    id:             uuid('id').primaryKey().defaultRandom(),
    gpId:           uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    citizenNo:      integer('citizen_no').notNull(),
    nameMr:         text('name_mr').notNull(),
    nameEn:         text('name_en'),
    mobile:         text('mobile').notNull(),
    wardNumber:     text('ward_number').notNull(),
    addressMr:      text('address_mr').notNull(),
    aadhaarLast4:   text('aadhaar_last4'),
    householdId:    text('household_id'),
    createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt:      timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpCitizenNo: uniqueIndex('gp_citizens_gp_id_citizen_no_uidx').on(t.gpId, t.citizenNo),
  })
)

export type GpCitizen = typeof gpCitizens.$inferSelect
export type NewGpCitizen = typeof gpCitizens.$inferInsert
