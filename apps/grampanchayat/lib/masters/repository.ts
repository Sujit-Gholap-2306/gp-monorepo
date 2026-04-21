'use client'

import { getGramDB } from '@/lib/db'
import { DEMO_MASTER_SNAPSHOT } from './demo-seed'
import type { MasterSnapshot, MasterSnapshotEnvelope } from './types'

const ENVELOPE_ID = 'default' as const

export async function getMasterSnapshot(): Promise<MasterSnapshot> {
  const db = await getGramDB()
  const existing = await db.get('masters', ENVELOPE_ID)
  if (existing) return existing.data

  const envelope: MasterSnapshotEnvelope = {
    id: ENVELOPE_ID,
    version: 1,
    data: DEMO_MASTER_SNAPSHOT,
    updatedAt: new Date().toISOString(),
  }
  await db.put('masters', envelope)
  return envelope.data
}

/** Replace entire snapshot (e.g. after import). */
export async function saveMasterSnapshot(data: MasterSnapshot): Promise<void> {
  const db = await getGramDB()
  const existing = await db.get('masters', ENVELOPE_ID)
  const envelope: MasterSnapshotEnvelope = {
    id: ENVELOPE_ID,
    version: (existing?.version ?? 0) + 1,
    data,
    updatedAt: new Date().toISOString(),
  }
  await db.put('masters', envelope)
}
