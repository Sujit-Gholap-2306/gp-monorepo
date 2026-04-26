import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { gpCitizens, gpProperties } from '../db/schema/index.ts'

const MASTERS_LIST_MAX = 2000
import { ApiError } from '../common/exceptions/http.exception.ts'
import { assertPropertyTypeRateRowCap, assertRowCap, parseImportBuffer } from '../lib/spreadsheet.ts'
import { propertyTypeRatesService } from './property-type-rates.service.ts'
import {
  collectCitizenRowErrors,
  collectPropertyRowErrors,
  collectPropertyTypeRateRowErrors,
} from '../types/masters-bulk.dto.ts'

function isPostgresUniqueViolation(e: unknown): boolean {
  if (e && typeof e === 'object' && 'code' in e) {
    return (e as { code: string }).code === '23505'
  }
  return false
}

export const mastersBulkService = {
  async listCitizensForGp(gpId: string) {
    return db
      .select({
        id:         gpCitizens.id,
        citizenNo:  gpCitizens.citizenNo,
        nameMr:     gpCitizens.nameMr,
        nameEn:     gpCitizens.nameEn,
        mobile:     gpCitizens.mobile,
        wardNumber: gpCitizens.wardNumber,
        addressMr:  gpCitizens.addressMr,
        aadhaarLast4: gpCitizens.aadhaarLast4,
        householdId: gpCitizens.householdId,
        createdAt:  gpCitizens.createdAt,
      })
      .from(gpCitizens)
      .where(eq(gpCitizens.gpId, gpId))
      .orderBy(asc(gpCitizens.citizenNo))
      .limit(MASTERS_LIST_MAX)
  },

  async listPropertiesForGp(gpId: string) {
    return db
      .select({
        id:            gpProperties.id,
        propertyNo:    gpProperties.propertyNo,
        ownerCitizenNo: gpCitizens.citizenNo,
        propertyType:  gpProperties.propertyType,
        occupantName:  gpProperties.occupantName,
        surveyNumber:  gpProperties.surveyNumber,
        plotOrGat:     gpProperties.plotOrGat,
        lengthFt:      gpProperties.lengthFt,
        widthFt:       gpProperties.widthFt,
        ageBracket:    gpProperties.ageBracket,
        resolutionRef: gpProperties.resolutionRef,
        assessmentDate: gpProperties.assessmentDate,
        lightingTaxPaise: gpProperties.lightingTaxPaise,
        sanitationTaxPaise: gpProperties.sanitationTaxPaise,
        waterTaxPaise: gpProperties.waterTaxPaise,
        createdAt:     gpProperties.createdAt,
      })
      .from(gpProperties)
      .innerJoin(gpCitizens, eq(gpProperties.ownerCitizenId, gpCitizens.id))
      .where(eq(gpProperties.gpId, gpId))
      .orderBy(asc(gpProperties.propertyNo))
      .limit(MASTERS_LIST_MAX)
  },

  async importCitizensFile(gpId: string, buffer: Buffer) {
    const raw = await parseImportBuffer(buffer)
    assertRowCap(raw)
    const result = collectCitizenRowErrors(raw)
    if (!result.ok) {
      throw new ApiError(400, 'Validation failed', result.errors)
    }
    const now = new Date()
    const rows = result.data.map((r) => ({
      gpId,
      citizenNo:      r.citizen_no,
      nameMr:         r.name_mr,
      nameEn:         r.name_en ?? null,
      mobile:         r.mobile,
      wardNumber:     r.ward_number,
      addressMr:      r.address_mr,
      aadhaarLast4:   r.aadhaar_last4 ?? null,
      householdId:    r.household_id ?? null,
      createdAt:      now,
      updatedAt:      now,
    }))

    try {
      await db.insert(gpCitizens).values(rows)
    } catch (e) {
      if (isPostgresUniqueViolation(e)) {
        throw new ApiError(
          400,
          'A citizen_no in this file already exists for this GP. Remove duplicates or use new numbers.'
        )
      }
      throw e
    }
    return { inserted: result.data.length }
  },

  async importPropertiesFile(gpId: string, buffer: Buffer) {
    const raw = await parseImportBuffer(buffer)
    assertRowCap(raw)
    const result = collectPropertyRowErrors(raw)
    if (!result.ok) {
      throw new ApiError(400, 'Validation failed', result.errors)
    }

    const ownerNos = [...new Set(result.data.map((r) => r.owner_citizen_no))]
    const owners   = await db
      .select({ id: gpCitizens.id, citizenNo: gpCitizens.citizenNo })
      .from(gpCitizens)
      .where(
        and(eq(gpCitizens.gpId, gpId), inArray(gpCitizens.citizenNo, ownerNos))
      )

    const ownerMap = new Map(owners.map((o) => [o.citizenNo, o.id]))
    const missing  = ownerNos.filter((k) => !ownerMap.has(k))
    if (missing.length > 0) {
      throw new ApiError(
        400,
        `Unknown owner_citizen_no: ${missing.map(String).join(', ')}. Run citizens bulk import first (same GP).`
      )
    }

    const now   = new Date()
    const props = result.data.map((r) => ({
      gpId,
      ownerCitizenId: ownerMap.get(r.owner_citizen_no) as string,
      propertyNo:     r.property_no,
      surveyNumber:   r.survey_number ?? null,
      plotOrGat:      r.plot_or_gat ?? null,
      propertyType:   r.property_type,
      lengthFt:       r.length_ft ?? null,
      widthFt:        r.width_ft ?? null,
      ageBracket:     r.age_bracket ?? null,
      occupantName:   r.occupant_name,
      resolutionRef:  r.resolution_ref ?? null,
      assessmentDate: r.assessment_date ?? null,
      lightingTaxPaise: r.lighting_tax_paise ?? null,
      sanitationTaxPaise: r.sanitation_tax_paise ?? null,
      waterTaxPaise: r.water_tax_paise ?? null,
      createdAt:      now,
      updatedAt:      now,
    }))

    try {
      await db.insert(gpProperties).values(props)
    } catch (e) {
      if (isPostgresUniqueViolation(e)) {
        throw new ApiError(
          400,
          'A property_no in this file already exists for this GP.'
        )
      }
      throw e
    }
    return { inserted: result.data.length }
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
