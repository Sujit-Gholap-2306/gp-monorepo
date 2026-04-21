---
title: GP Demo Prototype — Implementation Plan
date: 2026-04-18
spec: 2026-04-18-demo-prototype-design.md
stack: Next.js 16 · Prisma · PostgreSQL (Supabase) · next-intl · @react-pdf/renderer
auth: External microservice — no login UI in this plan
tags: [implementation, cursor, demo, tax, namune]
---

# GP Demo Prototype — Implementation Plan

Cursor-ready task list. Each phase is atomic and independently deployable. Work through phases in order — later phases depend on earlier schema and actions.

**App location:** `apps/grampanchayat/`  
**Package scope:** `@gp/*`  
**Port:** 3004

---

## Cross-Register Relationship Reference

Read this before implementing. These are the precise data flows between namune. Any deviation breaks the accounting chain.

### N08 → N09 (Assessment feeds Demand)
- Source of truth for demand amount: `tax_assessment.annual_demand`
- N09 has **2 rows per property per tax_type per FY** (half_year = 1 and half_year = 2)
- `demand_amount` per half-year = `tax_assessment.annual_demand / 2`
- `arrear_bf` on **half_year 1 only** = `SUM(balance)` across ALL prior FY `tax_demand` rows for same `property_id` + `tax_type` (both half-years of prior FY)
- `arrear_bf` on **half_year 2** = 0 at generation time (FY-close carry-forward is out of scope)
- `total_payable` = `demand_amount + arrear_bf` — stored at creation, never recomputed
- `balance` = `total_payable` at creation (collected = 0)

### N09 ← N10 (Collection updates Demand)
- One `tax_receipt` can pay across **multiple** `tax_demand` rows (different tax types, same sitting)
- Junction: `tax_receipt_demand` (receipt_id + demand_id + amount)
- On each `tax_receipt_demand` insert, update parent `tax_demand`:
  - `collected += amount`
  - `balance = total_payable - collected`
  - `status`: `PAID` if balance ≤ 0, `PARTIAL` if collected > 0 and balance > 0, `UNPAID` if collected = 0
- Server Action must validate `amount ≤ demand.balance` before entering transaction (no overpayment)
- Constraint: `SUM(tax_receipt_demand.amount WHERE receipt_id = X)` must equal `tax_receipt.amount`

### N10 → N05 (Receipt auto-creates Cash Book entries)
- One `cash_book_entry` per `tax_receipt_demand` row — **not** per receipt
- Reason: each `tax_type` maps to a different `account_head_id`
- `cash_amount` = row amount if `payment_mode = CASH`, else 0
- `bank_amount` = row amount if `payment_mode = BANK`, else 0
- `narration` = `"{tax_type} - {property.property_no} - {receipt.receipt_no}"`

### N05 → N06 (Cash Book entry updates Classified Register)
- One `classified_receipt` row per `(fy_id, calendar_month, account_head_id)` — upserted
- `month` = calendar month 1–12 from `cash_book_entry.date`
- `total_amount += cash_amount + bank_amount`
- `entry_count += 1`

### tax_type → account_head mapping (fixed)

| tax_type   | account_head.code | name_mr       |
|------------|-------------------|---------------|
| HOUSE      | 0101              | घरपट्टी       |
| WATER      | 0102              | पाणीपट्टी     |
| SANITATION | 0103              | स्वच्छता कर   |
| LIGHTING   | 0104              | दिवाबत्ती कर  |

Two additional heads seeded but not in tax chain (reserved for future N07/N12):
- 0105 — किरकोळ जमा (miscellaneous receipts)
- 0201 — सामान्य खर्च (general expenditure)

### N05 Running Balance — computed on read, never stored
Window function scoped to full FY, not filtered by month:
```sql
SUM(cash_amount + bank_amount) OVER (
  PARTITION BY fy_id
  ORDER BY date, id
  ROWS UNBOUNDED PRECEDING
) AS running_total
```
Filter to display month in application code after fetching.

### ratePct storage convention
`tax_rate.rate_pct` is stored as a percentage value (e.g. `0.75` = 0.75%).  
`annual_demand = annual_value × rate_pct / 100`  
Example: 800 sqft × ₹150/sqft = ₹1,20,000 annual value × 0.75 / 100 = ₹900 annual demand.

---

## Key Constraints (never break these)

1. `tax_receipt.amount` = `SUM(tax_receipt_demand.amount)` — enforced in Server Action before insert
2. `tax_demand.balance` is always `total_payable - collected` — never set independently
3. `dp.amount ≤ demand.balance` — validated before transaction begins (no overpayment)
4. `cash_book_entry` is always created inside the same transaction that updates `tax_demand` — never standalone
5. `classified_receipt` is always upserted in the same transaction as `cash_book_entry`
6. PDF Marathi strings are hardcoded constants — never pulled from i18n catalog
7. Running balance in N05 is computed via window function on read — never stored
8. Receipt numbers are generated via a PostgreSQL sequence — never via application-level MAX
9. `CashBookEntry` uses only `taxReceiptId` (FK) — `sourceId` string field removed (redundancy eliminated)

---

## Phase 0 — Foundation

### Task 0.1 — Supabase project + RLS + env

**Files:** `.env.local`, `prisma/schema.prisma`

1. Create Supabase project. Copy connection strings: Settings → Database → Connection string.

2. **Disable RLS on all app tables** (Supabase enables it by default — without this, all Prisma queries return 0 rows silently):
   In Supabase Studio → SQL Editor, run after each migration:
   ```sql
   ALTER TABLE gp_profile          DISABLE ROW LEVEL SECURITY;
   ALTER TABLE financial_year      DISABLE ROW LEVEL SECURITY;
   ALTER TABLE assessment_year     DISABLE ROW LEVEL SECURITY;
   ALTER TABLE account_head        DISABLE ROW LEVEL SECURITY;
   ALTER TABLE bank_account        DISABLE ROW LEVEL SECURITY;
   ALTER TABLE opening_balance     DISABLE ROW LEVEL SECURITY;
   ALTER TABLE tax_rate            DISABLE ROW LEVEL SECURITY;
   ALTER TABLE cheque_book         DISABLE ROW LEVEL SECURITY;
   ALTER TABLE citizen             DISABLE ROW LEVEL SECURITY;
   ALTER TABLE property            DISABLE ROW LEVEL SECURITY;
   ALTER TABLE tax_assessment      DISABLE ROW LEVEL SECURITY;
   ALTER TABLE tax_demand          DISABLE ROW LEVEL SECURITY;
   ALTER TABLE tax_receipt         DISABLE ROW LEVEL SECURITY;
   ALTER TABLE tax_receipt_demand  DISABLE ROW LEVEL SECURITY;
   ALTER TABLE cash_book_entry     DISABLE ROW LEVEL SECURITY;
   ALTER TABLE classified_receipt  DISABLE ROW LEVEL SECURITY;
   ```

3. Create `.env.local`:
```
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_APP_URL="http://localhost:3004"
NEXT_PUBLIC_DEFAULT_LOCALE="mr"
```

