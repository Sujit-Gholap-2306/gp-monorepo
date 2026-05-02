import { and, asc, eq, ilike, or } from 'drizzle-orm'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { db } from '../db/index.ts'
import { gpCitizens, gpWaterConnections } from '../db/schema/index.ts'
import type {
  CreateWaterConnectionBody,
  SetWaterConnectionStatusBody,
  UpdateWaterConnectionBody,
  WaterConnectionListQuery,
} from '../types/water-connections.dto.ts'

function isPostgresUniqueViolation(e: unknown): boolean {
  if (e && typeof e === 'object' && 'code' in e) {
    return (e as { code: string }).code === '23505'
  }
  return false
}

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
        pipeSizeMm: gpWaterConnections.pipeSizeMm,
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
        pipeSizeMm: gpWaterConnections.pipeSizeMm,
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
      const [created] = await db
        .insert(gpWaterConnections)
        .values({
          gpId,
          citizenId: body.citizenId,
          consumerNo: body.consumerNo,
          connectionType: body.connectionType,
          pipeSizeMm: body.pipeSizeMm,
          status: 'active',
          connectedAt: body.connectedAt ?? null,
          notes: body.notes ?? null,
        })
        .returning({ id: gpWaterConnections.id })

      if (!created) throw new ApiError(500, 'Failed to create water connection')
      return this.getById(gpId, created.id)
    } catch (e) {
      if (isPostgresUniqueViolation(e)) {
        throw new ApiError(409, 'consumer_no or citizen already has a water connection in this GP')
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
          consumerNo: body.consumerNo,
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
        throw new ApiError(409, 'consumer_no already exists in this GP')
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
