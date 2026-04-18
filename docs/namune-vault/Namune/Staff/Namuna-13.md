---
namuna: 13
name_en: Staff List and Pay Scale Register
name_mr: कर्मचारी वर्गाची सुची व वेतनश्रेणी नोंदवही
category: Staff
who_maintains: Gram Sevak
who_approves: Sarpanch; Panchayat Samiti (sanctioned posts)
frequency: As needed (updated on appointments/increments/exits)
submitted_to: Internal; PS (for post sanction)
audit_risk: HIGH
tags: [namuna, staff, gram-panchayat, establishment, personnel]
---

# Namuna 13 — कर्मचारी वर्गाची सुची (Staff List & Pay Scale Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Staff |
| Maintains | Gram Sevak |
| Approves | Sarpanch; PS (sanctioned posts) |
| Frequency | As needed |
| Deadline | N/A |
| Submitted To | Internal; PS (post sanction) |
| Audit Risk | HIGH |
| Legal Ref | MVP Act §57 [VERIFY: staff powers section]; GP Appointment Rules [VERIFY]; Lekha Sanhita Ch.VIII [VERIFY] |

## Purpose
Master register of ALL GP employees — regular, temporary, and daily wage — with designations, pay scales, appointment dates, and current salary. The basis for payroll (N21) and travel allowance (N31) calculations. No employee should receive salary without an entry here.

## Key Fields
- Serial no.; Employee name; Designation/post
- Sanctioned post reference (PS sanction no.); Category (permanent/temporary/daily wage)
- Date of appointment; Date of birth; Educational qualifications
- Pay scale; Current basic salary; Date of last increment; Next increment date
- Allowances applicable (HRA, DA rates); GPF/PF account number
- Superannuation date; Remarks (disciplinary, leave encashment)

## Dependencies
**Depends On:** *(none — starts from appointment orders)*
**Feeds Into:** [[Namuna-21]] [[Namuna-31]]

## Validation Rules
- No salary payment (N21) to any employee not listed here with a sanctioned post
- Increments must be sanctioned — auto-increments without sanction are objected
- Total salary commitments must be within N1 salary head provision
- Staff strength must not exceed PS-sanctioned cadre strength

## Audit Risk
HIGH — Common objections:
- Salary paid to employees not in N13
- Posts filled without PS sanction
- Increments granted without competent authority order
- Staff strength exceeding sanctioned cadre

## Related Registers
[[Namuna-21]] Payroll | [[Namuna-31]] Travel Allowance | [[Namuna-01]] Budget (salary provision)
