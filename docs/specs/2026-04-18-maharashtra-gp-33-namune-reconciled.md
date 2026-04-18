---
title: Maharashtra GP 33 Namune — Reconciled Master Requirements
version: reconciled-v1
date: 2026-04-18
sources: Claude draft + Cursor draft + web verification (mygrampanchayat.com, msdhulap.com)
legal_basis: Maharashtra Village Panchayats Act 1958; Maharashtra GP Lekha Sanhita 2011
jurisdiction: Maharashtra — Gram Panchayat level only
tags: [namune, gram-panchayat, maharashtra, requirements, reconciled]
---

# Maharashtra GP — 33 Namune: Reconciled Master Requirements

> This document reconciles the Claude draft (`namune-vault/`) and Cursor draft (`namune-vault-cursor/`).
> Each block includes a `RECONCILIATION` field stating which position was taken and why.
> Items that could not be confirmed from any source are marked `[VERIFY]`.

---

## CONFLICT SUMMARY (before reading all blocks)

| Namuna | Field | Claude | Cursor | Reconciled | Basis |
|--------|-------|--------|--------|------------|-------|
| N01 | audit_risk | HIGH | VERY HIGH | **VERY HIGH** | Budget fraud is top GP crime |
| N03 | frequency | Annual | Monthly | **Annual** | Definitionally an annual statement |
| N03 | submitted_to | Gram Sabha + PS | Internal | **Gram Sabha + PS** | Annual accounts are a GP Act obligation |
| N06 | frequency | Monthly | Daily | **Monthly** | Web confirmed: N5 daily, N6 monthly classified |
| N09 | audit_risk | HIGH | VERY HIGH | **HIGH** | N9 is demand tracking, not primary fraud register |
| N11 | submitted_to | Internal | Tax Defaulter | **Internal** | N11 is an internal register |
| N18 | frequency | Daily | As needed | **Daily** | Petty cash book is a daily record |
| N19 | audit_risk | VERY HIGH | HIGH | **VERY HIGH** | Muster roll ghost worker fraud = #1 GP audit objection |
| N21 | audit_risk | VERY HIGH | HIGH | **VERY HIGH** | Ghost employee payroll = major fraud point |
| N22 | audit_risk | HIGH | MEDIUM | **HIGH** | Property disputes + encroachment common |
| N24 | audit_risk | HIGH | MEDIUM | **HIGH** | Land alienation is major GP audit issue |
| N26 | submitted_to | PS (15th) | Internal | **PS by 15th** | Web confirmed: mandatory monthly submission |
| N28 | audit_risk | VERY HIGH | MEDIUM | **VERY HIGH** | Statutory earmark — most commonly unmet target |
| N30 | submitted_to | CEO ZP + PS | Gram Sabha | **CEO ZP + PS** | Audit compliance goes up chain, not to Gram Sabha |
| N31 | audit_risk | LOW | VERY HIGH | **LOW** | TA at GP level is minor; Cursor's VERY HIGH is wrong |

---

---
NAMUNA: 1
NAME_EN: Annual Budget Estimate
NAME_MR: अर्थसंकल्प
CATEGORY: Budget
LEGAL_REF: Maharashtra Village Panchayats Act 1958 §61 [VERIFY exact sub-section]; Lekha Sanhita 2011 Ch.2 [VERIFY rule number]
PURPOSE: Annual income and expenditure estimate for the coming financial year. Authorises the GP to collect revenue and incur expenditure under specific heads. No expenditure is valid without budget provision.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Gram Sabha (passes resolution); Panchayat Samiti (reviews/approves under MVP Act)
FREQUENCY: Annual
SUBMISSION_DEADLINE: Before 31 January for following financial year [VERIFY — some districts say 15 February]
SUBMITTED_TO: Panchayat Samiti

FIELDS_IN_REGISTER:
- Budget head code
- Head of account description (Marathi)
- Previous year actuals (receipts / expenditure)
- Current year revised estimate
- Coming year budget estimate (receipts)
- Coming year budget estimate (expenditure)
- Remarks / justification
- Sarpanch signature
- Gram Sevak signature
- PS approval endorsement

DEPENDS_ON: N03 (previous year actuals feed this year's estimates), N26 (monthly actuals inform revised estimate)
FEEDS_INTO: N02 (re-appropriation within approved budget), N12 (contingency limited to budget provision), N21 (salary budget ceiling)

TRIGGER: Start of budget preparation cycle (October–January) each year

VALIDATION_RULES:
- Total estimated receipts must equal total estimated expenditure (balanced budget)
- SC/ST allocation must be ≥15% of discretionary expenditure [VERIFY GR number]
- Women welfare allocation must be ≥10% of discretionary expenditure [VERIFY GR number]
- Salary heads must not exceed sanctioned post strength × scale
- Cannot show deficit without PS prior approval

AUDIT_RISK: VERY HIGH
AUDIT_RISK_REASON: Budget inflation, fake revenue heads, expenditure without provision, and misappropriation under vague heads are the most common GP fraud patterns.

RECONCILIATION: Cursor (VERY HIGH) adopted over Claude (HIGH). Budget manipulation is the root of most GP financial fraud — under-budgeting revenue + over-budgeting expenditure to create misappropriation room.

OBSIDIAN_TAGS: #namuna #budget #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-02]] [[Namuna-03]] [[Namuna-12]] [[Namuna-21]] [[Namuna-26]]
---

---
NAMUNA: 2
NAME_EN: Re-appropriation Register
NAME_MR: पुनर्विनियोजन नोंदवही
CATEGORY: Budget
LEGAL_REF: Maharashtra Village Panchayats Act 1958 §61 [VERIFY]; Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Records mid-year transfers of funds between budget heads when one head has surplus and another has shortfall. Every re-appropriation requires a GP resolution and, above a threshold, PS sanction.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Gram Panchayat (resolution); Panchayat Samiti (above prescribed limit [VERIFY limit amount])
FREQUENCY: As needed (during financial year)
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Panchayat Samiti (copy when PS sanction required)

FIELDS_IN_REGISTER:
- Serial number
- Date of GP resolution
- Resolution number
- Budget head from which funds transferred (code + description)
- Budget head to which funds transferred (code + description)
- Amount re-appropriated
- Balance available before transfer
- Balance available after transfer
- PS sanction number and date (where applicable)
- Gram Sevak signature; Sarpanch signature

DEPENDS_ON: N01 (re-appropriation operates within approved budget)
FEEDS_INTO: N01 (updated budget ceiling per head), N05 (expenditure now valid under new head)

TRIGGER: GP resolution passed when expenditure required under a head exceeds its budget provision

VALIDATION_RULES:
- Source head must have sufficient unspent balance
- Cannot re-appropriate from salary/establishment to works without PS approval [VERIFY]
- Total budget must remain balanced after re-appropriation
- Resolution number and date must be recorded before any expenditure under revised head

AUDIT_RISK: HIGH
AUDIT_RISK_REASON: Re-appropriation without proper resolution, retrospective re-appropriation to cover unauthorized expenditure, and re-appropriation above limit without PS sanction are common objections.

RECONCILIATION: Both agree on HIGH. Claude frequency (As needed) adopted over Cursor (Annual) — re-appropriation is a mid-year event, not annual.

OBSIDIAN_TAGS: #namuna #budget #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-01]] [[Namuna-05]]
---

---
NAMUNA: 3
NAME_EN: Annual Income & Expenditure Statement
NAME_MR: जमा-खर्च विवरण
CATEGORY: Reporting
LEGAL_REF: Maharashtra Village Panchayats Act 1958 §63 [VERIFY]; Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Annual financial statement summarising all income received and expenditure incurred during the financial year. Presented at the annual Gram Sabha and submitted to Panchayat Samiti. This is one of the two primary annual accountability documents (the other being N04).
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Gram Sabha (passes resolution accepting accounts); CEO ZP (at annual audit)
FREQUENCY: Annual
SUBMISSION_DEADLINE: Before annual Gram Sabha (April–June) [VERIFY exact date]
SUBMITTED_TO: Gram Sabha; Panchayat Samiti

FIELDS_IN_REGISTER:
- Financial year
- Income section: head-wise receipts (tax, grants, fees, etc.)
- Total income
- Expenditure section: head-wise payments (establishment, works, maintenance, etc.)
- Total expenditure
- Surplus / deficit for the year
- Opening balance (from prior year N04)
- Closing balance carried to N04
- Gram Sevak signature; Sarpanch signature; Gram Sabha resolution number

DEPENDS_ON: N05 (cash book totals), N06 (classified receipt totals), N21 (payroll totals), N12 (voucher totals), N26 (monthly return aggregates)
FEEDS_INTO: N04 (closing balance becomes opening balance of balance sheet)

TRIGGER: Close of financial year (31 March); prepared in April–June

VALIDATION_RULES:
- Total income + opening balance must equal total expenditure + closing balance
- Head-wise figures must reconcile with N26 monthly return aggregates
- Closing balance must equal N05 cash book closing balance
- Must be placed before Gram Sabha before submission to PS

AUDIT_RISK: HIGH
AUDIT_RISK_REASON: Inflated income figures, understated expenditure, misclassification of heads, and failure to present at Gram Sabha are common objections.

RECONCILIATION: Claude (Annual, Gram Sabha + PS) adopted over Cursor (Monthly, Internal). Cursor fundamentally misclassified N03 — this is the annual I&E statement, not a monthly record.

OBSIDIAN_TAGS: #namuna #reporting #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-04]] [[Namuna-05]] [[Namuna-06]] [[Namuna-21]] [[Namuna-26]]
---

---
NAMUNA: 4
NAME_EN: Assets & Liabilities Statement (Balance Sheet)
NAME_MR: मत्ता व दायित्वे विवरण
CATEGORY: Reporting
LEGAL_REF: Maharashtra Village Panchayats Act 1958 §63 [VERIFY]; Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Annual balance sheet showing the GP's assets (cash, property, investments, advances receivable) and liabilities (deposits payable, loans outstanding) at the close of the financial year. Companion document to N03.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Gram Sabha; CEO ZP (at audit)
FREQUENCY: Annual
SUBMISSION_DEADLINE: Same as N03 — before annual Gram Sabha
SUBMITTED_TO: Gram Sabha; audit

FIELDS_IN_REGISTER:
- Financial year
- Assets: cash in hand, bank balances, investments (N25), advances receivable (N17), movable assets (N16), immovable property (N22), land (N24), roads (N23), trees (N33)
- Liabilities: security deposits payable (N17), loans outstanding (N29), creditors
- Net assets (excess of assets over liabilities)
- Certification by Gram Sevak and Sarpanch

DEPENDS_ON: N03 (closing balance), N16 (movable assets value), N17 (advances + deposits), N22 (immovable property), N24 (land value), N25 (investments), N29 (loans)
FEEDS_INTO: N03 (opening balance for next year)

TRIGGER: Close of financial year; prepared alongside N03

VALIDATION_RULES:
- Assets total must equal liabilities + net assets
- Cash and bank balances must match N05 closing balance
- Investment values must match N25
- Loan balances must match N29
- Advance balances must match N17

AUDIT_RISK: MEDIUM
AUDIT_RISK_REASON: Balance sheet errors are usually derivative of errors in source registers (N16, N22, N25). Direct balance sheet fraud is less common than cash or works fraud.

RECONCILIATION: Claude (MEDIUM, Gram Sabha) adopted over Cursor (HIGH, Internal). N04 is presented at Gram Sabha per MVP Act §63 [VERIFY].

OBSIDIAN_TAGS: #namuna #reporting #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-03]] [[Namuna-16]] [[Namuna-17]] [[Namuna-22]] [[Namuna-24]] [[Namuna-25]] [[Namuna-29]]
---

---
NAMUNA: 5
NAME_EN: General Cash Book (incl. 5-Ka Daily Cash Book)
NAME_MR: सामान्य रोकड वही (व नमुना ५ क)
CATEGORY: Cash
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]; MVP Act 1958 §63
PURPOSE: The master financial record of the GP. Every cash and bank transaction is entered chronologically. Namuna 5-Ka (५ क) is the daily subsidiary cash book; N5 is the consolidated/reconciled cash book authenticated weekly by the Sarpanch.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (weekly authentication by signature)
FREQUENCY: Daily (5-Ka); weekly reconciliation (N5)
SUBMISSION_DEADLINE: N/A (internal)
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Date
- Receipt / voucher number
- Particulars (source of income or payee)
- Ledger folio (L.F.) cross-reference
- Cash receipts column
- Bank receipts column
- Cash payments column
- Bank payments column
- Daily closing balance (cash)
- Daily closing balance (bank)
- Sarpanch weekly authentication signature
- Gram Sevak signature

