import { sql } from 'drizzle-orm'
import {
  gpCitizens,
  gpMasterSequences,
  gpProperties,
  gpWaterConnections,
} from '../db/schema/index.ts'
import type { MasterSequenceEntity } from '../db/schema/master-sequences.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import type { db } from '../db/index.ts'

type AllocatedSeqRow = { allocated: number }
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

function numericTextMaxSql(column: typeof gpProperties.propertyNo | typeof gpWaterConnections.consumerNo) {
  return sql<number>`MAX(
    CASE
      WHEN ${column} ~ '^[0-9]+$' THEN (${column})::bigint
      ELSE NULL
    END
  )`
}

export async function allocateMasterNumber(
  tx: DbTransaction,
  gpId: string,
  entity: MasterSequenceEntity
): Promise<number> {
  if (entity === 'citizen') {
    const [seq] = await tx.execute<AllocatedSeqRow>(sql`
      INSERT INTO ${gpMasterSequences} (${gpMasterSequences.gpId}, ${gpMasterSequences.entity}, ${gpMasterSequences.nextNo})
      SELECT ${gpId}, ${entity}, COALESCE(MAX(${gpCitizens.citizenNo}), 0) + 2
      FROM ${gpCitizens}
      WHERE ${gpCitizens.gpId} = ${gpId}
      ON CONFLICT (${gpMasterSequences.gpId}, ${gpMasterSequences.entity}) DO UPDATE
        SET ${gpMasterSequences.nextNo} = GREATEST(${gpMasterSequences.nextNo} + 1, excluded.next_no),
            ${gpMasterSequences.updatedAt} = now()
      RETURNING ${gpMasterSequences.nextNo} - 1 AS allocated
    `)
    if (!seq) throw new ApiError(500, 'Citizen number allocation failed')
    return seq.allocated
  }

  if (entity === 'property') {
    const [seq] = await tx.execute<AllocatedSeqRow>(sql`
      INSERT INTO ${gpMasterSequences} (${gpMasterSequences.gpId}, ${gpMasterSequences.entity}, ${gpMasterSequences.nextNo})
      SELECT ${gpId}, ${entity}, COALESCE(${numericTextMaxSql(gpProperties.propertyNo)}, 0) + 2
      FROM ${gpProperties}
      WHERE ${gpProperties.gpId} = ${gpId}
      ON CONFLICT (${gpMasterSequences.gpId}, ${gpMasterSequences.entity}) DO UPDATE
        SET ${gpMasterSequences.nextNo} = GREATEST(${gpMasterSequences.nextNo} + 1, excluded.next_no),
            ${gpMasterSequences.updatedAt} = now()
      RETURNING ${gpMasterSequences.nextNo} - 1 AS allocated
    `)
    if (!seq) throw new ApiError(500, 'Property number allocation failed')
    return seq.allocated
  }

  const [seq] = await tx.execute<AllocatedSeqRow>(sql`
    INSERT INTO ${gpMasterSequences} (${gpMasterSequences.gpId}, ${gpMasterSequences.entity}, ${gpMasterSequences.nextNo})
    SELECT ${gpId}, ${entity}, COALESCE(${numericTextMaxSql(gpWaterConnections.consumerNo)}, 0) + 2
    FROM ${gpWaterConnections}
    WHERE ${gpWaterConnections.gpId} = ${gpId}
    ON CONFLICT (${gpMasterSequences.gpId}, ${gpMasterSequences.entity}) DO UPDATE
      SET ${gpMasterSequences.nextNo} = GREATEST(${gpMasterSequences.nextNo} + 1, excluded.next_no),
          ${gpMasterSequences.updatedAt} = now()
    RETURNING ${gpMasterSequences.nextNo} - 1 AS allocated
  `)
  if (!seq) throw new ApiError(500, 'Consumer number allocation failed')
  return seq.allocated
}
