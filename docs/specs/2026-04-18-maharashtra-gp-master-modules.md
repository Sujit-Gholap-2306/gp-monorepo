---
title: Maharashtra GP — Master Modules Before Namune
date: 2026-04-18
sources: namune dependency analysis + mahapanchayats.in training + PRIASoft + e-GramSwaraj
tags: [master-data, setup, gram-panchayat, maharashtra]
---

# Maharashtra GP — Master Modules

These modules must exist before any namune (register) can be entered. Derived from the DEPENDS_ON chain across all 33 namune and cross-referenced with live GP software (mahapanchayats.in, PRIASoft, e-GramSwaraj).

---

## Tier 1 — Before any namune

### 1. GP Profile
Organization-level record for the Gram Panchayat.

| Field | Notes |
|-------|-------|
| GP name (Marathi + English) | |
| GP code | State-assigned |
| District, Taluka | |
| Panchayat Samiti name | |
| Sarpanch name + mobile | |
| Gram Sevak name + mobile | |
| GP address | |
| Registered bank accounts | → feeds Bank Account master |

---

### 2. Financial Year
All 33 namune are year-scoped. One active FY at a time.

| Field | Notes |
|-------|-------|
| Year label | e.g. 2025-26 |
| Start date | 1 April |
| End date | 31 March |
| Status | active / closed |

---

### 3. Assessment Year
Tax assessment cycle is separate from the accounting year. A GP may revise assessments on a different schedule than its financial year close.

| Field | Notes |
|-------|-------|
| Year label | e.g. 2025-26 |
| Tax revision resolution number | GP resolution that fixed rates |
| Tax revision date | |
| Status | active / closed |

---

### 4. Account Head Master
Budget head codes per Maharashtra GP Lekha Sanhita 2011. Every transaction in N01, N05, N06, N12, N26 references a head code. No head = no entry.

| Field | Notes |
|-------|-------|
| Head code | e.g. 0045 |
| Description (Marathi) | |
| Description (English) | |
| Category | income / expenditure |
| Sub-category | establishment / works / maintenance / grants / tax / other |
| Flags | is_salary_head, is_works_head, sc_st_applicable, women_applicable |

---

### 5. Bank Account Master
N05 (Cash Book) has separate cash and bank columns per account.

| Field | Notes |
|-------|-------|
| Bank name | |
| Branch | |
| Account number | |
| IFSC | |
| Account type | savings / current / FD |
| Linked to GP | |

---

### 6. Citizen / Household Master
Every taxpayer, service receiver, and certificate applicant is a citizen record. Aadhaar-linked. Required before property registration, tax demand, or certificate issuance.

| Field | Notes |
|-------|-------|
| Citizen ID | system-generated |
| Name (Marathi + English) | |
| Aadhaar number | |
| Mobile | |
| Ward number | |
| Address | |
| Household ID | for grouping family members |

---

### 7. Elected Member Master
GP resolutions are signed by elected members. Approval chain references designation. Required before any resolution-backed entry (N01, N08, N20).

| Field | Notes |
|-------|-------|
| Name | |
| Ward number | |
| Role | Sarpanch / Upa-Sarpanch / Ward Member |
| Election date | |
| Tenure end date | |
| Mobile | |

---

### 8. Opening Balance
Previous year's closing cash, bank balance, advances, and liabilities carried forward. Required before the first transaction of a new financial year.

| Field | Notes |
|-------|-------|
| Financial year | |
| Account head | → Account Head master |
| Opening debit balance | |
| Opening credit balance | |

---

## Tier 2 — Before specific namune clusters

### 9. Property Master
Physical property record. Separate from N08 (Tax Assessment). First register the property; then assess it. Linked to a citizen (owner).

| Field | Notes |
|-------|-------|
| Property ID | system-generated |
| Survey / Gat number | |
| Property type | residential / commercial / tower / solar / agricultural |
| Built-up area (sq. ft.) | |
| Ward number | |
| Owner | → Citizen master |
| Construction year | |
| Usage | self-occupied / rented / vacant |

Feeds: N08 → N09 → N10

---