DEPENDS_ON: N07 (receipt vouchers), N10 (tax receipts), N12 (contingency vouchers), N14 (stamp revenue), N15 (consumables payments), N17 (advance payments/recoveries), N18 (petty cash transfers), N21 (salary payments), N29 (loan repayments), N31 (TA payments), N32 (refund payments)
FEEDS_INTO: N03 (annual I&E totals), N06 (classified receipt totals), N26 (monthly return totals)

TRIGGER: Every financial transaction — receipt or payment

VALIDATION_RULES:
- Daily closing balance must equal previous day balance + receipts − payments
- Cash balance must never be negative
- Bank balance must reconcile with bank passbook monthly
- Every entry must have a corresponding voucher/receipt (N07, N10, or N12)
- Cash above ₹2,000 must be deposited in bank within 24 hours [VERIFY threshold]
- Erasures and overwriting are prohibited — corrections by counter-signature only
- Sarpanch must authenticate weekly (not monthly)

AUDIT_RISK: VERY HIGH
AUDIT_RISK_REASON: Primary fraud document. Erasures, missing entries, unbalanced totals, cash withheld from deposit, and unauthenticated books are the most frequent serious audit objections.

RECONCILIATION: Both agree. No conflict.

OBSIDIAN_TAGS: #namuna #cash #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-06]] [[Namuna-07]] [[Namuna-10]] [[Namuna-12]] [[Namuna-18]] [[Namuna-21]]
---

---
NAMUNA: 6
NAME_EN: Classified Receipt Register
NAME_MR: वर्गीकृत जमा नोंदवही
CATEGORY: Receipt
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Monthly register that classifies all receipts under prescribed account heads. Summarises N5 receipt entries head-wise for the month. Used to prepare N26-Ka (monthly income return).
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (monthly review)
FREQUENCY: Monthly (compiled from daily N05 entries)
SUBMISSION_DEADLINE: N/A (internal; feeds N26 by 15th)
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Month and year
- Account head code
- Account head description
- Receipt amounts by date
- Monthly total per head
- Grand total receipts for month
- Gram Sevak signature; Sarpanch signature

DEPENDS_ON: N05 (daily cash book receipt entries), N07 (receipt vouchers), N10 (tax receipts)
FEEDS_INTO: N03 (annual income totals), N26 (monthly income return N26-Ka)

TRIGGER: End of each month — classified from daily N05 entries

VALIDATION_RULES:
- Sum of all head-wise monthly totals must equal N05 total receipts for the month
- Each entry must trace to a numbered receipt (N07 or N10)
- No head should appear that is not in the approved budget (N01)

AUDIT_RISK: MEDIUM
AUDIT_RISK_REASON: Classification errors (wrong account head) and totalling mistakes are typical objections. Primary fraud is caught at N05, not N06.

RECONCILIATION: Claude (Monthly, MEDIUM) adopted over Cursor (Daily, HIGH). Web confirmed N06 is the monthly classified summary; N05 is the daily book.

OBSIDIAN_TAGS: #namuna #receipt #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-05]] [[Namuna-07]] [[Namuna-10]] [[Namuna-26]]
---

---
NAMUNA: 7
NAME_EN: General Receipt Voucher
NAME_MR: सामान्य पावती
CATEGORY: Receipt
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Official receipt issued to any person or institution paying money to the GP (for non-tax income — grants, fees, fines, rent, etc.). Original goes to payer; counterfoil retained. Every receipt must be pre-numbered.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (periodic review of counterfoil book)
FREQUENCY: As needed (on each non-tax income transaction)
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Original to payer; counterfoil retained by GP

FIELDS_IN_REGISTER:
- Pre-printed serial number
- Date
- Name of payer
- Amount received (figures and words)
- Nature of payment (head of account)
- Cash / cheque / DD
- Cheque/DD number and bank (if applicable)
- Gram Sevak signature
- Sarpanch countersignature (above threshold [VERIFY])
- Revenue stamp (above ₹5,000 [VERIFY])

DEPENDS_ON: None (source document)
FEEDS_INTO: N05 (cash book receipt entry), N06 (classified receipt register)

TRIGGER: Any non-tax payment received by GP

VALIDATION_RULES:
- All receipt books must be pre-numbered and accounted for — missing numbers are a serious objection
- No cancelled receipt without both original and counterfoil marked "cancelled"
- Amount in words must match amount in figures
- Revenue stamp must be affixed above prescribed threshold [VERIFY ₹5,000]
- No receipt issued after the fact (back-dated receipts are major fraud)

AUDIT_RISK: HIGH
AUDIT_RISK_REASON: Missing receipt books, gaps in serial numbers, back-dating, and receipts issued without corresponding N05 entry are common objections.

RECONCILIATION: Claude (As needed, HIGH) adopted. Both agree on HIGH.

OBSIDIAN_TAGS: #namuna #receipt #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-05]] [[Namuna-06]]
---

---
NAMUNA: 8
NAME_EN: Tax Assessment Register
NAME_MR: कर आकारणी नोंदवही
CATEGORY: Tax
LEGAL_REF: Maharashtra Village Panchayats Act 1958 §124 (taxation power); Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Master register of all taxable properties and their assessed tax values within the GP area. Updated when new properties are assessed or existing assessments revised. Forms the basis for N09 (Tax Demand Register).
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Gram Panchayat (passes resolution fixing tax rates and assessment)
FREQUENCY: Annual (general revision); updated as new properties are assessed
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Assessment number (unique per property)
- Property owner name
- Property location (survey number / plot number)
- Property type (residential / commercial / agricultural)
- Annual rental value or capital value (basis of assessment)
- Tax rate applied (% per GP resolution)
- Annual tax demand
- GP resolution number approving assessment
- Date of assessment
- Remarks (objections pending, exemptions)

DEPENDS_ON: None (base register — assessment precedes demand)
FEEDS_INTO: N09 (tax demand raised for each assessed property)

TRIGGER: GP resolution for annual tax revision; addition of new property in GP area

VALIDATION_RULES:
- Every property in GP area must appear — omissions are objection-worthy
- Tax rate must not exceed limits prescribed under MVP Act §124 [VERIFY limits]
- Assessment must be backed by GP resolution — no individual officer can fix assessment
- Exemptions must cite specific legal provision

AUDIT_RISK: HIGH
AUDIT_RISK_REASON: Under-assessment (letting off properties at low rates for favour), omission of properties, and assessment without GP resolution are common.

RECONCILIATION: Both agree on Annual and HIGH. Minor difference on approver resolved: GP resolution (formal body action) is the correct approver, not individual Sarpanch.

OBSIDIAN_TAGS: #namuna #tax #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-09]]
---

---
NAMUNA: 9
NAME_EN: Tax Demand Register (incl. 9-Ka Demand Notice)
NAME_MR: कर मागणी नोंदवही (व नमुना ९ क)
CATEGORY: Tax
LEGAL_REF: Maharashtra Village Panchayats Act 1958 §124, §129; Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Annual register showing the demand raised, collections received, and balance outstanding for each taxpayer. N09-Ka (९ क) is the individual demand notice issued to the taxpayer. Updated as collections are made throughout the year.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch
FREQUENCY: Annual register; updated as collections received
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Assessment number (links to N08)
- Property owner name
- Annual demand amount
- First half-year demand
- First half-year collection date and amount
- First half-year arrears
- Second half-year demand
- Second half-year collection date and amount
- Second half-year arrears
- Total demand for year
- Total collection for year
- Balance outstanding (arrears)
- Receipt number (N10) for each collection

