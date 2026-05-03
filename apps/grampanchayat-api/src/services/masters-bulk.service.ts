import { and, asc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { db } from '../db/index.ts'
import {
  gpCitizens,
  gpMasterSequences,
  gpProperties,
} from '../db/schema/index.ts'
import { assertPropertyTypeRateRowCap, assertRowCap, parseImportBuffer } from '../lib/spreadsheet.ts'
import { allocateMasterNumber } from '../lib/master-sequences.ts'
import { isPostgresUniqueViolation } from '../lib/db-helpers.ts'
import { propertyTypeRatesService } from './property-type-rates.service.ts'
import {
  citizenRowSchema,
  collectPropertyTypeRateRowErrors,
  type CitizenRow,
  type PropertyRow,
  propertyRowSchema,
  type RowValidationError,
} from '../types/masters-bulk.dto.ts'
import type {
  CitizenListQuery,
  CreateCitizenBody,
  CreatePropertyBody,
  PropertyListQuery,
  UpdateCitizenBody,
  UpdatePropertyBody,
} from '../types/masters-crud.dto.ts'

const MASTERS_LIST_MAX = 2000
type ImportError = { row: number; field?: string; message: string }

function flattenZodIssues(error: { issues: Array<{ path: Array<string | number>; message: string }> }) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || '(row)',
    message: issue.message,
  }))
}

function partitionSheetRows<T>(
  rows: Record<string, string>[],
  schema: { safeParse: (input: unknown) => { success: true; data: T } | { success: false; error: { issues: Array<{ path: Array<string | number>; message: string }> } } }
) {
  const valid: Array<{ rowNo: number; value: T }> = []
  const errors: RowValidationError[] = []

  for (let i = 0; i < rows.length; i++) {
    const parsed = schema.safeParse(rows[i])
    if (parsed.success) {
      valid.push({ rowNo: i + 2, value: parsed.data })
    } else {
      errors.push({
        row: i + 2,
        message: 'Validation failed',
        fields: flattenZodIssues(parsed.error),
      })
    }
  }

  return { valid, errors }
}

