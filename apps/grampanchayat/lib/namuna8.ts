import type { Namuna8Property } from '@/types'
import { NAMUNA8_DATA } from '@/lib/data/namuna8-seed'

// ─── Calculations ─────────────────────────────────────────────────────────────

export interface Namuna8Calc {
  areaSqFt: number
  areaSqM: number
  landComponent: number
  buildingComponent: number
  capitalValue: number
  houseTax: number
  diwabatti: number
  arogya: number
  panipatti: number
  totalTax: number
}

export function calcNameuna8(p: Namuna8Property): Namuna8Calc {
  const areaSqFt = p.lengthFt * p.widthFt
  const areaSqM = areaSqFt / 10.764

  const landComponent = areaSqM * p.rrLandRate
  const buildingComponent = areaSqM * p.rrConstructionRate * p.depreciationRate * p.usageWeightage
  const capitalValue = landComponent + buildingComponent

  const houseTax = (capitalValue * p.taxRatePaise) / 1000
  const totalTax = houseTax + p.diwabatti + p.arogya + p.panipatti

  return {
    areaSqFt,
    areaSqM: Math.round(areaSqM * 100) / 100,
    landComponent: Math.round(landComponent * 100) / 100,
    buildingComponent: Math.round(buildingComponent * 100) / 100,
    capitalValue: Math.round(capitalValue * 100) / 100,
    houseTax: Math.round(houseTax * 100) / 100,
    diwabatti: p.diwabatti,
    arogya: p.arogya,
    panipatti: p.panipatti,
    totalTax: Math.round(totalTax * 100) / 100,
  }
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function searchProperties(query: string): Namuna8Property[] {
  const q = query.trim().toLowerCase()
  if (!q) return NAMUNA8_DATA
  return NAMUNA8_DATA.filter(
    p =>
      p.ownerName.toLowerCase().includes(q) ||
      p.occupantName.toLowerCase().includes(q) ||
      p.propertyNo.toLowerCase().includes(q) ||
      p.streetName?.toLowerCase().includes(q),
  )
}

export function getProperty(id: string): Namuna8Property | undefined {
  return NAMUNA8_DATA.find(p => p.id === id)
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatRupees(n: number): string {
  if (n === 0) return '—'
  return '₹' + n.toFixed(2)
}

export function formatNumber(n: number, decimals = 2): string {
  return n.toFixed(decimals)
}
