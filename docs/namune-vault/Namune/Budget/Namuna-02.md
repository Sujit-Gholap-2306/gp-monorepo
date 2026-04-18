---
namuna: 2
name_en: Re-appropriation and Reallocation Register
name_mr: पुनर्विनियोजन व नियत वाटप नोंदवही
category: Budget
who_maintains: Gram Sevak
who_approves: Gram Panchayat / Panchayat Samiti
frequency: As needed
submitted_to: Panchayat Samiti
audit_risk: HIGH
tags: [namuna, budget, gram-panchayat, re-appropriation]
---

# Namuna 2 — पुनर्विनियोजन व नियत वाटप (Re-appropriation Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Budget |
| Maintains | Gram Sevak |
| Approves | GP Resolution → Panchayat Samiti (above threshold) |
| Frequency | As needed (event-driven) |
| Deadline | N/A — contemporaneous with resolution |
| Submitted To | Panchayat Samiti (resolution copy) |
| Audit Risk | HIGH |
| Legal Ref | Lekha Sanhita Rule 21 [VERIFY]; MVP Act §61 [VERIFY] |

## Purpose
Transfers budget provision between account heads when one head runs short and another has surplus. Net effect on total budget is zero. Prevents illegal expenditure beyond head-wise provision without altering the overall approved budget.

## Key Fields
- Serial number; Date; Resolution number
- Account head losing provision (number + description + amount out)
- Account head gaining provision (number + description + amount in)
- Reason for re-appropriation
- Post-transfer balance for each head
- PS sanction reference (if required)

## Dependencies
**Depends On:** [[Namuna-01]]
**Feeds Into:** [[Namuna-03]] [[Namuna-26]]

## Validation Rules
- Amounts transferred out = amounts transferred in (zero net)
- Cannot move from salary heads to non-establishment without PS sanction [VERIFY]
- Every entry must reference the GP resolution number
- Post-transfer head balances must reconcile forward to N26 revised columns

## Audit Risk
HIGH — Common objections:
- Re-appropriation done verbally without resolution
- PS sanction bypassed where legally required
- Re-appropriated amounts creating overspend in receiving head

## Related Registers
[[Namuna-01]] Budget | [[Namuna-03]] Annual Statement | [[Namuna-26]] Monthly Returns
