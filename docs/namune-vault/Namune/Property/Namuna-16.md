---
namuna: 16
name_en: Fixed and Movable Assets Register
name_mr: जड वस्तु संग्रह व जंगम मालमत्ता नोंदवही
category: Property
who_maintains: Gram Sevak
who_approves: Sarpanch; CEO ZP (at audit)
frequency: Updated on acquisition/disposal; annual physical verification
submitted_to: PS (audit); Internal
audit_risk: HIGH
tags: [namuna, property, gram-panchayat, movable-assets, fixed-assets]
---

# Namuna 16 — जड वस्तु संग्रह व जंगम मालमत्ता नोंदवही (Movable Assets Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Property |
| Maintains | Gram Sevak |
| Approves | Sarpanch; CEO ZP |
| Frequency | On acquisition/disposal; annual physical verification |
| Deadline | Annual verification report [VERIFY: deadline] |
| Submitted To | PS at audit; Internal |
| Audit Risk | HIGH |
| Legal Ref | Lekha Sanhita Ch.VII [VERIFY]; MVP Act §57 [VERIFY] |

## Purpose
Records all MOVABLE assets owned by the GP — furniture, office equipment, vehicles, machinery, tools. Distinct from immovable property (N22). Annual physical verification is mandatory. Feeds into balance sheet (N4) and annual statement (N3).

## Key Fields
- Serial number; Article description (make, model, specification)
- Date of acquisition; Source (purchased via N12 / received as grant — scheme name)
- Cost/value at acquisition; Current location; Condition (good/fair/unserviceable)
- Date of last physical verification
- Disposal: date, method (auction/condemnation), amount realised (→N7), resolution number

## Dependencies
**Depends On:** [[Namuna-12]] [[Namuna-20]]
**Feeds Into:** [[Namuna-03]] [[Namuna-04]]

## Validation Rules
- Annual physical verification is mandatory — gap of 2+ years is objected
- Every asset must have a unique serial number and location tag
- Disposal by auction only with GP resolution — private sale is major objection
- Assets received as government scheme grants must be entered — missing scheme assets common objection
- Condemnation must be sanctioned by competent authority [VERIFY: limit]

## Audit Risk
HIGH — Common objections:
- Assets not physically verified for 2+ years
- Disposed assets still in register (inflating asset values)
- Scheme assets not entered (generator, computers from government schemes unaccounted)
- Private sale of GP assets without auction

## Related Registers
[[Namuna-12]] Purchase source | [[Namuna-20]] Works-created assets | [[Namuna-04]] Balance Sheet | [[Namuna-03]] Annual Statement