DEPENDS_ON: N08 (assessment forms the demand basis)
FEEDS_INTO: N10 (receipt issued for each collection), N05 (cash book on collection), N26 (monthly collection figures), N27 (arrears flagged in audit objections)

TRIGGER: Start of financial year (demand raised); each tax payment received (collection entry)

VALIDATION_RULES:
- Demand must match N08 assessment for each property
- Each collection entry must have a corresponding N10 receipt number
- Arrears must be carried forward from prior year
- Recovery action (warrant under §129) must be initiated if arrears exceed two half-years
- Half-yearly totals must reconcile with N05 cash book tax receipts

AUDIT_RISK: HIGH
AUDIT_RISK_REASON: Large unrecovered arrears without recovery action, collection without issuing N10 receipt, and demand not reconciling with N08 are common objections.

RECONCILIATION: Claude (HIGH, Annual updated) adopted over Cursor (VERY HIGH, Daily). N09 is a demand tracking register, not a daily transaction book. VERY HIGH reserved for cash book, muster roll, payroll. Daily update is correct operationally but the register itself is annual in structure.

OBSIDIAN_TAGS: #namuna #tax #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-08]] [[Namuna-10]] [[Namuna-05]] [[Namuna-26]]
---

---
NAMUNA: 10
NAME_EN: Tax & Fee Receipt
NAME_MR: कर व फी बाबत पावती
CATEGORY: Tax
LEGAL_REF: Maharashtra Village Panchayats Act 1958 §124; Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Official receipt issued specifically for tax and fee payments. Parallel to N07 (which is for non-tax receipts). Pre-numbered; original to taxpayer, counterfoil retained.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (periodic review)
FREQUENCY: As needed (on each tax/fee payment)
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Original to taxpayer; counterfoil retained by GP

FIELDS_IN_REGISTER:
- Pre-printed serial number
- Date
- Assessment number (links to N09)
- Name of taxpayer
- Property details
- Tax type (house tax, water tax, etc.)
- Period covered
- Amount paid (figures and words)
- Arrears cleared
- Balance outstanding after payment
- Gram Sevak signature

DEPENDS_ON: N09 (demand register — collection entered here)
FEEDS_INTO: N05 (cash book tax receipt entry), N09 (collection entry updated)

TRIGGER: Taxpayer paying tax or fee to GP

VALIDATION_RULES:
- Receipt number must be entered in N09 against the corresponding demand
- Serial number continuity mandatory — gaps must be explained
- Amount must match N09 demand or partial payment
- Revenue stamp as prescribed [VERIFY threshold]

AUDIT_RISK: HIGH
AUDIT_RISK_REASON: Collecting tax without issuing N10 receipt (misappropriation), gaps in serial numbers, and N10-N09 reconciliation failures are common objections.

RECONCILIATION: Both agree on HIGH and As needed. Cursor's "N/A (Issued directly)" for who_approves adopted with clarification: Gram Sevak issues on behalf of GP; Sarpanch reviews periodically.

OBSIDIAN_TAGS: #namuna #tax #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-09]] [[Namuna-05]]
---

---
NAMUNA: 11
NAME_EN: Miscellaneous Demand Register
NAME_MR: किरकोळ मागणी नोंदवही
CATEGORY: Receipt
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Register for miscellaneous non-tax demands such as water charges, market fees, ferry charges, and other recurring non-tax income. Tracks demand raised and collections received, similar to N09 but for non-tax heads.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch
FREQUENCY: As needed
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Serial number
- Name of person / entity
- Nature of demand (head of account)
- Amount demanded
- Date of demand
- Collection date
- Amount collected
- Receipt number (N07) for collection
- Balance outstanding
- Remarks

DEPENDS_ON: N07 (receipt voucher for each collection)
FEEDS_INTO: N05 (cash book receipt), N06 (classified receipt register), N26 (monthly returns)

TRIGGER: Raising of a miscellaneous demand (water connection fee, stall rent, etc.)

VALIDATION_RULES:
- Each collection must have a corresponding N07 receipt number
- Demand must be authorised — no undocumented demands
- Outstanding amounts must be pursued for recovery

AUDIT_RISK: MEDIUM
AUDIT_RISK_REASON: Uncollected miscellaneous dues and missing receipt references are typical objections, but fraud potential is lower than tax or payroll.

RECONCILIATION: Claude (MEDIUM, Internal) adopted over Cursor (VERY HIGH, "Tax Defaulter"). N11 is an internal register; "submitted to Tax Defaulter" is incorrect. VERY HIGH is too high for miscellaneous demands.

OBSIDIAN_TAGS: #namuna #receipt #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-07]] [[Namuna-05]] [[Namuna-06]] [[Namuna-26]]
---

---
NAMUNA: 12
NAME_EN: Contingency Expense Voucher
NAME_MR: आकस्मित खर्च प्रमाणक
CATEGORY: Expenditure
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Voucher authorising and recording every payment made by the GP. No payment from the GP treasury is valid without a properly sanctioned contingency voucher. Acts as the payment counterpart of N07/N10 on the receipt side.
WHO_MAINTAINS: Gram Sevak (prepares); Sarpanch (sanctions)
WHO_APPROVES: Sarpanch
FREQUENCY: As needed (for each payment)
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal (filed with cash book)

FIELDS_IN_REGISTER:
- Serial number (pre-printed)
- Date of payment
- Name of payee
- Purpose of payment
- Budget head charged
- Budget provision available
- Amount (figures and words)
- Supporting bill / invoice reference
- Mode of payment (cash / cheque)
- Cheque number (if applicable)
- Sarpanch sanction signature
- Gram Sevak signature
- Payee acknowledgement signature / thumb impression
- Revenue stamp (above ₹5,000 [VERIFY])

DEPENDS_ON: N01 (budget provision must exist), N05 (payment recorded here), N19 (labour payments backed by muster roll)
FEEDS_INTO: N05 (cash book payment entry), N21 (payroll backed by voucher), N26 (monthly expenditure return)

TRIGGER: Any payment to be made by GP

VALIDATION_RULES:
- Payment without budget provision is ultra vires
- Cash payment above ₹2,000 requires prior justification [VERIFY threshold for cheque mandate]
- Bill/invoice must be attached — no voucher without supporting document
- Payee must sign/thumb-print the voucher on receipt
- Voucher serial numbers must be continuous — gaps are serious objections
- Back-dated vouchers are not permitted

AUDIT_RISK: VERY HIGH
AUDIT_RISK_REASON: Fake vouchers, payments without supporting bills, cash payments above cheque limit, missing payee signatures, and vouchers without budget provision are the most common serious audit objections.

RECONCILIATION: Both agree on VERY HIGH.

OBSIDIAN_TAGS: #namuna #expenditure #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-01]] [[Namuna-05]] [[Namuna-19]] [[Namuna-21]] [[Namuna-26]]
---

---
NAMUNA: 13
NAME_EN: Staff List & Pay Scale Register
NAME_MR: कर्मचारी वर्गाची सुची
CATEGORY: Staff
LEGAL_REF: Maharashtra Village Panchayats Act 1958 §32A [VERIFY]; Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Master list of all GP employees with sanctioned post details, pay scales, and service particulars. Forms the basis for monthly payroll (N21). Updated on appointments, increments, and exits.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; Panchayat Samiti (for sanctioned post strength)
FREQUENCY: As needed (updated on personnel events)
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal; Panchayat Samiti (for post sanction)

FIELDS_IN_REGISTER:
- Employee serial number
- Name of employee
- Designation / post
- Sanctioned post number (PS order reference)
- Date of appointment
- Pay scale (band + grade pay)
- Current basic pay
- Date of last increment
- Date of next increment
- GPF / NPS account number
- Date of superannuation
- Remarks (on deputation, suspension, etc.)

DEPENDS_ON: None (base register)
FEEDS_INTO: N21 (payroll drawn based on this register)

TRIGGER: New appointment, increment, promotion, transfer, or exit of staff

VALIDATION_RULES:
- No employee on payroll without a sanctioned post
- Increment must be on due date — delayed increments require explanation
- Departed employees must be struck off immediately
- PS sanction order number must be on file for every post

AUDIT_RISK: HIGH
AUDIT_RISK_REASON: Ghost employees, overstated pay scales, delayed striking-off of resigned/retired staff, and posts without PS sanction are common objections.

RECONCILIATION: Both agree on HIGH. Claude more complete on submitted_to (PS for post sanction).

OBSIDIAN_TAGS: #namuna #staff #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-21]]
---

---
NAMUNA: 14
NAME_EN: Stamp Account Register
NAME_MR: मुद्रांक हिशोब नोंदवही
CATEGORY: Staff
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Register tracking the receipt, issue, and balance of postage stamps, revenue stamps, and other stamps held by the GP office. Every stamp used must be recorded.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (periodic physical verification)
FREQUENCY: As needed (updated on receipt or use of stamps)
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Date
- Type of stamp (postage / revenue / court fee)
- Denomination
- Opening balance (number × value)
- Stamps received: source, quantity, value
- Stamps used: document reference, quantity, value
- Closing balance (number × value)
- Gram Sevak signature
- Sarpanch verification signature

DEPENDS_ON: N05 (cash paid for stamps is recorded here)
FEEDS_INTO: N05 (revenue stamp income if sold)

TRIGGER: Purchase of stamps; use of stamp on a document or voucher

VALIDATION_RULES:
- Physical balance must match book balance at any verification
- Revenue stamps used must be listed with the document number on which affixed
- Postage stamps: bulk purchase must have approval

