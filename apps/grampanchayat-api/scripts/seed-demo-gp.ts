/**
 * Phase 22 demo seed for tax-chain invariant tests.
 *
 * Contract target (idempotent):
 * - tenant: test-gp (onboarding_complete=true)
 * - citizens >= 10
 * - properties >= 10
 * - N09 demands for current FY
 * - receipts >= 3 with exactly one voided
 */

import { and, asc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../src/db/index.ts'
import {
  PROPERTY_TYPE_KEYS,
  gpCitizens,
  gpNamuna10ReceiptLines,
  gpNamuna10Receipts,
  gpNamuna9DemandLines,
  gpNamuna9Demands,
  gpProperties,
  gpPropertyTypeRates,
  gpTenants,
} from '../src/db/schema/index.ts'
import { currentFiscalYear } from '../src/lib/fiscal.ts'
import { namuna9Service } from '../src/services/namuna9.service.ts'
import { namuna10Service } from '../src/services/namuna10.service.ts'

const SUBDOMAIN = 'test-gp'
const ACTOR_ID = '00000000-0000-0000-0000-000000000001'
const NOW = new Date()

type SeedCitizen = {
  citizenNo: number
  nameMr: string
  nameEn: string
  wardNumber: string
  mobile: string
  addressMr: string
}

type SeedProperty = {
  propertyNo: string
  ownerCitizenNo: number
  propertyType: (typeof PROPERTY_TYPE_KEYS)[number]
  lengthFt: number
  widthFt: number
  occupantName: string
  lightingTaxPaise?: number | null
  sanitationTaxPaise?: number | null
}

const SEED_CITIZENS: SeedCitizen[] = [
  { citizenNo: 1, nameMr: 'सोपान पाटील', nameEn: 'Sopan Patil', wardNumber: '1', mobile: '9000000001', addressMr: 'वार्ड 1, घर 1' },
  { citizenNo: 2, nameMr: 'माया शिंदे', nameEn: 'Maya Shinde', wardNumber: '1', mobile: '9000000002', addressMr: 'वार्ड 1, घर 2' },
  { citizenNo: 3, nameMr: 'अनिल जगदाळे', nameEn: 'Anil Jagdale', wardNumber: '2', mobile: '9000000003', addressMr: 'वार्ड 2, घर 1' },
  { citizenNo: 4, nameMr: 'सुमन कदम', nameEn: 'Suman Kadam', wardNumber: '2', mobile: '9000000004', addressMr: 'वार्ड 2, घर 2' },
  { citizenNo: 5, nameMr: 'रमेश भोसले', nameEn: 'Ramesh Bhosale', wardNumber: '3', mobile: '9000000005', addressMr: 'वार्ड 3, घर 1' },
  { citizenNo: 6, nameMr: 'विजया मोहिते', nameEn: 'Vijaya Mohite', wardNumber: '3', mobile: '9000000006', addressMr: 'वार्ड 3, घर 2' },
  { citizenNo: 7, nameMr: 'मंगेश जाधव', nameEn: 'Mangesh Jadhav', wardNumber: '4', mobile: '9000000007', addressMr: 'वार्ड 4, घर 1' },
  { citizenNo: 8, nameMr: 'श्वेता चव्हाण', nameEn: 'Shweta Chavan', wardNumber: '4', mobile: '9000000008', addressMr: 'वार्ड 4, घर 2' },
  { citizenNo: 9, nameMr: 'राजू साळुंखे', nameEn: 'Raju Salunkhe', wardNumber: '5', mobile: '9000000009', addressMr: 'वार्ड 5, घर 1' },
  { citizenNo: 10, nameMr: 'मेघा पवार', nameEn: 'Megha Pawar', wardNumber: '5', mobile: '9000000010', addressMr: 'वार्ड 5, घर 2' },
]

// Coverage rows for INV-1 edge checks:
// - TP-003 uses override lighting tax
// - TP-004 has zero area
// - TP-005 uses a property_type where default lighting is NULL
const SEED_PROPERTIES: SeedProperty[] = [
  { propertyNo: 'TP-001', ownerCitizenNo: 1, propertyType: 'jhopdi_mati', lengthFt: 24, widthFt: 18, occupantName: 'सोपान पाटील' },
  { propertyNo: 'TP-002', ownerCitizenNo: 2, propertyType: 'dagad_vit_mati', lengthFt: 28, widthFt: 20, occupantName: 'माया शिंदे' },
  { propertyNo: 'TP-003', ownerCitizenNo: 3, propertyType: 'dagad_vit_pucca', lengthFt: 32, widthFt: 22, occupantName: 'अनिल जगदाळे', lightingTaxPaise: 777 },
  { propertyNo: 'TP-004', ownerCitizenNo: 4, propertyType: 'navi_rcc', lengthFt: 0, widthFt: 0, occupantName: 'सुमन कदम' },
  { propertyNo: 'TP-005', ownerCitizenNo: 5, propertyType: 'bakhal', lengthFt: 20, widthFt: 16, occupantName: 'रमेश भोसले' },
  { propertyNo: 'TP-006', ownerCitizenNo: 6, propertyType: 'jhopdi_mati', lengthFt: 26, widthFt: 19, occupantName: 'विजया मोहिते' },
  { propertyNo: 'TP-007', ownerCitizenNo: 7, propertyType: 'dagad_vit_mati', lengthFt: 30, widthFt: 21, occupantName: 'मंगेश जाधव' },
  { propertyNo: 'TP-008', ownerCitizenNo: 8, propertyType: 'dagad_vit_pucca', lengthFt: 34, widthFt: 23, occupantName: 'श्वेता चव्हाण' },
  { propertyNo: 'TP-009', ownerCitizenNo: 9, propertyType: 'navi_rcc', lengthFt: 36, widthFt: 24, occupantName: 'राजू साळुंखे' },
  { propertyNo: 'TP-010', ownerCitizenNo: 10, propertyType: 'bakhal', lengthFt: 22, widthFt: 17, occupantName: 'मेघा पवार' },
]

function toPayerName(propertyNo: string): string {
  return `Seed Payer ${propertyNo}`
}

function hashTag(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

async function ensureTenant() {
  await db
    .insert(gpTenants)
    .values({
      nameMr: 'टेस्ट ग्रामपंचायत',
      nameEn: 'Test Gram Panchayat',
      subdomain: SUBDOMAIN,
      onboardingComplete: true,
      tier: 'pro',
      established: NOW,
    })
    .onConflictDoUpdate({
      target: gpTenants.subdomain,
      set: {
        nameMr: 'टेस्ट ग्रामपंचायत',
        nameEn: 'Test Gram Panchayat',
        onboardingComplete: true,
        tier: 'pro',
        updatedAt: NOW,
      },
    })

  const [tenant] = await db
    .select({ id: gpTenants.id })
    .from(gpTenants)
    .where(eq(gpTenants.subdomain, SUBDOMAIN))
    .limit(1)

  if (!tenant) throw new Error('Failed to upsert test tenant')
  return tenant.id
}

async function ensureRates(gpId: string) {
  const rates = [
    { propertyType: 'jhopdi_mati', land: '0.90', construction: '0.95', newConstruction: '1.10', lighting: 120, sanitation: 100 },
    { propertyType: 'dagad_vit_mati', land: '1.10', construction: '1.20', newConstruction: '1.35', lighting: 140, sanitation: 120 },
    { propertyType: 'dagad_vit_pucca', land: '1.30', construction: '1.55', newConstruction: '1.75', lighting: 160, sanitation: 135 },
    { propertyType: 'navi_rcc', land: '1.65', construction: '2.10', newConstruction: '2.35', lighting: 180, sanitation: 150 },
    { propertyType: 'bakhal', land: '0.80', construction: '0.85', newConstruction: '1.00', lighting: null, sanitation: 80 },
  ] as const

  for (const row of rates) {
    await db
      .insert(gpPropertyTypeRates)
      .values({
        gpId,
        propertyType: row.propertyType,
        minRate: '0.50',
        maxRate: '5.00',
        landRatePerSqft: row.land,
        constructionRatePerSqft: row.construction,
        newConstructionRatePerSqft: row.newConstruction,
        defaultLightingPaise: row.lighting,
        defaultSanitationPaise: row.sanitation,
      })
      .onConflictDoUpdate({
        target: [gpPropertyTypeRates.gpId, gpPropertyTypeRates.propertyType],
        set: {
          minRate: '0.50',
          maxRate: '5.00',
          landRatePerSqft: row.land,
          constructionRatePerSqft: row.construction,
          newConstructionRatePerSqft: row.newConstruction,
          defaultLightingPaise: row.lighting,
          defaultSanitationPaise: row.sanitation,
          updatedAt: NOW,
        },
      })
  }
}

async function ensureCitizens(gpId: string) {
  for (const row of SEED_CITIZENS) {
    await db
      .insert(gpCitizens)
      .values({
        gpId,
        citizenNo: row.citizenNo,
        nameMr: row.nameMr,
        nameEn: row.nameEn,
        mobile: row.mobile,
        wardNumber: row.wardNumber,
        addressMr: row.addressMr,
        aadhaarLast4: String(1000 + row.citizenNo),
        householdId: `H-${String(row.citizenNo).padStart(3, '0')}`,
      })
      .onConflictDoUpdate({
        target: [gpCitizens.gpId, gpCitizens.citizenNo],
        set: {
          nameMr: row.nameMr,
          nameEn: row.nameEn,
          mobile: row.mobile,
          wardNumber: row.wardNumber,
          addressMr: row.addressMr,
          updatedAt: NOW,
        },
      })
  }

  return db
    .select({
      id: gpCitizens.id,
      citizenNo: gpCitizens.citizenNo,
    })
    .from(gpCitizens)
    .where(eq(gpCitizens.gpId, gpId))
}

async function ensureProperties(
  gpId: string,
  citizens: Array<{ id: string; citizenNo: number }>
) {
  const citizenIdByNo = new Map(citizens.map((c) => [c.citizenNo, c.id]))

  for (const row of SEED_PROPERTIES) {
    const ownerCitizenId = citizenIdByNo.get(row.ownerCitizenNo)
    if (!ownerCitizenId) {
      throw new Error(`Missing owner citizen for property ${row.propertyNo}`)
    }

    await db
      .insert(gpProperties)
      .values({
        gpId,
        ownerCitizenId,
        propertyNo: row.propertyNo,
        surveyNumber: `S-${hashTag(row.propertyNo)}`,
        plotOrGat: `GAT-${row.ownerCitizenNo}`,
        propertyType: row.propertyType,
        lengthFt: row.lengthFt,
        widthFt: row.widthFt,
        ageBracket: 'after_2010',
        occupantName: row.occupantName,
        resolutionRef: `RES-${row.ownerCitizenNo}`,
        assessmentDate: '2026-04-01',
        lightingTaxPaise: row.lightingTaxPaise ?? null,
        sanitationTaxPaise: row.sanitationTaxPaise ?? null,
      })
      .onConflictDoUpdate({
        target: [gpProperties.gpId, gpProperties.propertyNo],
        set: {
          ownerCitizenId,
          propertyType: row.propertyType,
          lengthFt: row.lengthFt,
          widthFt: row.widthFt,
          occupantName: row.occupantName,
          lightingTaxPaise: row.lightingTaxPaise ?? null,
          sanitationTaxPaise: row.sanitationTaxPaise ?? null,
          updatedAt: NOW,
        },
      })
  }

  return db
    .select({
      id: gpProperties.id,
      propertyNo: gpProperties.propertyNo,
    })
    .from(gpProperties)
    .where(eq(gpProperties.gpId, gpId))
}

async function ensureCurrentFyDemands(gpId: string, fiscalYear: string) {
  // Keep this demo tenant deterministic across FY rollovers.
  const priorDemandIds = await db
    .select({ id: gpNamuna9Demands.id })
    .from(gpNamuna9Demands)
    .where(and(
      eq(gpNamuna9Demands.gpId, gpId),
      sql`${gpNamuna9Demands.fiscalYear} <> ${fiscalYear}`
    ))

  if (priorDemandIds.length > 0) {
    await db
      .delete(gpNamuna9Demands)
      .where(inArray(gpNamuna9Demands.id, priorDemandIds.map((r) => r.id)))
  }

  return namuna9Service.generate({
    gpId,
    generatedBy: ACTOR_ID,
    fiscalYear,
  })
}

async function getDemandLinesForProperty(gpId: string, fiscalYear: string, propertyId: string) {
  return db.execute<{
    demand_line_id: string
    tax_head: string
    total_due_paise: number | string
  }>(sql`
    SELECT
      dl.id AS demand_line_id,
      dl.tax_head,
      dl.total_due_paise
    FROM gp_namuna9_demand_lines dl
    JOIN gp_namuna9_demands d ON d.id = dl.demand_id
    WHERE d.gp_id = ${gpId}
      AND d.fiscal_year = ${fiscalYear}
      AND d.property_id = ${propertyId}
    ORDER BY dl.tax_head
  `)
}

async function findReceiptByReference(gpId: string, fiscalYear: string, reference: string) {
  const [row] = await db
    .select({
      id: gpNamuna10Receipts.id,
      isVoid: gpNamuna10Receipts.isVoid,
    })
    .from(gpNamuna10Receipts)
    .where(and(
      eq(gpNamuna10Receipts.gpId, gpId),
      eq(gpNamuna10Receipts.fiscalYear, fiscalYear),
      eq(gpNamuna10Receipts.reference, reference)
    ))
    .limit(1)
  return row ?? null
}

async function ensureReceipts(gpId: string, fiscalYear: string, properties: Array<{ id: string; propertyNo: string }>) {
  const pick = (propertyNo: string) => {
    const property = properties.find((p) => p.propertyNo === propertyNo)
    if (!property) throw new Error(`Missing property ${propertyNo}`)
    return property
  }

  const partialProperty = pick('TP-001')
  const fullProperty = pick('TP-002')
  const voidProperty = pick('TP-003')

  const partialRef = 'SEED-N10-PARTIAL'
  const fullRef = 'SEED-N10-FULL'
  const voidRef = 'SEED-N10-VOID'

  const partialExisting = await findReceiptByReference(gpId, fiscalYear, partialRef)
  if (!partialExisting) {
    const lines = await getDemandLinesForProperty(gpId, fiscalYear, partialProperty.id)
    const house = lines.find((l) => l.tax_head === 'house')
    if (!house) throw new Error('Missing house line for partial receipt property')
    const due = Number(house.total_due_paise)
    const amountPaise = Math.max(1, Math.floor(due / 2))

    await namuna10Service.create(gpId, ACTOR_ID, {
      propertyId: partialProperty.id,
      payerName: toPayerName(partialProperty.propertyNo),
      fiscalYear,
      paidAt: NOW.toISOString(),
      paymentMode: 'cash',
      reference: partialRef,
      lines: [{ demandLineId: house.demand_line_id, amountPaise }],
      discountPaise: 0,
      lateFeePaise: 0,
      noticeFeePaise: 0,
      otherPaise: 0,
    })
  }

  const fullExisting = await findReceiptByReference(gpId, fiscalYear, fullRef)
  if (!fullExisting) {
    const lines = await getDemandLinesForProperty(gpId, fiscalYear, fullProperty.id)
    await namuna10Service.create(gpId, ACTOR_ID, {
      propertyId: fullProperty.id,
      payerName: toPayerName(fullProperty.propertyNo),
      fiscalYear,
      paidAt: NOW.toISOString(),
      paymentMode: 'upi',
      reference: fullRef,
      lines: lines.map((line) => ({
        demandLineId: line.demand_line_id,
        amountPaise: Number(line.total_due_paise),
      })),
      discountPaise: 0,
      lateFeePaise: 0,
      noticeFeePaise: 0,
      otherPaise: 0,
    })
  }

  const voidExisting = await findReceiptByReference(gpId, fiscalYear, voidRef)
  if (!voidExisting) {
    const lines = await getDemandLinesForProperty(gpId, fiscalYear, voidProperty.id)
    const receipt = await namuna10Service.create(gpId, ACTOR_ID, {
      propertyId: voidProperty.id,
      payerName: toPayerName(voidProperty.propertyNo),
      fiscalYear,
      paidAt: NOW.toISOString(),
      paymentMode: 'cash',
      reference: voidRef,
      lines: lines.map((line) => ({
        demandLineId: line.demand_line_id,
        amountPaise: Number(line.total_due_paise),
      })),
      discountPaise: 0,
      lateFeePaise: 0,
      noticeFeePaise: 0,
      otherPaise: 0,
    })
    await namuna10Service.voidReceipt(gpId, ACTOR_ID, receipt.id, 'Seeded void case for INV-5')
  } else if (!voidExisting.isVoid) {
    await namuna10Service.voidReceipt(gpId, ACTOR_ID, voidExisting.id, 'Seeded void case for INV-5')
  }
}

async function printSummary(gpId: string, fiscalYear: string) {
  const [summary] = await db.execute<{
    citizens: number | string
    properties: number | string
    demands: number | string
    demand_lines: number | string
    receipts: number | string
    voided_receipts: number | string
    n05_entries: number | string
  }>(sql`
    SELECT
      (SELECT COUNT(*) FROM gp_citizens c WHERE c.gp_id = ${gpId})::int AS citizens,
      (SELECT COUNT(*) FROM gp_properties p WHERE p.gp_id = ${gpId})::int AS properties,
      (SELECT COUNT(*) FROM gp_namuna9_demands d WHERE d.gp_id = ${gpId} AND d.fiscal_year = ${fiscalYear})::int AS demands,
      (
        SELECT COUNT(*)
        FROM gp_namuna9_demand_lines dl
        JOIN gp_namuna9_demands d ON d.id = dl.demand_id
        WHERE d.gp_id = ${gpId} AND d.fiscal_year = ${fiscalYear}
      )::int AS demand_lines,
      (SELECT COUNT(*) FROM gp_namuna10_receipts r WHERE r.gp_id = ${gpId} AND r.fiscal_year = ${fiscalYear})::int AS receipts,
      (SELECT COUNT(*) FROM gp_namuna10_receipts r WHERE r.gp_id = ${gpId} AND r.fiscal_year = ${fiscalYear} AND r.is_void = true)::int AS voided_receipts,
      (SELECT COUNT(*) FROM gp_namuna05_cashbook_entries e WHERE e.gp_id = ${gpId} AND e.fiscal_year = ${fiscalYear})::int AS n05_entries
  `)

  console.log(`seed:demo complete for ${SUBDOMAIN} (${gpId})`)
  console.log(`fiscalYear=${fiscalYear}`)
  console.log(`citizens=${summary.citizens} properties=${summary.properties}`)
  console.log(`n09_headers=${summary.demands} n09_lines=${summary.demand_lines}`)
  console.log(`n10_receipts=${summary.receipts} voided=${summary.voided_receipts}`)
  console.log(`n05_entries=${summary.n05_entries}`)
}

async function main() {
  const fiscalYear = currentFiscalYear()
  const gpId = await ensureTenant()
  await ensureRates(gpId)
  const citizens = await ensureCitizens(gpId)
  const properties = await ensureProperties(gpId, citizens)
  await ensureCurrentFyDemands(gpId, fiscalYear)
  await ensureReceipts(gpId, fiscalYear, properties)
  await printSummary(gpId, fiscalYear)
}

main().catch((error) => {
  console.error('seed:demo failed', error)
  process.exit(1)
})
