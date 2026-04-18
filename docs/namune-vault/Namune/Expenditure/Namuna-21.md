---
namuna: 21
name_en: Employee Payroll Register
name_mr: कर्मचाऱ्याचे देयकांची नोंदवही
category: Expenditure
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: Monthly
submitted_to: Internal (retained with cash book)
audit_risk: VERY HIGH
tags: [namuna, expenditure, gram-panchayat, payroll, salary]
---

# Namuna 21 — कर्मचाऱ्याचे देयकांची नोंदवही (Employee Payroll Register)

## Quick Reference
| Field | Value |
|-------|-------|
| Category | Expenditure |
| Maintains | Gram Sevak |
| Approves | Sarpanch |
| Frequency | Monthly |
| Deadline | Last day of month (or first of next) [VERIFY] |
| Submitted To | Internal; retained with cash book |
| Audit Risk | VERY HIGH |
| Legal Ref | Lekha Sanhita Ch.VIII [VERIFY]; MVP Act §57 [VERIFY]; State Pay Rules [VERIFY] |

## Purpose
Monthly salary disbursement register for all GP employees. Prepared from N13 (staff register) and shows gross salary, deductions, and net pay for each employee. The authorised payment document for salary expenditure.

## Key Fields
- Month and year; Employee name and designation (from N13)
- Basic pay; DA; HRA; Other allowances; Gross salary
- Deductions: PF/GPF; Professional tax; TDS; Advance recovery (from N17)
- Net pay; Mode of payment; Bank account number
- Employee signature / acknowledgment
- Gram Sevak certification; Sarpanch approval

## Dependencies
**Depends On:** [[Namuna-13]]
**Feeds Into:** [[Namuna-05]] [[Namuna-26]]

## Validation Rules
- Salary only payable to employees listed in N13 with sanctioned posts — no ghost employees
- Deductions must be at statutory rates
- PF, PT deducted must be remitted by due date [VERIFY: remittance deadline]
- TDS deducted must be deposited and TDS return filed [VERIFY]
- Total salary must be within N1 provision (salary head)
- Employee signature on payroll is mandatory

## Audit Risk
VERY HIGH — Common objections:
- Ghost employees (salary paid to departed/fictitious employees)
- Salary paid in cash above permissible limit
- Statutory deductions not remitted to EPFO/PT authority
- No employee signatures on payroll sheets
- Salary drawn for posts that are not PS-sanctioned

## Related Registers
[[Namuna-13]] Staff Register | [[Namuna-05]] Cash Book | [[Namuna-26]] Monthly Returns
