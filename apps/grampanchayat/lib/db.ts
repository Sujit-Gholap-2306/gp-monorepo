'use client'

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Utara } from '@/types'

interface GramDB extends DBSchema {
  utaras: {
    key: string
    value: Utara
    indexes: {
      by_village: string
      by_status: string
      by_owner: string
    }
  }
}

const DB_NAME = 'grampanchayat-db'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<GramDB>> | null = null

function getDB(): Promise<IDBPDatabase<GramDB>> {
  if (!dbPromise) {
    dbPromise = openDB<GramDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('utaras', { keyPath: 'id' })
        store.createIndex('by_village', 'village')
        store.createIndex('by_status', 'status')
        store.createIndex('by_owner', 'ownerName')
      },
    })
  }
  return dbPromise
}

export async function getAllUtaras(): Promise<Utara[]> {
  const db = await getDB()
  const all = await db.getAll('utaras')
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getUtara(id: string): Promise<Utara | undefined> {
  const db = await getDB()
  return db.get('utaras', id)
}

export async function saveUtara(utara: Utara): Promise<void> {
  const db = await getDB()
  await db.put('utaras', utara)
}

export async function deleteUtara(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('utaras', id)
}

export async function searchUtaras(query: string): Promise<Utara[]> {
  const all = await getAllUtaras()
  const q = query.toLowerCase().trim()
  if (!q) return all
  return all.filter(
    u =>
      u.ownerName.toLowerCase().includes(q) ||
      u.surveyNumber.toLowerCase().includes(q) ||
      u.village.toLowerCase().includes(q) ||
      u.khataNumber?.toLowerCase().includes(q),
  )
}