AUDIT_RISK: MEDIUM
AUDIT_RISK_REASON: Stamp misuse and unrecorded consumption are typical objections, but fraud scale is small compared to cash or works.

RECONCILIATION: Claude (MEDIUM) adopted over Cursor (HIGH). Stamp fraud at GP level is minor.

OBSIDIAN_TAGS: #namuna #staff #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-05]]
---

---
NAMUNA: 15
NAME_EN: Consumables Store Register
NAME_MR: उपभोग्य वस्तुसाठा नोंदवही
CATEGORY: Staff
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Register tracking receipt and consumption of stationery, cleaning supplies, and other consumable items used in the GP office. Ensures items purchased are actually used and not diverted.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (periodic stock verification)
FREQUENCY: As needed (updated on receipt or issue of consumables)
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Item description
- Unit of measurement
- Opening stock
- Received: date, quantity, voucher number (N12)
- Issued: date, quantity, purpose
- Closing stock
- Gram Sevak signature; Sarpanch verification

DEPENDS_ON: N12 (contingency voucher for purchase), N05 (payment recorded)
FEEDS_INTO: N05 (purchase payment)

TRIGGER: Purchase of consumables; issue of items from store

VALIDATION_RULES:
- Physical stock must match book balance
- Items issued must cite purpose
- Large purchases relative to GP size require justification

AUDIT_RISK: LOW-MEDIUM
AUDIT_RISK_REASON: Over-purchase of stationery, fictitious consumption entries, and stock not matching physical count are typical low-value objections.

RECONCILIATION: Claude (LOW-MEDIUM, As needed) adopted. Cursor's "Daily" frequency is incorrect — consumables are not a daily register.

OBSIDIAN_TAGS: #namuna #staff #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-12]] [[Namuna-05]]
---

---
NAMUNA: 16
NAME_EN: Movable Assets Register (Fixed & Movable Property)
NAME_MR: जड वस्तु / जंगम मालमत्ता नोंदवही
CATEGORY: Property
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Register of all movable assets owned by the GP — furniture, equipment, vehicles, tools, and other tangible property. Annual physical verification mandatory. Assets created through works (N20) are entered here.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; CEO ZP (at annual audit)
FREQUENCY: Updated on acquisition or disposal; annual physical verification
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal; PS at audit

FIELDS_IN_REGISTER:
- Asset serial number
- Description of asset
- Date of acquisition
- Source (purchase / works N20 / grant)
- Voucher / work order reference
- Cost of acquisition
- Location / custody
- Annual verification date and officer
- Condition (good / damaged / condemned)
- Date and mode of disposal (if disposed)
- Disposal proceeds
- Remarks

DEPENDS_ON: N20 (works create assets), N12 (purchase voucher)
FEEDS_INTO: N04 (balance sheet — movable assets value)

TRIGGER: Purchase of asset; completion of a works item that creates an asset; disposal or condemnation of asset

VALIDATION_RULES:
- Physical verification must be done annually — gap of 2+ years is auto objection
- Assets not found during verification must be explained (report missing / theft)
- Disposed assets must have GP resolution and fair value realisation
- Assets purchased through grants must note the grant scheme

AUDIT_RISK: HIGH
AUDIT_RISK_REASON: Assets missing from physical count, disposal without GP resolution, assets acquired but not entered, and no annual verification are common serious objections.

RECONCILIATION: Claude (HIGH, annual verification) adopted over Cursor (MEDIUM, "N/A issued directly" — this was clearly a classification error by Cursor for a movable assets register).

OBSIDIAN_TAGS: #namuna #property #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-04]] [[Namuna-20]] [[Namuna-22]]
---

---
NAMUNA: 17
NAME_EN: Advances & Deposits Register
NAME_MR: अग्रीम / अनामत नोंदवही
CATEGORY: Advances
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Tracks two types of financial commitments: (a) advances paid out to staff or contractors — must be recovered within prescribed period; (b) security deposits received from contractors and lessees — must be refunded on completion. Both appear on the balance sheet.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; Panchayat Samiti (above prescribed advance limit [VERIFY])
FREQUENCY: As needed
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Serial number
- Type (advance payable / deposit receivable)
- Name of person / contractor
- Date of payment / receipt
- Purpose
- Amount
- Voucher / receipt reference
- Recovery / refund schedule
- Recovery entries (date, amount, receipt number)
- Balance outstanding
- Remarks (overdue, written off, etc.)

DEPENDS_ON: N05 (cash book for advance payment / deposit receipt)
FEEDS_INTO: N04 (assets: advances receivable; liabilities: deposits payable), N05 (recovery credited back)

TRIGGER: Payment of advance to staff/contractor; receipt of security deposit

VALIDATION_RULES:
- Advances must be recovered within the prescribed period (typically 3 months for temporary advance [VERIFY])
- Long-overdue advances (>1 year) must be treated as loss and reported
- Security deposits must be refunded after satisfactory work completion
- No new advance to a person with outstanding previous advance [VERIFY]

AUDIT_RISK: HIGH
AUDIT_RISK_REASON: Unrecovered long-outstanding advances, advances without sanction, and security deposits neither refunded nor forfeited are frequent objections.

RECONCILIATION: Both agree on HIGH.

OBSIDIAN_TAGS: #namuna #advances #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-04]] [[Namuna-05]]
---

---
NAMUNA: 18
NAME_EN: Petty Cash Book
NAME_MR: किरकोळ रोकड वही
CATEGORY: Cash
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Subsidiary cash book for small day-to-day payments below the petty cash limit (typically ₹500 [VERIFY]) that do not individually warrant a full contingency voucher. Funded by imprest from N05. Reconciled with N05 periodically.
WHO_MAINTAINS: Gram Sevak (or designated petty cashier)
WHO_APPROVES: Sarpanch (weekly review)
FREQUENCY: Daily
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Date
- Particulars of payment
- Amount
- Head of account
- Receipt / chit number
- Running balance
- Weekly closing balance
- Sarpanch signature

DEPENDS_ON: N05 (imprest drawn from main cash book to fund petty cash)
FEEDS_INTO: N05 (petty cash expenditure posted to main cash book on recoupment), N12 (consolidated voucher for petty cash recoupment)

TRIGGER: Each small payment from petty cash imprest

VALIDATION_RULES:
- Petty cash balance must never exceed the prescribed imprest limit [VERIFY ₹500]
- All payments must have supporting chits/receipts
- Recoupment to N05 must happen before imprest is exhausted
- Balance on hand must equal imprest minus unrecouped payments

AUDIT_RISK: MEDIUM
AUDIT_RISK_REASON: Excess imprest held, payments without chits, and petty cash used for above-limit items are typical objections. Lower fraud scale than main cash book.

RECONCILIATION: Claude (Daily, MEDIUM) adopted over Cursor (As needed, HIGH). Petty cash is a daily running record. MEDIUM risk is appropriate — lower scale than N05.

OBSIDIAN_TAGS: #namuna #cash #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-05]] [[Namuna-12]]
---

---
NAMUNA: 19
NAME_EN: Labour Attendance Register (Muster Roll)
NAME_MR: हजेरीपट (मस्टर रोल)
CATEGORY: Works
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]; Maharashtra Employment Guarantee Act [VERIFY for MGNREGS works]
PURPOSE: Daily attendance register for labourers working on GP construction and maintenance works. Each worker's attendance is marked daily at the work site by the overseer / Gram Sevak. Forms the basis for labour payment in N20-Kha (labour bill).
WHO_MAINTAINS: Gram Sevak / Site Supervisor
WHO_APPROVES: Sarpanch (weekly); Junior Engineer (scheme works)
FREQUENCY: Daily (at active work sites)
SUBMISSION_DEADLINE: N/A (used in N20 at bill preparation)
SUBMITTED_TO: Internal (used in N20-Kha bill)

FIELDS_IN_REGISTER:
- Work name and work order number (N20 reference)
- Date
- Worker name
- Worker address / identity proof reference
- Designation (skilled / semi-skilled / unskilled)
- Daily wage rate
- Attendance mark (present / absent) for each date
- Total days attended
- Total wages due
- Signature / thumb impression of each worker
- Sarpanch / supervisor authentication signature

DEPENDS_ON: N20 (work must be sanctioned before muster is opened)
FEEDS_INTO: N20 (labour bill N20-Kha is prepared from muster), N12 (payment voucher for wages), N05 (cash payment of wages)

TRIGGER: Start of work at site; each working day

VALIDATION_RULES:
- Muster must be maintained at the work site — not in the GP office
- Each worker must physically sign or thumb-print daily
- No proxy signing
- Attendance must be verified by surprise check by BDO / PS officer [VERIFY frequency]
- Total workers on muster must not exceed sanctioned strength for the work
- Muster must be closed on the day work stops — no open-ended musters

AUDIT_RISK: VERY HIGH
AUDIT_RISK_REASON: Ghost worker fraud (names of non-existent workers), inflated attendance (workers marked present on holidays or absent days), and muster maintained at office (not site) are the single most common serious fraud pattern in GP works audits across Maharashtra.

RECONCILIATION: Claude (VERY HIGH) adopted over Cursor (HIGH). Muster roll ghost worker fraud is #1 GP audit crime. VERY HIGH is unambiguous.

OBSIDIAN_TAGS: #namuna #works #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-20]] [[Namuna-12]] [[Namuna-05]]
---

---
NAMUNA: 20
NAME_EN: Works Register (incl. 20-Ka Measurement Book, 20-Kha Bill, 20-Kha1 Payment)
NAME_MR: कामे नोंदवही (व नमुना २०क, २०ख, २०ख१)
CATEGORY: Works
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]; Maharashtra GP works manual [VERIFY]
PURPOSE: Master register of all construction and maintenance works undertaken by the GP. N20-Ka is the Measurement Book (site measurements by JE); N20-Kha is the Contractor/Labour Bill; N20-Kha1 is the Payment Certificate. All three are sub-forms within this Namuna.
WHO_MAINTAINS: Gram Sevak; Junior Engineer (measurement entries)
WHO_APPROVES: GP Resolution (administrative sanction); BDO / Block-level EE (technical sanction above GP limit [VERIFY ₹2 lakh or current limit]); Sarpanch (final payment)
FREQUENCY: Per project (entry on work commencement and at each stage)
SUBMISSION_DEADLINE: N/A (submitted to PS on completion)
SUBMITTED_TO: Panchayat Samiti (completion report); CEO ZP (at audit)