### 10. Tax Rate by Category
GP passes a resolution fixing rates per property type per assessment year. Rates cannot be applied without this master.

| Field | Notes |
|-------|-------|
| Assessment year | → Assessment Year master |
| Property type | matches Property master types |
| Tax type | house tax / water tax / sanitation / lighting |
| Rate (%) or flat amount | |
| Resolution number | GP resolution that fixed this rate |

Feeds: N08

---

### 11. Water Connection Master
Water charges are a major non-tax revenue head. Tracked separately from property tax with connection-level records.

| Field | Notes |
|-------|-------|
| Connection number | |
| Citizen | → Citizen master |
| Connection type | domestic / commercial / industrial |
| Deposit paid | |
| Tariff slab | |
| Connection date | |
| Status | active / disconnected |

Feeds: N11 (misc demand), N07 (receipt), N05

---

### 12. Scheme / Grant Master
Works and welfare spending are scheme-funded. N20 and N28 both require knowing which scheme a work or expenditure falls under.

| Field | Notes |
|-------|-------|
| Scheme code | |
| Scheme name | e.g. MGNREGA, SBM, JJM, 14th/15th FC |
| Funding type | central / state / own source |
| Grant order number | |
| Sanctioned amount | |
| Financial year | |

Feeds: N01, N20, N28

---

### 13. Sanctioned Post Master
PS-issued list of approved posts. No employee can appear on N13 (Staff List) or N21 (Payroll) without a sanctioned post.

| Field | Notes |
|-------|-------|
| Post code | |
| Designation | e.g. Gram Sevak, Water Man, Sweeper |
| PS sanction order number | |
| Sanction date | |
| Sanctioned strength | number of posts |
| Pay band reference | → Pay Scale master |

Feeds: N13 → N21

---

### 14. Pay Scale / Allowance Master
State-defined pay bands and allowance rates. DA rates change on state GR revision. Required for N21 payroll computation.

| Field | Notes |
|-------|-------|
| Pay band | |
| Grade pay | |
| DA rate (%) | |
| DA effective date | |
| HRA rate (%) | |
| Professional tax slab | |

Feeds: N13, N21

---

### 15. Vendor / Contractor Master
N20 (Works Register) records the awarded contractor. No works payment without a registered vendor.

| Field | Notes |
|-------|-------|
| Vendor name | |
| GST number | |
| PAN | |
| Address | |
| Category | labour contractor / material supplier / civil contractor |
| Bank account (for payment) | |

Feeds: N20, N12

---

### 16. Cheque Book Master
N05 and N12 both reference cheque numbers. Cheque books are pre-numbered and must be tracked; audit objection if any leaf is unaccounted.

| Field | Notes |
|-------|-------|
| Bank account | → Bank Account master |
| Series from | first cheque number |
| Series to | last cheque number |
| Date issued | date GP received this book from bank |
| Leaves used | running count |

Feeds: N05, N12

---

## Dependency Map

```
GP Profile ──────────────────────────────────┐
Financial Year ──────────────────────────────┤
Assessment Year ─────────────────────────────┤→ All namune headers
Account Head Master ─────────────────────────┤
Bank Account Master ─────────────────────────┤
Elected Member Master ───────────────────────┘

Citizen Master → Property Master → Tax Rate → N08 → N09 → N10
Water Connection Master ──────────────────── → N11 → N07 → N05

Scheme/Grant Master ──────────────────────── → N20 → N28
Sanctioned Post + Pay Scale ─────────────── → N13 → N21
Vendor/Contractor Master ────────────────── → N20 → N12

Opening Balance ─────────────────────────── → N05 (FY start)
Cheque Book Master ──────────────────────── → N05, N12
```

---

## Build Order

```
1. GP Profile
2. Financial Year + Assessment Year
3. Account Head Master
4. Bank Account Master + Cheque Book Master
5. Elected Member Master
6. Citizen Master
7. Property Master + Tax Rate by Category
8. Water Connection Master
9. Sanctioned Post + Pay Scale
10. Scheme / Grant Master
11. Vendor / Contractor Master
12. Opening Balance (per FY)
    ↓
    N01 Budget ← first namune
```
