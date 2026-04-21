---
title: GP Demo Prototype — Design Spec
date: 2026-04-18
scope: Tax chain (N08→N09→N10) + Cash Book auto-link (N05→N06)
audience: Gram Sevak / Sarpanch
tags: [prototype, demo, tax, cash-book, namune]
---

# GP Demo Prototype — Design Spec

Single-GP demo showing the Maharashtra GP tax collection chain with automatic accounting linkage. Built to create a "wow" moment for actual Gram Sevaks — not a pitch deck, a working tool.

---

## Out of Scope (explicitly deferred)

- Authentication / login
- Multi-GP tenancy
- N01 Budget, N21 Payroll, N20 Works, N26 Monthly Returns
- Online citizen payment gateway
- Admin / super-admin panel
- GP onboarding / self-setup wizard

---

## Demo Strategy

All setup data is pre-seeded. The demo starts at the Dashboard — no login, no configuration screens. Seed GP: **"Ramoshi Gram Panchayat, Pune Taluka, Pune District"** with 60 citizens, 60 properties, and realistic prior-year arrears.

---

## 5-Act Demo Journey

### Act 1 — Dashboard
GP summary at a glance:
- Total properties assessed
- Outstanding demand (current year + arrears)
- Collections this month
- Quick-action buttons: Add Citizen, Add Property, Collect Payment

### Act 2 — Citizens & Properties
- Citizens list: search by name / Aadhaar / mobile
- Properties list: linked to citizen, type, survey number, ward
- Live-add one property in ~20 seconds to show simplicity

### Act 3 — Tax Assessment (N08)
- Assessment table: property-wise tax type, rate, calculated annual demand
- "Generate N08 Register" → Marathi PDF of the assessment register

### Act 4 — Demand Generation (N09) ← Primary wow moment
- "Generate Demands for 2025-26" → all 60 demand records created instantly
- Prior-year arrears auto-carried forward per property
- Select any property → N09-Ka demand notice PDF in Marathi with QR code
- "Download All Notices" → batch PDF (replaces weeks of handwriting)

### Act 5 — Collection + Chain (N10 → N05 → N06) ← Differentiator
- Search citizen by name or mobile
- Show outstanding demand + arrear breakdown
- Enter amount paid → receipt issued (Marathi, pre-numbered, QR code)
- Cash Book (N05) entry auto-created under correct budget head
- Classified Register (N06) updated for the month
- Three registers updated from one action — no competitor does this

---

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Dashboard | `/` | GP summary, quick actions |
| Citizens | `/citizens` | List, search, add |
| Citizen Detail | `/citizens/[id]` | Profile, linked properties, payment history |
| Properties | `/properties` | List, search, filter by ward/type |
| Property Detail | `/properties/[id]` | Details, assessment, demand history |
| Tax Assessment | `/assessment` | N08 — property-wise assessment table |
| Tax Demand | `/demand` | N09 — demand register with arrear tracking |
| Collect Payment | `/collect` | N10 — search citizen, enter payment, issue receipt |
| Receipt View | `/receipts/[id]` | N10 receipt with QR (printable) |
| Receipt Verify | `/receipts/verify/[qr_token]` | QR scan landing — shows receipt summary (public, no auth) |
| Cash Book | `/cashbook` | N05 — auto-populated entries view |
| Classified Register | `/classified` | N06 — monthly head-wise receipt summary |

---

## Data Model

### Masters (all pre-seeded for demo)

```
gp_profile          id, name_mr, name_en, district, taluka, ps_name,
                    sarpanch_name, gram_sevak_name, address

financial_year      id, label, start_date, end_date, status

assessment_year     id, label, resolution_no, revision_date, status

account_head        id, code, name_mr, name_en, category, sub_category,
                    is_tax_head

bank_account        id, bank_name, branch, account_no, ifsc

opening_balance     id, fy_id, account_head_id, amount
```

### Citizen & Property

```
citizen             id, name_mr, name_en, aadhaar, mobile, ward_no, address

property            id, property_no, citizen_id, survey_no, ward_no,
                    type, area_sqft, construction_year, usage, status
```

### Tax Chain (N08 → N09 → N10)

```
tax_rate            id, assessment_year_id, property_type, tax_type,
                    rate_pct, resolution_no
                    -- tax_type: house / water / sanitation / lighting

tax_assessment      id, property_id, assessment_year_id, tax_type,
                    annual_value, rate_pct, annual_demand
                    -- N08: one row per property per tax type

tax_demand          id, property_id, fy_id, tax_type, half_year,
                    demand_amount, arrear_bf, total_payable,
                    collected, balance, status
                    -- N09: half_year = 1 (Apr-Sep) or 2 (Oct-Mar)

tax_receipt         id, receipt_no, citizen_id, date,
                    amount, payment_mode, cheque_no, qr_token
                    -- N10: receipt_no auto-incremented, pre-numbered series
                    -- one receipt covers one sitting; multiple tax types
                    -- per sitting are separate receipts (one per tax_demand row)

tax_receipt_demand  id, receipt_id, demand_id, amount
                    -- junction: one receipt can clear multiple demands
                    -- (e.g. citizen pays house + water in one visit)
```