FIELDS_IN_REGISTER:
- Work serial number
- Work name and description
- Administrative sanction: GP resolution number + date + amount
- Technical sanction: authority, number, date, amount
- Tender / quotation number and awarded contractor (if applicable)
- Commencement date
- Stipulated completion date
- N20-Ka (Measurement Book): date, site measurements, JE signature
- N20-Kha (Bill): labour count from N19, material quantities, total bill amount
- N20-Kha1 (Payment): amount released per stage, cheque number, date
- Actual completion date
- Final cost vs sanctioned cost
- Utilisation Certificate reference

DEPENDS_ON: N01 (works budget provision), N19 (muster roll feeds labour bill), N12 (payment voucher)
FEEDS_INTO: N05 (payment to cash book), N16 (assets created by works), N22 (immovable property created), N23 (roads created), N04 (asset value in balance sheet)

TRIGGER: GP resolution sanctioning a work; commencement at site

VALIDATION_RULES:
- No work commenced without administrative sanction (GP resolution)
- No payment above GP technical sanction limit without BDO/EE sanction [VERIFY ₹2L limit]
- Measurement book entries (N20-Ka) must precede bill preparation (N20-Kha)
- JE must physically measure at site — no office-prepared measurements
- Payment must not exceed measured quantities
- Tender mandatory above prescribed threshold [VERIFY limit]
- Completion certificate must be on file before final payment
- Utilisation Certificate must be sent to funding agency on completion

AUDIT_RISK: VERY HIGH
AUDIT_RISK_REASON: Payment without measurement book, inflated quantities, payment above sanction limit, works not completed but payment released, sub-standard execution, and missing completion certificates are the most serious works audit objections.

RECONCILIATION: Both agree on VERY HIGH.

OBSIDIAN_TAGS: #namuna #works #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-01]] [[Namuna-05]] [[Namuna-12]] [[Namuna-16]] [[Namuna-19]] [[Namuna-22]] [[Namuna-23]]
---

---
NAMUNA: 21
NAME_EN: Employee Payroll Register
NAME_MR: कर्मचारी देयक नोंदवही
CATEGORY: Expenditure
LEGAL_REF: Maharashtra Village Panchayats Act 1958 §32A [VERIFY]; Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Monthly salary register for all GP employees. Records gross pay, deductions (GPF/NPS, PT, IT), and net pay for each employee. Must reconcile with N13 (staff list) — no employee on payroll who is not on N13.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch
FREQUENCY: Monthly
SUBMISSION_DEADLINE: N/A (salary paid by last working day of month)
SUBMITTED_TO: Internal (retained with cash book)

FIELDS_IN_REGISTER:
- Month and year
- Employee serial number (N13 reference)
- Employee name and designation
- Pay scale / band
- Basic pay
- Allowances (DA, HRA, TA, etc.)
- Gross pay
- Deductions: GPF/NPS, Professional Tax, Income Tax, recovery of advance
- Net pay
- Mode of payment (bank transfer / cash)
- Bank account number
- Employee signature / thumb impression on receipt of salary
- Sarpanch countersignature

DEPENDS_ON: N13 (staff list — basis for who gets paid and at what scale)
FEEDS_INTO: N05 (salary payment from cash book), N12 (voucher authorising salary payment), N26 (monthly expenditure return — salary head), N03 (annual establishment expenditure)

TRIGGER: End of each calendar month

VALIDATION_RULES:
- No employee paid who does not appear in N13
- No salary without employee's signature/thumb impression on the register
- Salary must match the pay scale in N13 — no ad hoc payments
- Deductions must be remitted to appropriate authorities within prescribed time (GPF to ZP, PT to state)
- Salary by cash only permitted where bank account not available [VERIFY — most GPs now bank transfer]
- Monthly salary total must reconcile with N26 expenditure return salary head

AUDIT_RISK: VERY HIGH
AUDIT_RISK_REASON: Ghost employees (names on payroll without real persons), salary paid without signature/thumb-print, salary scale higher than N13 authorises, and non-remittance of GPF deductions are among the most serious GP audit objections.

RECONCILIATION: Claude (VERY HIGH) adopted over Cursor (HIGH). Ghost employee payroll fraud is a tier-1 audit risk at GP level.

OBSIDIAN_TAGS: #namuna #expenditure #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-05]] [[Namuna-12]] [[Namuna-13]] [[Namuna-26]]
---

---
NAMUNA: 22
NAME_EN: Immovable Property Register
NAME_MR: स्थावर मालमत्ता नोंदवही
CATEGORY: Property
LEGAL_REF: Maharashtra Village Panchayats Act 1958 [VERIFY section]; Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Register of all immovable properties owned or controlled by the GP — buildings, office premises, community halls, water tanks, etc. Roads are tracked separately in N23; land in N24. Annual physical verification mandatory.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; CEO ZP (at audit)
FREQUENCY: Updated on acquisition / construction / disposal; annual verification
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Panchayat Samiti (at audit)

FIELDS_IN_REGISTER:
- Property serial number
- Description (type, name)
- Location (survey / plot number, village)
- Date of acquisition / construction
- Source (own construction / grant / transfer)
- Cost / value
- Area (sq. metres)
- Current use
- Annual verification date and condition
- Encumbrances / disputes
- Disposal details (if any)

DEPENDS_ON: N20 (works that create immovable assets), N24 (land on which structure stands), N23 (roads classified as immovable property)
FEEDS_INTO: N04 (balance sheet — immovable property value)

TRIGGER: Construction completion; acquisition by GP; disposal of property

VALIDATION_RULES:
- Annual physical verification mandatory — gap of 2+ years = auto objection
- Any dispute or encroachment must be noted and legal action status recorded
- Structures built on GP land must link to N24 land entry
- Assets created through government schemes must note the scheme

AUDIT_RISK: HIGH
AUDIT_RISK_REASON: Encroachment on GP property, property not entered after construction, disposal without GP resolution, and no annual verification are common serious objections.

RECONCILIATION: Claude (HIGH, annual verification, PS at audit) adopted over Cursor (MEDIUM, Internal). Property disputes and encroachment are significant GP issues — HIGH is correct.

OBSIDIAN_TAGS: #namuna #property #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-04]] [[Namuna-20]] [[Namuna-23]] [[Namuna-24]]
---

---
NAMUNA: 23
NAME_EN: Roads Register
NAME_MR: रस्ते नोंदवही
CATEGORY: Property
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Register of all roads within GP jurisdiction — village roads, internal lanes, approach roads to hamlets. Roads are also immovable property and feed into N22. Updated on new road construction and maintenance works.
WHO_MAINTAINS: Gram Sevak; Junior Engineer (technical details)
WHO_APPROVES: Sarpanch; JE (technical details)
FREQUENCY: Updated on new construction / maintenance; annual review
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal; PS on request

FIELDS_IN_REGISTER:
- Road serial number
- Road name / route description
- From point to end point
- Length (km)
- Width (metres)
- Surface type (kachcha / metalled / CC / BT)
- Year of construction
- Works reference (N20 work number)
- Maintenance history (year, work done, cost, N20 reference)
- Current condition
- Remarks

DEPENDS_ON: N20 (works that construct or maintain road)
FEEDS_INTO: N22 (roads are immovable property), N04 (value in balance sheet)

TRIGGER: Completion of road construction or maintenance work

VALIDATION_RULES:
- Every road in GP area must be listed — omission is an objection
- Length and surface type must be physically verifiable
- Maintenance works must cross-reference N20 work number

AUDIT_RISK: MEDIUM
AUDIT_RISK_REASON: Roads not entered, poor condition not noted, and maintenance without corresponding N20 are typical objections. Not as high-risk as cash or payroll.

RECONCILIATION: Both agree MEDIUM. Claude frequency (on construction/maintenance) adopted over Cursor (Daily) — roads register is not a daily document.

OBSIDIAN_TAGS: #namuna #property #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-20]] [[Namuna-22]] [[Namuna-04]]
---

---
NAMUNA: 24
NAME_EN: Land Register
NAME_MR: जमीन नोंदवही
CATEGORY: Property
LEGAL_REF: Maharashtra Village Panchayats Act 1958 [VERIFY section on GP land]; Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Register of all land owned or controlled by the GP. Land is the foundational asset — structures (N22) and trees (N33) sit on GP land. Revenue records (7/12 extract) must corroborate entries. Updates require Tehsildar coordination.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; Tehsildar (revenue record corroboration)
FREQUENCY: Updated on acquisition, transfer, or change of use
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal; Tehsildar (for revenue record updates)

FIELDS_IN_REGISTER:
- Survey number / Gat number
- Village and taluka
- Area (hectares / acres)
- Class of land (agricultural / non-agricultural / gairan)
- Mode of acquisition (purchase / government transfer / donation)
- Date of acquisition
- 7/12 extract reference
- Current use
- Encumbrances / disputes
- Mutation entry number (Tehsildar)
- Remarks

DEPENDS_ON: None (primary land record)
FEEDS_INTO: N22 (structures on this land), N33 (trees on this land), N04 (land value in balance sheet)

TRIGGER: Acquisition of land; transfer; change of use; encroachment reported

VALIDATION_RULES:
- All GP land must be entered — unrecorded GP land is vulnerable to encroachment
- Revenue records (7/12) must show GP as owner for each entry
- Disputed land must note case number and court
- Change of use from agricultural to non-agricultural requires Collector permission [VERIFY]

AUDIT_RISK: HIGH
AUDIT_RISK_REASON: Encroachment on GP land (gairan in particular), land not entered in register, disputed land without legal action, and 7/12 not matching the register are serious objections. Land alienation cases are escalated to ZP level.

