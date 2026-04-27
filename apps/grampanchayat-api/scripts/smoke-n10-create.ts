/**
 * Staged smoke test — N10 create (Phase 15)
 *
 * Run each stage independently, check DB via MCP between stages.
 *
 * Usage:
 *   npx tsx apps/grampanchayat-api/scripts/smoke-n10-create.ts --stage 1
 *   npx tsx apps/grampanchayat-api/scripts/smoke-n10-create.ts --stage 2
 *   ... etc
 *
 * Stages:
 *   1 — enable onboarding (setup)
 *   2 — gate + error cases (no DB writes)
 *   3 — partial payment (first receipt)
 *   4 — remaining payment (second receipt, fully paid)
 *   5 — print receipt IDs for MCP verification
 *   6 — overpayment blocked after full payment
 *   7 — cleanup + disable onboarding
 */

import assert from 'node:assert/strict'
import { eq, inArray, sql } from 'drizzle-orm'
import { db } from '../src/db/index.ts'
import {
  gpNamuna10ReceiptLines,
  gpNamuna10Receipts,
  gpNamuna9DemandLines,
  gpTenants,
} from '../src/db/schema/index.ts'
import { currentFiscalYear } from '../src/lib/fiscal.ts'
import { namuna10Service } from '../src/services/namuna10.service.ts'

// ─── Constants (verified from DB 2026-04-26) ───────────────────────────────
const GP_ID         = '7dcd9da3-f806-4aab-a3f4-993129a41eed'  // nashik-gp-verify-1
const PROPERTY_ID   = '55d16e6b-1c48-4931-8467-09a78605a1a6'  // P-001
const HOUSE_LINE_ID = '3a7590e2-6aee-444a-bb38-78a1d82bfd1b'  // house tax line
const HOUSE_DUE     = 13671                                     // paise
const FY            = currentFiscalYear()
const ACTOR_ID      = '00000000-0000-0000-0000-000000000001'
// ───────────────────────────────────────────────────────────────────────────

// Persisted between stages via a local state file
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const STATE_FILE = '/tmp/smoke-n10-state.json'

function loadState(): { receiptIds: string[] } {
  if (!existsSync(STATE_FILE)) return { receiptIds: [] }
  return JSON.parse(readFileSync(STATE_FILE, 'utf-8'))
}

function saveState(state: { receiptIds: string[] }) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
}

// ─── Stages ────────────────────────────────────────────────────────────────

async function stage1_setup() {
  await db.update(gpTenants).set({ onboardingComplete: true }).where(eq(gpTenants.id, GP_ID))
  console.log('✓ onboarding_complete = true')
  console.log('\nNow check via MCP:')
  console.log('  SELECT onboarding_complete FROM gp_tenants WHERE id = \'7dcd9da3-f806-4aab-a3f4-993129a41eed\';')
}