4. `prisma/schema.prisma` datasource block:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
generator client {
  provider = "prisma-client-js"
}
```

5. Install packages:
```bash
pnpm add @prisma/client prisma next-intl @react-pdf/renderer qrcode decimal.js
pnpm add -D @types/qrcode
```

6. Create `lib/db/prisma.ts`:
```ts
import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Acceptance:** `.env.local` in place. Supabase project created. RLS SQL script saved and ready to run after first migration.

---

### Task 0.2 — Full Prisma schema + sequence + migration

**File:** `prisma/schema.prisma`

Full schema — paste exactly:

```prisma
// ─── Enums ────────────────────────────────────────────────────────────────

enum FyStatus        { ACTIVE CLOSED }
enum AyStatus        { ACTIVE CLOSED }
enum HeadCategory    { INCOME EXPENDITURE }
enum BankAccountType { SAVINGS CURRENT FD }
enum PropertyType    { RESIDENTIAL COMMERCIAL AGRICULTURAL }
enum PropertyUsage   { SELF_OCCUPIED RENTED VACANT }
enum PropertyStatus  { ACTIVE DEMOLISHED DISPUTED }
enum TaxType         { HOUSE WATER SANITATION LIGHTING }
enum DemandStatus    { UNPAID PARTIAL PAID }
enum PaymentMode     { CASH BANK }
enum EntryType       { RECEIPT PAYMENT }

// ─── Masters ──────────────────────────────────────────────────────────────

model GpProfile {
  id            String   @id @default(cuid())
  nameMr        String
  nameEn        String
  district      String
  taluka        String
  psName        String
  sarpanchName  String
  gramSevakName String
  address       String
  createdAt     DateTime @default(now())
  @@map("gp_profile")
}

model FinancialYear {
  id        String   @id @default(cuid())
  label     String   @unique
  startDate DateTime
  endDate   DateTime
  status    FyStatus @default(ACTIVE)

  taxDemands         TaxDemand[]
  cashBookEntries    CashBookEntry[]
  classifiedReceipts ClassifiedReceipt[]
  openingBalances    OpeningBalance[]
  @@map("financial_year")
}

model AssessmentYear {
  id           String   @id @default(cuid())
  label        String   @unique
  resolutionNo String
  revisionDate DateTime
  status       AyStatus @default(ACTIVE)

  taxRates       TaxRate[]
  taxAssessments TaxAssessment[]
  @@map("assessment_year")
}

model AccountHead {
  id          String       @id @default(cuid())
  code        String       @unique
  nameMr      String
  nameEn      String
  category    HeadCategory
  subCategory String
  isTaxHead   Boolean      @default(false)

  cashBookEntries    CashBookEntry[]
  classifiedReceipts ClassifiedReceipt[]
  openingBalances    OpeningBalance[]
  @@map("account_head")
}

model BankAccount {
  id          String          @id @default(cuid())
  bankName    String
  branch      String
  accountNo   String          @unique
  ifsc        String
  accountType BankAccountType

  cashBookEntries CashBookEntry[]
  chequeBooks     ChequeBook[]
  @@map("bank_account")
}

model OpeningBalance {
  id            String  @id @default(cuid())
  fyId          String
  accountHeadId String
  amount        Decimal @db.Decimal(12, 2)

  fy          FinancialYear @relation(fields: [fyId], references: [id])
  accountHead AccountHead   @relation(fields: [accountHeadId], references: [id])
  @@unique([fyId, accountHeadId])
  @@map("opening_balance")
}

model TaxRate {
  id               String       @id @default(cuid())
  assessmentYearId String
  propertyType     PropertyType
  taxType          TaxType
  ratePct          Decimal      @db.Decimal(5, 2)
  // ratePct stored as percentage: 0.75 means 0.75% — divide by 100 when computing demand
  resolutionNo     String

  assessmentYear AssessmentYear @relation(fields: [assessmentYearId], references: [id])
  @@unique([assessmentYearId, propertyType, taxType])
  @@map("tax_rate")
}

model ChequeBook {
  id            String      @id @default(cuid())
  bankAccountId String
  seriesFrom    String
  seriesTo      String
  dateIssued    DateTime
  leavesUsed    Int         @default(0)

  bankAccount BankAccount @relation(fields: [bankAccountId], references: [id])
  @@map("cheque_book")
}

// ─── Citizen & Property ───────────────────────────────────────────────────

model Citizen {
  id      String  @id @default(cuid())
  nameMr  String
  nameEn  String
  aadhaar String? @unique
  mobile  String?
  wardNo  String
  address String

  properties  Property[]
  taxReceipts TaxReceipt[]
  @@map("citizen")
}

model Property {
  id               String         @id @default(cuid())
  propertyNo       String         @unique
  citizenId        String
  surveyNo         String
  wardNo           String
  type             PropertyType
  areaSqft         Decimal        @db.Decimal(8, 2)
  constructionYear Int?
  usage            PropertyUsage
  status           PropertyStatus @default(ACTIVE)

  citizen        Citizen         @relation(fields: [citizenId], references: [id])
  taxAssessments TaxAssessment[]
  taxDemands     TaxDemand[]
  @@map("property")
}

// ─── N08 — Tax Assessment ─────────────────────────────────────────────────

model TaxAssessment {
  id               String  @id @default(cuid())
  propertyId       String
  assessmentYearId String
  taxType          TaxType
  annualValue      Decimal @db.Decimal(12, 2)
  ratePct          Decimal @db.Decimal(5, 2)
  annualDemand     Decimal @db.Decimal(12, 2)
  // annualDemand stored (not computed) to allow future manual override

  property       Property       @relation(fields: [propertyId], references: [id])
  assessmentYear AssessmentYear @relation(fields: [assessmentYearId], references: [id])
  @@unique([propertyId, assessmentYearId, taxType])
  @@map("tax_assessment")
}

// ─── N09 — Tax Demand ─────────────────────────────────────────────────────

model TaxDemand {
  id           String       @id @default(cuid())
  propertyId   String
  fyId         String
  taxType      TaxType
  halfYear     Int
  // halfYear: 1 = Apr–Sep, 2 = Oct–Mar
  demandAmount Decimal      @db.Decimal(12, 2)
  arrearBf     Decimal      @db.Decimal(12, 2) @default(0)
  // arrearBf: non-zero on halfYear=1 only; SUM(balance) from prev FY same property+taxType
  totalPayable Decimal      @db.Decimal(12, 2)
  // totalPayable = demandAmount + arrearBf — stored at creation, never recomputed
  collected    Decimal      @db.Decimal(12, 2) @default(0)
  balance      Decimal      @db.Decimal(12, 2)
  // balance = totalPayable - collected — kept in sync by collection transaction only
  status       DemandStatus @default(UNPAID)

  property       Property          @relation(fields: [propertyId], references: [id])
  fy             FinancialYear     @relation(fields: [fyId], references: [id])
  receiptDemands TaxReceiptDemand[]

  @@unique([propertyId, fyId, taxType, halfYear])
  @@index([fyId, status])
  @@index([propertyId, fyId])
  @@map("tax_demand")
}

// ─── N10 — Tax Receipt ────────────────────────────────────────────────────

model TaxReceipt {
  id          String      @id @default(cuid())
  receiptNo   String      @unique
  // receiptNo format: RCP-{FY_LABEL}-{seq_padded_4} e.g. RCP-2025-26-0001
  // generated via PostgreSQL sequence — never via application MAX
  citizenId   String
  date        DateTime    @default(now())
  amount      Decimal     @db.Decimal(12, 2)
  // amount = SUM(receiptDemands.amount) — validated in Server Action before insert
  paymentMode PaymentMode
  chequeNo    String?
  // chequeNo: required when paymentMode = BANK — enforced in Server Action
  qrToken     String      @unique @default(cuid())

  citizen         Citizen            @relation(fields: [citizenId], references: [id])
  receiptDemands  TaxReceiptDemand[]
  cashBookEntries CashBookEntry[]

  @@index([citizenId])
  @@map("tax_receipt")
}

// Junction: N10 ↔ N09 — one receipt can clear multiple demand rows
model TaxReceiptDemand {
  id        String  @id @default(cuid())
  receiptId String
  demandId  String
  amount    Decimal @db.Decimal(12, 2)

  receipt TaxReceipt @relation(fields: [receiptId], references: [id])
  demand  TaxDemand  @relation(fields: [demandId], references: [id])
  @@unique([receiptId, demandId])
  @@map("tax_receipt_demand")
}

// ─── N05 — Cash Book Entry (auto-created by collection transaction) ────────

model CashBookEntry {
  id            String    @id @default(cuid())
  fyId          String
  date          DateTime
  entryType     EntryType
  taxReceiptId  String
  // taxReceiptId is the only source type in this demo — extensible later
  accountHeadId String
  bankAccountId String?
  cashAmount    Decimal   @db.Decimal(12, 2) @default(0)
  bankAmount    Decimal   @db.Decimal(12, 2) @default(0)
  narration     String
  receiptRef    String?
  // receiptRef: human-readable receipt number for cross-reference display

  fy          FinancialYear @relation(fields: [fyId], references: [id])
  accountHead AccountHead   @relation(fields: [accountHeadId], references: [id])
  bankAccount BankAccount?  @relation(fields: [bankAccountId], references: [id])
  taxReceipt  TaxReceipt    @relation(fields: [taxReceiptId], references: [id])

  @@index([fyId, date])
  @@index([taxReceiptId])
  @@map("cash_book_entry")
}

// ─── N06 — Classified Receipt Register (auto-upserted) ────────────────────

model ClassifiedReceipt {
  id            String  @id @default(cuid())
  fyId          String
  month         Int
  // month: calendar month 1–12 (not FY-relative)
  accountHeadId String
  totalAmount   Decimal @db.Decimal(12, 2) @default(0)
  entryCount    Int     @default(0)

  fy          FinancialYear @relation(fields: [fyId], references: [id])
  accountHead AccountHead   @relation(fields: [accountHeadId], references: [id])
  @@unique([fyId, month, accountHeadId])
  @@map("classified_receipt")
}
```