RECONCILIATION: Claude (HIGH, Tehsildar involvement) adopted over Cursor (MEDIUM). Land is HIGH risk in Maharashtra GP context given gairan encroachment issues.

OBSIDIAN_TAGS: #namuna #property #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-22]] [[Namuna-33]] [[Namuna-04]]
---

---
NAMUNA: 25
NAME_EN: Investment Register
NAME_MR: गुतवणुक नोंदवही
CATEGORY: Advances
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Register tracking all investments made by the GP from surplus funds — fixed deposits, post office savings, government bonds, etc. Only investments in prescribed instruments are permitted. Interest earned is credited to N05.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: GP Resolution; Panchayat Samiti sanction [VERIFY — whether PS sanction needed or GP resolution sufficient]
FREQUENCY: As needed; interest entries on receipt of interest
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal; PS on request

FIELDS_IN_REGISTER:
- Investment serial number
- Date of investment
- Instrument type (FD / post office / bond)
- Institution name and branch
- FD / certificate number
- Principal amount
- Rate of interest
- Maturity date
- Interest credited (date and amount) — each receipt
- Maturity proceeds received
- GP resolution authorising investment
- Remarks

DEPENDS_ON: N05 (funds invested from cash book)
FEEDS_INTO: N05 (interest credited to cash book), N04 (investments shown as asset in balance sheet)

TRIGGER: Surplus funds available; GP resolution to invest; interest receipt; maturity

VALIDATION_RULES:
- Investment only in permitted instruments (nationalised bank FDs, post office, government bonds)
- GP resolution mandatory before any investment
- Interest must be received and entered when due — overdue interest is objection
- Investments must not lock up funds needed for operational expenses

AUDIT_RISK: MEDIUM
AUDIT_RISK_REASON: Investment in non-permitted instruments and interest not credited are typical objections. Lower risk than cash or works.

RECONCILIATION: Claude (MEDIUM) adopted over Cursor (HIGH). Investments in a typical GP are small amounts in FDs — not a primary fraud area.

OBSIDIAN_TAGS: #namuna #advances #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-04]] [[Namuna-05]]
---

---
NAMUNA: 26
NAME_EN: Monthly Returns (26-Ka Income + 26-Kha Expenditure)
NAME_MR: मासिक विवरण (नमुना २६ क + २६ ख)
CATEGORY: Reporting
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]; PS circular [VERIFY deadline confirmation]
PURPOSE: Monthly financial returns submitted to Panchayat Samiti. N26-Ka summarises all income received during the month (from N06); N26-Kha summarises all expenditure incurred (from N12/N21). Core accountability mechanism — PS monitors GP finances through these returns.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (signs before submission)
FREQUENCY: Monthly
SUBMISSION_DEADLINE: By 15th of the following month (web confirmed)
SUBMITTED_TO: Panchayat Samiti

FIELDS_IN_REGISTER:
- Month and year
- N26-Ka (Income): head-wise receipts, total income, opening balance, closing balance
- N26-Kha (Expenditure): head-wise payments, total expenditure
- Bank reconciliation statement
- Gram Sevak signature; Sarpanch signature
- PS receiving stamp and date

DEPENDS_ON: N05 (cash book monthly totals), N06 (classified receipts), N12 (vouchers for expenditure), N21 (payroll totals)
FEEDS_INTO: N03 (annual I&E — aggregated from 12 monthly N26s), N27 (audit objections raised after PS review of N26)

TRIGGER: End of each calendar month

VALIDATION_RULES:
- Must be submitted by 15th — late submission is an objection
- Income total must match N06 classified receipt total for the month
- Expenditure total must match N12 voucher total + N21 salary total for the month
- Closing balance must match N05 cash book closing balance
- Bank balance in N26 must match bank passbook

AUDIT_RISK: HIGH
AUDIT_RISK_REASON: Late submission, figures not matching source registers (N05, N06), and missing bank reconciliation are common objections.

RECONCILIATION: Claude (Monthly, PS, 15th deadline) adopted over Cursor (As needed, Internal). Web confirmed N26 is the mandatory monthly submission to PS by 15th. Cursor's classification as Internal is incorrect.

OBSIDIAN_TAGS: #namuna #reporting #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-03]] [[Namuna-05]] [[Namuna-06]] [[Namuna-12]] [[Namuna-21]] [[Namuna-27]]
---

---
NAMUNA: 27
NAME_EN: Audit Objections Monthly Statement
NAME_MR: लेखापरीक्षण आक्षेप मासिक विवरण
CATEGORY: Reporting
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Monthly statement of all pending audit objections — both new objections raised and compliance achieved on old ones. Submitted to PS and CEO ZP. Feeds into N30 (cumulative audit compliance register).
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; CEO ZP
FREQUENCY: Monthly
SUBMISSION_DEADLINE: By 15th of following month (same cycle as N26) [VERIFY]
SUBMITTED_TO: Panchayat Samiti; CEO ZP

FIELDS_IN_REGISTER:
- Month and year
- Objection serial number
- Date of original objection
- Nature of objection
- Amount involved
- Current status (pending / partially complied / closed)
- Action taken during month
- Target date for full compliance
- Sarpanch signature; Gram Sevak signature

DEPENDS_ON: N26 (PS review of monthly returns generates objections), N30 (cumulative register feeds monthly statement)
FEEDS_INTO: N30 (monthly data aggregated in cumulative register)

TRIGGER: Audit visit raising new objections; monthly compliance reporting cycle

VALIDATION_RULES:
- All open objections from N30 must appear in this statement
- Closed objections must have CEO ZP closure order reference
- No objection to be shown as "complied" without documentary proof

AUDIT_RISK: HIGH
AUDIT_RISK_REASON: Objections not reported, false compliance entries, and growing backlog of unresolved objections are common findings.

RECONCILIATION: Claude (Monthly, PS + CEO ZP) adopted over Cursor (upon audit, PS only). N27 is a monthly statement, not triggered only by audit visits.

OBSIDIAN_TAGS: #namuna #reporting #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-26]] [[Namuna-30]]
---

---
NAMUNA: 28
NAME_EN: SC/ST 15% + Women 10% Welfare Expenditure Register
NAME_MR: SC/ST + महिला खर्च विवरण
CATEGORY: Reporting
LEGAL_REF: Government of Maharashtra GR [VERIFY GR number and date] mandating 15% SC/ST and 10% women earmark; Constitutional provisions (Art. 243G + Schedules)
PURPOSE: Tracks compliance with mandatory expenditure earmarks — minimum 15% of GP's discretionary expenditure for SC/ST welfare and minimum 10% for women welfare. One of the most frequently raised audit objections across Maharashtra.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; PS / CEO ZP review
FREQUENCY: Monthly compilation; quarterly review
SUBMISSION_DEADLINE: Quarterly [VERIFY exact deadline] to Panchayat Samiti
SUBMITTED_TO: Panchayat Samiti; CEO ZP

FIELDS_IN_REGISTER:
- Month / quarter
- Total discretionary expenditure
- Expenditure on SC/ST welfare works (head-wise)
- % of total (must be ≥15%)
- Expenditure on women welfare works (head-wise)
- % of total (must be ≥10%)
- Works references (N20 work numbers)
- Voucher references (N12)
- Deficit (if target not met) and recovery plan
- Sarpanch signature; Gram Sevak signature

DEPENDS_ON: N12 (vouchers), N20 (works identifying SC/ST / women beneficiaries), N05 (cash book totals)
FEEDS_INTO: N30 (audit compliance — failure to meet targets is auto objection)

TRIGGER: Monthly/quarterly compilation of expenditure under welfare heads

VALIDATION_RULES:
- SC/ST share must be ≥15% of discretionary expenditure [VERIFY GR]
- Women share must be ≥10% of discretionary expenditure [VERIFY GR]
- Works must actually benefit the target group — not just relabelled
- N20 work records must corroborate beneficiary details
- Deficit at year-end triggers mandatory audit objection

AUDIT_RISK: VERY HIGH
AUDIT_RISK_REASON: Most GPs consistently miss the SC/ST 15% and women 10% targets. This is the single most commonly raised compliance objection in Maharashtra GP audits. Failure is almost automatic in smaller GPs with limited discretionary budget.

RECONCILIATION: Claude (VERY HIGH, PS + CEO ZP) adopted over Cursor (MEDIUM, Internal). Cursor's classification here is fundamentally wrong — N28 is a statutory compliance register submitted to PS and CEO ZP.

OBSIDIAN_TAGS: #namuna #reporting #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-12]] [[Namuna-20]] [[Namuna-05]] [[Namuna-30]]
---

---
NAMUNA: 29
NAME_EN: Loan Register
NAME_MR: कर्ज नोंदवही
CATEGORY: Advances
LEGAL_REF: Maharashtra Village Panchayats Act 1958 [VERIFY borrowing powers section]; Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Register of all loans borrowed by the GP from government agencies, banks, or other bodies. GPs have limited borrowing powers. Each loan requires GP resolution and PS/CEO ZP sanction above GP's authority.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: GP Resolution; Panchayat Samiti / CEO ZP (above GP borrowing limit [VERIFY])
FREQUENCY: As needed
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal; PS (disclosure of loan obligation)

FIELDS_IN_REGISTER:
- Loan serial number
- Lending agency
- Purpose of loan
- Sanction date and amount
- Rate of interest
- Repayment schedule (instalment amount, due date)
- GP resolution number
- PS / CEO ZP sanction (where required)
- Disbursement date and amount
- Repayment entries (date, amount, receipt number)
- Outstanding balance
- Remarks

DEPENDS_ON: N05 (loan receipt into cash book; repayment from cash book)
FEEDS_INTO: N04 (balance sheet — loan outstanding as liability), N05 (repayment payments)

TRIGGER: Sanction of new loan; each repayment instalment

