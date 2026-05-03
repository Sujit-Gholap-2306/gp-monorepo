import { and, asc, eq, ilike, or, sql } from 'drizzle-orm'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { db } from '../db/index.ts'
import { gpCitizens, gpWaterConnections } from '../db/schema/index.ts'
import { allocateMasterNumber } from '../lib/master-sequences.ts'
import { isPostgresUniqueViolation } from '../lib/db-helpers.ts'
import type {
  CreateWaterConnectionBody,
  SetWaterConnectionStatusBody,
  UpdateWaterConnectionBody,
  WaterConnectionListQuery,
} from '../types/water-connections.dto.ts'

async function assertCitizenBelongsToGp(gpId: string, citizenId: string): Promise<void> {
  const [citizen] = await db
    .select({ id: gpCitizens.id })
    .from(gpCitizens)
    .where(and(eq(gpCitizens.id, citizenId), eq(gpCitizens.gpId, gpId)))
    .limit(1)
  if (!citizen) throw new ApiError(422, 'Citizen does not belong to this GP')
}

export const waterConnectionsService = {
  async list(gpId: string, filters: WaterConnectionListQuery) {
    const conditions = [eq(gpWaterConnections.gpId, gpId)]

    if (filters.status) {
      conditions.push(eq(gpWaterConnections.status, filters.status))
    }
    if (filters.connectionType) {
      conditions.push(eq(gpWaterConnections.connectionType, filters.connectionType))
    }
    if (filters.citizenNo) {
      conditions.push(eq(gpCitizens.citizenNo, filters.citizenNo))
    }
    if (filters.q) {
      const q = `%${filters.q}%`
      conditions.push(
        or(
          ilike(gpWaterConnections.consumerNo, q),
          ilike(gpCitizens.nameMr, q),
          ilike(gpCitizens.nameEn, q)
        )!
      )
    }

    const rows = await db
      .select({
        id: gpWaterConnections.id,
        consumerNo: gpWaterConnections.consumerNo,
        connectionType: gpWaterConnections.connectionType,
        pipeSizeInch: sql<number>`${gpWaterConnections.pipeSizeInch}::float8`,
        status: gpWaterConnections.status,
        connectedAt: gpWaterConnections.connectedAt,
        notes: gpWaterConnections.notes,
        createdAt: gpWaterConnections.createdAt,
        updatedAt: gpWaterConnections.updatedAt,
        citizen: {
          id: gpCitizens.id,
          citizenNo: gpCitizens.citizenNo,
          nameMr: gpCitizens.nameMr,
          nameEn: gpCitizens.nameEn,
          wardNumber: gpCitizens.wardNumber,
        },
      })
      .from(gpWaterConnections)
      .innerJoin(gpCitizens, eq(gpWaterConnections.citizenId, gpCitizens.id))
      .where(and(...conditions))
      .orderBy(asc(gpWaterConnections.consumerNo))

    return { items: rows, count: rows.length }
  },

  async getById(gpId: string, id: string) {
    const [row] = await db
      .select({
        id: gpWaterConnections.id,
        consumerNo: gpWaterConnections.consumerNo,
        connectionType: gpWaterConnections.connectionType,
        pipeSizeInch: sql<number>`${gpWaterConnections.pipeSizeInch}::float8`,
        status: gpWaterConnections.status,
        connectedAt: gpWaterConnections.connectedAt,
        notes: gpWaterConnections.notes,
        createdAt: gpWaterConnections.createdAt,
        updatedAt: gpWaterConnections.updatedAt,
        citizen: {
          id: gpCitizens.id,
          citizenNo: gpCitizens.citizenNo,
          nameMr: gpCitizens.nameMr,
          nameEn: gpCitizens.nameEn,
          wardNumber: gpCitizens.wardNumber,
        },
      })
      .from(gpWaterConnections)
      .innerJoin(gpCitizens, eq(gpWaterConnections.citizenId, gpCitizens.id))
      .where(and(eq(gpWaterConnections.id, id), eq(gpWaterConnections.gpId, gpId)))
      .limit(1)

    if (!row) throw new ApiError(404, 'Water connection not found')
    return row
  },

  async create(gpId: string, body: CreateWaterConnectionBody) {
    await assertCitizenBelongsToGp(gpId, body.citizenId)
    try {
      const createdId = await db.transaction(async (tx) => {
        const consumerNo = await allocateMasterNumber(tx, gpId, 'water_connection')
        const [created] = await tx
          .insert(gpWaterConnections)
          .values({
            gpId,
            citizenId: body.citizenId,
            consumerNo: String(consumerNo),
            connectionType: body.connectionType,
            pipeSizeInch: String(body.pipeSizeInch),
            status: 'active',
            connectedAt: body.connectedAt ?? null,
            notes: body.notes ?? null,
          })
          .returning({ id: gpWaterConnections.id })

        if (!created) throw new ApiError(500, 'Failed to create water connection')
        return created.id
      })

      return this.getById(gpId, createdId)
    } catch (e) {
      if (isPostgresUniqueViolation(e)) {
        throw new ApiError(409, 'Water connection already exists for this citizen or consumer number')
      }
      throw e
    }
  },

  async update(gpId: string, id: string, body: UpdateWaterConnectionBody) {
    if (Object.keys(body).length === 0) {
      return this.getById(gpId, id)
    }

    try {
      const [updated] = await db
        .update(gpWaterConnections)
        .set({
          connectedAt: body.connectedAt,
          notes: body.notes,
          updatedAt: new Date(),
        })
        .where(and(eq(gpWaterConnections.id, id), eq(gpWaterConnections.gpId, gpId)))
        .returning({ id: gpWaterConnections.id })

      if (!updated) throw new ApiError(404, 'Water connection not found')
      return this.getById(gpId, updated.id)
    } catch (e) {
      if (isPostgresUniqueViolation(e)) {
        throw new ApiError(409, 'Water connection update conflicted with an existing record')
      }
      throw e
    }
  },

  async setStatus(gpId: string, id: string, body: SetWaterConnectionStatusBody) {
    const [updated] = await db
      .update(gpWaterConnections)
      .set({
        status: body.status,
        updatedAt: new Date(),
      })
      .where(and(eq(gpWaterConnections.id, id), eq(gpWaterConnections.gpId, gpId)))
      .returning({ id: gpWaterConnections.id })

    if (!updated) throw new ApiError(404, 'Water connection not found')
    return this.getById(gpId, updated.id)
  },
}
