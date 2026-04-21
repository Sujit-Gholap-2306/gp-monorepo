---
namuna: 21
name_en: Salary Bill
name_mr: वेतन देयक
category: Staff
who_maintains: Gram Sevak
who_approves: Sarpanch
frequency: Monthly
submitted_to: Internal
audit_risk: HIGH
tags: [namuna, staff, gram-panchayat]
---

# Namuna 21 — वेतन देयक (Salary Bill)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Staff | Gram Sevak | Sarpanch | Monthly | 1st week of the subsequent month | Internal | HIGH | Lekha Sanhita 2011 [VERIFY] |

## Purpose

Monthly payroll register for all GP employees (excluding state-paid Gram Sevaks), calculating gross pay and executing statutory deductions.

## Key Fields

- Month and Year
- Name of Employee
- Designation
- Basic Pay
- Allowances
- Gross Salary
- Deductions (Provident Fund, Professional Tax, Advances)
- Net Amount Payable
- Signature/Thumb Impression of Employee

## Dependencies

- Depends On: [[Namuna-18]], [[Namuna-19]]
- Feeds Into: [[Namuna-05]], [[Namuna-07]]

## Validation Rules

- Daily wagers' pay must be verified against the days marked present in the Muster Roll (Namuna 19).
- Advance deductions must reconcile with the outstanding balances in the Advance Register (Namuna 18).
- Net pay must be logged as an outflow in Namuna 5 (Cash Book) and Namuna 7 (Classified Expenditure).

## Audit Risk — HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-05]], [[Namuna-07]], [[Namuna-18]], [[Namuna-19]]