VALIDATION_RULES:
- Borrowing only for capital works — not for operational expenses [VERIFY]
- GP resolution mandatory before any borrowing
- Repayment must be on schedule — overdue repayments are audit objections
- Unauthorised borrowings (without resolution) are serious objections

AUDIT_RISK: MEDIUM
AUDIT_RISK_REASON: Unauthorised borrowings and default on repayment are the main risks, but most GPs borrow infrequently. Medium risk overall.

RECONCILIATION: Claude (MEDIUM) adopted over Cursor (HIGH). Loan register is medium risk for a typical GP.

OBSIDIAN_TAGS: #namuna #advances #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-04]] [[Namuna-05]]
---

---
NAMUNA: 30
NAME_EN: Audit Compliance Register
NAME_MR: लेखापरीक्षण पूर्तता नोंदवही
CATEGORY: Audit
LEGAL_REF: Maharashtra Village Panchayats Act 1958 [VERIFY audit section]; Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Cumulative, all-time register of every audit objection raised against the GP across all audit years, and the compliance achieved on each. The first document examined by any superior audit or CAG inspection. Incompleteness or falsification is itself a major audit finding.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; CEO ZP (closes objections)
FREQUENCY: Ongoing (updated after each audit visit and on each compliance action)
SUBMISSION_DEADLINE: N/A (standing register; referred to in N27 monthly)
SUBMITTED_TO: CEO ZP; Panchayat Samiti

FIELDS_IN_REGISTER:
- Objection serial number (cumulative, never reset)
- Year and type of audit (internal / district / CAG)
- Para number in audit report
- Nature of objection
- Amount involved
- Date first raised
- GP response (initial reply)
- Compliance action taken (date and details)
- Amount recovered / regularised
- CEO ZP closure order number and date
- Status (open / partially complied / closed)

DEPENDS_ON: N27 (monthly objection statement feeds cumulative register), N28 (welfare compliance — frequently flagged), all other Namune (direct audit subjects)
FEEDS_INTO: Nothing downstream — this is the terminal accountability document

TRIGGER: Audit visit raising new objection; compliance action taken; CEO ZP closure order

VALIDATION_RULES:
- No objection to be closed without CEO ZP order
- Amount recovered must be evidenced by N05 receipt entry
- Objection must remain open until formally closed — no informal closing
- All objections from N27 must be traceable here

AUDIT_RISK: VERY HIGH
AUDIT_RISK_REASON: False compliance entries, closing objections without actual recovery, long-pending objections (5+ years), and the register itself being incomplete or missing are among the most serious findings in any superior audit.

RECONCILIATION: Both agree VERY HIGH. Claude (CEO ZP + PS) adopted over Cursor (Gram Sabha). Audit compliance goes to CEO ZP and PS — not Gram Sabha. Gram Sabha receives annual accounts (N03/N04), not audit compliance reports.

OBSIDIAN_TAGS: #namuna #audit #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-27]] [[Namuna-28]]
---

---
NAMUNA: 31
NAME_EN: Travel Allowance Register
NAME_MR: प्रवास भत्ता देयक नोंदवही
CATEGORY: Expenditure
LEGAL_REF: Maharashtra GP TA rules [VERIFY]; Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Register recording travel allowance claims by GP staff for official travel. Claims must be supported by travel details and approved by Sarpanch (for GP staff) or Panchayat Samiti (for Gram Sevak).
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (GP staff TA); Panchayat Samiti (Gram Sevak TA)
FREQUENCY: As needed
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal; PS (for Gram Sevak TA claims)

FIELDS_IN_REGISTER:
- Claim serial number
- Employee name and designation
- Date of journey
- From and to (places visited)
- Purpose of travel
- Mode of transport
- Distance / fare claimed
- Daily allowance
- Total claim amount
- Voucher number (N12)
- Sarpanch / PS approval signature

DEPENDS_ON: N12 (contingency voucher for TA payment), N05 (payment from cash book)
FEEDS_INTO: N05 (TA payment entry), N26 (monthly expenditure return — TA head)

TRIGGER: GP staff undertaking official travel

VALIDATION_RULES:
- Travel must be for official purpose — no personal travel claims
- Mode of transport and fare must be within prescribed rates [VERIFY]
- Gram Sevak TA must be counter-approved by BDO / PS
- Claims must be submitted within 30 days of travel [VERIFY]

AUDIT_RISK: LOW
AUDIT_RISK_REASON: TA at GP level involves small amounts and few staff. Inflated claims are common but the financial impact is minor. Not a priority audit area.

RECONCILIATION: Claude (LOW) adopted over Cursor (VERY HIGH, Annual, PS). Cursor's VERY HIGH is clearly disproportionate — TA fraud at GP level is low-value. Annual frequency is also wrong; it's as needed.

OBSIDIAN_TAGS: #namuna #expenditure #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-05]] [[Namuna-12]] [[Namuna-26]]
---

---
NAMUNA: 32
NAME_EN: Refund Order Register
NAME_MR: परतावा आदेश नोंदवही
CATEGORY: Expenditure
LEGAL_REF: Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Register recording all refunds authorised by the GP — over-collected taxes, deposits returned, excess fees refunded. Each refund requires GP order and is paid through N12 (contingency voucher).
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; GP resolution (for larger refunds)
FREQUENCY: As needed
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Refund serial number
- Date of refund order
- Name of person / entity
- Nature of original receipt (tax / deposit / fee)
- Original receipt number and date
- Amount originally collected
- Refund amount
- Reason for refund (over-collection / deposit return)
- GP resolution number (if required)
- Voucher number (N12)
- Payee signature on receipt of refund
- Gram Sevak and Sarpanch signatures

DEPENDS_ON: N07 or N10 (original receipt that is now being refunded), N12 (voucher for refund payment)
FEEDS_INTO: N05 (refund payment from cash book)

TRIGGER: Over-collection identified; security deposit matured for refund; fee error corrected

VALIDATION_RULES:
- Refund must be backed by original receipt evidence
- GP resolution required above a threshold [VERIFY amount]
- No refund without payee signature on register
- Refund amount must not exceed original receipt amount

AUDIT_RISK: LOW
AUDIT_RISK_REASON: Refunds at GP level are infrequent and small. Phantom refunds (paying fictitious persons) are possible but rare. Low financial exposure.

RECONCILIATION: Claude (LOW) adopted over Cursor (HIGH). Refunds are rare at GP level; LOW risk is appropriate.

OBSIDIAN_TAGS: #namuna #expenditure #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-05]] [[Namuna-12]]
---

---
NAMUNA: 33
NAME_EN: Tree Register
NAME_MR: वृक्ष नोंदवही
CATEGORY: Property
LEGAL_REF: Maharashtra Village Panchayats Act 1958 [VERIFY section on GP trees]; Maharashtra (Urban Areas) Protection and Preservation of Trees Act [VERIFY applicability at GP level]; Lekha Sanhita 2011 [VERIFY rule]
PURPOSE: Register of all trees on GP land — their species, location, estimated value, and census. Annual census mandatory. Tree felling requires GP resolution and, for protected species, Forest Department permission. Proceeds from timber go to N05.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; Forest Department (protected species)
FREQUENCY: Annual census; updated on felling, planting, or loss
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Panchayat Samiti; Forest Dept (if applicable)

FIELDS_IN_REGISTER:
- Tree serial number
- Species (common + botanical name)
- Location (survey number / plot, N24 reference)
- Estimated girth and height
- Estimated timber value
- Year planted / surveyed
- Annual census date and condition
- Felling order reference (GP resolution + Forest Dept if required)
- Timber / produce realised (amount credited to N05)
- Remarks

DEPENDS_ON: N24 (land on which trees stand)
FEEDS_INTO: N04 (trees are GP assets in balance sheet), N05 (proceeds from felling / produce)

TRIGGER: Annual tree census; felling of tree; new planting; loss due to storm/theft

VALIDATION_RULES:
- Annual census is mandatory — missed census = audit objection
- Felling without GP resolution is an offence
- Protected species felling without Forest Dept permission is criminal offence
- Proceeds from felling must be deposited in N05 within prescribed time
- Tree count must reconcile year-over-year (opening + planted − felled − lost = closing)

AUDIT_RISK: MEDIUM
AUDIT_RISK_REASON: Unauthorised tree felling, proceeds not deposited, and census not conducted are typical objections. Not a primary fraud area but environmentally sensitive.

RECONCILIATION: Both agree on MEDIUM.

OBSIDIAN_TAGS: #namuna #property #gram-panchayat
OBSIDIAN_LINKS: [[Namuna-24]] [[Namuna-04]] [[Namuna-05]]
---

---

## SECTION 1: MASTER DEPENDENCY MATRIX