After pasting schema, run:
```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

Then create the receipt number sequence — run in Supabase SQL Editor:
```sql
CREATE SEQUENCE receipt_seq_2025_26 START 1 INCREMENT 1;
```

Then run the RLS disable script from Task 0.1.

**Acceptance:** All tables visible in Supabase Studio. `pnpm prisma generate` completes with no type errors. Sequence `receipt_seq_2025_26` exists.

---

### Task 0.3 — next-intl setup

**Files:** `i18n.ts`, `middleware.ts`, `messages/mr.json`, `messages/en.json`

`i18n.ts`:
```ts
import { getRequestConfig } from 'next-intl/server'
export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}))
```

`middleware.ts`:
```ts
import createMiddleware from 'next-intl/middleware'
export default createMiddleware({
  locales: ['mr', 'en'],
  defaultLocale: 'mr'
})
export const config = { matcher: ['/((?!_next|api|.*\\..*).*)'] }
```

Seed `messages/mr.json` and `messages/en.json` with nav labels only at this stage. Full strings added in Phase 7.

**Acceptance:** `/mr` and `/en` routes resolve. Language toggle switches nav labels.

---

### Task 0.4 — App structure + navigation shell

**Files:** `app/[locale]/layout.tsx`, `app/[locale]/(demo)/layout.tsx`, `components/nav.tsx`

Route structure:
```
app/
└── [locale]/
    └── (demo)/
        ├── layout.tsx          ← sidebar + GP name header
        ├── page.tsx            ← Dashboard (shell, wire numbers in Phase 6)
        ├── citizens/
        ├── properties/
        ├── assessment/
        ├── demand/
        ├── collect/
        ├── receipts/
        ├── cashbook/
        └── classified/
```

Nav sidebar items (Marathi labels from i18n):
- मुख्यपृष्ठ (Dashboard)
- नागरिक (Citizens)
- मालमत्ता (Properties)
- करआकारणी - N08 (Tax Assessment)
- करमागणी - N09 (Tax Demand)
- कर संकलन - N10 (Collect Payment)
- रोकड वही - N05 (Cash Book)
- वर्गीकृत नोंदवही - N06 (Classified Register)

GP name in header: Server Component reads `gp_profile` from DB on each layout render.

**Acceptance:** Nav renders in Marathi. All route stubs return 200. GP name appears in header.

---

## Phase 1 — Seed Data + Dashboard Shell

### Task 1.1 — Seed: masters

**File:** `prisma/seed.ts`

Capture all created record IDs immediately — do not re-query. Seed in FK dependency order:

```ts
// 1. GP Profile
const gp = await prisma.gpProfile.create({ data: {
  nameMr: 'रामोशी ग्रामपंचायत', nameEn: 'Ramoshi Gram Panchayat',
  district: 'पुणे', taluka: 'पुणे', psName: 'पुणे पंचायत समिती',
  sarpanchName: 'सुनील पवार', gramSevakName: 'रमेश शिंदे',
  address: 'मुख्य चौक, रामोशी, पुणे - 412101'
}})

// 2. Financial Years — capture both IDs
const fy2425 = await prisma.financialYear.create({ data: {
  label: '2024-25', startDate: new Date('2024-04-01'),
  endDate: new Date('2025-03-31'), status: 'CLOSED'
}})
const fy2526 = await prisma.financialYear.create({ data: {
  label: '2025-26', startDate: new Date('2025-04-01'),
  endDate: new Date('2026-03-31'), status: 'ACTIVE'
}})

// 3. Assessment Year
const ay2526 = await prisma.assessmentYear.create({ data: {
  label: '2025-26', resolutionNo: 'GP/2025/TAX/001',
  revisionDate: new Date('2025-03-15'), status: 'ACTIVE'
}})

