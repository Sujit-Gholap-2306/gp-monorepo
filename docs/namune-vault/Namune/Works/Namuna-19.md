---
namuna: 19
name_en: Labour Attendance Register
name_mr: कामावर असलेल्या व्यक्तीचा हजेरीपट
category: Works
who_maintains: Gram Sevak / Site Supervisor
who_approves: Sarpanch (weekly); JE (scheme works)
frequency: Daily
submitted_to: Internal (used in N20ख)
audit_risk: VERY HIGH
tags: [namuna, works, gram-panchayat, labour, attendance, muster-roll]
---

# Namuna 19 — कामावर असलेल्या व्यक्तीचा हजेरीपट (Labour Attendance Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Works |
| Maintains | Gram Sevak / Site Supervisor |
| Approves | Sarpanch (weekly); JE (scheme works) [VERIFY] |
| Frequency | Daily (for each active work site) |
| Deadline | N/A — updated on day of work |
| Submitted To | Internal; feeds work bills (N20ख) |
| Audit Risk | VERY HIGH |
| Legal Ref | Lekha Sanhita Ch.VI [VERIFY]; MGNREGS MIS norms if applicable [VERIFY] |

## Purpose
Daily attendance record for labour engaged on GP works. Each worker's name, category, days attended, and earnings are recorded per work site. Forms the basis for calculating the labour component of work bills (N20ख). A primary target for muster roll fraud.

## Key Fields
- Work name and number (from N20)
- Date; Worker name; Father's/husband's name; Village/address
- Skill category (skilled/semi-skilled/unskilled)
- Daily wage rate (per GP or MGNREGS schedule)
- Attendance per day (present/absent mark)
- Days worked (total); Amount earned
- Worker signature or thumb impression (collected same day)
- Site supervisor signature; Muster roll number

## Dependencies
**Depends On:** [[Namuna-20]]
**Feeds Into:** [[Namuna-20]]

## Validation Rules
- Worker count per day must match physical headcount — inflated muster = major fraud
- Wage rates must match prescribed schedule — excess payment without sanction objected
- Worker signatures/thumb impressions must be collected same day — backdated signatures invalid
- Labour attendance totals must agree with labour cost in N20ख work bill
- For MGNREGS works: MIS update requirements apply [VERIFY]

## Audit Risk
VERY HIGH — Primary fraud vector in GP works:
- Inflated muster rolls (ghost workers paid wages)
- Attendance signatures collected in bulk (one day's bulk signing for multiple days)
- Worker count on register exceeds actual site headcount
- Wage rate paid exceeds prescribed schedule

## Works Chain Position
**[[Namuna-20]] (sanctioned) → N19 (attendance recorded) → [[Namuna-20]] (measurement/bill)**