function mapCitizenRow(gpId: string, row: CitizenRow, now: Date) {
  return {
    gpId,
    citizenNo: row.citizen_no,
    nameMr: row.name_mr,
    nameEn: row.name_en ?? null,
    mobile: row.mobile,
    wardNumber: row.ward_number,
    addressMr: row.address_mr,
    aadhaarLast4: row.aadhaar_last4 ?? null,
    householdId: row.household_id ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

function mapPropertyRow(
  gpId: string,
  ownerCitizenId: string,
  row: PropertyRow,
  now: Date
) {
  return {
    gpId,
    ownerCitizenId,
    propertyNo: row.property_no,
    surveyNumber: row.survey_number ?? null,
    plotOrGat: row.plot_or_gat ?? null,
    propertyType: row.property_type,
    lengthFt: row.length_ft ?? null,
    widthFt: row.width_ft ?? null,
    ageBracket: row.age_bracket ?? null,
    occupantName: row.occupant_name,
    resolutionRef: row.resolution_ref ?? null,
    assessmentDate: row.assessment_date ?? null,
    lightingTaxPaise: row.lighting_tax_paise ?? null,
    sanitationTaxPaise: row.sanitation_tax_paise ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

export const mastersBulkService = {
  async listCitizensForGp(gpId: string, filters: CitizenListQuery = {}) {
    const conditions = [eq(gpCitizens.gpId, gpId)]

    if (filters.ward) {
      conditions.push(eq(gpCitizens.wardNumber, filters.ward))
    }
    if (filters.q) {
      const q = `%${filters.q}%`
      conditions.push(
        or(
          sql<boolean>`CAST(${gpCitizens.citizenNo} AS text) ILIKE ${q}`,
          ilike(gpCitizens.nameMr, q),
          ilike(gpCitizens.nameEn, q),
          ilike(gpCitizens.mobile, q)
        )!
      )
    }

    const items = await db
      .select({
        id: gpCitizens.id,
        citizenNo: gpCitizens.citizenNo,
        nameMr: gpCitizens.nameMr,
        nameEn: gpCitizens.nameEn,
        mobile: gpCitizens.mobile,
        wardNumber: gpCitizens.wardNumber,
        addressMr: gpCitizens.addressMr,
        aadhaarLast4: gpCitizens.aadhaarLast4,
        householdId: gpCitizens.householdId,
        createdAt: gpCitizens.createdAt,
        updatedAt: gpCitizens.updatedAt,
      })
      .from(gpCitizens)
      .where(and(...conditions))
      .orderBy(asc(gpCitizens.citizenNo))
      .limit(MASTERS_LIST_MAX)

    return { items, count: items.length }
  },

  async getCitizenById(gpId: string, id: string) {
    const [row] = await db
      .select({
        id: gpCitizens.id,
        citizenNo: gpCitizens.citizenNo,
        nameMr: gpCitizens.nameMr,
        nameEn: gpCitizens.nameEn,
        mobile: gpCitizens.mobile,
        wardNumber: gpCitizens.wardNumber,
        addressMr: gpCitizens.addressMr,
        aadhaarLast4: gpCitizens.aadhaarLast4,
        householdId: gpCitizens.householdId,
        createdAt: gpCitizens.createdAt,
        updatedAt: gpCitizens.updatedAt,
      })
      .from(gpCitizens)
      .where(and(eq(gpCitizens.gpId, gpId), eq(gpCitizens.id, id)))
      .limit(1)

    if (!row) throw new ApiError(404, 'Citizen not found')
    return row
  },

  async createCitizen(gpId: string, body: CreateCitizenBody) {
    try {
      const citizenId = await db.transaction(async (tx) => {
        const citizenNo = await allocateMasterNumber(tx, gpId, 'citizen')
        const [created] = await tx
          .insert(gpCitizens)
          .values({
            gpId,
            citizenNo,
            nameMr: body.name_mr,
            nameEn: body.name_en ?? null,
            mobile: body.mobile,
            wardNumber: body.ward_number,
            addressMr: body.address_mr,
            aadhaarLast4: body.aadhaar_last4 ?? null,
            householdId: body.household_id ?? null,
          })
          .returning({ id: gpCitizens.id })

        if (!created) throw new ApiError(500, 'Citizen create failed')
        return created.id
      })

      return this.getCitizenById(gpId, citizenId)
    } catch (e) {
      if (isPostgresUniqueViolation(e)) {
        throw new ApiError(409, 'Citizen number already exists in this GP')
      }
      throw e
    }
  },

  async updateCitizen(gpId: string, id: string, body: UpdateCitizenBody) {
    if (Object.keys(body).length === 0) {
      return this.getCitizenById(gpId, id)
    }

    const [updated] = await db
      .update(gpCitizens)
      .set({
        nameMr: body.name_mr,
        nameEn: body.name_en,
        mobile: body.mobile,
        wardNumber: body.ward_number,
        addressMr: body.address_mr,
        aadhaarLast4: body.aadhaar_last4,
        householdId: body.household_id,
        updatedAt: new Date(),
      })
      .where(and(eq(gpCitizens.gpId, gpId), eq(gpCitizens.id, id)))
      .returning({ id: gpCitizens.id })

    if (!updated) throw new ApiError(404, 'Citizen not found')
    return this.getCitizenById(gpId, updated.id)
  },

  async listPropertiesForGp(gpId: string, filters: PropertyListQuery = {}) {
    const conditions = [eq(gpProperties.gpId, gpId)]

    if (filters.ward) {
      conditions.push(eq(gpCitizens.wardNumber, filters.ward))
    }
    if (filters.property_type) {
      conditions.push(eq(gpProperties.propertyType, filters.property_type))
    }
    if (filters.q) {
      const q = `%${filters.q}%`
      conditions.push(
        or(
          ilike(gpProperties.propertyNo, q),
          ilike(gpCitizens.nameMr, q),
          ilike(gpCitizens.nameEn, q)
        )!
      )
    }

    const items = await db
      .select({
        id: gpProperties.id,
        propertyNo: gpProperties.propertyNo,
        propertyType: gpProperties.propertyType,
        occupantName: gpProperties.occupantName,
        surveyNumber: gpProperties.surveyNumber,
        plotOrGat: gpProperties.plotOrGat,
        lengthFt: gpProperties.lengthFt,
        widthFt: gpProperties.widthFt,
        ageBracket: gpProperties.ageBracket,
        resolutionRef: gpProperties.resolutionRef,
        assessmentDate: gpProperties.assessmentDate,
        lightingTaxPaise: gpProperties.lightingTaxPaise,
        sanitationTaxPaise: gpProperties.sanitationTaxPaise,
        createdAt: gpProperties.createdAt,
        updatedAt: gpProperties.updatedAt,
        owner: {
          id: gpCitizens.id,
          citizenNo: gpCitizens.citizenNo,
          nameMr: gpCitizens.nameMr,
          nameEn: gpCitizens.nameEn,
          wardNumber: gpCitizens.wardNumber,
        },
      })
      .from(gpProperties)
      .innerJoin(gpCitizens, eq(gpProperties.ownerCitizenId, gpCitizens.id))
      .where(and(...conditions))
      .orderBy(asc(gpProperties.propertyNo))
      .limit(MASTERS_LIST_MAX)

    return { items, count: items.length }
  },

  async getPropertyById(gpId: string, id: string) {
    const [row] = await db
      .select({
        id: gpProperties.id,
        propertyNo: gpProperties.propertyNo,
        propertyType: gpProperties.propertyType,
        occupantName: gpProperties.occupantName,
        surveyNumber: gpProperties.surveyNumber,
        plotOrGat: gpProperties.plotOrGat,
        lengthFt: gpProperties.lengthFt,
        widthFt: gpProperties.widthFt,
        ageBracket: gpProperties.ageBracket,
        resolutionRef: gpProperties.resolutionRef,
        assessmentDate: gpProperties.assessmentDate,
        lightingTaxPaise: gpProperties.lightingTaxPaise,
        sanitationTaxPaise: gpProperties.sanitationTaxPaise,
        createdAt: gpProperties.createdAt,
        updatedAt: gpProperties.updatedAt,
        owner: {
          id: gpCitizens.id,
          citizenNo: gpCitizens.citizenNo,
          nameMr: gpCitizens.nameMr,
          nameEn: gpCitizens.nameEn,
          wardNumber: gpCitizens.wardNumber,
        },
      })
      .from(gpProperties)
      .innerJoin(gpCitizens, eq(gpProperties.ownerCitizenId, gpCitizens.id))
      .where(and(eq(gpProperties.gpId, gpId), eq(gpProperties.id, id)))
      .limit(1)

    if (!row) throw new ApiError(404, 'Property not found')
    return row
  },

  async createProperty(gpId: string, body: CreatePropertyBody) {
    try {
      const propertyId = await db.transaction(async (tx) => {
        const [citizen] = await tx
          .select({ id: gpCitizens.id })
          .from(gpCitizens)
          .where(and(eq(gpCitizens.id, body.owner_citizen_id), eq(gpCitizens.gpId, gpId)))
          .limit(1)
        if (!citizen) throw new ApiError(422, 'Citizen does not belong to this GP')

        const propertyNo = await allocateMasterNumber(tx, gpId, 'property')
        const [created] = await tx
          .insert(gpProperties)
          .values({
            gpId,
            ownerCitizenId: body.owner_citizen_id,
            propertyNo: String(propertyNo),
            propertyType: body.property_type,
            lengthFt: body.length_ft ?? null,
            widthFt: body.width_ft ?? null,
            occupantName: body.occupant_name,
            surveyNumber: body.survey_number ?? null,
            plotOrGat: body.plot_or_gat ?? null,
            ageBracket: body.age_bracket ?? null,
            resolutionRef: body.resolution_ref ?? null,
            assessmentDate: body.assessment_date ?? null,
            lightingTaxPaise: body.lighting_tax_paise ?? null,
            sanitationTaxPaise: body.sanitation_tax_paise ?? null,
          })
          .returning({ id: gpProperties.id })

        if (!created) throw new ApiError(500, 'Property create failed')
        return created.id
      })

      return this.getPropertyById(gpId, propertyId)
    } catch (e) {
      if (isPostgresUniqueViolation(e)) {
        throw new ApiError(409, 'Property number already exists in this GP')
      }
      throw e
    }
  },

  async updateProperty(gpId: string, id: string, body: UpdatePropertyBody) {
    if (Object.keys(body).length === 0) {
      return this.getPropertyById(gpId, id)
    }

    const [updated] = await db
      .update(gpProperties)
      .set({
        propertyType: body.property_type,
        lengthFt: body.length_ft,
        widthFt: body.width_ft,
        occupantName: body.occupant_name,
        surveyNumber: body.survey_number,
        plotOrGat: body.plot_or_gat,
        ageBracket: body.age_bracket,
        resolutionRef: body.resolution_ref,
        assessmentDate: body.assessment_date,
        lightingTaxPaise: body.lighting_tax_paise,
        sanitationTaxPaise: body.sanitation_tax_paise,
        updatedAt: new Date(),
      })
      .where(and(eq(gpProperties.gpId, gpId), eq(gpProperties.id, id)))
      .returning({ id: gpProperties.id })

    if (!updated) throw new ApiError(404, 'Property not found')
    return this.getPropertyById(gpId, updated.id)
  },

  async importCitizensFile(gpId: string, buffer: Buffer) {
    const raw = await parseImportBuffer(buffer)
    assertRowCap(raw)

    const parsed = partitionSheetRows(raw, citizenRowSchema)
    const errors: ImportError[] = parsed.errors.map((error) => ({
      row: error.row,
      message: error.fields?.map((field) => `${field.field}: ${field.message}`).join(' · ') ?? error.message,
    }))

    const existingRows = await db
      .select({ citizenNo: gpCitizens.citizenNo })
      .from(gpCitizens)
      .where(eq(gpCitizens.gpId, gpId))
    const existingNos = new Set(existingRows.map((row) => row.citizenNo))
    const seenInFile = new Set<number>()
    const now = new Date()
    const toInsert: Array<ReturnType<typeof mapCitizenRow>> = []

    for (const item of parsed.valid) {
      if (existingNos.has(item.value.citizen_no)) {
        errors.push({
          row: item.rowNo,
          field: 'citizen_no',
          message: `citizen_no ${String(item.value.citizen_no)} already exists`,
        })
        continue
      }
      if (seenInFile.has(item.value.citizen_no)) {
        errors.push({
          row: item.rowNo,
          field: 'citizen_no',
          message: `citizen_no ${String(item.value.citizen_no)} is duplicated in this file`,
        })
        continue
      }
      seenInFile.add(item.value.citizen_no)
      toInsert.push(mapCitizenRow(gpId, item.value, now))
    }

    if (toInsert.length > 0) {
      try {
        await db.transaction(async (tx) => {
          await tx.insert(gpCitizens).values(toInsert)
          // sync sequence to actual DB max (not file max) — handles gaps and pre-existing data
          await tx.execute(sql`
            INSERT INTO ${gpMasterSequences} (${gpMasterSequences.gpId}, ${gpMasterSequences.entity}, ${gpMasterSequences.nextNo})
            SELECT ${gpId}, 'citizen', COALESCE(MAX(${gpCitizens.citizenNo}), 0) + 1
            FROM ${gpCitizens} WHERE ${gpCitizens.gpId} = ${gpId}
            ON CONFLICT (${gpMasterSequences.gpId}, ${gpMasterSequences.entity}) DO UPDATE
              SET ${gpMasterSequences.nextNo} = GREATEST(${gpMasterSequences.nextNo}, excluded.next_no)
          `)
        })
      } catch (e) {
        if (isPostgresUniqueViolation(e)) {
          throw new ApiError(409, 'Citizen import conflicted with an existing number')
        }
        throw e
      }
    }

    return {
      inserted: toInsert.length,
      skipped: errors.length,
      errors,
    }
  },

  async importPropertiesFile(gpId: string, buffer: Buffer) {
    const raw = await parseImportBuffer(buffer)
    assertRowCap(raw)

    const parsed = partitionSheetRows(raw, propertyRowSchema)
    const errors: ImportError[] = parsed.errors.map((error) => ({
      row: error.row,
      message: error.fields?.map((field) => `${field.field}: ${field.message}`).join(' · ') ?? error.message,
    }))

    const ownerNos = [...new Set(parsed.valid.map((item) => item.value.owner_citizen_no))]
    const owners = ownerNos.length === 0
      ? []
      : await db
        .select({ id: gpCitizens.id, citizenNo: gpCitizens.citizenNo })
        .from(gpCitizens)
        .where(and(eq(gpCitizens.gpId, gpId), inArray(gpCitizens.citizenNo, ownerNos)))
    const ownerMap = new Map(owners.map((owner) => [owner.citizenNo, owner.id]))

    const existingRows = await db
      .select({ propertyNo: gpProperties.propertyNo })
      .from(gpProperties)
      .where(eq(gpProperties.gpId, gpId))
    const existingNos = new Set(existingRows.map((row) => row.propertyNo))
    const seenInFile = new Set<string>()
    const now = new Date()
    const toInsert: Array<ReturnType<typeof mapPropertyRow>> = []

    for (const item of parsed.valid) {
      if (existingNos.has(item.value.property_no)) {
        errors.push({
          row: item.rowNo,
          field: 'property_no',
          message: `property_no ${item.value.property_no} already exists`,
        })
        continue
      }
      if (seenInFile.has(item.value.property_no)) {
        errors.push({
          row: item.rowNo,
          field: 'property_no',
          message: `property_no ${item.value.property_no} is duplicated in this file`,
        })
        continue
      }
      const ownerCitizenId = ownerMap.get(item.value.owner_citizen_no)
      if (!ownerCitizenId) {
        errors.push({
          row: item.rowNo,
          field: 'owner_citizen_no',
          message: `owner_citizen_no ${String(item.value.owner_citizen_no)} not found`,
        })
        continue
      }

      seenInFile.add(item.value.property_no)
      toInsert.push(mapPropertyRow(gpId, ownerCitizenId, item.value, now))
    }

    if (toInsert.length > 0) {
      try {
        await db.transaction(async (tx) => {
          await tx.insert(gpProperties).values(toInsert)
          // sync sequence to actual DB max (not file max) — handles gaps and pre-existing data
          await tx.execute(sql`
            INSERT INTO ${gpMasterSequences} (${gpMasterSequences.gpId}, ${gpMasterSequences.entity}, ${gpMasterSequences.nextNo})
            SELECT ${gpId}, 'property', COALESCE(MAX((${gpProperties.propertyNo})::bigint), 0) + 1
            FROM ${gpProperties} WHERE ${gpProperties.gpId} = ${gpId}
            ON CONFLICT (${gpMasterSequences.gpId}, ${gpMasterSequences.entity}) DO UPDATE
              SET ${gpMasterSequences.nextNo} = GREATEST(${gpMasterSequences.nextNo}, excluded.next_no)
          `)
        })
      } catch (e) {
        if (isPostgresUniqueViolation(e)) {
          throw new ApiError(409, 'Property import conflicted with an existing number')
        }
        throw e
      }
    }

    return {
      inserted: toInsert.length,
      skipped: errors.length,
      errors,
    }
  },

  async importPropertyTypeRatesFile(gpId: string, buffer: Buffer) {
    const raw = await parseImportBuffer(buffer)
    assertPropertyTypeRateRowCap(raw)
    const result = collectPropertyTypeRateRowErrors(raw)
    if (!result.ok) {
      throw new ApiError(400, 'Validation failed', result.errors)
    }
    await propertyTypeRatesService.upsertForGp(gpId, result.data)
    return { inserted: result.data.length }
  },
}