// 4. Account Heads — capture IDs for FK use in opening balances
const heads = await prisma.$transaction([
  prisma.accountHead.create({ data: { code: '0101', nameMr: 'घरपट्टी',      nameEn: 'House Tax',          category: 'INCOME',      subCategory: 'tax',  isTaxHead: true  }}),
  prisma.accountHead.create({ data: { code: '0102', nameMr: 'पाणीपट्टी',    nameEn: 'Water Tax',          category: 'INCOME',      subCategory: 'tax',  isTaxHead: true  }}),
  prisma.accountHead.create({ data: { code: '0103', nameMr: 'स्वच्छता कर',  nameEn: 'Sanitation Tax',     category: 'INCOME',      subCategory: 'tax',  isTaxHead: true  }}),
  prisma.accountHead.create({ data: { code: '0104', nameMr: 'दिवाबत्ती कर', nameEn: 'Lighting Tax',       category: 'INCOME',      subCategory: 'tax',  isTaxHead: true  }}),
  prisma.accountHead.create({ data: { code: '0105', nameMr: 'किरकोळ जमा',   nameEn: 'Misc Receipts',      category: 'INCOME',      subCategory: 'misc', isTaxHead: false }}),
  prisma.accountHead.create({ data: { code: '0201', nameMr: 'सामान्य खर्च', nameEn: 'General Expenditure',category: 'EXPENDITURE', subCategory: 'misc', isTaxHead: false }}),
])
const [h0101, h0102, h0103, h0104] = heads

// 5. Bank Account
const bank = await prisma.bankAccount.create({ data: {
  bankName: 'बँक ऑफ महाराष्ट्र', branch: 'रामोशी शाखा',
  accountNo: '60123456789', ifsc: 'MAHB0001234', accountType: 'SAVINGS'
}})

// 6. Opening Balances (all zero for demo clarity)
await prisma.openingBalance.createMany({ data: heads.map(h => ({
  fyId: fy2526.id, accountHeadId: h.id, amount: 0
}))})

// 7. Tax Rates — 4 types × 3 property categories = 12 rows
// Rates stored as percentage values (e.g. 0.75 = 0.75%)
const rateData = [
  // Residential
  { propertyType: 'RESIDENTIAL', taxType: 'HOUSE',       ratePct: 0.75 },
  { propertyType: 'RESIDENTIAL', taxType: 'WATER',       ratePct: 0.25 },
  { propertyType: 'RESIDENTIAL', taxType: 'SANITATION',  ratePct: 0.20 },
  { propertyType: 'RESIDENTIAL', taxType: 'LIGHTING',    ratePct: 0.15 },
  // Commercial
  { propertyType: 'COMMERCIAL',  taxType: 'HOUSE',       ratePct: 1.00 },
  { propertyType: 'COMMERCIAL',  taxType: 'WATER',       ratePct: 0.50 },
  { propertyType: 'COMMERCIAL',  taxType: 'SANITATION',  ratePct: 0.40 },
  { propertyType: 'COMMERCIAL',  taxType: 'LIGHTING',    ratePct: 0.30 },
  // Agricultural
  { propertyType: 'AGRICULTURAL',taxType: 'HOUSE',       ratePct: 0.40 },
  { propertyType: 'AGRICULTURAL',taxType: 'WATER',       ratePct: 0.15 },
  { propertyType: 'AGRICULTURAL',taxType: 'SANITATION',  ratePct: 0.10 },
  { propertyType: 'AGRICULTURAL',taxType: 'LIGHTING',    ratePct: 0.10 },
]
await prisma.taxRate.createMany({ data: rateData.map(r => ({
  ...r, assessmentYearId: ay2526.id, resolutionNo: 'GP/2025/TAX/001'
}))})
```

**Acceptance:** `pnpm prisma db seed` completes. 6 account heads, 12 tax rates, 1 bank account visible in Supabase.

---

### Task 1.2 — Seed: citizens + properties

**File:** `prisma/data/citizens.ts` (data array), `prisma/seed.ts` (import + insert)

- 60 citizens with Marathi names, ward numbers 1–6 (10 per ward), mobile numbers
- 60 properties — **1 property per citizen** for demo simplicity
- Mix: 40 `RESIDENTIAL`, 15 `COMMERCIAL`, 5 `AGRICULTURAL`
- `areaSqft`: residential 600–1200, commercial 200–600, agricultural 2000–5000
- `propertyNo` format: `RP-{ward}-{seq}` e.g. `RP-1-001`
- `surveyNo`: Pune-format e.g. `Survey No. 142/1A`

Export `CITIZEN_SEED_DATA` array from `prisma/data/citizens.ts`. Import in `seed.ts`, insert citizens first, then properties with matching `citizenId`.

**Acceptance:** 60 citizens and 60 properties in DB. Each property links to a unique citizen.

---

### Task 1.3 — Seed: prior-year demand history (FY 2024-25)

**Purpose:** Provides arrear data for the arrear carry-forward demo in Phase 4.

For 20 of the 60 properties (pick a realistic mix), create **both** half-year rows for FY 2024-25:

```ts
// Example: property RP-2-005
// halfYear 1 — paid in full
{ propertyId: prop.id, fyId: fy2425.id, taxType: 'HOUSE', halfYear: 1,
  demandAmount: 360, arrearBf: 0, totalPayable: 360,
  collected: 360, balance: 0, status: 'PAID' }
// halfYear 2 — unpaid (this becomes arrear_bf in FY 2025-26)
{ propertyId: prop.id, fyId: fy2425.id, taxType: 'HOUSE', halfYear: 2,
  demandAmount: 360, arrearBf: 0, totalPayable: 360,
  collected: 0,   balance: 360, status: 'UNPAID' }
