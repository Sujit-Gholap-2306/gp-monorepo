# Maharashtra Gram Panchayat — 33 Namune Machine Requirements
## Claude Independent Draft (for cross-AI reconciliation)

**Version:** Claude independent draft — do NOT merge with Cursor draft without reconciliation pass  
**Date:** 2026-04-18  
**Prepared by:** Claude (Sonnet 4.6) — independent research, no reference to Cursor output  
**Primary verified source:** mygrampanchayat.com Namune list (secondary training resource, verified as consistent with GP office practice)  
**Legal anchors:** Maharashtra Village Panchayats Act, 1958 (Act III of 1959); Maharashtra Gram Panchayat Lekha Sanhita (Accounting Code), 2011  
**Jurisdiction:** Maharashtra State — Gram Panchayat level only  

**Numbering policy:** Namuna 1–33 are the main series. Sub-forms (5क, 9क, 20क, 20ख, 20ख1, 26क, 26ख) are physical books tied to their parent Namuna and described inside the parent block. OBSIDIAN_LINKS and dependency lists reference parent numbers only.

**VERIFY policy:** Items marked [VERIFY] could not be confirmed from publicly accessible sources in this session. Lekha Sanhita 2011 specific rule numbers are all [VERIFY] — consult the printed code. MVP Act section numbers for budget/accounts/audit chapters are [VERIFY] — different printed editions number them differently after amendments.

**WARNING on tax Namune:** Namune 8–10 here are the ACCOUNTING tax registers (assessment, demand, receipt). Do NOT confuse with revenue/land Namune used in 7/12 extracts (a different Namuna 8).

---

## NAMUNA BLOCKS (1–33)

---
NAMUNA: 1
NAME_EN: Annual Budget Estimate
NAME_MR: अर्थसंकल्प
CATEGORY: Budget
LEGAL_REF: Maharashtra Village Panchayats Act, 1958 — Section 61 [VERIFY: some editions cite as Section 62; confirm against your printed Act]; Lekha Sanhita, 2011 — Chapter III (Budget) [VERIFY: specific rule number]
PURPOSE: Estimates the Gram Panchayat's income and expenditure for the coming financial year head-by-head. No expenditure may be incurred against a head without provision in this register except through the re-appropriation process.
WHO_MAINTAINS: Gram Sevak (prepares draft); Sarpanch (presents to Gram Sabha)
WHO_APPROVES: Gram Panchayat resolution → Gram Sabha (ratification) → Panchayat Samiti (approval)
FREQUENCY: Annual (revised estimate as needed mid-year)
SUBMISSION_DEADLINE: Draft to Gram Sabha by 31 January; final to Panchayat Samiti by 28 February [VERIFY: check your district CEO ZP circular — mygrampanchayat.com also cites December submission; discrepancy exists between sources]
SUBMITTED_TO: Panchayat Samiti

FIELDS_IN_REGISTER:
- Financial year
- Account head number
- Account head description
- Opening balance (brought forward from previous year)
- Estimated receipts (current year)
- Estimated expenditure (current year)
- Revised estimate amount (filled during mid-year revision)
- Actual receipts (filled at year-end comparison)
- Actual expenditure (filled at year-end comparison)
- Variance (actual vs estimated)
- Resolution number authorising the budget
- Date of Gram Sabha approval
- Date of Panchayat Samiti approval
- Gram Sevak signature; Sarpanch signature; PS stamp

DEPENDS_ON: []
FEEDS_INTO: [2, 12, 20, 28]
TRIGGER: Start of financial year planning cycle (typically October–January for next April–March year)
VALIDATION_RULES:
- Total estimated expenditure must not exceed total estimated receipts plus opening balance
- Every expenditure entry in Namuna 5 and 12 must have a corresponding budget head provision here
- Revised estimate requires formal GP resolution and PS sanction before implementation
- Budget must be presented to Gram Sabha before submission to PS — bypass is an audit objection

OBSIDIAN_TAGS: #namuna #budget #gram-panchayat #lekha-sanhita
OBSIDIAN_LINKS: [[Namuna-02]] [[Namuna-12]] [[Namuna-20]] [[Namuna-28]]

---
NAMUNA: 2
NAME_EN: Re-appropriation and Reallocation Register
NAME_MR: पुनर्विनियोजन व नियत वाटप नोंदवही
CATEGORY: Budget
LEGAL_REF: Lekha Sanhita, 2011 — [VERIFY: rule number for re-appropriation; training materials cite Rule 21 but this needs confirmation against printed code]; MVP Act, 1958 — Section 61/62 [VERIFY]
PURPOSE: Records transfers of budget provision between account heads when one head runs short and another has surplus. Prevents expenditure exceeding head-wise provision without altering the total approved budget.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Gram Panchayat (resolution) → Panchayat Samiti (sanction for re-appropriation above prescribed limit) [VERIFY: threshold amount requiring PS sanction]
FREQUENCY: As needed (event-driven)
SUBMISSION_DEADLINE: N/A (event-driven; resolution recorded contemporaneously)
SUBMITTED_TO: Panchayat Samiti (copy of resolution)

FIELDS_IN_REGISTER:
- Serial number
- Date of resolution
- Resolution number
- Account head losing provision (number and description)
- Amount transferred out
- Account head gaining provision (number and description)
- Amount transferred in
- Reason for re-appropriation
- Balance provision remaining in each head post-transfer
- Panchayat Samiti sanction reference (if applicable)
- Gram Sevak signature; Sarpanch signature

DEPENDS_ON: [1]
FEEDS_INTO: [3, 26]
TRIGGER: When actual expenditure on a head is projected to exceed its budget provision before year-end
VALIDATION_RULES:
- Amounts transferred out and in must be equal (zero net effect on total budget)
- Cannot re-appropriate from salary/establishment heads to non-establishment without PS sanction [VERIFY]
- Each entry must reference the GP resolution number authorising the transfer
- Revised amounts must reconcile with Namuna 1 revised estimate column

OBSIDIAN_TAGS: #namuna #budget #gram-panchayat #re-appropriation
OBSIDIAN_LINKS: [[Namuna-01]] [[Namuna-03]] [[Namuna-26]]

---
NAMUNA: 3
NAME_EN: Annual Income and Expenditure Statement
NAME_MR: जमा-खर्च विवरण
CATEGORY: Reporting
LEGAL_REF: MVP Act, 1958 — Section 8 (Panchayat to place statement of accounts before Gram Sabha); Section 8(1A) (six-monthly expenditure report); Lekha Sanhita, 2011 — Chapter IX [VERIFY: specific rule]
PURPOSE: Annual financial statement consolidating total receipts and expenditure for the financial year by account head. Presented to the Gram Sabha as the primary accountability document.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Gram Sabha (presented for ratification); CEO ZP (as part of annual audit file)
FREQUENCY: Annual (after 31 March year-end)
SUBMISSION_DEADLINE: At annual Gram Sabha meeting (typically April–June) [VERIFY: exact statutory deadline]
SUBMITTED_TO: Gram Sabha; copy to Panchayat Samiti

FIELDS_IN_REGISTER:
- Financial year
- Account head number and description
- Budget provision (from Namuna 1)
- Revised provision (from Namuna 2, if applicable)
- Actual receipts during year (from Namuna 5/6)
- Actual expenditure during year (from Namuna 5)
- Surplus or deficit per head
- Opening balance
- Closing balance
- Total receipts and total expenditure (foot totals)
- Gram Sabha date and resolution number
- Gram Sevak signature; Sarpanch signature; PS/CEO ZP certification

DEPENDS_ON: [2, 5, 6, 16, 22, 25, 26, 28]
FEEDS_INTO: []
TRIGGER: End of financial year (1 April); compilation after books are closed for the year
VALIDATION_RULES:
- Total receipts in Namuna 3 must agree with Namuna 26क cumulative (12 months)
- Total expenditure in Namuna 3 must agree with Namuna 26ख cumulative (12 months)
- Closing balance must equal opening balance of next year's Namuna 1
- SC/ST 15% and women 10% actuals (from Namuna 28) must be reflected here
- Cannot be presented to Gram Sabha if cash book (Namuna 5) is not closed and balanced

OBSIDIAN_TAGS: #namuna #reporting #gram-panchayat #annual-accounts
OBSIDIAN_LINKS: [[Namuna-02]] [[Namuna-05]] [[Namuna-06]] [[Namuna-16]] [[Namuna-22]] [[Namuna-25]] [[Namuna-26]] [[Namuna-28]]

---
NAMUNA: 4
NAME_EN: Assets and Liabilities Register (Balance Sheet)
NAME_MR: मत्ता व दायित्वे नोंदवही
CATEGORY: Reporting
LEGAL_REF: Lekha Sanhita, 2011 — Chapter IX (Annual Accounts) [VERIFY: specific rule]; MVP Act, 1958 — Section 63 [VERIFY: accounts maintenance section]
PURPOSE: Records the Gram Panchayat's financial position — all assets (cash, investments, advances, property) and liabilities (loans, deposits payable) — as at year-end. The GP equivalent of a balance sheet.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Gram Sabha (as part of annual accounts); CEO ZP (audit)
FREQUENCY: Annual
SUBMISSION_DEADLINE: With Namuna 3 at annual Gram Sabha [VERIFY]
SUBMITTED_TO: Gram Sabha; audit

FIELDS_IN_REGISTER:
- As-at date (31 March)
- ASSETS side: Cash in hand; balance in bank accounts (bank-wise); investments (FDs, bonds — from Namuna 25); advances recoverable (from Namuna 17); stock in hand; value of movable assets (from Namuna 16); value of immovable property (from Namuna 22); roads value (from Namuna 23); land value (from Namuna 24); tree asset value (from Namuna 33)
- LIABILITIES side: Loans outstanding (from Namuna 29); security deposits payable (from Namuna 17); refunds payable (from Namuna 32); outstanding creditors
- Net assets (excess of assets over liabilities)
- Previous year comparative figures
- Gram Sevak and Sarpanch certification

