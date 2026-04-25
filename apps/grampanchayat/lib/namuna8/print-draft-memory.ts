'use client'

import type { Namuna8PrintDraft } from './print-draft'

const drafts = new Map<string, Namuna8PrintDraft>()

export function setNamuna8PrintDraft(propertyId: string, draft: Namuna8PrintDraft) {
  drafts.set(propertyId, draft)
}

export function getNamuna8PrintDraft(propertyId: string): Namuna8PrintDraft | null {
  return drafts.get(propertyId) ?? null
}