```

Vary the pattern: some H1 partial, some H2 partial, some both unpaid — gives demo variety.  
Seed both H1 and H2 for all 20 properties (not just H2) so demand history views are complete.

**Acceptance:** 20 properties have FY 2024-25 demand rows with `balance > 0`. When Phase 4 demand generation runs, these 20 show non-zero `arrear_bf` on their 2025-26 H1 rows.

---

### Task 1.4 — Dashboard shell

**File:** `app/[locale]/(demo)/page.tsx`

Build the full dashboard layout now with realistic-looking static numbers. Wire to real DB in Phase 6 (Task 6.3). Build the shell now so Act 1 of the demo is always showable.

Four stat cards (static for now, replace in Task 6.3):
1. एकूण मालमत्ता — `60`
2. एकूण मागणी — `₹0` (demands not generated yet)
3. या महिन्याची वसुली — `₹0`
4. थकबाकी — `₹0`

Quick action buttons: नागरिक जोडा, मालमत्ता जोडा, कर भरा (routes only)

Recent collections table: empty state with "अद्याप कोणतीही नोंद नाही" placeholder.

**Acceptance:** Dashboard loads without error. Layout matches nav. No broken imports.

---

## Phase 2 — Citizen + Property CRUD

### Task 2.1 — Citizens list page + search

**File:** `app/[locale]/(demo)/citizens/page.tsx`  
**Action:** `lib/actions/citizens.ts → getCitizens(search?: string)`

Query:
```ts
prisma.citizen.findMany({
  where: search ? {
    OR: [
      { nameMr: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search } },
      { aadhaar: { contains: search } },
    ]
  } : undefined,
  include: { _count: { select: { properties: true } } },
  orderBy: { nameMr: 'asc' },
  take: 20,
  skip: page * 20,
})
```

Table columns: नाव, वार्ड, मोबाइल, मालमत्ता संख्या, कृती (View button)

**Acceptance:** Marathi name search works (ILIKE). 60 records paginated at 20 per page.

---

### Task 2.2 — Citizen detail page

**File:** `app/[locale]/(demo)/citizens/[id]/page.tsx`

Single Prisma query with all includes (no N+1):
```ts
prisma.citizen.findUniqueOrThrow({
  where: { id },
  include: {
    properties: true,
    taxReceipts: {
      orderBy: { date: 'desc' },
      take: 10,
      include: { receiptDemands: { include: { demand: true } } }
    }
  }
})
```

Sections:
1. Personal details card
2. Properties table (propertyNo, type, area, status)
3. Payment history (receiptNo, date, amount, paymentMode)
4. Outstanding demand summary — aggregate query: `SUM(balance) by taxType WHERE status != PAID`

**Acceptance:** All sections populate from seed data. No N+1 queries.

---

### Task 2.3 — Add citizen Server Action + form

**Files:** `app/[locale]/(demo)/citizens/new/page.tsx`, `lib/actions/citizens.ts → createCitizen()`

Validation:
- `nameMr`: required, min 2 chars
- `aadhaar`: optional, must be exactly 12 digits if provided
- Aadhaar uniqueness: do NOT pre-query. Insert directly; catch Prisma error `P2002` and return `{ error: 'Aadhaar already registered' }`

```ts
try {
  const citizen = await prisma.citizen.create({ data })
  redirect(`/${locale}/citizens/${citizen.id}`)
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
    return { error: 'हे आधार क्रमांक आधीच नोंदणीकृत आहे' }
  }
  throw e
}
```

**Acceptance:** New citizen saved. Duplicate Aadhaar shows Marathi error inline.

---

### Task 2.4 — Properties list page + search

**File:** `app/[locale]/(demo)/properties/page.tsx`

Filters: Ward (select 1–6), Type (select RESIDENTIAL/COMMERCIAL/AGRICULTURAL), Status (select)  
Table: Property No, Owner Name, Ward, Type, Area (sqft), Status, Outstanding Balance  
Outstanding balance = `SUM(tax_demand.balance WHERE fy = active AND status != PAID)` — compute per property via aggregate or subquery.

**Acceptance:** All 60 properties visible. Ward filter returns correct subset.

---

### Task 2.5 — Property detail page

**File:** `app/[locale]/(demo)/properties/[id]/page.tsx`

Single query with includes:
```ts
prisma.property.findUniqueOrThrow({
  where: { id },
  include: {
    citizen: true,
    taxAssessments: { include: { assessmentYear: true } },
    taxDemands: {
      include: { fy: true },
      orderBy: [{ fyId: 'desc' }, { taxType: 'asc' }, { halfYear: 'asc' }]
    }
  }
})
```

Sections: Property details → Assessment history (N08) → Demand history (N09 grouped by FY) → Receipt links

**Acceptance:** Full history visible. Demand table shows FY grouping clearly.

---

### Task 2.6 — Add property Server Action + form

**Files:** `app/[locale]/(demo)/properties/new/page.tsx`, `lib/actions/properties.ts → createProperty()`

Owner field: citizen search autocomplete — `getCitizens(search)` Server Action powers this.  
PropertyNo: auto-suggest `RP-{ward}-{next_seq}` based on existing count in that ward, editable.

Validation:
- `propertyNo` unique — catch `P2002` same pattern as citizens
- `citizenId` must exist — FK constraint handles this; catch `P2003` for friendly error

**Acceptance:** New property links to citizen. Visible in citizen detail properties tab.

---

## Phase 3 — Tax Assessment (N08)

### Task 3.1 — Generate assessments Server Action

**File:** `lib/actions/assessment.ts → generateAssessments(assessmentYearId: string)`

```ts
// Demo constants for annual value base — NOT real Maharashtra rates
// Production: replace with GP-specific assessment master from GP resolution
const BASE_VALUE_PER_SQFT: Record<string, number> = {
  RESIDENTIAL: 150,
  COMMERCIAL:  300,
  AGRICULTURAL: 50,
}