DEPENDS_ON: [5, 16, 17, 22, 23, 24, 25, 29, 32, 33]
FEEDS_INTO: []
TRIGGER: Year-end closure (31 March) and compilation of all asset/liability registers
VALIDATION_RULES:
- Cash in hand per Namuna 4 must agree with closing balance in Namuna 5
- Bank balances must agree with bank reconciliation (if maintained separately) [VERIFY: whether bank reconciliation is a sub-form of N5 or separate]
- Investment total must agree with Namuna 25
- Loan outstanding must agree with Namuna 29
- Assets total minus liabilities total must equal fund balance (carried forward to next year's Namuna 1)

OBSIDIAN_TAGS: #namuna #reporting #gram-panchayat #balance-sheet
OBSIDIAN_LINKS: [[Namuna-05]] [[Namuna-16]] [[Namuna-17]] [[Namuna-22]] [[Namuna-23]] [[Namuna-24]] [[Namuna-25]] [[Namuna-29]] [[Namuna-32]] [[Namuna-33]]

---
NAMUNA: 5
NAME_EN: General Cash Book
NAME_MR: सामान्य रोकड वही
CATEGORY: Cash
LEGAL_REF: Lekha Sanhita, 2011 — Chapter IV (Cash Book) [VERIFY: specific rule]; MVP Act, 1958 — Section 63 [VERIFY]
PURPOSE: The central financial register recording every receipt and payment of the Gram Panchayat. The primary book of account from which all other registers are posted. Sub-form 5क (दैनिक रोकड वही, Daily Cash Book) records transactions day-by-day and is reconciled weekly into this general book.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (authenticates weekly with signature and date; monthly at month-close)
FREQUENCY: Daily (5क) / Weekly reconciliation (5)
SUBMISSION_DEADLINE: N/A (internal; balance checked at any audit visit)
SUBMITTED_TO: Internal; available for audit inspection

FIELDS_IN_REGISTER:
- Date
- RECEIPT side: Particulars; Receipt/Voucher number; Account head; Bank column; Cash column
- PAYMENT side: Particulars; Cheque/Voucher number; Account head; Bank column; Cash column
- Daily closing balance (cash in hand + bank balance)
- Running balance
- Weekly Sarpanch authentication signature and date
- Monthly closing: carried forward balance
- Bank reconciliation note (date of reconciliation, balance as per bank passbook, reconciling items) [VERIFY: whether this is a column in N5 or a separate sub-form]

SUB-FORM 5क (दैनिक रोकड वही — Daily Cash Book):
- Same columnar structure as N5 but maintained per-day
- Receipts and payments entered on the day of transaction
- Daily cash-in-hand balance struck at end of day
- Weekly reconciliation with N5 (general cash book)
- Gram Sevak initials each day; Sarpanch weekly signature

DEPENDS_ON: [7, 10, 11, 12, 18, 20, 21, 25, 29, 31, 32]
FEEDS_INTO: [3, 6, 26]
TRIGGER: Every financial transaction (receipt or payment) of the Gram Panchayat
VALIDATION_RULES:
- Cash book must be balanced (struck) every day — unbalanced books are a major audit objection
- Cash in hand per books must agree with physical cash count at any time
- No erasures or overwriting permitted — corrections by striking through with attestation
- Cheque required for all payments above ₹2,000 [VERIFY: current threshold per Lekha Sanhita or GR]
- Revenue stamp required on payment vouchers above ₹5,000 [VERIFY: current Indian Stamp Act threshold]
- Bank deposits must be made within 24 hours of receipt of cash collections [VERIFY]
- Monthly closing balance in N5 must agree with Namuna 26 monthly totals
- Sarpanch must authenticate weekly — absence of authentication is audit objection
- No payment without prior sanction/resolution — unsanctioned payments flagged immediately

OBSIDIAN_TAGS: #namuna #cash #gram-panchayat #primary-book
OBSIDIAN_LINKS: [[Namuna-07]] [[Namuna-10]] [[Namuna-11]] [[Namuna-12]] [[Namuna-18]] [[Namuna-20]] [[Namuna-21]] [[Namuna-25]] [[Namuna-26]] [[Namuna-03]] [[Namuna-06]]

---
NAMUNA: 6
NAME_EN: Classified Receipt Register (Monthly)
NAME_MR: जमा रक्कमांची वर्गीकृत नोंदवही
CATEGORY: Receipt
LEGAL_REF: Lekha Sanhita, 2011 — Chapter IV [VERIFY: specific rule for classified posting]; MVP Act, 1958 — Section 63 [VERIFY]
PURPOSE: Posts all receipts month-by-month under each account head. Provides a running tally of actual income vs budget provision for each head, enabling the GP to track revenue shortfalls before year-end.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (monthly sign-off)
FREQUENCY: Monthly
SUBMISSION_DEADLINE: N/A (internal ledger; feeds into Namuna 26क)
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Account head number and description
- Budget provision (from Namuna 1)
- Revised provision (from Namuna 2, if applicable)
- Monthly receipt columns (April through March — 12 columns)
- Cumulative receipts to date
- Balance yet to be received
- Reference to receipt voucher number (Namuna 7) or cash book folio
- Gram Sevak signature each month

DEPENDS_ON: [5, 7, 12, 18]
FEEDS_INTO: [3, 26]
TRIGGER: At end of each month, posting from cash book (Namuna 5) to this ledger
VALIDATION_RULES:
- Monthly total in N6 must agree with receipt side monthly total in Namuna 5
- Annual cumulative in N6 must agree with Namuna 3 total receipts
- Every receipt entry must have a corresponding entry in Namuna 7 (general receipt voucher)
- Account head classification must match Namuna 1 heads — no unclassified receipts

OBSIDIAN_TAGS: #namuna #receipt #gram-panchayat #classified-ledger
OBSIDIAN_LINKS: [[Namuna-05]] [[Namuna-07]] [[Namuna-12]] [[Namuna-18]] [[Namuna-03]] [[Namuna-26]]

---
NAMUNA: 7
NAME_EN: General Receipt Voucher
NAME_MR: सामान्य पावती
CATEGORY: Receipt
LEGAL_REF: Lekha Sanhita, 2011 — Chapter IV (Receipts) [VERIFY: specific rule]; MVP Act, 1958 — Section 63 [VERIFY]
PURPOSE: The primary receipt issued for every amount received by the Gram Panchayat (other than tax-specific receipts which use Namuna 10). Maintained as a bound book with counterfoils. Every receipt issued must be from this book.
WHO_MAINTAINS: Gram Sevak (issues receipt); Sarpanch (countersigns above prescribed amount) [VERIFY: threshold]
WHO_APPROVES: Sarpanch (periodic review of counterfoil book)
FREQUENCY: As needed (every receipt transaction)
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal (counterfoil retained; original to payer)

FIELDS_IN_REGISTER:
- Receipt number (pre-printed serial)
- Date
- Name of payer
- Amount (in figures and words)
- Purpose / account head
- Mode of receipt (cash / cheque / DD)
- Cheque/DD number and bank (if applicable)
- Gram Sevak signature and GP seal
- Counterfoil: same data retained in book
- Cancellation note (if receipt cancelled — both original and counterfoil must be retained)

DEPENDS_ON: [10, 11, 33]
FEEDS_INTO: [5, 6]
TRIGGER: Every time money is received by the Gram Panchayat (non-tax income, grant receipt, loan receipt, etc.)
VALIDATION_RULES:
- No cash may be acknowledged without issuing a receipt from this book
- Receipts must be in strict serial order — missing numbers are audit objections
- Cancelled receipts must have both parts (original + counterfoil) preserved with "CANCELLED" across them
- Total of counterfoils must reconcile with cash book (Namuna 5) receipt entries
- Receipt book must be pre-numbered; unauthorized blank receipt books are a major fraud risk

OBSIDIAN_TAGS: #namuna #receipt #gram-panchayat #voucher
OBSIDIAN_LINKS: [[Namuna-05]] [[Namuna-06]] [[Namuna-10]] [[Namuna-11]] [[Namuna-33]]

---
NAMUNA: 8
NAME_EN: Tax Assessment Register
NAME_MR: कर आकारणी नोंदवही
CATEGORY: Tax
LEGAL_REF: MVP Act, 1958 — Section 124 (power to levy house tax, water tax, and other taxes); Lekha Sanhita, 2011 — Chapter V (Tax Records) [VERIFY: specific rule]; Maharashtra Village Panchayats (Levy and Recovery of Taxes) Rules, 1960 [VERIFY: exact rule number]
PURPOSE: The master register of all properties assessed for taxation within the Gram Panchayat area. Contains assessed value, tax rate applied, and annual demand for each property. Basis for all demand, collection, and outstanding calculations.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Gram Panchayat (resolution for annual assessment revision)
FREQUENCY: Annual (revised when new properties added or existing properties change)
SUBMISSION_DEADLINE: N/A (internal master register; updated before demand is raised each year)
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Assessment number (unique, permanent per property)
- Name of property holder (owner / occupant)
- Property location (survey number / plot number / village)
- Property description (residential / commercial / industrial)
- Plinth area (sq m or sq ft)
- Annual Rateable Value (ARV) or Capital Value [VERIFY: which basis Maharashtra GP uses]
- Tax rate (percentage — house tax, water tax, lighting tax separately if applicable)
- Annual tax demand per type
- Total annual demand
- Date of assessment
- Date of last revision
- Assessment officer signature
- Remarks (exemptions, disputes, court stay orders)

DEPENDS_ON: []
FEEDS_INTO: [9]
TRIGGER: Annual assessment cycle or new construction / property transfer reported to GP
VALIDATION_RULES:
- Every property within GP limits must be assessed — omissions are audit risk
- Assessment must be based on ARV or prescribed valuation method — arbitrary rates are objected to
- Demand in Namuna 9 must exactly match the annual demand per property in Namuna 8
- Revised assessment requires GP resolution with notice to property owner [VERIFY: notice period]
- Exemptions (places of worship, burial grounds, etc.) must be noted with legal basis [VERIFY: MVP Act sections for exemptions]

OBSIDIAN_TAGS: #namuna #tax #gram-panchayat #assessment
OBSIDIAN_LINKS: [[Namuna-09]]

---
NAMUNA: 9
NAME_EN: Tax Demand Register
NAME_MR: कर मागणी नोंदवही
CATEGORY: Tax
LEGAL_REF: MVP Act, 1958 — Section 124 (tax levy) and Section 129 (recovery of taxes); Lekha Sanhita, 2011 — Chapter V [VERIFY: specific rule]; Maharashtra Village Panchayats (Levy and Recovery of Taxes) Rules, 1960 [VERIFY]
PURPOSE: Records the annual tax demand raised against each assessed property (derived from Namuna 8) and tracks collections and outstanding balances through the year. Core register for tax revenue management.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (signs demand register when completed)
FREQUENCY: Annual (demand raised once per year; collections updated as payments received)
SUBMISSION_DEADLINE: Demand must be raised before start of collection cycle [VERIFY: GP Act deadline for raising demand]
SUBMITTED_TO: Internal; available for audit

FIELDS_IN_REGISTER:
- Demand year
- Assessment number (from Namuna 8)
- Name of taxpayer
- Property address / survey number
- Annual demand (house tax; water tax; other taxes — separate columns)
- First half-year demand (April–September)
- Second half-year demand (October–March)
- First half collection (date, amount, receipt number from Namuna 10)
- Second half collection (date, amount, receipt number)
- Arrears from previous year (brought forward)
- Total demand (current + arrears)
- Total collected
- Outstanding balance
- Demand notice issued date (Namuna 9क reference)
- Remarks (dispute, court stay, write-off with resolution number)

SUB-FORM 9क (कराची मागणी पावती — Tax Demand Notice/Cum-Receipt):
- A printed notice-cum-receipt form issued to taxpayer
- Contains: GP name; assessment number; taxpayer name; property description; amount demanded (current + arrears); payment due date; early payment discount (5%) [VERIFY]; penalty for late payment [VERIFY]
- GP seal; issuing officer signature
- Detachable receipt portion completed when payment made

DEPENDS_ON: [8]
FEEDS_INTO: [10]
TRIGGER: Annual assessment completed in Namuna 8; demand raised for new financial year
VALIDATION_RULES:
- Total demand in N9 must match sum of annual demands in Namuna 8
- Demand notice (9क) must be issued to every taxpayer — non-issuance bars recovery proceedings
- Arrears brought forward must equal previous year's outstanding in N9
- Collections recorded in N9 must match receipts issued in Namuna 10
- Outstanding = Total demand − Total collected (arithmetic check)
- Recovery proceedings under Section 129 can only proceed after demand notice issued [VERIFY]

OBSIDIAN_TAGS: #namuna #tax #gram-panchayat #demand
OBSIDIAN_LINKS: [[Namuna-08]] [[Namuna-10]]

---
NAMUNA: 10
NAME_EN: Tax and Fee Receipt
NAME_MR: कर व फी बाबत पावती
CATEGORY: Tax
LEGAL_REF: MVP Act, 1958 — Section 124; Lekha Sanhita, 2011 — Chapter V [VERIFY: specific rule]
PURPOSE: The official receipt issued to a taxpayer when they pay their taxes or fees to the Gram Panchayat. Provides proof of payment. Counterfoil retained by GP. Updates the collection record in Namuna 9.
WHO_MAINTAINS: Gram Sevak (issues receipt)
WHO_APPROVES: Sarpanch (periodic review)
FREQUENCY: As needed (every tax payment transaction)
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Original to payer; counterfoil retained by GP

FIELDS_IN_REGISTER:
- Receipt number (pre-printed serial)
- Date of payment
- Taxpayer name and assessment number (from Namuna 9)
- Property description
- Type of tax (house tax / water tax / lighting tax / other)
- Current year demand amount
- Arrears amount
- Amount paid (current)
- Amount paid (arrears)
- Total amount paid
- Early payment discount applied (5%) if applicable [VERIFY: discount provision in rules]
- Late payment penalty applied [VERIFY: penalty rate]
- Mode of payment (cash / cheque)
- Balance remaining outstanding
- Collecting officer signature; GP seal

DEPENDS_ON: [9]
FEEDS_INTO: [5, 7]
TRIGGER: Taxpayer makes payment against demand in Namuna 9 (or 9क notice)
VALIDATION_RULES:
- Receipt amount must be posted in same day's Namuna 5 (cash book)
- Total receipts per N10 must reconcile with tax collection columns in Namuna 9
- Receipt books must be pre-numbered and accounted for — missing receipts are audit objection
- Discounts and penalties must have legal basis — arbitrary application is objected to
- Collections must be deposited in bank same day or next working day [VERIFY]

OBSIDIAN_TAGS: #namuna #tax #gram-panchayat #collection-receipt
OBSIDIAN_LINKS: [[Namuna-09]] [[Namuna-05]] [[Namuna-07]]

---
NAMUNA: 11
NAME_EN: Miscellaneous Demand Register
NAME_MR: किरकोळ मागणी नोंदवही
CATEGORY: Receipt
LEGAL_REF: MVP Act, 1958 — Section 57 (GP powers) and Section 124 (fees, rents); Lekha Sanhita, 2011 — Chapter V [VERIFY: specific rule]
PURPOSE: Records demands and collections for non-tax income — market rents, lease rents on GP properties, fines, fees (birth/death certificates, building permissions, etc.). Separate from the main tax demand chain (Namune 8–10).
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch
FREQUENCY: As needed (event-driven for fines/fees; periodically for rents)
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Serial number
- Date of demand
- Name of person liable
- Nature of demand (market rent / lease rent / fine / fee / other)
- Property / purpose description
- Period of demand (if rent — monthly/annual)
- Amount demanded
- Amount collected (date, receipt number from Namuna 7)
- Balance outstanding
- Remarks (waivers, disputes, legal proceedings)

DEPENDS_ON: []
FEEDS_INTO: [5, 7]
TRIGGER: GP lease/rent due date; fine imposed by resolution; fee application received
VALIDATION_RULES:
- Every demand raised must have a legal basis (resolution, lease agreement, or statutory provision)
- Collection receipt must be issued via Namuna 7 (general receipt) and posted to Namuna 5
- Outstanding amounts not pursued for more than 3 years are audit-flagged [VERIFY: limitation provision]
- Rents must be periodically revised — unchanged rents for many years are audit observations

OBSIDIAN_TAGS: #namuna #receipt #gram-panchayat #miscellaneous-income
OBSIDIAN_LINKS: [[Namuna-05]] [[Namuna-07]]

---
NAMUNA: 12
NAME_EN: Contingency Expenditure Voucher
NAME_MR: आकस्मित खर्चाचे प्रमाणक
CATEGORY: Expenditure
LEGAL_REF: Lekha Sanhita, 2011 — Chapter VI (Expenditure and Vouchers) [VERIFY: specific rule]; MVP Act, 1958 — Section 63 [VERIFY]
PURPOSE: The authorised payment voucher for contingency (day-to-day office and operational) expenditure. Each payment requires a separate voucher with bill/invoice attached, approved before disbursement. The primary source document for all cash payments except payroll.
WHO_MAINTAINS: Gram Sevak (prepares voucher)
WHO_APPROVES: Sarpanch (signs authorising payment)
FREQUENCY: As needed (every contingency payment)
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal (filed with cash book)

FIELDS_IN_REGISTER:
- Voucher number (serial, per financial year)
- Date
- Payee name and address
- Nature of expenditure
- Account head (from Namuna 1)
- Budget provision available
- Amount (in figures and words)
- Supporting bills/invoices attached (listed)
- Revenue stamp affixed (if applicable above threshold)
- GP resolution number (if required for the expenditure)
- Gram Sevak certification; Sarpanch approval signature
- Payment acknowledgment (payee signature/thumb impression on receipt)

DEPENDS_ON: [1]
FEEDS_INTO: [5, 6, 15]
TRIGGER: Any operational expenditure (stationery, repairs, utilities, consumables, etc.) within GP jurisdiction
VALIDATION_RULES:
- No payment without budget provision in Namuna 1 — expenditure against non-existent head is illegal
- Revenue stamp required on vouchers above ₹5,000 [VERIFY: current threshold]
- Voucher must have supporting original bill/invoice — no payment on photocopies
- Payments above ₹2,000 by cheque only — cash payment above this limit is audit objection [VERIFY: current limit per GR]
- Vouchers must be numbered serially without gaps
- GP resolution required for expenditure items above prescribed limit [VERIFY: limit from Lekha Sanhita]
- Payee acknowledgment (signature) is mandatory — payment without acknowledgment is an objection

OBSIDIAN_TAGS: #namuna #expenditure #gram-panchayat #voucher
OBSIDIAN_LINKS: [[Namuna-01]] [[Namuna-05]] [[Namuna-06]] [[Namuna-15]]

---
NAMUNA: 13
NAME_EN: Staff List and Pay Scale Register
NAME_MR: कर्मचारी वर्गाची सुची व वेतनश्रेणी नोंदवही
CATEGORY: Staff
LEGAL_REF: MVP Act, 1958 — Section 57 (GP powers for staff appointment) [VERIFY: specific staff-related section]; Maharashtra Village Panchayats (Appointment of Officers and Servants) Rules [VERIFY: exact rule citation]; Lekha Sanhita, 2011 — Chapter VIII (Establishment) [VERIFY]
PURPOSE: Master register of all Gram Panchayat employees — regular, temporary, and daily wage — with their designations, pay scales, date of appointment, and current salary. The basis for payroll (Namuna 21) and travel allowance (Namuna 31) entitlements.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; Panchayat Samiti (for sanctioned posts)
FREQUENCY: Updated as needed (appointments, increments, retirements, transfers)
SUBMISSION_DEADLINE: N/A (internal master; available for audit)
SUBMITTED_TO: Internal; Panchayat Samiti (for sanction of posts)

FIELDS_IN_REGISTER:
- Serial number
- Employee name
- Designation / post
- Sanctioned post reference (PS sanction number)
- Category (permanent / temporary / daily wage / outsourced)
- Date of appointment
- Date of birth
- Educational qualifications
- Pay scale (grade pay, basic pay)
- Current basic salary
- Date of last increment; date of next increment
- Allowances applicable (HRA, DA, TA rates)
- GPF / PF account number
- Date of retirement (superannuation date)
- Remarks (disciplinary proceedings, leave encashment status)

DEPENDS_ON: []
FEEDS_INTO: [21, 31]
TRIGGER: New appointment; increment sanction; retirement; transfer; resignation
VALIDATION_RULES:
- No salary payment (Namuna 21) to any employee not listed here with a sanctioned post
- Increments must be sanctioned by competent authority — auto-increments without sanction are objected to
- Total salary commitments must be within salary head provision in Namuna 1
- Staff strength must not exceed PS-sanctioned cadre strength — excess appointments are major objections

OBSIDIAN_TAGS: #namuna #staff #gram-panchayat #establishment
OBSIDIAN_LINKS: [[Namuna-21]] [[Namuna-31]]

---
NAMUNA: 14
NAME_EN: Stamp Account Register
NAME_MR: मुद्रांक हिशोब नोंदवही
CATEGORY: Staff
LEGAL_REF: Indian Stamp Act, 1899 (as applicable to Maharashtra); Lekha Sanhita, 2011 — Chapter VI [VERIFY: specific rule for stamp accounting]
PURPOSE: Tracks the purchase and usage of revenue stamps at the Gram Panchayat office. Revenue stamps must be affixed on payment vouchers and receipts above prescribed thresholds. This register ensures accountability for stamps as a government quasi-cash item.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (periodic verification of balance)
FREQUENCY: As needed (updated on every purchase or usage)
SUBMISSION_DEADLINE: N/A (internal; balance physically verified at audit)
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Date
- Particulars (purchase from treasury / used on document)
- Denomination of stamp (₹1, ₹2, ₹5, ₹10, ₹20, ₹50, ₹100 etc.)
- Quantity received (on purchase)
- Value received
- Quantity used (on usage entry)
- Document reference (voucher number / receipt number where used)
- Quantity balance in hand
- Value balance in hand
- Sarpanch verification signature and date

DEPENDS_ON: []
FEEDS_INTO: []
TRIGGER: Purchase of stamps from treasury or licensed vendor; affixing stamp on document
VALIDATION_RULES:
- Physical count of stamps must agree with register balance at any audit inspection
- Stamps used must reference the specific document (voucher / receipt number)
- Purchases must be supported by treasury receipt / vendor bill
- Stamps cannot be used for personal documents — GP stamps only for GP transactions

OBSIDIAN_TAGS: #namuna #staff #gram-panchayat #stamps
OBSIDIAN_LINKS: []

---
NAMUNA: 15
NAME_EN: Consumables and Stationery Store Register
NAME_MR: उपभोग्य वस्तुसाठा नोंदवही
CATEGORY: Staff
LEGAL_REF: Lekha Sanhita, 2011 — Chapter VII (Stores) [VERIFY: specific rule]
PURPOSE: Tracks the receipt and consumption of office consumables (stationery, cleaning materials, printer supplies, etc.) purchased by the GP. Ensures consumables expenditure is accounted for and stock is not misused.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (periodic stock verification)
FREQUENCY: Updated on each purchase or issue
SUBMISSION_DEADLINE: N/A (internal)
SUBMITTED_TO: Internal; physical stock verified at audit

FIELDS_IN_REGISTER:
- Article description
- Unit of measurement
- Opening balance (quantity)
- Date of purchase; quantity received; source (supplier name, voucher number from Namuna 12)
- Quantity issued (date, purpose, authorisation)
- Closing balance (quantity)
- Rate per unit (from purchase invoice)
- Value of balance in hand

DEPENDS_ON: [12]
FEEDS_INTO: []
TRIGGER: Purchase of consumables (via Namuna 12 contingency voucher) or issue from existing stock
VALIDATION_RULES:
- Physical stock count must agree with register balance — excess or deficit is an objection
- Each issue must be authorised — un-authorised issues indicate misappropriation risk
- Purchases without supporting invoice (from Namuna 12) must not be entered

OBSIDIAN_TAGS: #namuna #staff #gram-panchayat #stores
OBSIDIAN_LINKS: [[Namuna-12]]

---
NAMUNA: 16
NAME_EN: Fixed and Movable Assets Register
NAME_MR: जड वस्तु संग्रह व जंगम मालमत्ता नोंदवही
CATEGORY: Property
LEGAL_REF: Lekha Sanhita, 2011 — Chapter VII (Property) [VERIFY: specific rule]; MVP Act, 1958 — Section 57 [VERIFY]
PURPOSE: Records all movable assets owned by the Gram Panchayat — furniture, office equipment, vehicles, machinery, tools — with acquisition details, current location, and condition. Distinct from immovable property (Namuna 22). Annual physical verification is mandatory.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; CEO ZP (at audit)
FREQUENCY: Updated on acquisition or disposal; annual physical verification
SUBMISSION_DEADLINE: Annual physical verification report [VERIFY: deadline]
SUBMITTED_TO: Panchayat Samiti (on audit); Internal

FIELDS_IN_REGISTER:
- Serial number
- Article description (make, model, specification)
- Date of acquisition
- Source (purchased — supplier, voucher number from Namuna 12; or received as grant — scheme name)
- Cost / value at acquisition
- Current location (office / field / work site)
- Condition (good / fair / unserviceable)
- Date of last physical verification
- Disposal: date, method (auction / condemnation), amount realised (→ Namuna 7), authorising resolution
- Remarks

DEPENDS_ON: [12, 20]
FEEDS_INTO: [3, 4]
TRIGGER: Purchase of new equipment (via Namuna 12); asset created through works (Namuna 20); annual physical verification cycle
VALIDATION_RULES:
- Physical verification must be conducted annually — unverified assets for 2+ years are objected to
- Every asset must have a unique serial number and location tag
- Disposal must be by auction with GP resolution — private sale without auction is a major objection
- Assets received as part of government schemes must also be entered — missing scheme assets are common objections
- Condemnation must be sanctioned by competent authority [VERIFY: limit]

OBSIDIAN_TAGS: #namuna #property #gram-panchayat #movable-assets
OBSIDIAN_LINKS: [[Namuna-12]] [[Namuna-20]] [[Namuna-03]] [[Namuna-04]]

---
NAMUNA: 17
NAME_EN: Advances and Deposits Register
NAME_MR: अग्रीम / अनामत रक्कमांची नोंदवही
CATEGORY: Advances
LEGAL_REF: Lekha Sanhita, 2011 — Chapter VI [VERIFY: advances/deposits section]; MVP Act, 1958 — Section 63 [VERIFY]
PURPOSE: Tracks all temporary advances paid by the GP (to staff, contractors, suppliers) and security deposits received from contractors. Every advance must be adjusted within prescribed time; every deposit must be refunded when obligation is fulfilled.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; Panchayat Samiti (for advances above prescribed limit) [VERIFY]
FREQUENCY: As needed (event-driven)
SUBMISSION_DEADLINE: N/A (internal; outstanding advances reviewed at audit)
SUBMITTED_TO: Internal; available at audit

FIELDS_IN_REGISTER:
- Serial number
- Date of advance / deposit
- Name of recipient (staff / contractor / vendor)
- Nature (advance for works / travel advance / security deposit received)
- Amount paid / received
- Purpose / reference (work number, purchase order)
- Due date for adjustment / refund
- Amount adjusted / refunded (date, reference)
- Outstanding balance
- Remarks (overdue flag, recovery action taken)

DEPENDS_ON: [5]
FEEDS_INTO: [4, 32]
TRIGGER: Advance payment from Namuna 5 (cash book); security deposit received from contractor before work award
VALIDATION_RULES:
- Advances must be adjusted within 30 days for works advances or as prescribed [VERIFY: deadlines]
- Unadjusted advances beyond due date are a major audit objection
- Security deposits must be refunded after work completion and defect liability period
- Outstanding advances in Namuna 17 must appear as assets in Namuna 4 (balance sheet)
- No second advance to a person with outstanding unadjusted first advance

OBSIDIAN_TAGS: #namuna #advances #gram-panchayat #deposits
OBSIDIAN_LINKS: [[Namuna-05]] [[Namuna-04]] [[Namuna-32]]

---
NAMUNA: 18
NAME_EN: Petty Cash Book
NAME_MR: किरकोळ रोकड वही
CATEGORY: Cash
LEGAL_REF: Lekha Sanhita, 2011 — Chapter IV (Petty Cash) [VERIFY: specific rule]; amount threshold [VERIFY: ₹500 per transaction per some sources]
PURPOSE: Records small day-to-day cash payments below a prescribed threshold (e.g., ₹500) that are impractical to process through the main cash book individually. Maintained on an imprest basis — a fixed float is drawn from Namuna 5 and periodically replenished.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (weekly review)
FREQUENCY: Daily (as petty expenses occur); weekly reconciliation
SUBMISSION_DEADLINE: N/A (internal)
SUBMITTED_TO: Internal; feeds into Namuna 5 on replenishment

FIELDS_IN_REGISTER:
- Date
- Particulars of expense
- Purpose / account head
- Amount paid
- Cumulative total paid
- Imprest balance remaining
- Voucher/chit number
- Signature of recipient
- Replenishment date and amount (drawn from Namuna 5)

DEPENDS_ON: [5]
FEEDS_INTO: [5, 6]
TRIGGER: Small incidental office expenses below prescribed petty cash threshold
VALIDATION_RULES:
- Individual payments must not exceed prescribed petty cash limit [VERIFY: amount from Lekha Sanhita]
- Splitting a large expense into multiple petty cash payments to avoid the limit is prohibited
- Imprest must be replenished before it runs out — exhausted imprest without replenishment is not permitted
- Balance of petty cash at any time = Imprest float − total payments since last replenishment

OBSIDIAN_TAGS: #namuna #cash #gram-panchayat #petty-cash
OBSIDIAN_LINKS: [[Namuna-05]] [[Namuna-06]]

---
NAMUNA: 19
NAME_EN: Labour Attendance Register
NAME_MR: कामावर असलेल्या व्यक्तीचा हजेरीपट
CATEGORY: Works
LEGAL_REF: Lekha Sanhita, 2011 — Chapter VI (Works Accounts) [VERIFY: specific rule]; MGNREGS norms if applicable for scheme works [VERIFY]
PURPOSE: Daily attendance record for labour engaged on GP works. Each worker's name, daily wage category, days worked, and earnings are recorded per work site. Forms the basis for calculating the labour component of work bills (Namuna 20ख).
WHO_MAINTAINS: Gram Sevak / Site Supervisor
WHO_APPROVES: Sarpanch (weekly); Junior Engineer (for scheme works) [VERIFY]
FREQUENCY: Daily (for each active work site)
SUBMISSION_DEADLINE: N/A (internal; reviewed before bill payment)
SUBMITTED_TO: Internal; used in Namuna 20ख (work bill)

FIELDS_IN_REGISTER:
- Work name and number (from Namuna 20)
- Date
- Worker name
- Father's / husband's name
- Village / address
- Skill category (skilled / semi-skilled / unskilled)
- Daily wage rate (as per GP or MGNREGS schedule)
- Attendance per day (present / absent mark)
- Days worked (total)
- Amount earned
- Worker signature or thumb impression
- Site supervisor signature
- Muster roll number (if applicable)

DEPENDS_ON: [20]
FEEDS_INTO: [20]
TRIGGER: Worker reports to work site for GP work in progress under Namuna 20
VALIDATION_RULES:
- Worker count per day must match physical headcount — inflated muster rolls are a major fraud risk
- Wage rates must match prescribed schedule — excess payment without sanction is objected to
- Worker signatures / thumb impressions must be collected on same day — backdated signatures are invalid
- Labour attendance totals must agree with labour cost in the work bill (Namuna 20ख)
- Muster rolls for MGNREGS works must follow MIS update requirements [VERIFY]

OBSIDIAN_TAGS: #namuna #works #gram-panchayat #labour #attendance
OBSIDIAN_LINKS: [[Namuna-20]]

---
NAMUNA: 20
NAME_EN: Works Register (Estimate, Measurement, Bill, Payment)
NAME_MR: कामाच्या अंदाजाची नोंदवही (with sub-forms 20क, 20ख, 20ख(1))
CATEGORY: Works
LEGAL_REF: Lekha Sanhita, 2011 — Chapter VI (Works) [VERIFY: specific rules for estimates and bills]; Maharashtra Public Works Manual (as applicable to GP-level works) [VERIFY: applicability threshold]
PURPOSE: Master register for all capital and maintenance works — from estimate sanction through measurement, billing, and payment. Contains four physical components: (20) works list/estimate; (20क) measurement book; (20ख) work bill/invoice; (20ख(1)) payment register with contractor acknowledgment.
WHO_MAINTAINS: Gram Sevak (administrative); Junior Engineer / Civil Engineer (technical measurements and certification)
WHO_APPROVES: GP resolution (administrative sanction); BDO / EE (technical sanction for works above GP's delegated limit) [VERIFY: financial limit for GP-level technical sanction]
FREQUENCY: As needed (per work sanctioned)
SUBMISSION_DEADLINE: N/A (works accounts maintained till completion and audit clearance)
SUBMITTED_TO: Panchayat Samiti (on completion); CEO ZP (audit)

FIELDS_IN_REGISTER:
- NAMUNA 20 (Works Estimate Register): Work number; work name; location; source of funds (own / 14th FC / SFC / scheme); account head; estimated cost (item-wise schedule of quantities × rates); date of technical sanction; technical sanctioning authority; administrative approval (GP resolution number and date); tendering / quotation reference; contractor name; contract amount; contract date; work commencement date; stipulated completion date; actual completion date; final cost; variations and justification; remarks
- NAMUNA 20क (मोजमाप वही — Measurement Book): Work number reference; date of measurement; item description; unit; quantity measured this visit; cumulative quantity to date; rate; amount; engineer's name and signature; Gram Sevak countersignature
- NAMUNA 20ख (कामाचे देयक — Work Bill): Bill number; work and contractor reference; measurement book folio reference; description of work claimed; quantity; rate; gross amount claimed; deductions (TDS / labour cess / security deposit holdback / penalty); net amount payable; engineer certification; Sarpanch approval
- NAMUNA 20ख(1) (Payment Acknowledgment Register): Payment number; date; contractor/payee name; bill reference; cheque/voucher number; amount paid; contractor acknowledgment signature; Gram Sevak and Sarpanch signatures

DEPENDS_ON: [1, 19]
FEEDS_INTO: [5, 16, 19]
TRIGGER: GP resolution sanctioning a specific work; approved estimate and funds provision in Namuna 1
VALIDATION_RULES:
- No work may start without both technical sanction and administrative sanction
- Estimate must be prepared from approved Schedule of Rates (SOR) — arbitrary rates are objected to
- Measurements must be recorded before payment — payment without MB entry is a major fraud indicator
- Measurement entries must be sequential and indelible — torn-out pages are audit objections
- Contractor payment must not exceed certified measurement value — excess payment without variation order is illegal
- TDS must be deducted at prescribed rates and deposited — non-deduction is an income tax compliance objection
- Labour cess must be collected and remitted to BOCW Board [VERIFY: applicability at GP level]
- Works above prescribed limit must be tendered — award without tender is objected to [VERIFY: GP-level threshold]
- Utilisation Certificate must be issued for grant-funded works [VERIFY: deadline]

OBSIDIAN_TAGS: #namuna #works #gram-panchayat #capital-works #measurement
OBSIDIAN_LINKS: [[Namuna-01]] [[Namuna-05]] [[Namuna-16]] [[Namuna-19]]

---
NAMUNA: 21
NAME_EN: Employee Payroll / Pay Bill Register
NAME_MR: कर्मचाऱ्याचे देयकांची नोंदवही
CATEGORY: Expenditure
LEGAL_REF: MVP Act, 1958 — Section 57 (GP powers for staff); Lekha Sanhita, 2011 — Chapter VIII (Establishment Expenditure) [VERIFY: specific rule]; Maharashtra State Pay Revision rules as applicable [VERIFY]
PURPOSE: Monthly salary disbursement register for all GP employees. Prepared from Namuna 13 (staff register) and shows gross salary, deductions, and net pay for each employee. The authorised payment document for salary expenditure.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch
FREQUENCY: Monthly
SUBMISSION_DEADLINE: Salary due by last day of month (or first day of next) [VERIFY: exact date from service rules]
SUBMITTED_TO: Internal (retained with cash book as supporting voucher)

FIELDS_IN_REGISTER:
- Month and year
- Employee name and designation (from Namuna 13)
- Employee code / pay order number
- Basic pay; grade pay (if applicable)
- Dearness Allowance (DA); House Rent Allowance (HRA); Other allowances
- Gross salary
- Deductions: PF / GPF (employee share); Professional tax; TDS (income tax); GPF loan recovery; advance recovery (from Namuna 17)
- Net pay
- Mode of payment (bank transfer / cash) [VERIFY: whether cash salary payment is permitted]
- Bank account number (if bank transfer)
- Employee signature / acknowledgment
- Gram Sevak certification; Sarpanch approval signature

DEPENDS_ON: [13]
FEEDS_INTO: [5, 26]
TRIGGER: End of each calendar month; salary entitlement arises from service under Namuna 13
VALIDATION_RULES:
- Salary only payable to employees listed in Namuna 13 with sanctioned posts — no ghost employees
- Deductions must be at statutory rates — incorrect deduction computation is an objection
- PF and PT deducted must be remitted within due dates [VERIFY: remittance deadlines]
- TDS deducted must be deposited to Income Tax and TDS return filed [VERIFY]
- Total salary expenditure must be within provision in Namuna 1 (salary head)
- Employee signature on payroll is mandatory — payment without acknowledgment is an objection

OBSIDIAN_TAGS: #namuna #expenditure #gram-panchayat #payroll #salary
OBSIDIAN_LINKS: [[Namuna-13]] [[Namuna-05]] [[Namuna-26]]

---
NAMUNA: 22
NAME_EN: Immovable Property Register
NAME_MR: स्थावर मालमत्ता नोंदवही
CATEGORY: Property
LEGAL_REF: MVP Act, 1958 — Section 57 (GP powers over property); Lekha Sanhita, 2011 — Chapter VII (Property Accounts) [VERIFY: specific rule]; Maharashtra Village Panchayats Act, Section 53 [VERIFY: vesting of properties in GP]
PURPOSE: Master register of all immovable assets (buildings, structures, water supply works, drainage works) owned by the Gram Panchayat. Feeds into the balance sheet (Namuna 4). Roads are in Namuna 23; land in Namuna 24.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; CEO ZP at audit
FREQUENCY: Updated on acquisition or disposal; annual physical verification
SUBMISSION_DEADLINE: Annual physical verification report [VERIFY]
SUBMITTED_TO: Panchayat Samiti (audit)

FIELDS_IN_REGISTER:
- Serial number
- Property name / description (Gram Panchayat building, community hall, water tank, drainage line, etc.)
- Survey / property number
- Location
- Total area (for buildings: plinth area in sq m)
- Date of construction / acquisition
- Mode of acquisition (own construction / scheme / donation / transfer from Government)
- Original cost / value
- Source of funds (own / 14th FC / scheme)
- Current condition
- Current use
- Encumbrance (if any)
- Date of last physical verification
- Remarks

DEPENDS_ON: [23, 24]
FEEDS_INTO: [3, 4]
TRIGGER: New structure constructed; transfer of government property to GP; donation registered
VALIDATION_RULES:
- Every building/structure vested in GP must be in this register — omissions are audit risk
- Properties encumbered (mortgaged) must be noted — undisclosed encumbrances are objected to
- Annual physical verification is mandatory — gaps of 2+ years are audit observations
- Properties in dilapidated condition without repair plan are flagged
- Construction cost must reconcile with Namuna 20 (works register) for GP-constructed assets

OBSIDIAN_TAGS: #namuna #property #gram-panchayat #immovable
OBSIDIAN_LINKS: [[Namuna-23]] [[Namuna-24]] [[Namuna-03]] [[Namuna-04]]

---
NAMUNA: 23
NAME_EN: Roads in Possession Register
NAME_MR: ताब्यातील रस्त्याची नोंदवही
CATEGORY: Property
LEGAL_REF: MVP Act, 1958 — Section 57 (GP jurisdiction over village roads); Lekha Sanhita, 2011 — Chapter VII [VERIFY: specific rule]
PURPOSE: Records all roads under Gram Panchayat control — length, width, surface type, and maintenance history. Roads are a significant GP asset and a major category of works expenditure.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; Junior Engineer (technical details)
FREQUENCY: Updated on new road construction or takeover; maintenance work recorded
SUBMISSION_DEADLINE: N/A (internal; reviewed at audit)
SUBMITTED_TO: Internal; Panchayat Samiti (on request)

FIELDS_IN_REGISTER:
- Road number / name
- From point to point (origin–destination)
- Total length (km)
- Width (m)
- Surface type (kutcha / gravel / WBM / CC / BT)
- Date of construction / date of handover to GP
- Construction cost / value
- Works register reference (Namuna 20 work number)
- Last maintenance date and work number
- Maintenance cost
- Present condition (good / fair / poor)
- Remarks

DEPENDS_ON: [20]
FEEDS_INTO: [4, 22]
TRIGGER: New road constructed under Namuna 20; road handed over from PWD/ZP to GP; road taken up for maintenance
VALIDATION_RULES:
- Roads constructed under schemes must be in this register — missing scheme roads are objections
- Maintenance expenditure (from Namuna 20) must be cross-referenced here
- Roads in poor condition without maintenance action are noted in audit

OBSIDIAN_TAGS: #namuna #property #gram-panchayat #roads
OBSIDIAN_LINKS: [[Namuna-20]] [[Namuna-04]] [[Namuna-22]]

---
NAMUNA: 24
NAME_EN: Land Register
NAME_MR: जमिनीची नोंदवही
CATEGORY: Property
LEGAL_REF: MVP Act, 1958 — Section 53 [VERIFY: vesting section]; Maharashtra Land Revenue Code, 1966 (revenue records basis); Lekha Sanhita, 2011 — Chapter VII [VERIFY: specific rule]
PURPOSE: Records all land parcels owned by or vested in the Gram Panchayat — gram sabha land (gairan / gochar), GP-purchased land, and lands transferred from government for GP use. Basis for Namuna 22 (structures on such land) and Namuna 33 (trees on such land).
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; Tehsildar (for revenue record entries) [VERIFY]
FREQUENCY: Updated on acquisition, transfer, or change in use
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal; available to Tehsildar

FIELDS_IN_REGISTER:
- Survey number / Gat number
- Village / location
- Total area (Hectares and Gunthas)
- Classification (gairan / gochar / GP land / gram sabha land)
- Revenue record reference (7/12 extract reference)
- Date of acquisition
- Mode of acquisition (purchase / government transfer / court order)
- Title document reference
- Encumbrances
- Current use (playground / burial ground / school plot / open land)
- Structures on land (refer Namuna 22)
- Trees on land (refer Namuna 33)
- Remarks (encroachments, disputes, court cases)

DEPENDS_ON: []
FEEDS_INTO: [4, 22]
TRIGGER: New land acquired; land transferred to GP; encroachment identified; survey updated
VALIDATION_RULES:
- All GP land must be recorded in revenue records (7/12) in GP name — land without clear title is audit risk
- Encroachments must be reported and action taken — unresolved encroachments for years are objected to
- Gairan / gochar land converted to other uses must have government sanction
- Land values in Namuna 4 (balance sheet) must be traceable to entries here

OBSIDIAN_TAGS: #namuna #property #gram-panchayat #land
OBSIDIAN_LINKS: [[Namuna-04]] [[Namuna-22]] [[Namuna-33]]

---
NAMUNA: 25
NAME_EN: Investment Register
NAME_MR: गुतवणुक नोंदवही
CATEGORY: Advances
LEGAL_REF: Lekha Sanhita, 2011 — Chapter VI (Investments) [VERIFY: specific rule]; MVP Act, 1958 — Section 61 [VERIFY: fund investment powers]
PURPOSE: Records all investments made by the Gram Panchayat from surplus funds — fixed deposits, savings instruments, government bonds. Tracks interest earned and maturity dates. All investments must be in prescribed instruments only.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Gram Panchayat (resolution for investment); Panchayat Samiti [VERIFY: sanction required?]
FREQUENCY: As needed (event-driven); interest entries monthly or on receipt
SUBMISSION_DEADLINE: N/A (internal; reviewed at audit for interest accrued vs received)
SUBMITTED_TO: Internal; Panchayat Samiti on request

FIELDS_IN_REGISTER:
- Serial number
- Date of investment
- Name of bank / institution
- Type of instrument (FD / savings / NSC / government bond)
- Deposit receipt / bond number
- Principal amount invested
- Rate of interest
- Period (maturity date)
- Interest received (date, amount, receipt number via Namuna 7)
- Maturity amount received (date, cash book reference)
- Premature withdrawal details (if any — resolution number, penalty)
- Balance outstanding
- Remarks

DEPENDS_ON: [5]
FEEDS_INTO: [3, 4, 5]
TRIGGER: GP resolution to invest surplus funds; interest payment received; investment matured
VALIDATION_RULES:
- Investments only in permitted instruments (nationalised banks, post offices, government bonds) — investment in private entities is a major objection [VERIFY: prescribed list]
- GP resolution required before each investment
- Interest received must be immediately recorded as income in Namuna 7 → Namuna 5
- Premature withdrawal requires GP resolution and PS sanction [VERIFY]
- Total investments must appear in Namuna 4 (balance sheet assets)

OBSIDIAN_TAGS: #namuna #advances #gram-panchayat #investments
OBSIDIAN_LINKS: [[Namuna-05]] [[Namuna-03]] [[Namuna-04]] [[Namuna-07]]

---
NAMUNA: 26
NAME_EN: Monthly Returns — Income (26क) and Expenditure (26ख)
NAME_MR: जमा मासिक विवरण (26क) आणि खर्चाचे मासिक विवरण (26ख)
CATEGORY: Reporting
LEGAL_REF: Lekha Sanhita, 2011 — Chapter IX (Monthly Returns) [VERIFY: specific rule]; MVP Act, 1958 — Section 8(1A) [VERIFY: six-monthly expenditure report — monthly may be a Sanhita requirement]
PURPOSE: Two mandatory monthly returns submitted to Panchayat Samiti: 26क summarises income by account head for the month; 26ख summarises expenditure. Together they provide the PS with a real-time financial monitoring tool for each GP.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (signs before submission)
FREQUENCY: Monthly
SUBMISSION_DEADLINE: By 15th of the following month [VERIFY: confirmed by mygrampanchayat.com; check CEO ZP circular for your district]
SUBMITTED_TO: Panchayat Samiti

FIELDS_IN_REGISTER:
- NAMUNA 26क (Monthly Income Return): Month and year; account head number and description; budget provision (from Namuna 1 / revised via Namuna 2); receipts during this month; cumulative receipts April to date; balance yet to be received; GP certification signature and date
- NAMUNA 26ख (Monthly Expenditure Return): Month and year; account head number and description; budget provision; expenditure during this month; cumulative expenditure April to date; balance available; GP certification; date submitted to PS

DEPENDS_ON: [2, 5, 6, 21, 31]
FEEDS_INTO: [3, 27]
TRIGGER: End of each calendar month; month's transactions closed in Namuna 5
VALIDATION_RULES:
- Monthly totals in 26क must agree with receipt side monthly closing in Namuna 5
- Monthly totals in 26ख must agree with payment side monthly closing in Namuna 5
- Late submission (after 15th) is an audit objection; non-submission for 3+ months triggers PS intervention
- 12-month cumulative of 26क must equal Namuna 3 total receipts at year-end
- 12-month cumulative of 26ख must equal Namuna 3 total expenditure at year-end
- Head-wise expenditure must not exceed budget provision — overspending visible in this return

OBSIDIAN_TAGS: #namuna #reporting #gram-panchayat #monthly-returns
OBSIDIAN_LINKS: [[Namuna-02]] [[Namuna-05]] [[Namuna-06]] [[Namuna-21]] [[Namuna-31]] [[Namuna-03]] [[Namuna-27]]

---
NAMUNA: 27
NAME_EN: Audit Objections Monthly Statement
NAME_MR: लेखापरीक्षणातील आक्षेपांचे मासिक विवरण
CATEGORY: Reporting
LEGAL_REF: MVP Act, 1958 — Section 64 [VERIFY: audit section]; Lekha Sanhita, 2011 — Chapter X (Audit) [VERIFY: specific rule]; Maharashtra Local Fund Accounts Act [VERIFY: applicability and audit authority]
PURPOSE: Monthly tracking register of all pending audit objections against the Gram Panchayat. Records each objection raised, action taken, and compliance status. Submitted monthly to Panchayat Samiti to demonstrate audit compliance progress.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; CEO ZP (reviews compliance)
FREQUENCY: Monthly
SUBMISSION_DEADLINE: Monthly with Namuna 26 returns [VERIFY]
SUBMITTED_TO: Panchayat Samiti; CEO ZP

FIELDS_IN_REGISTER:
- Audit report reference number and year
- Paragraph / objection serial number
- Nature of objection
- Amount involved (if recoverable)
- Register / Namuna concerned
- Date objection raised by auditor
- Reply submitted by GP (date and summary)
- Auditor's acceptance/non-acceptance of reply
- Compliance action (recovery, record produced, etc.)
- Date compliance completed
- Outstanding Y/N
- Remarks

DEPENDS_ON: [26]
FEEDS_INTO: [30]
TRIGGER: Audit inspection conducted; objection memo received from auditor
VALIDATION_RULES:
- Every objection in the audit memo must have a corresponding entry here — omitting objections is itself an objection
- Compliance must be completed within prescribed period [VERIFY: time limit from audit rules]
- Objections with recoverable amounts: recovery must be deposited and receipt number noted
- Long-pending objections (3+ years) are escalated to CEO ZP / State Audit [VERIFY: escalation process]

OBSIDIAN_TAGS: #namuna #reporting #gram-panchayat #audit-objections
OBSIDIAN_LINKS: [[Namuna-26]] [[Namuna-30]]

---
NAMUNA: 28
NAME_EN: SC/ST (15%) and Women (10%) Welfare Expenditure Register
NAME_MR: मागासवर्गीय १५% व महिला १०% खर्च विवरण
CATEGORY: Reporting
LEGAL_REF: MVP Act, 1958 — Section 57 read with State reservation GRs [VERIFY: specific GR number mandating 15% SC/ST and 10% women expenditure]; 73rd Constitutional Amendment (Article 243G — devolution of powers); Lekha Sanhita, 2011 — [VERIFY: specific rule for earmarking requirement]
PURPOSE: Tracks compliance with the statutory requirement that Gram Panchayats spend at least 15% of their budget on Scheduled Caste / Scheduled Tribe welfare and 10% on women welfare. Non-compliance is a major audit and political objection.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; PS/CEO ZP review
FREQUENCY: Monthly or quarterly [VERIFY: reporting frequency from relevant GR]
SUBMISSION_DEADLINE: [VERIFY: deadline from GR — typically quarterly to PS and annual to CEO ZP]
SUBMITTED_TO: Panchayat Samiti; CEO ZP

FIELDS_IN_REGISTER:
- Financial year
- Total GP own budget / total receipts (base for calculating %age)
- 15% earmark for SC/ST welfare (calculated amount)
- Actual expenditure on SC/ST welfare (scheme-wise: road in SC wadi, water in SC area, scholarships, etc.)
- % of SC/ST target met
- 10% earmark for women welfare (calculated amount)
- Actual expenditure on women welfare (scheme-wise: anganwadi, SHG support, women sanitation, etc.)
- % of women welfare target met
- Balance yet to be spent (SC/ST and women — separately)
- Remarks

DEPENDS_ON: [1, 5, 26]
FEEDS_INTO: [3, 30]
TRIGGER: Monthly / quarterly — derived from Namuna 26ख (expenditure) tagged to SC/ST or women welfare heads
VALIDATION_RULES:
- Expenditure claimed as SC/ST welfare must geographically or beneficiary-wise serve SC/ST population — non-targeted expenditure included in this % is an objection
- Budget provision for these earmarks must exist in Namuna 1
- Expenditure posted here must reconcile with Namuna 26ख entries
- Year-end: if 15% SC/ST target not met, surplus funds must be transferred to next year for that purpose [VERIFY: carryover rule]
- Audit objection if target not met without documented explanation

OBSIDIAN_TAGS: #namuna #reporting #gram-panchayat #scst-welfare #women-welfare
OBSIDIAN_LINKS: [[Namuna-01]] [[Namuna-05]] [[Namuna-26]] [[Namuna-03]] [[Namuna-30]]

---
NAMUNA: 29
NAME_EN: Loan Register
NAME_MR: कर्जाची नोंदवही
CATEGORY: Advances
LEGAL_REF: MVP Act, 1958 — Section 62 [VERIFY: district village development fund loans or separate loan section]; Lekha Sanhita, 2011 — Chapter VI [VERIFY: loans section]
PURPOSE: Records all loans taken by the Gram Panchayat from government, Panchayat Samiti, banks, or other sources. Tracks disbursement, repayment schedule, interest, and outstanding balance. Long-term borrowings are GP liabilities and must appear in Namuna 4.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Gram Panchayat (resolution); Panchayat Samiti / CEO ZP sanction (for loans above GP limit) [VERIFY]
FREQUENCY: As needed (event-driven: on each loan received or repayment made)
SUBMISSION_DEADLINE: N/A (internal; available at audit)
SUBMITTED_TO: Internal; Panchayat Samiti (disclosure)

FIELDS_IN_REGISTER:
- Loan serial number
- Date of loan sanction
- Lender name (PS / ZP / bank / government scheme)
- Purpose of loan
- Sanctioned amount
- Amount disbursed (date, Namuna 5 reference)
- Rate of interest
- Repayment schedule (instalment amount, frequency, total instalments)
- Instalments paid (each: date, amount, Namuna 5 reference)
- Interest paid (separately tracked if applicable)
- Outstanding principal balance
- Outstanding interest balance
- Remarks (prepayment, restructuring)

DEPENDS_ON: []
FEEDS_INTO: [4, 5]
TRIGGER: Loan sanction letter received; repayment instalment due
VALIDATION_RULES:
- Loan receipt must be recorded in Namuna 5 (cash book) immediately
- Repayments must be made per schedule — defaults create liability objections
- Interest calculations must be verified against lender statements annually
- Total outstanding in N29 must equal loan liability in Namuna 4 (balance sheet)
- Loans taken without GP resolution are unauthorised — major objection

OBSIDIAN_TAGS: #namuna #advances #gram-panchayat #loans
OBSIDIAN_LINKS: [[Namuna-04]] [[Namuna-05]]

---
NAMUNA: 30
NAME_EN: Audit Compliance Register
NAME_MR: लेखापरीक्षण आक्षेप पूर्तता नोंदवही
CATEGORY: Audit
LEGAL_REF: MVP Act, 1958 — Section 64 (audit) [VERIFY: exact sub-section for compliance]; Maharashtra Local Fund Accounts Act [VERIFY: compliance timeframes]; Lekha Sanhita, 2011 — Chapter X [VERIFY]
PURPOSE: The master register tracking all audit objections across years, their current status, recovery details, and final closure. While Namuna 27 is the monthly monitoring report, Namuna 30 is the cumulative compliance register used by the CEO ZP and external auditors to assess GP's audit health.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; CEO ZP (marks objections as closed or escalates)
FREQUENCY: Updated after each audit visit and on each compliance action
SUBMISSION_DEADLINE: Available at all audit inspections; annual review with CEO ZP
SUBMITTED_TO: CEO ZP; Panchayat Samiti

FIELDS_IN_REGISTER:
- Audit report year and reference number
- Name of auditor / audit party
- Objection number
- Para heading
- Amount involved
- Nature (recoverable / procedural / documentary)
- Date raised
- GP reply date and summary
- Auditor acceptance (date, reply reference)
- Recovery amount deposited (date, receipt number from Namuna 7)
- Documents produced
- Closure order reference
- Status (open / closed / appealed)
- Remarks (escalated to director of audit / court)

DEPENDS_ON: [3, 4, 27, 28]
FEEDS_INTO: []
TRIGGER: Audit inspection report received; compliance action completed; director-level review
VALIDATION_RULES:
- Every para in every audit report must have an entry here — gaps indicate suppression of objections
- Closed objections must have documentary evidence of compliance (recovery receipt, corrected entry reference)
- Recoverable amounts must be deposited — recording "closed" without actual deposit is false compliance
- Objections pending beyond 3 years require CEO ZP personal review [VERIFY: escalation norms]
- Audit objection register is the first document examined in any superior audit or CAG inspection

OBSIDIAN_TAGS: #namuna #audit #gram-panchayat #compliance
OBSIDIAN_LINKS: [[Namuna-03]] [[Namuna-04]] [[Namuna-27]] [[Namuna-28]]

---
NAMUNA: 31
NAME_EN: Travel Allowance Bill Register
NAME_MR: प्रवास भत्ता देयक नोंदवही
CATEGORY: Expenditure
LEGAL_REF: Maharashtra Village Panchayats (Travelling Allowance) Rules [VERIFY: exact rule citation and year]; Lekha Sanhita, 2011 — Chapter VIII [VERIFY]; MVP Act, 1958 — Section 32A and 33A (member/Sarpanch allowances)
PURPOSE: Records travel allowance (TA) claims by GP employees and elected members for official travel — inspections, training programmes, official meetings at Block/District level. Each claim is a separate entry with supporting documents.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch (for staff TA); Panchayat Samiti (for Gram Sevak TA) [VERIFY: approval authority]
FREQUENCY: As needed (each TA claim)
SUBMISSION_DEADLINE: TA claims must be submitted within [VERIFY: prescribed days after travel — typically 30 days]
SUBMITTED_TO: Internal (filed with cash book); PS (for Gram Sevak claims)

FIELDS_IN_REGISTER:
- Claim number (serial)
- Employee name and designation (from Namuna 13)
- Date(s) of travel
- Place visited (origin → destination → return)
- Purpose of journey (official reference)
- Mode of travel
- Distance (km)
- Fare claimed (bus/train tickets attached)
- Daily allowance (DA) claimed per day
- Total claim amount
- Sanctioning authority signature
- Payment date and Namuna 5 reference
- Employee acknowledgment signature

DEPENDS_ON: [13]
FEEDS_INTO: [5, 26]
TRIGGER: Employee or member undertakes official travel for GP business
VALIDATION_RULES:
- TA claims only for officially sanctioned travel — personal travel is not reimbursable
- Actual tickets / receipts must be attached — claimed amount must not exceed actual fare [VERIFY: prescribed class of travel per grade]
- TA claims submitted after prescribed period require sanction for delayed submission
- Sarpanch sumptuary allowance (Section 33A) is separate from TA and must not be mixed
- Total TA expenditure must be within Namuna 1 provision under TA/contingency head

OBSIDIAN_TAGS: #namuna #expenditure #gram-panchayat #travel-allowance
OBSIDIAN_LINKS: [[Namuna-13]] [[Namuna-05]] [[Namuna-26]]

---
NAMUNA: 32
NAME_EN: Refund Order Register
NAME_MR: रकमेच्या परताव्यासाठीचा आदेश नोंदवही
CATEGORY: Expenditure
LEGAL_REF: Lekha Sanhita, 2011 — Chapter VI [VERIFY: specific rule for refund orders]; MVP Act, 1958 — Section 63 [VERIFY]
PURPOSE: Records all refund orders issued by the Gram Panchayat — for overpaid amounts, returned advances, excess security deposits, or amounts collected in error. Each refund requires a formal order before payment from the cash book.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; GP resolution (for larger refunds) [VERIFY: threshold]
FREQUENCY: As needed (event-driven)
SUBMISSION_DEADLINE: N/A
SUBMITTED_TO: Internal

FIELDS_IN_REGISTER:
- Order number (serial)
- Date of order
- Name of payee (person entitled to refund)
- Reason for refund (excess tax paid / advance returned / deposit refundable / payment error)
- Original amount received by GP (Namuna 7 receipt reference)
- Amount to be refunded
- GP resolution number (if applicable)
- Date of payment
- Mode of payment (cash / cheque)
- Namuna 5 (cash book) folio reference
- Payee signature on receipt of refund

DEPENDS_ON: [17]
FEEDS_INTO: [4, 5]
TRIGGER: Advance returned by recipient (from Namuna 17); excess collection identified; security deposit release
VALIDATION_RULES:
- Refund must have a supporting original receipt (Namuna 7) showing the amount was originally received by GP
- Payment only after GP order — no adhoc refunds from cash
- Refund of excess tax collection requires verification against Namuna 9 / N10 demand and collection records
- Refund reduces the corresponding liability in Namuna 4 (balance sheet)

OBSIDIAN_TAGS: #namuna #expenditure #gram-panchayat #refund
OBSIDIAN_LINKS: [[Namuna-17]] [[Namuna-04]] [[Namuna-05]]

---
NAMUNA: 33
NAME_EN: Tree Register
NAME_MR: वृक्ष नोंदवही
CATEGORY: Property
LEGAL_REF: Maharashtra Gram Panchayat Act, 1958 — Section 57 (GP jurisdiction over gram sabha land); Maharashtra Village Trees (Protection and Preservation) Rules [VERIFY: specific rule]; Lekha Sanhita, 2011 — Chapter VII [VERIFY: tree register provision]
PURPOSE: Records all trees on Gram Panchayat and Gram Sabha land — species, count, annual yield, and income from auctioning/harvesting. Trees are GP assets; tree income is a source of GP revenue.
WHO_MAINTAINS: Gram Sevak
WHO_APPROVES: Sarpanch; Forest Department (for protected species) [VERIFY]
FREQUENCY: Annual census; updated on planting, harvest, or loss
SUBMISSION_DEADLINE: Annual update and report [VERIFY: deadline]
SUBMITTED_TO: Panchayat Samiti; Forest Department (if applicable)

FIELDS_IN_REGISTER:
- Survey number / plot (from Namuna 24 — GP land)
- Location description
- Species name (common and botanical)
- Number of trees (species-wise, girth-class-wise)
- Year of planting (if plantation)
- Estimated annual yield (fruit / timber / wood)
- Income from harvest or auction (date, amount, receipt reference via Namuna 7)
- Trees lost (date, cause: storm / disease / theft / natural; replaced Y/N)
- Trees planted as replacement
- Remarks (Protected species, court orders)

DEPENDS_ON: [24]
FEEDS_INTO: [4, 7]
TRIGGER: Annual census of trees on GP land; harvest/auction; storm loss; new plantation
VALIDATION_RULES:
- Tree count in register must agree with physical count during annual survey
- Unauthorised tree felling without GP resolution and forest dept. NOC is a major objection and criminal offence
- Tree auction income must be immediately receipted via Namuna 7 and posted to Namuna 5
- Tree auction must be by public tender — private sale is not permitted
- Trees in Namuna 33 must correspond to land parcels in Namuna 24

OBSIDIAN_TAGS: #namuna #property #gram-panchayat #trees
OBSIDIAN_LINKS: [[Namuna-24]] [[Namuna-04]] [[Namuna-07]]

---

## ADDITIONAL OUTPUTS

---

### 1. MASTER DEPENDENCY MATRIX

Format: Source → Target → Dependency Type
(Types: FEEDS = data flows into; RECONCILES = must match/agree; VERIFIES = confirms correctness; TRIGGERS = creates entries in; APPROVES = subject to approval before data used)

| Source | Target | Type | Description |
|--------|--------|------|-------------|
| N1 | N2 | TRIGGERS | Re-appropriation can only occur if budget exists in N1 |
| N1 | N12 | FEEDS | N12 expenditure must have provision in N1 |
| N1 | N20 | FEEDS | Works can only be sanctioned if N1 has provision |
| N1 | N28 | FEEDS | Base amount for 15%/10% calculation comes from N1 |
| N2 | N3 | FEEDS | Revised amounts from N2 are reflected in N3 |
| N2 | N26 | FEEDS | Monthly returns (N26) use revised budget from N2 |
| N3 | N30 | VERIFIES | Annual statement is primary document for annual audit (N30) |
| N4 | N30 | VERIFIES | Balance sheet verified against N30 audit |
| N5 | N3 | FEEDS | Annual totals from N5 become N3 |
| N5 | N6 | FEEDS | Monthly receipt/payment totals posted to classified ledger |
| N5 | N26 | FEEDS | Monthly totals from N5 form basis of N26 |
| N6 | N3 | FEEDS | Classified receipts aggregate to annual statement |
| N6 | N26 | FEEDS | Classified receipts posted to monthly return |
| N7 | N5 | FEEDS | Receipt vouchers trigger cash book debit/credit |
| N7 | N6 | FEEDS | Receipt head classification feeds classified ledger |
| N8 | N9 | TRIGGERS | Assessment in N8 triggers demand raising in N9 |
| N9 | N10 | TRIGGERS | Demand in N9 triggers collection via N10 |
| N9 | N10 | RECONCILES | N10 collections must reconcile with N9 demand |
| N10 | N5 | FEEDS | Tax collections post to cash book |
| N10 | N7 | FEEDS | Tax receipts (N10) are a subset of general receipts (N7) |
| N11 | N5 | FEEDS | Misc collections post to cash book |
| N11 | N7 | FEEDS | Misc receipts flow through general receipt N7 |
| N12 | N5 | FEEDS | Contingency vouchers trigger cash book payments |
| N12 | N6 | FEEDS | Expenditure heads from N12 posted to classified ledger |
| N12 | N15 | TRIGGERS | Consumable purchase via N12 triggers N15 entry |
| N13 | N21 | FEEDS | Staff details (salary, deductions) feed payroll |
| N13 | N31 | FEEDS | Staff grade/designation determines TA entitlement |
| N16 | N3 | FEEDS | Asset additions/disposals reflected in annual statement |
| N16 | N4 | FEEDS | Movable asset value appears in N4 balance sheet |
| N17 | N4 | FEEDS | Outstanding advances show as assets in N4 |
| N17 | N32 | TRIGGERS | Recovery of advance triggers N32 refund order |
| N18 | N5 | FEEDS | Petty cash replenishment flows through N5 |
| N18 | N6 | FEEDS | Petty cash expenditure heads post to classified ledger |
| N19 | N20 | FEEDS | Attendance data feeds into works billing (N20क, N20ख) |
| N20 | N5 | FEEDS | Works payment vouchers post to cash book |
| N20 | N16 | FEEDS | Assets created through works entered in N16 |
| N20 | N19 | TRIGGERS | Work sanction in N20 triggers attendance recording |
| N21 | N5 | FEEDS | Payroll payments posted to cash book |
| N21 | N26 | FEEDS | Monthly salary expenditure in N26ख |
| N22 | N3 | FEEDS | Immovable property included in annual statement |
| N22 | N4 | FEEDS | Immovable property value in N4 |
| N23 | N4 | FEEDS | Road assets in balance sheet |
| N23 | N22 | FEEDS | Roads are classified under immovable assets |
| N24 | N4 | FEEDS | Land value in balance sheet |
| N24 | N22 | FEEDS | Land supports immovable property data |
| N24 | N33 | TRIGGERS | Land parcels in N24 trigger tree entries in N33 |
| N25 | N3 | FEEDS | Investment income in annual statement |
| N25 | N4 | FEEDS | Investments shown as assets in N4 |
| N25 | N5 | FEEDS | Interest receipts post to cash book |
| N26 | N3 | FEEDS | 12-month aggregate of N26 becomes N3 |
| N26 | N27 | TRIGGERS | Monthly return submission triggers audit monitoring |
| N27 | N30 | FEEDS | Monthly objection status consolidated in N30 |
| N28 | N3 | FEEDS | Welfare expenditure in annual statement |
| N28 | N30 | FEEDS | Welfare compliance reviewed in audit (N30) |
| N29 | N4 | FEEDS | Loan liability in balance sheet |
| N29 | N5 | FEEDS | Loan receipt/repayment through cash book |
| N31 | N5 | FEEDS | TA payments through cash book |
| N31 | N26 | FEEDS | TA expenditure in monthly return |
| N32 | N4 | FEEDS | Refunds reduce liability in N4 |
| N32 | N5 | FEEDS | Refund payments through cash book |
| N33 | N4 | FEEDS | Tree asset value in balance sheet |
| N33 | N7 | FEEDS | Tree income via general receipt N7 |
| N5 | N3 | RECONCILES | N5 annual total must match N3 |
| N5 | N6 | RECONCILES | N5 monthly totals must match N6 monthly postings |
| N9 | N8 | RECONCILES | Total demand in N9 must match N8 assessment totals |
| N10 | N9 | RECONCILES | Collections in N10 must update and reconcile with N9 outstanding |
| N26 | N5 | RECONCILES | N26 monthly totals must agree with N5 closing figures |
| N3 | N26 | RECONCILES | N3 annual totals must equal 12-month sum of N26 |

---

### 2. CATEGORY GROUPS

**Budget & Planning**
- Namuna 1 — Annual Budget Estimate
- Namuna 2 — Re-appropriation and Reallocation

**Daily Cash Chain**
- Namuna 5 — General Cash Book (+ sub-form 5क Daily Cash Book)
- Namuna 18 — Petty Cash Book

**Receipt & Income**
- Namuna 6 — Classified Receipt Register
- Namuna 7 — General Receipt Voucher
- Namuna 11 — Miscellaneous Demand Register

**Tax Chain (Assess → Demand → Collect)**
- Namuna 8 — Tax Assessment Register
- Namuna 9 — Tax Demand Register (+ sub-form 9क Demand Notice)
- Namuna 10 — Tax and Fee Receipt

**Expenditure & Payments**
- Namuna 12 — Contingency Expenditure Voucher
- Namuna 21 — Employee Payroll Register
- Namuna 31 — Travel Allowance Bill Register
- Namuna 32 — Refund Order Register

**Works & Capital**
- Namuna 19 — Labour Attendance Register
- Namuna 20 — Works Register (+ sub-forms 20क Measurement Book, 20ख Work Bill, 20ख(1) Payment)

**Staff & Stores**
- Namuna 13 — Staff List and Pay Scale Register
- Namuna 14 — Stamp Account Register
- Namuna 15 — Consumables and Stationery Register

**Property & Assets**
- Namuna 16 — Fixed and Movable Assets Register
- Namuna 22 — Immovable Property Register
- Namuna 23 — Roads Register
- Namuna 24 — Land Register
- Namuna 33 — Tree Register

**Advances, Investments & Loans**
- Namuna 17 — Advances and Deposits Register
- Namuna 25 — Investment Register
- Namuna 29 — Loan Register

**Reporting & Annual Accounts**
- Namuna 3 — Annual Income and Expenditure Statement
- Namuna 4 — Assets and Liabilities Register (Balance Sheet)
- Namuna 26 — Monthly Returns Income (26क) and Expenditure (26ख)
- Namuna 27 — Audit Objections Monthly Statement
- Namuna 28 — SC/ST 15% and Women 10% Welfare Expenditure Register

**Audit**
- Namuna 30 — Audit Compliance Register

---

### 3. CRITICAL DAILY WORKFLOW PATH

The following Namune must be updated on every working day, in this sequence:

| Step | Namuna | Action | Dependency |
|------|--------|--------|------------|
| 1 | N7 | Issue receipt for any income received | First action on any money coming in |
| 2 | N10 | Issue tax receipt if tax payment received | Before closing N7 for tax transactions |
| 3 | N11 | Record miscellaneous demand/collection if applicable | As transactions occur |
| 4 | N12 | Issue contingency voucher for any day's expenditure | Before any payment made |
| 5 | N18 | Update petty cash book for small expenses | Same day as incurred |
| 6 | N19 | Mark daily attendance for active work sites | Before workers leave site |
| 7 | N5क | Post all day's transactions to Daily Cash Book | End of day — all receipts + payments |
| 8 | N5 | Post to General Cash Book (weekly from N5क) | Every Monday or on special events |
| 9 | N14 | Update stamp register when stamps used on documents | Same day as usage |

**Weekly actions (triggered from daily):**
- Reconcile N5क entries into N5 general cash book
- Sarpanch authenticates N5 weekly

**Monthly actions (by 15th of following month):**
- Compile N6 (Classified Receipts) from N5
- Prepare N21 (Payroll) for the month
- Submit N26क and N26ख to Panchayat Samiti
- Update N27 (Audit Objections Monthly Statement)
- Update N28 (Welfare Expenditure tracking)

**Annual cycle sequence:**
1. March 31: Close books — N5 final balance, N6 annual total
2. April–May: Prepare N3 (Annual Statement) from N5, N6
3. April–May: Prepare N4 (Balance Sheet) from all asset/liability registers
4. May: Present N3 and N4 to Gram Sabha
5. September–November: Update N8 (Tax Assessment) for next year
6. October–January: Raise N9 (Tax Demand) for next year; issue N9क notices
7. October–January: Prepare N1 (Budget) for next financial year
8. January–February: Present N1 to Gram Sabha; submit to PS
9. Ongoing: Physical verification of N16, N22, N23, N24, N33

---

### 4. AUDIT RISK POINTS (per Namuna)

| Namuna | Audit Risk Level | Common Objection |
|--------|-----------------|-----------------|
| N1 | HIGH | Expenditure without budget provision; budget not placed before Gram Sabha before PS submission |
| N2 | HIGH | Re-appropriation without GP resolution; re-appropriation without PS sanction where required |
| N3 | HIGH | Totals not reconciling with N5 / N26; not presented to Gram Sabha; delays in preparation |
| N4 | MEDIUM | Asset values not updated; assets in N4 not reconciling with individual registers |
| N5 | VERY HIGH | Cash book not balanced daily; erasures and overwriting; Sarpanch authentication missing; cash-in-hand exceeds prescribed limit; payments without vouchers |
| N6 | MEDIUM | Unclassified receipts; N6 total not matching N5; delayed posting |
| N7 | HIGH | Missing receipt numbers (gap in series); receipts not issued for all collections; counterfoils defaced |
| N8 | HIGH | Properties not assessed; assessment not revised for years; arbitrarily low valuations |
| N9 | HIGH | Demand not raised for all assessed properties; arrears not brought forward; demand notices (N9क) not issued |
| N10 | HIGH | Collections not reconciling with N9 demand; missing receipt books; receipts not deposited to bank same day |
| N11 | MEDIUM | Long-outstanding miscellaneous demands without recovery action; rent not revised |
| N12 | VERY HIGH | Payments without bills; no Sarpanch approval; cash payments above limit; no revenue stamp; voucher series gaps; payment to fictitious payees |
| N13 | HIGH | Salary paid to employees not in N13; posts not sanctioned by PS; increments granted without sanction |
| N14 | MEDIUM | Physical stamp count not matching register; stamps used on personal documents |
| N15 | LOW-MEDIUM | Stock count not matching register; consumables issued without authorisation |
| N16 | HIGH | Assets not physically verified for years; disposed assets not removed from register; scheme assets not entered |
| N17 | HIGH | Unadjusted advances for years; advances re-given before first adjusted; security deposits not refunded after work completion |
| N18 | MEDIUM | Petty cash limit exceeded; expenses split to avoid limit; no replenishment voucher |
| N19 | VERY HIGH | Inflated muster rolls (ghost workers); attendance not taken on actual date; worker signatures collected in bulk not daily; labour count exceeds actual head count on site |
| N20 | VERY HIGH | Payment without measurement book entry; MB pages torn/overwritten; payment without engineer certificate; works above limit not tendered; TDS not deducted; works started before technical sanction |
| N21 | VERY HIGH | Ghost employees on payroll; salary paid in cash above limit; deductions not remitted; no employee signatures |
| N22 | HIGH | Properties not in register; annual verification not done; encroachments on GP properties not acted upon |
| N23 | MEDIUM | Roads not maintained; roads in poor condition with no action; road assets not reconciling with N20 |
| N24 | HIGH | GP land without title documents; encroachments not removed; gairan/gochar land encroached and alienated |
| N25 | MEDIUM | Investments in non-permitted institutions; interest not received and reconciled; premature withdrawal without sanction |
| N26 | HIGH | Not submitted by 15th; discrepancy between N26 and N5; head-wise overspending visible but no corrective action |
| N27 | HIGH | Objections not pursued; compliance overstated; recoverable amounts not deposited |
| N28 | VERY HIGH | 15% SC/ST / 10% women targets not met; expenditure incorrectly classified as welfare without evidence of beneficiary targeting |
| N29 | MEDIUM | Loan repayments in default; interest calculations wrong; loan not sanctioned by proper authority |
| N30 | VERY HIGH | Long-pending objections (5+ years); objections closed without actual compliance evidence; objection register not updated after audit visits |
| N31 | LOW | TA claims without actual travel proof; claims submitted after prescribed period without sanction |
| N32 | LOW | Refunds paid without formal order; refunds of excess tax not traced to original demand/receipt |
| N33 | MEDIUM | Trees felled without GP resolution; auction income not receipted; tree count not matching physical survey |

---

### 5. OBSIDIAN VAULT STRUCTURE

```
docs/superpowers/namune-vault/
│
├── MOC-Master.md                          ← Master Map of Content — all 33 links + dependency graph embed
│
└── Namune/
    │
    ├── Budget/
    │   ├── MOC-Budget.md                  ← Group MOC: Budget & Planning
    │   ├── Namuna-01.md                   ← अर्थसंकल्प
    │   └── Namuna-02.md                   ← पुनर्विनियोजन
    │
    ├── Cash/
    │   ├── MOC-Cash.md                    ← Group MOC: Daily Cash Chain
    │   ├── Namuna-05.md                   ← सामान्य रोकड वही (includes 5क)
    │   └── Namuna-18.md                   ← किरकोळ रोकड वही
    │
    ├── Tax/
    │   ├── MOC-Tax.md                     ← Group MOC: Tax Chain
    │   ├── Namuna-08.md                   ← कर आकारणी
    │   ├── Namuna-09.md                   ← कर मागणी (includes 9क)
    │   └── Namuna-10.md                   ← कर व फी पावती
    │
    ├── Receipt/
    │   ├── MOC-Receipt.md                 ← Group MOC: Receipts & Income
    │   ├── Namuna-06.md                   ← वर्गीकृत जमा नोंदवही
    │   ├── Namuna-07.md                   ← सामान्य पावती
    │   └── Namuna-11.md                   ← किरकोळ मागणी
    │
    ├── Expenditure/
    │   ├── MOC-Expenditure.md             ← Group MOC: Expenditure & Payments
    │   ├── Namuna-12.md                   ← आकस्मित खर्च प्रमाणक
    │   ├── Namuna-21.md                   ← वेतन देयक
    │   ├── Namuna-31.md                   ← प्रवास भत्ता
    │   └── Namuna-32.md                   ← परतावा आदेश
    │
    ├── Works/
    │   ├── MOC-Works.md                   ← Group MOC: Works & Capital
    │   ├── Namuna-19.md                   ← हजेरीपट
    │   └── Namuna-20.md                   ← कामे नोंदवही (includes 20क, 20ख, 20ख1)
    │
    ├── Staff/
    │   ├── MOC-Staff.md                   ← Group MOC: Staff & Stores
    │   ├── Namuna-13.md                   ← कर्मचारी सुची
    │   ├── Namuna-14.md                   ← मुद्रांक नोंदवही
    │   └── Namuna-15.md                   ← उपभोग्य साठा
    │
    ├── Property/
    │   ├── MOC-Property.md                ← Group MOC: Property & Assets
    │   ├── Namuna-16.md                   ← जंगम मालमत्ता
    │   ├── Namuna-22.md                   ← स्थावर मालमत्ता
    │   ├── Namuna-23.md                   ← रस्ते नोंदवही
    │   ├── Namuna-24.md                   ← जमीन नोंदवही
    │   └── Namuna-33.md                   ← वृक्ष नोंदवही
    │
    ├── Advances/
    │   ├── MOC-Advances.md                ← Group MOC: Advances, Investments, Loans
    │   ├── Namuna-17.md                   ← अग्रीम / अनामत
    │   ├── Namuna-25.md                   ← गुतवणुक नोंदवही
    │   └── Namuna-29.md                   ← कर्ज नोंदवही
    │
    ├── Reporting/
    │   ├── MOC-Reporting.md               ← Group MOC: Reporting & Annual Accounts
    │   ├── Namuna-03.md                   ← जमा-खर्च विवरण
    │   ├── Namuna-04.md                   ← मत्ता व दायित्वे
    │   ├── Namuna-26.md                   ← मासिक विवरण (26क + 26ख)
    │   ├── Namuna-27.md                   ← लेखापरीक्षण आक्षेप मासिक
    │   └── Namuna-28.md                   ← SC/ST + महिला खर्च विवरण
    │
    └── Audit/
        ├── MOC-Audit.md                   ← Group MOC: Audit & Compliance
        └── Namuna-30.md                   ← लेखापरीक्षण पूर्तता नोंदवही
```

**MOC page structure (each MOC-*.md should contain):**
- Group description (1 paragraph)
- Table of Namune in this group (number | Marathi name | English name | frequency)
- Internal dependency links within this group
- Links to MOC pages of connected groups
- Embedded Dataview query: `TABLE namuna, name_en, frequency FROM "Namune/Budget" SORT namuna ASC`

**MOC-Master.md should contain:**
- Overview of all 33 Namune
- Critical path summary
- Links to all 11 Group MOC pages
- Dependency graph note (link to graphify output if available)
- Cross-AI reconciliation status table (Claude draft | Cursor draft | Gemini draft | Reconciled)
- Verification status table (which VERIFY items have been resolved)

---
*End of document — Claude independent draft — 2026-04-18*
*Sources: mygrampanchayat.com (Namune list verification), MVP Act 1958 (indiankanoon.org — sections 8, 32A, 33A, 124, 129, 140 confirmed), Lekha Sanhita 2011 (structural knowledge from training data — specific rule numbers [VERIFY] against printed code)*
