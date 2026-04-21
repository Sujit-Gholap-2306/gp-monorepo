---
namuna: 1
name_en: Budget
name_mr: अर्थसंकल्प
category: Budget
who_maintains: Gram Sevak
who_approves: Gram Sabha
frequency: Annual
submitted_to: Panchayat Samiti
audit_risk: VERY HIGH
tags: [namuna, budget, gram-panchayat]
---

# Namuna 01 — अर्थसंकल्प (Budget)

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| Budget | Gram Sevak | Gram Sabha | Annual | [VERIFY] Statutory budget calendar (Jan/Feb chain vs ZP circular) | Panchayat Samiti | VERY HIGH | MVP Act 1958 Sec 62; Lekha Sanhita 2011 [VERIFY] |

## Purpose

Defines the primary financial plan outlining estimated receipts and proposed expenditures for the upcoming financial year, serving as the legal basis for all GP spending. [VERIFY: reconcile with official Namuna 1 annex]

## Key Fields

- Major Head of Account (Receipts & Expenditure)
- Minor Head of Account
- Actuals of the previous financial year
- Revised Estimates of the current financial year
- Budget Estimates for the upcoming financial year
- Explanation for significant variations
- Gram Sevak Signature
- Sarpanch Signature

## Dependencies

- Depends On: None
- Feeds Into: [[Namuna-02]], [[Namuna-03]]

## Validation Rules

- Opening balance must match the closing balance of the previous year's Namuna 3.
- Proposed expenditure cannot exceed estimated receipts plus the verified opening balance.
- Must contain explicit approval resolution number from the Gram Sabha.

## Audit Risk — VERY HIGH

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

[[Namuna-02]], [[Namuna-03]]
