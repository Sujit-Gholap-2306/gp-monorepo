/**
 * gp_properties — N08-style property/assessment row (structure for Namuna 8; N09 demand in a follow-up).
 * length_ft / width_ft: feet (Namuna8Property lengthFt/widthFt).
 * property_type / age_bracket: align with apps/grampanchayat/types Namuna8Property enums.
 */
import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  real,
  bigint,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { gpTenants } from './tenants.ts'
import { gpCitizens } from './citizens.ts'

export const gpProperties = pgTable(
  'gp_properties',
  {
    id:               uuid('id').primaryKey().defaultRandom(),
    gpId:             uuid('gp_id')
      .notNull()
      .references(() => gpTenants.id, { onDelete: 'cascade' }),
    ownerCitizenId:   uuid('owner_citizen_id')
      .notNull()
      .references(() => gpCitizens.id, { onDelete: 'restrict' }),
    propertyNo:       text('property_no').notNull(),
    surveyNumber:     text('survey_number'),
    plotOrGat:        text('plot_or_gat'),
    propertyType:     text('property_type').notNull(),
    lengthFt:         real('length_ft'),
    widthFt:          real('width_ft'),
    ageBracket:       text('age_bracket'),
    occupantName:     text('occupant_name').notNull(),
    resolutionRef:    text('resolution_ref'),
    assessmentDate:   date('assessment_date'),
    lightingTaxPaise: bigint('lighting_tax_paise', { mode: 'number' }),
    sanitationTaxPaise: bigint('sanitation_tax_paise', { mode: 'number' }),
    waterTaxPaise:    bigint('water_tax_paise', { mode: 'number' }),
    createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt:        timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gpPropertyNo:    uniqueIndex('gp_properties_gp_id_property_no_uidx').on(t.gpId, t.propertyNo),
    ownerCitizenIdx: index('gp_properties_owner_citizen_id_idx').on(t.ownerCitizenId),
  })
)

export type GpProperty = typeof gpProperties.$inferSelect
export type NewGpProperty = typeof gpProperties.$inferInsert