export async function generateAssessments(assessmentYearId: string) {
  const [properties, taxRates] = await Promise.all([
    prisma.property.findMany({ where: { status: 'ACTIVE' } }),
    prisma.taxRate.findMany({ where: { assessmentYearId } }),
  ])

  // Build rate lookup: propertyType_taxType → ratePct
  const rateMap = new Map(
    taxRates.map(r => [`${r.propertyType}_${r.taxType}`, r.ratePct])
  )

  let created = 0
  for (const property of properties) {
    for (const taxType of ['HOUSE', 'WATER', 'SANITATION', 'LIGHTING'] as const) {
      const key = `${property.type}_${taxType}`
      const ratePct = rateMap.get(key)
      if (!ratePct) continue

      const exists = await prisma.taxAssessment.findUnique({
        where: { propertyId_assessmentYearId_taxType: {
          propertyId: property.id, assessmentYearId, taxType
        }}
      })
      if (exists) continue

      const annualValue = new Decimal(property.areaSqft)
        .times(BASE_VALUE_PER_SQFT[property.type])
      const annualDemand = annualValue.times(ratePct).dividedBy(100)

      await prisma.taxAssessment.create({
        data: { propertyId: property.id, assessmentYearId, taxType,
                annualValue, ratePct, annualDemand }
      })
      created++
    }
  }
  return { created }
}
```

**Acceptance:** 60 properties × 4 tax types = 240 assessment rows. Calling twice creates 0 additional rows.

---

### Task 3.2 — Assessment table page (N08)

**File:** `app/[locale]/(demo)/assessment/page.tsx`

Display: **Grouped by property** — one expandable/collapsible row per property showing 4 tax-type sub-rows. Not 240 flat rows. This is how GPs read the physical N08 register.

Columns: Property No, Owner, Ward | Tax Type, Annual Value, Rate %, Annual Demand

Summary row at bottom: total annual demand per tax type.

Actions: "करआकारणी तयार करा" (Generate Assessments) button → Server Action → show count toast  
"N08 PDF उतरवा" → `/assessment/pdf`

**Acceptance:** Grouped display shows 60 property rows, each expandable to 4 sub-rows. Totals are correct.

---

### Task 3.3 — N08 Assessment Register PDF + route

**Files:** `lib/pdf/n08-assessment.tsx`, `app/[locale]/(demo)/assessment/pdf/route.ts`

Route handler:
```ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const data = await getAssessmentData()
  const pdf = await renderToBuffer(<N08AssessmentPdf data={data} />)
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="n08-assessment-2025-26.pdf"'
    }
  })
}
```

PDF template `lib/pdf/n08-assessment.tsx`:
- Register `Lohit-Devanagari.ttf` at top of module (not inside component render)
- Header: GP name, "कर आकारणी नोंदवही", Assessment Year, generation date
- Table: अ.क्र. | मालमत्ता क्र. | मालक नाव | सर्वे क्र. | प्रकार | क्षेत्रफळ | वार्षिक भाडेमूल्य | कर प्रकार | दर % | वार्षिक मागणी
- Footer: एकूण वार्षिक मागणी, ग्रामसेवक / सरपंच signature lines

**Acceptance:** PDF downloads. Marathi text renders without tofu. Font file committed to `lib/pdf/fonts/`. Download `Lohit-Devanagari.ttf` from https://github.com/lohit-fonts/lohit-devanagari and commit.

---

## Phase 4 — Tax Demand (N09)

### Task 4.1 — Demand generation Server Action

**File:** `lib/actions/demand.ts → generateDemands(fyId: string, assessmentYearId: string)`

```ts
export async function generateDemands(fyId: string, assessmentYearId: string) {
  const [currentFy, assessments] = await Promise.all([
    prisma.financialYear.findUniqueOrThrow({ where: { id: fyId } }),
    prisma.taxAssessment.findMany({
      where: { assessmentYearId },
      include: { property: true }
    })
  ])

  // Find previous FY — most recent FY ending before current FY starts
  const prevFy = await prisma.financialYear.findFirst({
    where: { endDate: { lt: currentFy.startDate } },
    orderBy: { endDate: 'desc' }
  })

  let created = 0
  for (const assessment of assessments) {
    // Carry-forward: SUM of balance across BOTH half-years of prev FY
    let arrearBf = new Decimal(0)
    if (prevFy) {
      const prevDemands = await prisma.taxDemand.findMany({
        where: {
          propertyId: assessment.propertyId,
          fyId: prevFy.id,
          taxType: assessment.taxType,
          balance: { gt: 0 }
        }
      })
      arrearBf = prevDemands.reduce(
        (sum, d) => sum.plus(d.balance), new Decimal(0)
      )
    }

    const demandAmount = new Decimal(assessment.annualDemand).dividedBy(2)

    for (const halfYear of [1, 2]) {
      const exists = await prisma.taxDemand.findUnique({
        where: { propertyId_fyId_taxType_halfYear: {
          propertyId: assessment.propertyId, fyId, taxType: assessment.taxType, halfYear
        }}
      })
      if (exists) continue

      const bf = halfYear === 1 ? arrearBf : new Decimal(0)
      const totalPayable = demandAmount.plus(bf)

      await prisma.taxDemand.create({
        data: {
          propertyId: assessment.propertyId,
          fyId, taxType: assessment.taxType, halfYear,
          demandAmount, arrearBf: bf,
          totalPayable, balance: totalPayable,
          status: 'UNPAID'
        }
      })
      created++
    }
  }
  return { created }
}
```

**Acceptance:** 60 properties × 4 tax types × 2 half-years = 480 demand rows. 20 properties with prior arrears show `arrear_bf > 0` on halfYear=1 rows. Running twice creates 0 additional rows.

---

### Task 4.2 — Demand register page (N09)

**File:** `app/[locale]/(demo)/demand/page.tsx`

Tabs: सहामाही १ (Apr–Sep) | सहामाही २ (Oct–Mar)

Summary cards: एकूण मागणी | एकूण वसुली | एकूण शिल्लक

Table columns: Property No, Owner, Tax Type, Demand, Arrear B/F, Total Payable, Collected, Balance, Status badge

Status badge colours: UNPAID = red, PARTIAL = amber, PAID = green

Actions: "मागण्या तयार करा" button | "सर्व नोटिसा डाउनलोड करा" → batch PDF  
Row: property number links to `/properties/[id]`

**Acceptance:** 240 rows per tab (60 × 4 tax types). Arrear column non-zero for 20 properties.

---

### Task 4.3 — N09-Ka Demand Notice PDF (single property)

**Files:** `lib/pdf/n09-ka-notice.tsx`, `app/[locale]/(demo)/demand/pdf/[propertyId]/route.ts`

Route:
```ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
```

PDF content (hardcoded Marathi strings — NOT i18n):
```
Header:
  {gp.nameMr}
  "कर मागणी सूचना - नमुना ९ क"
  आर्थिक वर्ष: 2025-26

Property:
  मालमत्ता क्र.: {propertyNo}
  मालक: {citizen.nameMr}
  पत्ता: {citizen.address}
  सर्वे क्र.: {surveyNo}

Demand Table:
  कर प्रकार | सहामाही | मागणी | थकबाकी | एकूण देय | वसुली | शिल्लक
  (rows: 4 tax types × 2 half-years = 8 rows)

Due Dates:
  पहिल्या सहामाहीसाठी: ३० सप्टेंबर २०२५
  दुसऱ्या सहामाहीसाठी: ३१ मार्च २०२६

  NOTE: September has 30 days — ३० सप्टेंबर, not ३१

QR Code:
  Encodes: https://localhost:3004/mr/receipts/verify/{latest_receipt_qr_token}
  Only shown if at least one receipt exists for this property.
  If no receipts yet: omit QR section entirely (do NOT show a broken QR).

Footer:
  ग्रामसेवक स्वाक्षरी          सरपंच स्वाक्षरी
