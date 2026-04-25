import type { Namuna8ListItem } from '@/lib/api/namuna8'

export type Namuna8PrintDraft = {
  ownerNameMr?: string
  ownerNameEn?: string
  occupantName?: string
  housePaise?: number
  lightingPaise?: number
  sanitationPaise?: number
  waterPaise?: number
  notes?: string
}

export type Namuna8PrintPayload = Namuna8ListItem & {
  notes?: string
}

function parseNumber(input: unknown, fallback: number): number {
  if (typeof input === 'number' && Number.isFinite(input)) return Math.max(0, Math.round(input))
  if (typeof input === 'string') {
    const parsed = Number(input)
    if (Number.isFinite(parsed)) return Math.max(0, Math.round(parsed))
  }
  return fallback
}

export function applyNamuna8Draft(base: Namuna8ListItem, draft: Namuna8PrintDraft | null): Namuna8PrintPayload {
  if (!draft) return base

  const housePaise = parseNumber(draft.housePaise, base.heads.housePaise)
  const lightingPaise = parseNumber(draft.lightingPaise, base.heads.lightingPaise)
  const sanitationPaise = parseNumber(draft.sanitationPaise, base.heads.sanitationPaise)
  const waterPaise = parseNumber(draft.waterPaise, base.heads.waterPaise)
  const totalPaise = housePaise + lightingPaise + sanitationPaise + waterPaise

  return {
    ...base,
    occupantName: draft.occupantName?.trim() || base.occupantName,
    owner: {
      ...base.owner,
      nameMr: draft.ownerNameMr?.trim() || base.owner.nameMr,
      nameEn: draft.ownerNameEn?.trim() || base.owner.nameEn,
    },
    heads: {
      ...base.heads,
      housePaise,
      lightingPaise,
      sanitationPaise,
      waterPaise,
      totalPaise,
      houseRupees: housePaise / 100,
      totalRupees: totalPaise / 100,
    },
    notes: draft.notes?.trim() || undefined,
  }
}