async function stage2_gate_errors() {
  // Case A: onboarding gate (not applicable now — we enabled it, test wrong FY instead)
  console.log('Case A — wrong fiscal year blocked')
  try {
    await namuna10Service.create(GP_ID, ACTOR_ID, {
      propertyId: PROPERTY_ID, payerName: 'Smoke', fiscalYear: '2020-21',
      paidAt: new Date().toISOString(), paymentMode: 'cash',
      lines: [{ demandLineId: HOUSE_LINE_ID, amountPaise: 100 }],
      discountPaise: 0, lateFeePaise: 0, noticeFeePaise: 0, otherPaise: 0,
    })
    console.log('  ✗ should have thrown 422')
  } catch (err) {
    if (err instanceof Error && err.message.includes('आर्थिक वर्ष')) {
      console.log(`  ✓ 422 for wrong FY`)
    } else {
      console.log(`  ✗ wrong error: ${err instanceof Error ? err.message : err}`)
    }
  }

  // Case B: overpayment
  console.log('Case B — overpayment blocked')
  try {
    await namuna10Service.create(GP_ID, ACTOR_ID, {
      propertyId: PROPERTY_ID, payerName: 'Smoke', fiscalYear: FY,
      paidAt: new Date().toISOString(), paymentMode: 'cash',
      lines: [{ demandLineId: HOUSE_LINE_ID, amountPaise: HOUSE_DUE + 1 }],
      discountPaise: 0, lateFeePaise: 0, noticeFeePaise: 0, otherPaise: 0,
    })
    console.log('  ✗ should have thrown 422')
  } catch (err) {
    if (err instanceof Error && err.message.includes('amountPaise')) {
      console.log(`  ✓ 422 overpayment (${HOUSE_DUE + 1} > ${HOUSE_DUE})`)
    } else {
      console.log(`  ✗ wrong error: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log('\n✓ No DB writes in this stage. Nothing to check via MCP.')
}

async function stage3_partial_payment() {
  const partial = Math.floor(HOUSE_DUE / 2)
  const result = await namuna10Service.create(GP_ID, ACTOR_ID, {
    propertyId: PROPERTY_ID, payerName: 'Ramesh Mane', fiscalYear: FY,
    paidAt: new Date().toISOString(), paymentMode: 'cash',
    lines: [{ demandLineId: HOUSE_LINE_ID, amountPaise: partial }],
    discountPaise: 0, lateFeePaise: 0, noticeFeePaise: 0, otherPaise: 0,
  })

  const state = loadState()
  state.receiptIds.push(result.id)
  saveState(state)

  console.log(`✓ Receipt created: ${result.receiptNo} (id: ${result.id})`)
  console.log(`  Partial paid: ₹${partial / 100} of ₹${HOUSE_DUE / 100}`)
  console.log('\nCheck via MCP:')
  console.log(`  SELECT paid_paise, total_due_paise, status FROM gp_namuna9_demand_lines WHERE id = '${HOUSE_LINE_ID}';`)
  console.log(`  -- expect: paid_paise = ${partial}, total_due_paise = ${HOUSE_DUE - partial}, status = 'partial'`)
}

async function stage4_remaining_payment() {
  const firstPaid = Math.floor(HOUSE_DUE / 2)
  const remaining = HOUSE_DUE - firstPaid

  const result = await namuna10Service.create(GP_ID, ACTOR_ID, {
    propertyId: PROPERTY_ID, payerName: 'Ramesh Mane', fiscalYear: FY,
    paidAt: new Date().toISOString(), paymentMode: 'upi', reference: 'UPI-SMOKE-001',
    lines: [{ demandLineId: HOUSE_LINE_ID, amountPaise: remaining }],
    discountPaise: 0, lateFeePaise: 0, noticeFeePaise: 0, otherPaise: 0,
  })

  const state = loadState()
  state.receiptIds.push(result.id)
  saveState(state)

  console.log(`✓ Receipt created: ${result.receiptNo} (id: ${result.id})`)
  console.log(`  Remaining paid: ₹${remaining / 100} — should be fully paid now`)
  console.log('\nCheck via MCP:')
  console.log(`  SELECT paid_paise, total_due_paise, status FROM gp_namuna9_demand_lines WHERE id = '${HOUSE_LINE_ID}';`)
  console.log(`  -- expect: paid_paise = ${HOUSE_DUE}, total_due_paise = 0, status = 'paid'`)
  const ids = state.receiptIds.map(id => `'${id}'`).join(', ')
  console.log(`\n  SELECT receipt_id, is_void, lines_total_paise, total_paise FROM gp_namuna10_receipt_totals WHERE receipt_id IN (${ids});`)
  console.log(`  -- expect 2 rows, neither voided, totals = ${firstPaid} and ${remaining}`)
}

async function stage5_print_ids() {
  const state = loadState()
  console.log('Receipt IDs created in this smoke run:')
  state.receiptIds.forEach((id, i) => console.log(`  [${i + 1}] ${id}`))
  console.log('\nMCP queries to run:')
  const ids = state.receiptIds.map(id => `'${id}'`).join(', ')
  console.log(`\n-- INV-4: no orphan receipt lines`)
  console.log(`SELECT COUNT(*) AS orphan_count FROM gp_namuna10_receipt_lines rl LEFT JOIN gp_namuna9_demand_lines dl ON dl.id = rl.demand_line_id WHERE rl.receipt_id IN (${ids}) AND dl.id IS NULL;`)
  console.log(`-- expect: 0`)
  console.log(`\n-- demand_line_split view`)
  console.log(`SELECT * FROM gp_namuna9_demand_line_split WHERE demand_line_id = '${HOUSE_LINE_ID}';`)
  console.log(`-- expect: arrears_outstanding = 0, current_outstanding = 0`)
  console.log(`\n-- receipt sequence`)
  console.log(`SELECT next_no FROM gp_receipt_sequences WHERE gp_id = '${GP_ID}' AND fiscal_year = '${FY}';`)
  console.log(`-- expect: next_no = 3 (2 receipts created)`)
}

async function stage6_overpayment_after_full() {
  console.log('Case — overpayment after full payment blocked')
  try {
    await namuna10Service.create(GP_ID, ACTOR_ID, {
      propertyId: PROPERTY_ID, payerName: 'Smoke', fiscalYear: FY,
      paidAt: new Date().toISOString(), paymentMode: 'cash',
      lines: [{ demandLineId: HOUSE_LINE_ID, amountPaise: 1 }],
      discountPaise: 0, lateFeePaise: 0, noticeFeePaise: 0, otherPaise: 0,
    })
    console.log('  ✗ should have thrown 422')
  } catch (err) {
    if (err instanceof Error && err.message.includes('amountPaise')) {
      console.log('  ✓ 422 blocked — total_due = 0, cannot pay 1 paise more')
    } else {
      console.log(`  ✗ wrong error: ${err instanceof Error ? err.message : err}`)
    }
  }
}

async function stage7_cleanup() {
  const state = loadState()

  if (state.receiptIds.length > 0) {
    await db.delete(gpNamuna10ReceiptLines).where(inArray(gpNamuna10ReceiptLines.receiptId, state.receiptIds))
    await db.delete(gpNamuna10Receipts).where(inArray(gpNamuna10Receipts.id, state.receiptIds))
    console.log(`✓ Deleted ${state.receiptIds.length} receipt(s) + their lines`)
  }

  await db.update(gpNamuna9DemandLines).set({ paidPaise: 0 }).where(eq(gpNamuna9DemandLines.id, HOUSE_LINE_ID))
  console.log('✓ Restored paid_paise = 0 on house line')

  await db.update(gpTenants).set({ onboardingComplete: false }).where(eq(gpTenants.id, GP_ID))
  console.log('✓ onboarding_complete = false')

  // Reset sequence to 1 (test-only tenant, safe to reset)
  await db.execute(sql`
    UPDATE gp_receipt_sequences SET next_no = 1, updated_at = now()
    WHERE gp_id = ${GP_ID} AND fiscal_year = ${FY}
  `)
  console.log('✓ receipt sequence reset to 1')

  writeFileSync(STATE_FILE, JSON.stringify({ receiptIds: [] }, null, 2))
  console.log('✓ state file cleared')
  console.log('\nVerify cleanup via MCP:')
  console.log(`  SELECT paid_paise, status FROM gp_namuna9_demand_lines WHERE id = '${HOUSE_LINE_ID}';`)
  console.log(`  SELECT COUNT(*) FROM gp_namuna10_receipts WHERE gp_id = '${GP_ID}' AND fiscal_year = '${FY}';`)
}

// ─── Main ──────────────────────────────────────────────────────────────────

const stage = process.argv.find(a => a.startsWith('--stage='))?.split('=')[1]
  ?? process.argv[process.argv.indexOf('--stage') + 1]

if (!stage) {
  console.error('Usage: npx tsx smoke-n10-create.ts --stage <1-7>')
  process.exit(1)
}

const stages: Record<string, () => Promise<void>> = {
  '1': stage1_setup,
  '2': stage2_gate_errors,
  '3': stage3_partial_payment,
  '4': stage4_remaining_payment,
  '5': stage5_print_ids,
  '6': stage6_overpayment_after_full,
  '7': stage7_cleanup,
}

const fn = stages[stage]
if (!fn) {
  console.error(`Unknown stage: ${stage}. Valid: 1-7`)
  process.exit(1)
}

console.log(`\n── Stage ${stage} ─────────────────────────────────────`)
fn()
  .then(() => { console.log(); process.exit(0) })
  .catch(err => { console.error('Stage failed:', err); process.exit(1) })