```

**Acceptance:** PDF downloads for any property. September due date shows "३०". QR absent for properties with no receipt history.

---

### Task 4.4 — Batch demand notice PDF

**File:** `app/[locale]/(demo)/demand/pdf/batch/route.ts`

```ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60  // Vercel: increase timeout for batch PDF
```

One `Page` per property in a single `Document`. Add a cover page first:  
GP name, "कर मागणी नोटिसा", FY 2025-26, एकूण मालमत्ता: 60, generated date.

Filename: `demand-notices-2025-26.pdf`

**Acceptance:** Batch PDF downloads with 61 pages (cover + 60 properties). Each page is a valid N09-Ka.

---

## Phase 5 — Collection (N10) + Auto-link

### Task 5.1 — Marathi numerals utility

**File:** `lib/utils/marathi-numerals.ts`

Converts an amount to Marathi words for receipt PDFs.  
Example: `1200` → `"एक हजार दोनशे रुपये"`

Implement for amounts up to ₹99,999 (sufficient for GP tax receipts).  
Marathi number words are different from Hindi — use correct Marathi vocabulary.

Key words to implement:
```
एक, दोन, तीन, चार, पाच, सहा, सात, आठ, नऊ, दहा,
अकरा, बारा, तेरा, चौदा, पंधरा, सोळा, सतरा, अठरा, एकोणीस, वीस,
एकवीस...नव्वद, शंभर, हजार
```

Export: `amountToMarathiWords(amount: number): string`

**Acceptance:** Unit-testable function. `amountToMarathiWords(1200)` = `"एक हजार दोनशे रुपये"`.

---

### Task 5.2 — Collection entry page + citizen search

**File:** `app/[locale]/(demo)/collect/page.tsx`

Two-step UI (state managed in Client Component):

Step 1 — Search:
- Text input: search by name or mobile
- Server Action: `getOutstandingDemands` (see below) — debounced on input change
- Show citizen cards with total outstanding balance
- Click citizen → advance to Step 2

Step 2 — Select demands + pay:
- Property cards for selected citizen
- Each card shows UNPAID/PARTIAL demand rows with checkbox + amount input (defaults to `balance`)
- Payment mode: रोख (CASH) / बँक (BANK)
- Cheque number field: shown only when BANK selected
- Running total: "एकूण भरणा: ₹{sum}"
- "पावती तयार करा" submit button

**Action:** `lib/actions/collection.ts → getOutstandingDemands(citizenId: string)`

```ts
return prisma.taxDemand.findMany({
  where: { property: { citizenId }, status: { not: 'PAID' } },
  include: { property: true, fy: true },  // explicit include — no N+1
  orderBy: [{ fyId: 'asc' }, { taxType: 'asc' }, { halfYear: 'asc' }]
})
```

**Acceptance:** Searching "रमेश" returns matching citizens. Selecting a citizen shows their outstanding demands grouped by property.

---

### Task 5.3 — Collection Server Action (Prisma transaction)

**File:** `lib/actions/collection.ts → collectPayment(input: CollectPaymentInput)`

```ts
type CollectPaymentInput = {
  citizenId: string
  paymentMode: 'CASH' | 'BANK'
  chequeNo?: string
  demands: Array<{ demandId: string; amount: number }>
}
```

**Pre-transaction validation (fail fast, before DB):**
```ts
if (input.paymentMode === 'BANK' && !input.chequeNo?.trim()) {
  return { error: 'बँक भरणासाठी चेक क्रमांक आवश्यक आहे' }
}
const totalAmount = input.demands.reduce((s, d) => s + d.amount, 0)
if (totalAmount <= 0) return { error: 'रक्कम शून्यापेक्षा जास्त असणे आवश्यक आहे' }
```

**Transaction:**
```ts
return await prisma.$transaction(async (tx) => {

  // Validate no overpayment — check all demands first
  for (const dp of input.demands) {
    const demand = await tx.taxDemand.findUniqueOrThrow({
      where: { id: dp.demandId },
      include: { property: true }
    })
    if (new Decimal(dp.amount).greaterThan(demand.balance)) {
      throw new Error(`रक्कम शिल्लकीपेक्षा जास्त: ${demand.taxType}`)
    }
  }

  // Generate receipt number via PostgreSQL sequence (race-condition safe)
  const [{ nextval }] = await tx.$queryRaw<[{ nextval: bigint }]>`
    SELECT nextval('receipt_seq_2025_26')
  `
  const receiptNo = `RCP-2025-26-${String(Number(nextval)).padStart(4, '0')}`

  // Create TaxReceipt
  const receipt = await tx.taxReceipt.create({
    data: {
      receiptNo,
      citizenId: input.citizenId,
      amount: new Decimal(totalAmount),
      paymentMode: input.paymentMode,
      chequeNo: input.chequeNo ?? null,
    }
  })

  // Pre-fetch all demands + account heads + bank account before the loop
  const demandIds = input.demands.map(d => d.demandId)
  const demands = await tx.taxDemand.findMany({
    where: { id: { in: demandIds } },
    include: { property: true }
  })
  const demandMap = new Map(demands.map(d => [d.id, d]))

  const TAX_HEAD_CODE: Record<string, string> = {
    HOUSE: '0101', WATER: '0102', SANITATION: '0103', LIGHTING: '0104'
  }
  const taxTypes = [...new Set(demands.map(d => d.taxType))]
  const accountHeads = await tx.accountHead.findMany({
    where: { code: { in: taxTypes.map(t => TAX_HEAD_CODE[t]) } }
  })
  const headMap = new Map(accountHeads.map(h => [h.code, h]))

  const bankAccount = input.paymentMode === 'BANK'
    ? await tx.bankAccount.findFirstOrThrow()
    : null

  // Active FY for cash book entry
  const activeFy = await tx.financialYear.findFirstOrThrow({
    where: { status: 'ACTIVE' }
  })

  // Process each demand payment
  for (const dp of input.demands) {
    const demand = demandMap.get(dp.demandId)!
    const dpAmount = new Decimal(dp.amount)

    // Junction row
    await tx.taxReceiptDemand.create({
      data: { receiptId: receipt.id, demandId: dp.demandId, amount: dpAmount }
    })

    // Update N09 demand
    const newCollected = new Decimal(demand.collected).plus(dpAmount)
    const newBalance   = new Decimal(demand.totalPayable).minus(newCollected)
    const newStatus: DemandStatus =
      newBalance.lessThanOrEqualTo(0) ? 'PAID' :
      newCollected.greaterThan(0)     ? 'PARTIAL' : 'UNPAID'

    await tx.taxDemand.update({
      where: { id: dp.demandId },
      data: { collected: newCollected, balance: newBalance, status: newStatus }
    })

    // N05 cash book entry
    const accountHead = headMap.get(TAX_HEAD_CODE[demand.taxType])!
    await tx.cashBookEntry.create({
      data: {
        fyId:          activeFy.id,
        date:          receipt.date,
        entryType:     'RECEIPT',
        taxReceiptId:  receipt.id,
        accountHeadId: accountHead.id,
        bankAccountId: bankAccount?.id ?? null,
        cashAmount:    input.paymentMode === 'CASH' ? dpAmount : new Decimal(0),
        bankAmount:    input.paymentMode === 'BANK' ? dpAmount : new Decimal(0),
        narration:     `${demand.taxType} - ${demand.property.propertyNo} - ${receiptNo}`,
        receiptRef:    receiptNo,
      }
    })

    // N06 classified receipt — upsert
    const month = receipt.date.getMonth() + 1
    await tx.classifiedReceipt.upsert({
      where: { fyId_month_accountHeadId: {
        fyId: activeFy.id, month, accountHeadId: accountHead.id
      }},
      create: {
        fyId: activeFy.id, month, accountHeadId: accountHead.id,
        totalAmount: dpAmount, entryCount: 1
      },
      update: {
        totalAmount: { increment: dpAmount },
        entryCount:  { increment: 1 }
      }
    })
  }

  return { receiptId: receipt.id, receiptNo }
})
```

On success: redirect to `/[locale]/receipts/[receiptId]`

**Acceptance:** One payment creates: 1 tax_receipt, N junction rows, N demand updates, N cash_book_entries, N classified_receipt upserts — all in one transaction. Concurrent requests each get a unique receipt number from the sequence.

---

### Task 5.4 — N10 Receipt PDF

**Files:** `lib/pdf/n10-receipt.tsx`, `app/[locale]/(demo)/receipts/[id]/page.tsx`, `app/[locale]/(demo)/receipts/[id]/pdf/route.ts`

Receipt view page: HTML view with receipt details + "PDF उतरवा" button linking to `/receipts/[id]/pdf`

PDF route:
```ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
```

PDF content (hardcoded Marathi strings):
```
Header:
  {gp.nameMr}
  "कर पावती - नमुना १०"
  पावती क्र.: RCP-2025-26-0001

Two columns:
  Left: तारीख, नागरिक नाव, मालमत्ता क्र., सर्वे क्र.
  Right: QR code (see QR URL note below)

Payment table:
  कर प्रकार | सहामाही | एकूण देय | भरलेली रक्कम | शिल्लक

Total:
  एकूण भरणा: ₹{amount}
  ({amountToMarathiWords(amount)})
  अदाई प्रकार: रोख / बँक

Footer:
  ग्रामसेवक स्वाक्षरी
```

**QR URL:** Always encode with Marathi locale prefix:
```ts
const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/mr/receipts/verify/${receipt.qrToken}`
```
Hard-code `/mr/` — PDFs are always Marathi documents regardless of user's UI locale.

