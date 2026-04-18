---
namuna: 20
name_en: Works Register (Estimate, Measurement, Bill, Payment)
name_mr: कामाच्या अंदाजाची नोंदवही
category: Works
who_maintains: Gram Sevak (administrative); JE/Civil Engineer (technical)
who_approves: GP resolution (admin sanction); BDO/EE (technical sanction above limit)
frequency: As needed
submitted_to: Panchayat Samiti (on completion); CEO ZP (audit)
audit_risk: VERY HIGH
tags: [namuna, works, gram-panchayat, capital-works, measurement, estimate, works-bill]
---

# Namuna 20 — कामे नोंदवही (Works Register)

> **Four physical components:**
> - **20** — Works list and estimate register
> - **20क** — मोजमाप वही (Measurement Book)
> - **20ख** — कामाचे देयक (Work Bill/Invoice)
> - **20ख(1)** — Payment acknowledgment register

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Works |
| Maintains | Gram Sevak + JE/Engineer |
| Approves | GP resolution + technical sanction |
| Frequency | Per work (as needed) |
| Deadline | N/A — maintained till completion and audit clearance |
| Submitted To | PS on completion; CEO ZP audit |
| Audit Risk | VERY HIGH |
| Legal Ref | Lekha Sanhita Ch.VI [VERIFY rules]; Maharashtra PWM (GP-level applicability) [VERIFY threshold] |

## Purpose
Master register for ALL capital and maintenance works — from estimate sanction through measurement, billing, and payment. No works expenditure is valid without entries in this chain.

## Key Fields
**N20 (Estimate Register):** Work no.; work name; location; fund source (own/14FC/SFC/scheme); account head; estimated cost (schedule of quantities × SOR rates); technical sanction (authority + date); admin approval (GP resolution no. + date); contractor details; contract amount; commencement/completion dates; final cost

**N20क (Measurement Book):** Work no.; date; item description; unit; quantity this visit; cumulative quantity; rate; amount; engineer signature; Gram Sevak countersignature

**N20ख (Work Bill):** Bill no.; work/contractor ref.; MB folio ref.; description; gross amount; deductions (TDS/security deposit/penalty); net payable; engineer certification; Sarpanch approval

**N20ख(1) (Payment Register):** Payment no.; date; contractor name; cheque/voucher no.; amount paid; contractor acknowledgment signature

## Dependencies
**Depends On:** [[Namuna-01]] [[Namuna-19]]
**Feeds Into:** [[Namuna-05]] [[Namuna-16]] [[Namuna-19]]

## Validation Rules
- No work starts without BOTH technical sanction AND administrative sanction
- Estimates from approved Schedule of Rates (SOR) — arbitrary rates objected
- Measurements recorded BEFORE payment — payment without MB entry = fraud indicator
- MB entries sequential and indelible — torn pages are audit objections
- Contractor payment ≤ certified measurement value — excess payment without variation order is illegal
- TDS deducted at prescribed rates and deposited [VERIFY: current TDS rate on contractor payments]
- Works above prescribed limit must be tendered [VERIFY: GP-level threshold]
- Utilisation Certificate issued for grant-funded works [VERIFY: UC deadline]

## Audit Risk
VERY HIGH — Most objected works category:
- Payment without measurement book (MB) entry
- MB pages torn/overwritten to inflate quantities
- Technical sanction obtained after work started
- Works awarded without tender process
- TDS deducted but not remitted to Income Tax

## Works Chain
**[[Namuna-01]] (provision) → N20 (sanction) → [[Namuna-19]] (attendance) → N20 sub-forms (measure → bill → pay) → [[Namuna-05]] (cash book)**