| Source | Target | Dependency Type | Notes |
|--------|--------|-----------------|-------|
| N01 | N02 | FEEDS | Budget ceiling governs re-appropriation |
| N01 | N12 | FEEDS | No payment without budget provision |
| N01 | N21 | FEEDS | Salary budget ceiling |
| N02 | N01 | FEEDS | Updates budget head ceilings |
| N03 | N04 | FEEDS | Annual I&E closing balance → BS opening |
| N04 | N03 | FEEDS | BS opening balance from prior year I&E |
| N05 | N03 | FEEDS | Cash book totals → annual I&E |
| N05 | N06 | FEEDS | Daily entries → monthly classified register |
| N05 | N26 | FEEDS | Monthly totals → monthly return |
| N06 | N03 | FEEDS | Classified receipts → annual I&E income |
| N06 | N26 | FEEDS | Monthly receipt totals → N26-Ka |
| N07 | N05 | FEEDS | Receipt issued → cash book receipt entry |
| N07 | N06 | FEEDS | Receipt → classified register |
| N08 | N09 | FEEDS | Assessment → demand raised |
| N09 | N10 | TRIGGERS | Demand triggers receipt on collection |
| N09 | N05 | FEEDS | Collection enters cash book |
| N09 | N26 | FEEDS | Tax collection in monthly returns |
| N10 | N09 | RECONCILES | Receipt reconciles against demand |
| N10 | N05 | FEEDS | Tax receipt → cash book |
| N11 | N05 | FEEDS | Misc collection → cash book |
| N11 | N06 | FEEDS | Misc receipt → classified register |
| N12 | N05 | FEEDS | Voucher → cash book payment |
| N12 | N26 | FEEDS | Voucher totals → monthly expenditure return |
| N13 | N21 | FEEDS | Staff list → payroll basis |
| N14 | N05 | FEEDS | Stamp revenue/expenditure → cash book |
| N15 | N12 | FEEDS | Consumable purchase backed by voucher |
| N16 | N04 | FEEDS | Movable asset value → balance sheet |
| N17 | N04 | FEEDS | Advances receivable + deposits payable → BS |
| N17 | N05 | FEEDS | Advance paid / recovered via cash book |
| N18 | N05 | FEEDS | Petty cash recoupment → main cash book |
| N19 | N20 | FEEDS | Muster roll → labour bill (N20-Kha) |
| N20 | N05 | FEEDS | Works payment → cash book |
| N20 | N16 | FEEDS | Works create movable assets |
| N20 | N22 | FEEDS | Works create immovable property |
| N20 | N23 | FEEDS | Works construct roads |
| N21 | N05 | FEEDS | Salary payment → cash book |
| N21 | N12 | FEEDS | Salary backed by voucher |
| N21 | N26 | FEEDS | Monthly salary → expenditure return |
| N22 | N04 | FEEDS | Immovable property value → BS |
| N23 | N22 | FEEDS | Roads classified as immovable property |
| N23 | N04 | FEEDS | Road value → balance sheet |
| N24 | N22 | FEEDS | Land underlies immovable property |
| N24 | N33 | FEEDS | Land is location of GP trees |
| N24 | N04 | FEEDS | Land value → balance sheet |
| N25 | N04 | FEEDS | Investments → balance sheet assets |
| N25 | N05 | FEEDS | Interest on investment → cash book |
| N26 | N03 | FEEDS | 12 monthly returns aggregate → annual I&E |
| N26 | N27 | TRIGGERS | PS review of N26 → audit objections |
| N27 | N30 | FEEDS | Monthly objections → cumulative register |
| N28 | N30 | FEEDS | Welfare non-compliance → audit objection |
| N29 | N04 | FEEDS | Loan outstanding → balance sheet liability |
| N29 | N05 | FEEDS | Loan receipt / repayment via cash book |
| N31 | N05 | FEEDS | TA payment → cash book |
| N31 | N12 | FEEDS | TA backed by voucher |
| N32 | N05 | FEEDS | Refund payment → cash book |
| N32 | N12 | FEEDS | Refund backed by voucher |
| N33 | N04 | FEEDS | Tree value → balance sheet assets |
| N33 | N05 | FEEDS | Timber proceeds → cash book |

---

## SECTION 2: CATEGORY GROUPS

| Group | Namune | Primary Risk |
|-------|--------|-------------|
| Budget & Planning | N01, N02 | VERY HIGH, HIGH |
| Daily Cash Chain | N05, N18 | VERY HIGH, MEDIUM |
| Tax Chain | N08, N09, N10 | HIGH, HIGH, HIGH |
| Receipt & Income | N06, N07, N11 | MEDIUM, HIGH, MEDIUM |
| Expenditure & Payments | N12, N21, N31, N32 | VERY HIGH, VERY HIGH, LOW, LOW |
| Works & Capital | N19, N20 | VERY HIGH, VERY HIGH |
| Staff & Stores | N13, N14, N15 | HIGH, MEDIUM, LOW-MEDIUM |
| Property & Assets | N16, N22, N23, N24, N33 | HIGH, HIGH, MEDIUM, HIGH, MEDIUM |
| Advances, Investments & Loans | N17, N25, N29 | HIGH, MEDIUM, MEDIUM |
| Reporting & Annual Accounts | N03, N04, N26, N27, N28 | HIGH, MEDIUM, HIGH, HIGH, VERY HIGH |
| Audit & Compliance | N30 | VERY HIGH |

---

## SECTION 3: CRITICAL DAILY PATH

```
Every working day (in sequence):

1.  N07  → Issue receipt for any non-tax income received
2.  N10  → Issue receipt for any tax / fee payment received
3.  N11  → Record any miscellaneous demand collection
4.  N19  → Mark attendance at active work sites (morning)
5.  N18  → Record petty cash payments during the day
6.  N12  → Prepare contingency voucher for each payment made
7.  N14  → Enter any stamp used on documents
8.  N05  → Post all receipts and payments to daily cash book (end of day)
9.  N05  → Verify closing balance = opening + receipts − payments

Weekly:
10. N05  → Sarpanch authentication of cash book

Monthly (by 15th):
11. N06  → Compile classified receipt register for the month
12. N21  → Prepare payroll register and pay salaries
13. N26  → Prepare N26-Ka (income) + N26-Kha (expenditure) → submit to PS
14. N27  → Prepare audit objections monthly statement → submit to PS + CEO ZP
15. N28  → Update SC/ST + women welfare expenditure tracker

Annual:
16. N08  → Tax assessment revision
17. N09  → Open new demand register for financial year
18. N01  → Prepare budget for coming year (by January 31)
19. N03  → Prepare Annual I&E Statement (April–June)
20. N04  → Prepare Balance Sheet (April–June)
```

---

## SECTION 4: AUDIT RISK RANKING

| Risk Level | Namune | Why |
|------------|--------|-----|
| VERY HIGH | N01, N05, N12, N19, N20, N21, N28, N30 | Budget fraud, cash manipulation, fake vouchers, muster roll ghost workers, works fraud, ghost employees, welfare earmark failure, false compliance |
| HIGH | N02, N03, N07, N08, N09, N10, N13, N16, N17, N22, N24, N26, N27, N29 | Multiple audit-sensitive operations; standard fraud patterns |
| MEDIUM | N04, N06, N11, N14, N23, N25, N33 | Classification errors, minor misuse; lower fraud potential |
| LOW-MEDIUM | N15 | Over-purchase of consumables; low value |
| LOW | N31, N32 | Rare, small-value, limited fraud potential |

---

## SECTION 5: OBSIDIAN VAULT STRUCTURE

```
namune-vault/
├── MOC-Master.md                    ← navigation root, all 33 + group links
└── Namune/
    ├── Budget/
    │   ├── MOC-Budget.md
    │   ├── Namuna-01.md
    │   └── Namuna-02.md
    ├── Cash/
    │   ├── MOC-Cash.md
    │   ├── Namuna-05.md
    │   └── Namuna-18.md
    ├── Tax/
    │   ├── MOC-Tax.md
    │   ├── Namuna-08.md
    │   ├── Namuna-09.md
    │   └── Namuna-10.md
    ├── Receipt/
    │   ├── MOC-Receipt.md
    │   ├── Namuna-06.md
    │   ├── Namuna-07.md
    │   └── Namuna-11.md
    ├── Expenditure/
    │   ├── MOC-Expenditure.md
    │   ├── Namuna-12.md
    │   ├── Namuna-21.md
    │   ├── Namuna-31.md
    │   └── Namuna-32.md
    ├── Works/
    │   ├── MOC-Works.md
    │   ├── Namuna-19.md
    │   └── Namuna-20.md
    ├── Staff/
    │   ├── MOC-Staff.md
    │   ├── Namuna-13.md
    │   ├── Namuna-14.md
    │   └── Namuna-15.md
    ├── Property/
    │   ├── MOC-Property.md
    │   ├── Namuna-16.md
    │   ├── Namuna-22.md
    │   ├── Namuna-23.md
    │   ├── Namuna-24.md
    │   └── Namuna-33.md
    ├── Advances/
    │   ├── MOC-Advances.md
    │   ├── Namuna-17.md
    │   ├── Namuna-25.md
    │   └── Namuna-29.md
    ├── Reporting/
    │   ├── MOC-Reporting.md
    │   ├── Namuna-03.md
    │   ├── Namuna-04.md
    │   ├── Namuna-26.md
    │   ├── Namuna-27.md
    │   └── Namuna-28.md
    └── Audit/
        ├── MOC-Audit.md
        └── Namuna-30.md
```

**Note on Cursor vault:** Cursor placed N30 inside the Reporting folder (no separate Audit folder).
Recommendation: Keep Audit as a separate folder — N30 is functionally distinct from reporting registers.
N30 is the terminal accountability document examined first in any CAG inspection.

---

## OPEN VERIFY ITEMS (priority list for human expert / physical Lekha Sanhita review)

1. **MVP Act section numbers** — §61 (budget), §63 (accounts/audit), §124 (taxation), §129 (recovery) appear correct but sub-sections need verification against physical Act
2. **Lekha Sanhita 2011 specific rule/chapter numbers** — none were confirmable from web sources; require physical copy of the code
3. **Budget submission deadline** — January 31 vs February 15 discrepancy across sources
4. **N28 GR number** — specific Government Resolution mandating 15% SC/ST + 10% women earmark
5. **Cash deposit threshold** — ₹2,000 cash limit before bank deposit required [VERIFY]
6. **Cheque mandatory threshold** — above what amount must payment be by cheque (not cash)
7. **Revenue stamp threshold** — ₹5,000 confirmed in web sources [VERIFY against current rules — threshold may have changed]
8. **Petty cash imprest limit** — ₹500 is the commonly cited figure [VERIFY per Lekha Sanhita]
9. **Works technical sanction limit** — GP-level sanction limit (₹2 lakh cited, may be revised)
10. **N09-Ka status** — whether demand notice (९ क) is a separate serial form or sub-form of N09 varies by district printed sets
11. **N26 submission deadline** — 15th of following month web-confirmed; verify if any district circulars differ
12. **Advance recovery period** — 3 months for temporary advance [VERIFY]
13. **GP borrowing limit** — what requires PS sanction vs GP resolution alone