**Acceptance:** Receipt PDF shows correct amounts and Marathi words. QR encodes correct URL with `/mr/` prefix.

---

### Task 5.5 — Receipt verify page (public, QR scan landing)

**File:** `app/[locale]/(demo)/receipts/verify/[qrToken]/page.tsx`

No auth required. Fetches by `qrToken`:
```ts
prisma.taxReceipt.findUnique({
  where: { qrToken },
  include: {
    citizen: true,
    receiptDemands: { include: { demand: { include: { property: true } } } }
  }
})
```

If not found: show "अवैध पावती क्रमांक" with GP name.

If found: show
- GP name + "✓ अधिकृत ग्रामपंचायत कर पावती"
- Receipt No, Date, Citizen Name, Property, Amount, Payment Mode
- Each demand: tax type, half-year, amount paid

**Acceptance:** QR scan from PDF opens this page with correct data. Invalid token shows Marathi error.

---

## Phase 6 — Cash Book + Classified Register Views

### Task 6.1 — Cash Book view (N05)

**File:** `app/[locale]/(demo)/cashbook/page.tsx`

Month selector (default: current calendar month).

Running balance via raw SQL — scoped to full FY, filtered to display month in app code:

```ts
const rows = await prisma.$queryRaw<CashBookRow[]>`
  WITH fy_entries AS (
    SELECT
      cbe.id,
      cbe.date,
      cbe.entry_type,
      ah.name_mr    AS account_head_mr,
      cbe.cash_amount,
      cbe.bank_amount,
      cbe.narration,
      cbe.receipt_ref,
      tr.receipt_no,
      SUM(cbe.cash_amount) OVER (
        PARTITION BY cbe.fy_id
        ORDER BY cbe.date, cbe.id
        ROWS UNBOUNDED PRECEDING
      ) AS running_cash,
      SUM(cbe.bank_amount) OVER (
        PARTITION BY cbe.fy_id
        ORDER BY cbe.date, cbe.id
        ROWS UNBOUNDED PRECEDING
      ) AS running_bank
    FROM cash_book_entry cbe
    JOIN account_head ah ON ah.id = cbe.account_head_id
    JOIN tax_receipt tr   ON tr.id = cbe.tax_receipt_id
    WHERE cbe.fy_id = ${fyId}
    ORDER BY cbe.date, cbe.id
  )
  SELECT * FROM fy_entries
  WHERE EXTRACT(MONTH FROM date) = ${month}
`
```

Table: तारीख | तपशील | खाते शीर्ष | रोख जमा | बँक जमा | रोख शिल्लक | बँक शिल्लक | पावती क्र.

Opening balance row at top (from `opening_balance` — zero in demo).

"पावती पहा" link on each row → `/receipts/[taxReceiptId]`

**Acceptance:** Running balance is cumulative from FY start, not reset per month. Switching months shows correct balance continuation.

---

### Task 6.2 — Classified Register view (N06)

**File:** `app/[locale]/(demo)/classified/page.tsx`

Fetch all `classified_receipt` rows for active FY with account head joins.

Display: grid — rows = account heads, columns = months Apr–Mar (in FY order: Apr=4, May=5...Mar=3).  
Each cell: `total_amount` for that month+head.  
Bottom row: monthly totals. Right column: annual totals per head.

**Acceptance:** Grid cells match cash book entries. Annual total per head matches N06 `SUM(total_amount)`.

---

### Task 6.3 — Dashboard numbers wired up

**File:** `app/[locale]/(demo)/page.tsx` (replace static shell from Task 1.4)

```ts
const activeFy = await prisma.financialYear.findFirstOrThrow({ where: { status: 'ACTIVE' } })
const now = new Date()
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0)

const [totalProperties, demandAgg, collectionAgg, arrearAgg, recentReceipts] =
  await Promise.all([
    prisma.property.count({ where: { status: 'ACTIVE' } }),
    prisma.taxDemand.aggregate({
      _sum: { totalPayable: true },
      where: { fyId: activeFy.id }
    }),
    prisma.taxReceipt.aggregate({
      _sum: { amount: true },
      where: { date: { gte: monthStart, lte: monthEnd } }
    }),
    // Outstanding = all unpaid/partial balance in active FY
    prisma.taxDemand.aggregate({
      _sum: { balance: true },
      where: { fyId: activeFy.id, status: { not: 'PAID' } }
    }),
    prisma.taxReceipt.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { citizen: true }
    }),
  ])
```

**Acceptance:** All four stat cards show real numbers after collections. Recent collections table shows last 5 receipts.

---

## Phase 7 — i18n Polish

### Task 7.1 — Complete translation strings

**Files:** `messages/mr.json`, `messages/en.json`

Complete all keys: nav labels, page titles, table headers, form labels, error messages, status badges, button labels, dashboard stat labels.

PDF Marathi strings remain as hardcoded constants in PDF template files — they are legal government formats, not UI strings.

**Acceptance:** All UI text translates correctly. PDF content unchanged regardless of selected locale.

---

### Task 7.2 — Language toggle

**File:** `components/locale-switcher.tsx`

Client Component. Uses `useRouter()` from `next-intl/client` with `{ locale }` option.  
Store preference in `NEXT_LOCALE` cookie (7-day expiry) for persistence across refresh.

Placement: top-right corner of header nav.  
Display: `मराठी | English` — active locale underlined.

**Acceptance:** Toggle switches all UI labels. Refresh retains selected language. PDFs always download in Marathi.

---

## File Structure

```
apps/grampanchayat/
├── app/
│   └── [locale]/
│       └── (demo)/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── citizens/page.tsx, new/page.tsx, [id]/page.tsx
│           ├── properties/page.tsx, new/page.tsx, [id]/page.tsx
│           ├── assessment/page.tsx, pdf/route.ts
│           ├── demand/page.tsx,
│           │          pdf/[propertyId]/route.ts,
│           │          pdf/batch/route.ts
│           ├── collect/page.tsx
│           ├── receipts/[id]/page.tsx, [id]/pdf/route.ts
│           │           verify/[qrToken]/page.tsx
│           ├── cashbook/page.tsx
│           └── classified/page.tsx
├── lib/
│   ├── db/prisma.ts
│   ├── actions/
│   │   ├── citizens.ts
│   │   ├── properties.ts
│   │   ├── assessment.ts
│   │   ├── demand.ts
│   │   └── collection.ts
│   ├── pdf/
│   │   ├── fonts/Lohit-Devanagari.ttf   ← commit this binary
│   │   ├── n08-assessment.tsx
│   │   ├── n09-ka-notice.tsx
│   │   └── n10-receipt.tsx
│   └── utils/
│       └── marathi-numerals.ts
├── components/
│   ├── nav.tsx
│   ├── locale-switcher.tsx
│   └── collection/demand-selector.tsx
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── data/citizens.ts
└── messages/
    ├── mr.json
    └── en.json
```

---

## Dependencies

```bash
pnpm add @prisma/client prisma next-intl @react-pdf/renderer qrcode decimal.js
pnpm add -D @types/qrcode
```

---

## Environment Variables

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase transaction pooler (port 6543) with `?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct connection (port 5432) — migrations only |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3004` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `mr` |
