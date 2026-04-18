---
namuna: 25
name_en: Investment Register
name_mr: गुतवणुक नोंदवही
category: Advances
who_maintains: Gram Sevak
who_approves: GP Resolution; PS sanction [VERIFY]
frequency: As needed; interest entries on receipt
submitted_to: Internal; PS on request
audit_risk: MEDIUM
tags: [namuna, advances, gram-panchayat, investments, fixed-deposit]
---

# Namuna 25 — गुतवणुक नोंदवही (Investment Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Advances |
| Maintains | Gram Sevak |
| Approves | GP Resolution; PS [VERIFY: sanction required?] |
| Frequency | As needed; interest entries monthly or on receipt |
| Deadline | N/A |
| Submitted To | Internal; PS on request |
| Audit Risk | MEDIUM |
| Legal Ref | Lekha Sanhita Ch.VI [VERIFY: investments rule]; MVP Act §61 [VERIFY: fund investment powers] |

## Purpose
Records all investments made by the GP from surplus funds — FDs, savings, government bonds. Tracks interest earned and maturity dates. Investments must be only in prescribed instruments.

## Key Fields
- Serial no.; Date of investment; Bank/institution name
- Type of instrument (FD/savings/NSC/government bond); Deposit receipt/bond number
- Principal amount; Rate of interest; Maturity date
- Interest received (date, amount, N7 receipt no.)
- Maturity amount received (date, N5 folio reference)
- Premature withdrawal details (resolution no., penalty)
- Balance outstanding

## Dependencies
**Depends On:** [[Namuna-05]]
**Feeds Into:** [[Namuna-03]] [[Namuna-04]] [[Namuna-05]]

## Validation Rules
- Investments only in permitted instruments (nationalised banks, post offices, government bonds) [VERIFY: prescribed list]
- GP resolution required before each investment
- Interest received immediately recorded as income in N7 → N5
- Premature withdrawal requires GP resolution + PS sanction [VERIFY]
- Total investments must appear in N4 (balance sheet assets)

## Audit Risk
MEDIUM — Common objections:
- Investment in non-permitted/private institutions
- Interest not received for years (lapsed FDs)
- Premature withdrawal without proper sanction
- Interest received not receipted

## Related Registers
[[Namuna-05]] Cash Book | [[Namuna-07]] General Receipt | [[Namuna-04]] Balance Sheet | [[Namuna-03]] Annual Statement