### Auto-linked Accounting (N05 → N06)

```
cash_book_entry     id, fy_id, date, entry_type, source_type,
                    source_id, account_head_id, bank_account_id,
                    cash_amount, bank_amount, narration, receipt_ref
                    -- N05: auto-created on tax_receipt insert

classified_receipt  id, fy_id, month, account_head_id,
                    total_amount, entry_count
                    -- N06: upserted on each cash_book_entry insert
```

---

## Auto-link Logic (N10 → N05 → N06)

Triggered as a **database transaction** on every `tax_receipt` insert:

```
1. Insert tax_receipt row
2. Update tax_demand: collected += amount, balance -= amount, status = partial/paid
3. For each tax_receipt_demand row:
     - Update tax_demand: collected += row.amount, balance -= row.amount, status = partial/paid
     - Insert cash_book_entry:
         source_type = 'tax_receipt', source_id = receipt.id
         account_head_id = TAX_TYPE_TO_ACCOUNT_HEAD[demand.tax_type]
         if payment_mode = 'cash': cash_amount = row.amount, bank_amount = 0
         if payment_mode = 'bank': cash_amount = 0, bank_amount = row.amount
     - Upsert classified_receipt:
         fy + month + account_head → increment total_amount + entry_count
```

All four writes happen in one Prisma transaction. If any step fails, nothing commits.

### tax_type → account_head mapping

| tax_type | account_head_code | name_mr |
|----------|-------------------|---------|
| house | 0101 | घरपट्टी |
| water | 0102 | पाणीपट्टी |
| sanitation | 0103 | स्वच्छता कर |
| lighting | 0104 | दिवाबत्ती कर |

Two additional heads seeded (not in this mapping):
- 0105 — किरकोळ जमा (miscellaneous receipts, for N07/N11 later)
- 0201 — सामान्य खर्च (general expenditure, for N12 later)

---

## PDF Output (Marathi)

Library: `@react-pdf/renderer`

Fonts: Lohit Devanagari (open source, covers Marathi Unicode fully)

### N09-Ka — Demand Notice
Fields: GP name, citizen name, property details, tax type, current demand, arrears, total payable, due date, GP seal placeholder, QR code linking to `/receipts/verify/[qr_token]`

### N10 — Tax Receipt
Fields: Receipt number, date, citizen name, property number, tax type, period (half-year), amount paid, balance outstanding, QR code, Gram Sevak signature line

### N08 — Assessment Register
Table: serial, property no, owner name, survey no, type, area, annual value, tax rate, annual demand — all in Marathi column headers

---

## Seed Data Shape

```
1 GP profile
1 Financial Year: 2025-26
1 Assessment Year: 2025-26 (with tax rate resolution)
Tax rates: 4 types × 3 property categories = 12 rate rows
Account heads: 6 relevant heads (see tax_type mapping + 2 future-ready heads)
1 Bank account
60 citizens (realistic Marathi names, Pune ward numbers)
60 properties — 1 property per citizen, mix of residential/commercial, varied areas
Prior-year arrears on ~20 properties (makes demand generation realistic)
```

---

## Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 16, App Router, Server Actions |
| Database | PostgreSQL + Prisma |
| UI | @gp/shadcn + Tailwind CSS v4 |
| i18n | next-intl (mr + en) |
| PDF | @react-pdf/renderer + Lohit Devanagari font |
| QR | `qrcode` npm package |
| Seed | Prisma seed script (`prisma/seed.ts`) |

---

## i18n Approach

next-intl is configured from Week 1. All UI strings go into `messages/mr.json` and `messages/en.json` from the start — no deferred migration.

**PDF strings are separate from the i18n catalog.** Marathi content in N09-Ka and N10 PDFs is kept as typed constants in the PDF template files (`/lib/pdf/n09-ka.tsx`, `/lib/pdf/n10-receipt.tsx`). PDFs are government-format documents — their field labels are fixed by law and do not change with UI language toggle.

---

## Build Order

```
Week 1: DB schema + seed data + next-intl setup + dashboard shell (Act 1 always showable)
Week 2: Citizen + Property CRUD + Tax Assessment (N08)
Week 3: Demand generation (N09) + N09-Ka PDF (Marathi, hardcoded constants)
Week 4: Collection entry (N10) + Receipt PDF + auto-link to N05/N06
Week 5: Cash Book + Classified Register views + dashboard numbers wired up
```
