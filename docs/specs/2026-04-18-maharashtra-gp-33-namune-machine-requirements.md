# Maharashtra Gram Panchayat — 33 Namune (Registers) Machine Requirements

**Status:** Research draft for cross-AI reconciliation (Claude / Gemini / Cursor).  
**Jurisdiction:** Maharashtra, India — Gram Panchayat (village) level only.  
**Primary legal anchors:** Maharashtra Village Panchayats Act, 1958 (often published as *Bombay Act III of 1959* / cited as “1959” on Indian Kanoon) [VERIFY: exact citation title on your printed bare Act]; Maharashtra Gram Panchayat Lekha Sanhita (Accounting Code), 2011.  
**Numbering policy in this file:** `NAMUNA` uses integers **1–33** as one continuous series. **Namuna 5** is documented as one logical register that is **physically maintained as two books** (Namuna 5 — General Cash Book, and Namuna 5क — Daily Cash Book). **Namuna 20** aggregates the **works estimate + measurement + bill** chain (forms commonly labelled 20, 20क, 20ख, 20ख(1) in training material). **Namuna 26** aggregates **monthly income return + monthly expenditure return** (26क + 26ख). [VERIFY: confirm annex serial ↔ physical book mapping against the printed Lekha Sanhita annex from the Rural Development & Panchayat Raj Department.]

**Sources used for this draft (non-exhaustive):** explanatory articles on msdhulap.com and mygrampanchayat.com; Indian Kanoon summaries for MVP Act Sections 62, 124, 129. **Not used:** full 586-page Lekha Sanhita PDF (not retrieved in-session).  

**Disclaimer:** Where the printed Sanhita / GR prescribes a column, row, or rule not confirmed here, the line reads `[VERIFY: …]`. This file **must not** be treated as substitute for the official printed code or current GRs.

### Are these the “proper / latest” Namune and rules?

**Namuna set (1–33) and Marathi titles:** These names and the overall register set match what Maharashtra GP training material repeats everywhere (including the “५ + ५ क”, “२० / २० क / २० ख”, “२६ क / २६ ख” pattern). That is **proper** in the sense of “standard GP office kit”, not guessed from scratch.

**“Latest” in the legal sense:** This file is **not** automatically aligned to every post-2011 **Government Resolution (GR)** or re-printed rule amendment until someone checks the **current** PDFs / circulars. In particular, **rupee limits** (e.g. cheque vs cash, revenue stamp limits), **exact rule numbers** in the Lekha Sanhita, and **submission dates** sometimes differ between (a) bare Act text, (b) Sanhita commentary, and (c) **district ZP / CEO** circulars. Those items stay **`[VERIFY]`** on purpose.

### Authority ladder (use this for a “gold” revision pass)

Use sources **in this order** when you want maximum freshness and audit-defensible quality:

1. **Printed or official PDF — Maharashtra Gram Panchayat Lekha Sanhita, 2011** (and any **GR** that explicitly “supersedes / substitutes” pages or rules) — *primary for columns, annex layouts, rule numbers.*  
2. **Maharashtra Village Panchayats Act + Rules** — search portals reference a **consolidated PDF dated 27 March 2022** (e.g. State Election Commission / mahasec upload path ending `REVISED ... 27032022 ... ACT AND RULES.pdf`). Treat that as the baseline for **section numbering after amendments** [VERIFY: open the PDF you trust; numbering can shift between reprints].  
3. **CEO Zilla Parishad / Panchayat Samiti circulars** for your district (budget calendar, e-submission of Namuna 26, online audit compliance formats, etc.).  
4. **Training / blog articles** — good for workflow memory and diagrams; **weak** as sole proof of a numeric rule.

### What your Claude “research pass” should extract into this file

- Annex **field/column lists** per Namuna (replace `[VERIFY: …]` blocks).  
- **Exact** Lekha Sanhita **rule numbers** for cash, vouchers, stamps, petty cash, PS returns.  
- Any **GR** after 2011 that changes thresholds, timelines, or **reservation reporting** (Namuna 28 family).  
- Whether **Namuna 9क** (कर मागणी पावती / demand bill) is a **separate annex serial** or folded under Namuna 9 in your district’s printed set.

Until that pass lands, treat this document as a **structured skeleton + dependency graph hypothesis**, not a certified compliance manual.

---

## NAMUNA BLOCKS (1–33)

---
NAMUNA: 1  
NAME_EN: Annual Budget / Estimate (Appropriation)  
NAME_MR: अंदाजपत्रक / अर्थसंकल्प  
CATEGORY: Budget  
LEGAL_REF: Maharashtra Village Panchayats Act, 1958 — **Section 62** (annual budget statement: contents, timelines, failure duties of Sarpanch / Panchayat / Secretary) [VERIFY: sub-clause letters against latest amendment]. Lekha Sanhita, 2011 — **Rule 21** cited in training notes for reallocation context [VERIFY: exact rule text for budget heads].  
PURPOSE: Estimates income and expenditure for the financial year by account head; no expenditure without provision except as Act permits.  
WHO_MAINTAINS: Sarpanch (prepares) + Gram Sevak (Secretary) (support / compulsory submission if Sarpanch defaults — Sec. 62 narrative in training material)  
WHO_APPROVES: Gram Panchayat (recommendations) → **Gram Sabha** (ratification) → **Panchayat Samiti** (approval) [VERIFY: exact sequence wording in bare Act]  
FREQUENCY: Annual (revised as needed)  
SUBMISSION_DEADLINE: Training material states: Sarpanch to Gram Panchayat by **31 January**; Gram Sabha ratification by **28 February**; statement to **Panchayat Samiti** thereafter [VERIFY: Indian Kanoon summary also mentions **5 January** determination for directly elected Sarpanch — reconcile with your district circular]. mygrampanchayat.com mentions **December** submission to PS — **contradiction** → **[VERIFY: which deadline your ZP circular follows]**.  
SUBMITTED_TO: Panchayat Samiti  

FIELDS_IN_REGISTER:  
- [VERIFY: full column schedule from Lekha Sanhita Annex for Namuna 1 — typically: account head; opening balance; estimated receipts; estimated expenditure; remarks; signatures]  

DEPENDS_ON: []  
FEEDS_INTO: 2, 3, 6, 28, 29  
TRIGGER: Start of financial year / new works & establishment planning cycle  
VALIDATION_RULES:  
- No expenditure against heads without budget provision except permitted supplemental process via Namuna 2 pathway [VERIFY].  
- Totals should reconcile forward to Namuna 3 (year-end) and Namuna 6 (monthly classified postings by head).  
OBSIDIAN_TAGS: #namuna #budget #gram-panchayat  
OBSIDIAN_LINKS: [[Namuna-2]] [[Namuna-3]] [[Namuna-6]] [[Namuna-28]] [[Namuna-29]]  
---

---
NAMUNA: 2  
NAME_EN: Re-appropriation / Revised Allocation (Supplementary & head-to-head transfers)  
NAME_MR: पुनर्विनियोजित नियतवाटप / पुनर्विनियोजन व नियत वाटप  
CATEGORY: Budget  
LEGAL_REF: Lekha Sanhita, 2011 — **Rule 21** (as referenced in GP training articles for moving provision between heads) [VERIFY: rule text & whether “Rule 21” is budgeting or stores in your edition].  
PURPOSE: Moves budget provision between account heads to match actual requirement without altering overall approved scheme (training narrative).  
WHO_MAINTAINS: Gram Sevak (draft) + Sarpanch (approval chain)  
WHO_APPROVES: Gram Panchayat → Panchayat Samiti  
FREQUENCY: As needed (when head-wise shortage/surplus)  
SUBMISSION_DEADLINE: N/A (event-driven) [VERIFY: PS reporting if any]  
SUBMITTED_TO: Panchayat Samiti  

FIELDS_IN_REGISTER:  
- [VERIFY: columns per annex — from/to head; amounts; resolution nos.; dates; signatures]  

DEPENDS_ON: 1  
FEEDS_INTO: 3, 6  
TRIGGER: Overspend on one head with savings on another; supplementary estimate process [VERIFY]  
VALIDATION_RULES:  
- Cannot create “opening/closing balance” rows unlike Namuna 1 (per msdhulap narrative) [VERIFY].  
- Must remain consistent with PS-approved totals.  
OBSIDIAN_TAGS: #namuna #budget #reallocation  
OBSIDIAN_LINKS: [[Namuna-1]] [[Namuna-3]] [[Namuna-6]]  
---

---
NAMUNA: 3  
NAME_EN: Gram Panchayat Income & Expenditure Statement  
NAME_MR: ग्रामपंचायत जमा–खर्च विवरण  
CATEGORY: Reporting  
LEGAL_REF: Lekha Sanhita, 2011 — annual compilation obligations [VERIFY: exact rule no.]; Gram Sabha placement obligations cross-read with MVP Act provisions on accounts laid before Gram Sabha (see Act Chapter on accounts — **[VERIFY: section no.]**).  
PURPOSE: Consolidates year’s receipts and payments for governance & upward reporting.  
WHO_MAINTAINS: Gram Sevak (compile) + Sarpanch (certify)  
WHO_APPROVES: Gram Sabha (presentation)  
FREQUENCY: Annual (with monthly building blocks via Namuna 6 / 26)  
SUBMISSION_DEADLINE: **1 June** to Panchayat Samiti (per msdhulap); first Gram Sabha of year for laying accounts [VERIFY].  
SUBMITTED_TO: Panchayat Samiti; Gram Sabha (presentation)  

FIELDS_IN_REGISTER:  
- [VERIFY: annex columns — receipts by head; payments by head; opening/closing; bank & cash summary if required]  

DEPENDS_ON: 1, 2, 5, 6  
FEEDS_INTO: []  
TRIGGER: Year closing / audit preparation cycle  
VALIDATION_RULES:  
- Must tie to Namuna 6 monthly classified totals and Namuna 5 cash book movements [VERIFY: bank passbook reconciliation fields].  
OBSIDIAN_TAGS: #namuna #reporting #accounts  
OBSIDIAN_LINKS: [[Namuna-1]] [[Namuna-2]] [[Namuna-5]] [[Namuna-6]]  
---

---
NAMUNA: 4  
NAME_EN: Assets & Liabilities Statement  
NAME_MR: ग्रामपंचायतीची मत्ता व दायित्वे  
CATEGORY: Reporting  
LEGAL_REF: Lekha Sanhita, 2011 — balance-sheet style return [VERIFY: rule / form annex].  
PURPOSE: Year-end statement of receivables (assets) and payables / arrears (liabilities).  
WHO_MAINTAINS: Gram Sevak + Sarpanch  
WHO_APPROVES: Gram Sabha (presentation)  
FREQUENCY: Annual  
SUBMISSION_DEADLINE: **31 March** preparation narrative; **1 June** to PS (per msdhulap) [VERIFY].  
SUBMITTED_TO: Panchayat Samiti  

FIELDS_IN_REGISTER:  
- [VERIFY: asset/liability line items; ageing buckets; supporting schedules]  

DEPENDS_ON: 11  
FEEDS_INTO: []  
TRIGGER: Year-end closing; after demand-register summaries  
VALIDATION_RULES:  
- Demands / arrears from Namuna 11 (miscellaneous demands) should foot to liability side [VERIFY].  
OBSIDIAN_TAGS: #namuna #reporting #balance-sheet  
OBSIDIAN_LINKS: [[Namuna-11]]  
---

---
NAMUNA: 5  
NAME_EN: Cash Books — General Cash Book (Namuna 5) + Daily Cash Book (Namuna 5क)  
NAME_MR: सामान्य रोकड वही + दैनिक रोकडवही (नमुना ५ / ५ क)  
CATEGORY: Cash  
LEGAL_REF: Lekha Sanhita, 2011 — cash discipline & bank payment thresholds (e.g. **> ₹500 by cheque** narrative in training articles) [VERIFY: exact rule & current rupee threshold if amended by GR]. **Rule 65** mentioned for imprest / petty limits in msdhulap [VERIFY].  
PURPOSE: **5:** Consolidated postings from daily book & cheque receipts; **5क:** first-line capture of receipts (Namuna 7 / 10 / cheques) before bank deposit & consolidation. **Cash payments prohibited in Namuna 5** per msdhulap narrative [VERIFY].  
WHO_MAINTAINS: Gram Sevak (entries) + Sarpanch (daily/weekly attestation per training)  
WHO_APPROVES: Sarpanch (authentication / joint tally)  
FREQUENCY: Daily (5क); Daily/monthly roll-forward (5)  
SUBMISSION_DEADLINE: N/A (internal); month-end tie to passbook [VERIFY]  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: double-column cash book fields; bank columns; voucher cross-refs; denomination breakdown if any]  

DEPENDS_ON: 7, 10, 17  
FEEDS_INTO: 6, 18, 25  
TRIGGER: Every receipt & payment transaction  
VALIDATION_RULES:  
- Daily sub-book (नमुना ५ क) entries for Namuna 7 & 10 receipts must aggregate into the general cash book (नमुना ५) same-day / next working day narrative [VERIFY].  
- Month-end: Namuna 6 opening/closing must reconcile with Namuna 5 [per msdhulap].  
- Withdrawals to petty cash pathway per Rule 24(2) narrative via Namuna 12 → Namuna 18 [VERIFY].  
OBSIDIAN_TAGS: #namuna #cash #daily-chain  
OBSIDIAN_LINKS: [[Namuna-6]] [[Namuna-7]] [[Namuna-10]] [[Namuna-12]] [[Namuna-17]] [[Namuna-18]] [[Namuna-25]]  
NOTE_ON_LINKS: **Namuna-5** represents **both** physical books (५ + ५ क). For Obsidian graphs, split `[[Namuna-5]]` / `[[Namuna-5K]]` if needed; parsers should treat one `NAMUNA: 5` with `SUBBOOKS: [5, 5K]`.  
---

---
NAMUNA: 6  
NAME_EN: Classified Receipt & Expenditure Register (Monthly)  
NAME_MR: मासिक जमा–खर्चाची वर्गीकृत नोंदवही (जमा रकमांची वर्गीकृत नोंदवही)  
CATEGORY: Reporting  
LEGAL_REF: Lekha Sanhita, 2011 — classified ledger by budget head [VERIFY: rule / annex].  
PURPOSE: Month-wise classified summary feeding monthly PS returns and year-end Namuna 3.  
WHO_MAINTAINS: Gram Sevak + Sarpanch  
WHO_APPROVES: Internal certification  
FREQUENCY: Monthly  
SUBMISSION_DEADLINE: Feeds **Namuna 26** by **15th** of next month (per training articles) [VERIFY].  
SUBMITTED_TO: Panchayat Samiti (via Namuna 26)  

FIELDS_IN_REGISTER:  
- [VERIFY: head-wise pages; monthly opening; receipts; payments; closing]  

DEPENDS_ON: 5, 1, 2  
FEEDS_INTO: 3, 26  
TRIGGER: Month-end closing  
VALIDATION_RULES:  
- Closing balance must match Namuna 5 roll-up [msdhulap].  
- Year-end tax collections total should be **cross-checked** against Namuna 9 totals [msdhulap] — modelling as **RECONCILES** edge in the master map, not a posting feed from Namuna 6 → Namuna 9.  
OBSIDIAN_TAGS: #namuna #reporting #classified-ledger  
OBSIDIAN_LINKS: [[Namuna-1]] [[Namuna-2]] [[Namuna-3]] [[Namuna-5]] [[Namuna-9]] [[Namuna-26]]  
---

---
NAMUNA: 7  
NAME_EN: General Receipt (Counterfoil receipt book)  
NAME_MR: सामान्य पावती  
CATEGORY: Receipt  
LEGAL_REF: Lekha Sanhita, 2011 — receipting for non-tax receipts [VERIFY: annex]. Stamp duty / revenue stamp rule for collections **> ₹5000** per msdhulap [VERIFY: amount & stamp type].  
PURPOSE: Evidence of money received (fees, contributions, donations, non-tax income).  
WHO_MAINTAINS: Gram Sevak (issue)  
WHO_APPROVES: Sarpanch (authentication of receipt book)  
FREQUENCY: Per transaction  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: receipt no.; date; payer; amount in words & figures; purpose; carbon duplicate flag; signatures]  

DEPENDS_ON: []  
FEEDS_INTO: 5  
TRIGGER: Money received (non-tax / general)  
VALIDATION_RULES:  
- Every issued receipt must appear same day in Namuna 5क [training chain].  
- Revenue stamp rule if above threshold [VERIFY].  
OBSIDIAN_TAGS: #namuna #receipt #cash-chain  
OBSIDIAN_LINKS: [[Namuna-5]]  
---

---
NAMUNA: 8  
NAME_EN: Tax Assessment Register  
NAME_MR: कर आकारणी नोंदवही  
CATEGORY: Tax  
LEGAL_REF: Maharashtra Village Panchayats Act, 1958 — **Section 124** (tax on buildings & lands etc., procedure & liability). Notification on capital-value-based assessment mentioned in msdhulap (**31 Dec 2015** circular) [VERIFY: current basis].  
PURPOSE: Property / holding-wise assessment roll for GP taxes.  
WHO_MAINTAINS: Gram Sevak (under Sarpanch oversight)  
WHO_APPROVES: Gram Panchayat / tax fixation process as per rules [VERIFY]  
FREQUENCY: Annual / revision cycle [VERIFY]  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: property ID; owner/occupier; dimensions; capital value; tax rate; tax demanded; exemptions; remarks]  

DEPENDS_ON: []  
FEEDS_INTO: 9  
TRIGGER: Assessment cycle; new construction; transfer  
VALIDATION_RULES:  
- **Total assessed demand** must equal **Namuna 9 current-year demand** aggregate [msdhulap].  
OBSIDIAN_TAGS: #namuna #tax #assessment  
OBSIDIAN_LINKS: [[Namuna-9]]  
---

---
NAMUNA: 9  
NAME_EN: Tax Demand Register  
NAME_MR: कर मागणी नोंदवही  
CATEGORY: Tax  
LEGAL_REF: Maharashtra Village Panchayats Act, 1958 — **Section 129** (bills, writ of demand, recovery); demand fixation / Gram Panchayat approval in April monthly meeting narrative [VERIFY].  
PURPOSE: Running demand register (arrears, current, total) and collection postings.  
WHO_MAINTAINS: Gram Sevak + Sarpanch  
WHO_APPROVES: Gram Panchayat (April meeting narrative) [VERIFY]  
FREQUENCY: Daily postings for collections; annual roll for demand  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: holding ref; arrears; current demand; collections; balance; bill / writ cross-ref]  

DEPENDS_ON: 8, 10  
FEEDS_INTO: 5, 6  
TRIGGER: Collection event; demand revision  
VALIDATION_RULES:  
- Daily collections → Namuna 5क; year-end collections total ↔ Namuna 6 tax head [msdhulap].  
- Related **Namuna 9क** (demand notice / bill book) described on mygrampanchayat — **[VERIFY: whether 9क is separate annex or part of 9]**  
OBSIDIAN_TAGS: #namuna #tax #demand  
OBSIDIAN_LINKS: [[Namuna-8]] [[Namuna-5]] [[Namuna-6]] [[Namuna-10]]  
---

---
NAMUNA: 10  
NAME_EN: Tax & Fee Collection Receipt  
NAME_MR: कर व फी वसुली बाबत पावती  
CATEGORY: Tax  
LEGAL_REF: MVP Act, 1958 — **Section 129(1)** bill on tax becoming due [VERIFY mapping to receipt book]; Lekha Sanhita receipting annex [VERIFY].  
PURPOSE: Counterfoil evidence for tax/fee collections.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch (per authentication narrative)  
FREQUENCY: Per collection  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: receipt no.; tax type; period; rebate/penalty lines — mygrampanchayat mentions **5% rebate if paid within 6 months** & **5% penalty on arrears** [VERIFY: statutory vs local bye-law]]  

DEPENDS_ON: 9, 8  
FEEDS_INTO: 5, 6, 9  
TRIGGER: Tax paid  
VALIDATION_RULES:  
- Must same-day flow to Namuna 5क [training].  
- Carbon duplicate mandatory narrative [msdhulap].  
OBSIDIAN_TAGS: #namuna #tax #receipt  
OBSIDIAN_LINKS: [[Namuna-8]] [[Namuna-9]] [[Namuna-5]] [[Namuna-6]]  
---

---
NAMUNA: 11  
NAME_EN: Miscellaneous Demands Register (Non-tax receivables)  
NAME_MR: किरकोळ मागणी नोंदवही  
CATEGORY: Receipt  
LEGAL_REF: Lekha Sanhita, 2011 — sundry demand schedule [VERIFY].  
PURPOSE: Tracks non-tax demands (rents, market fees, grants receivable narrative, etc.).  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch  
FREQUENCY: Ongoing  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: demand type; party; amount; due date; collection cross-ref to Namuna 7]  

DEPENDS_ON: []  
FEEDS_INTO: 4, 5  
TRIGGER: Demand raised  
VALIDATION_RULES:  
- Collections via Namuna 7 receipts [training].  
- Year-end summary feeds Namuna 4 [msdhulap].  
OBSIDIAN_TAGS: #namuna #receipt #demands  
OBSIDIAN_LINKS: [[Namuna-4]] [[Namuna-5]]  
---

---
NAMUNA: 12  
NAME_EN: Contingent Expenditure Voucher (Imprest / office expense voucher)  
NAME_MR: आकस्मिक खर्चाचे प्रमाणक  
CATEGORY: Expenditure  
LEGAL_REF: Lekha Sanhita, 2011 — voucher system & cheque payment discipline [VERIFY: rules cited as 24(2), 65 in articles].  
PURPOSE: Primary payment authority document; ties store issues & bank withdrawals.  
WHO_MAINTAINS: Gram Sevak (prepare)  
WHO_APPROVES: Sarpanch (mandatory before payment narrative)  
FREQUENCY: Per payment  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: voucher no.; payee; amount; budget head; bill attachments; cheque no.; Sarpanch signature]  

DEPENDS_ON: 1, 2, 15, 20, 21  
FEEDS_INTO: 5, 15, 16, 18, 19  
TRIGGER: Payment to supplier / contractor / imprest refill  
VALIDATION_RULES:  
- **> ₹500** payment by cheque only narrative [msdhulap — VERIFY current threshold].  
- Store-linked payments must update Namuna 15 [msdhulap].  
- Must be ink / ball pen (no pencil) narrative [msdhulap — VERIFY].  
OBSIDIAN_TAGS: #namuna #expenditure #voucher  
OBSIDIAN_LINKS: [[Namuna-1]] [[Namuna-2]] [[Namuna-5]] [[Namuna-15]] [[Namuna-16]] [[Namuna-18]] [[Namuna-19]] [[Namuna-20]] [[Namuna-21]]  
---

---
NAMUNA: 13  
NAME_EN: Establishment Register — Posts & Pay Scales  
NAME_MR: कर्मचारी वर्गाची सूची व वेतनश्रेणी नोंदवही  
CATEGORY: Staff  
LEGAL_REF: Maharashtra Gram Panchayat (Employees) Provident Fund Rules, 1961 linkage in msdhulap narrative [VERIFY]; pattern / cadre orders [VERIFY].  
PURPOSE: Sanctioned vs working posts; pay scales; PF deduction accounting narrative.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch (certification)  
FREQUENCY: As appointments change + annual certification [VERIFY]  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: post name; sanctioned strength; incumbent; appointment date; scale; PF deduction % narrative]  

DEPENDS_ON: []  
FEEDS_INTO: 21  
TRIGGER: Appointment / promotion / transfer  
VALIDATION_RULES:  
- Must match pay bills in Namuna 21 [logical].  
OBSIDIAN_TAGS: #namuna #staff #establishment  
OBSIDIAN_LINKS: [[Namuna-21]]  
---

---
NAMUNA: 14  
NAME_EN: Revenue Stamp (Stamp Stock) Account  
NAME_MR: मुद्रांक हिशोब नोंदवही  
CATEGORY: Stores  
LEGAL_REF: Lekha Sanhita, 2011 — stamp custody [VERIFY].  
PURPOSE: Tracks purchase & use of revenue stamps for receipting.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch (monthly stock verification narrative)  
FREQUENCY: Monthly attestation  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: opening stock; purchases; issues (receipt nos.); closing; signatures]  

DEPENDS_ON: []  
FEEDS_INTO: 7  
TRIGGER: Stamp purchase or issue to receipts > threshold [VERIFY]  
VALIDATION_RULES:  
- Physical stock = book stock [VERIFY].  
OBSIDIAN_TAGS: #namuna #stores #stamps  
OBSIDIAN_LINKS: [[Namuna-7]]  
---

---
NAMUNA: 15  
NAME_EN: Consumable Stores Ledger  
NAME_MR: उपभोग्य वस्तू साठा लेखा नोंदवही  
CATEGORY: Stores  
LEGAL_REF: Lekha Sanhita, 2011 — consumable inventory [VERIFY].  
PURPOSE: Stationery, forms, small consumables, cheque book stock etc.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch (per line authentication narrative)  
FREQUENCY: Per transaction  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: item; qty; rate; voucher ref; balance; signatures]  

DEPENDS_ON: 12  
FEEDS_INTO: 12  
TRIGGER: Purchase / issue  
VALIDATION_RULES:  
- Issues must not proceed without Sarpanch auth then payment [msdhulap].  
OBSIDIAN_TAGS: #namuna #stores #inventory  
OBSIDIAN_LINKS: [[Namuna-12]]  
---

---
NAMUNA: 16  
NAME_EN: Dead Stock / Durable Movables Register  
NAME_MR: जड वस्तू संग्रह / जंगम मालमत्ता नोंदवही  
CATEGORY: Property  
LEGAL_REF: Lekha Sanhita, 2011 — capitalisable movables [VERIFY].  
PURPOSE: Furniture, fixtures, equipment above consumable threshold.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch (half-yearly physical verification narrative — **twice a year** per msdhulap)  
FREQUENCY: Per acquisition + bi-annual verification  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: asset tag; description; location; cost; date; condition; disposal]  

DEPENDS_ON: 12  
FEEDS_INTO: []  
TRIGGER: Purchase / reclassification from Namuna 15 [VERIFY]  
VALIDATION_RULES:  
- [VERIFY: capitalization criteria amount]  
OBSIDIAN_TAGS: #namuna #property #dead-stock  
OBSIDIAN_LINKS: [[Namuna-12]]  
---

---
NAMUNA: 17  
NAME_EN: Advances & Security Deposits Register  
NAME_MR: अग्रीम दिलेल्या/अनामत ठेवलेल्या रकमांची नोंदवही  
CATEGORY: Advances  
LEGAL_REF: Lekha Sanhita, 2011 — securities & advances [VERIFY].  
PURPOSE: Tracks EMD / performance security / staff advances recovery.  
WHO_MAINTAINS: Gram Sevak + Sarpanch  
WHO_APPROVES: Gram Panchayat (forfeiture / refund decisions) [VERIFY]  
FREQUENCY: Per event  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: party; purpose; amount; receipt in Namuna 5क cross-ref; recovery schedule; balance]  

DEPENDS_ON: []  
FEEDS_INTO: 5, 32  
TRIGGER: Security received / advance given  
VALIDATION_RULES:  
- Security receipts also entered in Namuna 5क [msdhulap].  
- No new advance if old advance not fully recovered [msdhulap].  
OBSIDIAN_TAGS: #namuna #advances #security  
OBSIDIAN_LINKS: [[Namuna-5]] [[Namuna-32]]  
---

---
NAMUNA: 18  
NAME_EN: Petty Cash Book  
NAME_MR: किरकोळ रोकड वही  
CATEGORY: Cash  
LEGAL_REF: Lekha Sanhita, 2011 — **Rule 24(2)** narrative for payments **< ₹500** by bearer cheque / cash pathway [VERIFY exact text].  
PURPOSE: Small payments imprest loop linked to Namuna 5 & 19.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch  
FREQUENCY: Daily  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: opening cash; bank withdrawal ref; payments; closing]  

DEPENDS_ON: 5, 12  
FEEDS_INTO: 19  
TRIGGER: Bank withdrawal to petty; small payment  
VALIDATION_RULES:  
- **Only** payments supported by Namuna 19 (muster) for labour petty path per msdhulap narrative [VERIFY exceptions].  
- Deposit side ties from Namuna 5 withdrawal via Namuna 12 [msdhulap].  
OBSIDIAN_TAGS: #namuna #cash #petty  
OBSIDIAN_LINKS: [[Namuna-5]] [[Namuna-12]] [[Namuna-19]]  
---

---
NAMUNA: 19  
NAME_EN: Muster Roll / Wage Attendance Sheet  
NAME_MR: कामावर असलेल्या व्यक्तींचा हजेरीपट  
CATEGORY: Staff  
LEGAL_REF: Lekha Sanhita, 2011 — **Rule 24(5)** linkage to payments from Namuna 19 in msdhulap [VERIFY].  
PURPOSE: Daily labour attendance & wage calculation for petty cash payments.  
WHO_MAINTAINS: Gram Sevak / work supervisor [VERIFY]  
WHO_APPROVES: Sarpanch (serial pramanak numbering from **1 April** ascending narrative)  
FREQUENCY: Daily (when work proceeds)  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: work name; date; names; attendance units; rates; total; signatures]  

DEPENDS_ON: 12  
FEEDS_INTO: 18  
TRIGGER: Wage payment event  
VALIDATION_RULES:  
- Must precede petty payment from Namuna 18 [msdhulap].  
OBSIDIAN_TAGS: #namuna #staff #muster  
OBSIDIAN_LINKS: [[Namuna-12]] [[Namuna-18]]  
---

---
NAMUNA: 20  
NAME_EN: Works — Estimate + Measurement + Bills (Namuna 20 / 20क / 20ख / 20ख(1))  
NAME_MR: कामाच्या अंदाजाची नोंदवही; मोजमाप वही; कामाचे देयक (साखळी)  
CATEGORY: Works  
LEGAL_REF: Lekha Sanhita, 2011 — works measurement & billing annexes [VERIFY]; technical attestation by **Junior Engineer / Branch Engineer of Panchayat Samiti** narrative [msdhulap].  
PURPOSE: End-to-end public works documentation from administrative estimate through measurement to payment certificate.  
WHO_MAINTAINS: Gram Sevak + **Engineer (PS level)** for measurement book entries  
WHO_APPROVES: Sarpanch (estimate & bills); Engineer (measurement)  
FREQUENCY: Per work package  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal / PS technical scrutiny [VERIFY]  

FIELDS_IN_REGISTER:  
- [VERIFY: estimate qty & rates; abstract; tender/contract ref; measurement entries; bill amounts; payee acknowledgement on Namuna 20ख(1) narrative]  

DEPENDS_ON: 1, 2  
FEEDS_INTO: 12, 3  
TRIGGER: New work sanction; running bill; final bill  
VALIDATION_RULES:  
- Bill quantities must trace to measurement pages [msdhulap].  
- Payee signature on payment acceptance form (20ख(1)) [msdhulap].  
OBSIDIAN_TAGS: #namuna #works #engineering  
OBSIDIAN_LINKS: [[Namuna-1]] [[Namuna-2]] [[Namuna-3]] [[Namuna-12]]  
---

---
NAMUNA: 21  
NAME_EN: Salary Payment Register / Pay Bill Book  
NAME_MR: कर्मचाऱ्यांच्या वेतन देयकाची नोंदवही  
CATEGORY: Staff  
LEGAL_REF: Lekha Sanhita, 2011 — pay bill sequence [VERIFY]; pattern compliance [VERIFY].  
PURPOSE: Monthly wage preparation & payment tracking for permanent staff.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch (before disbursement)  
FREQUENCY: Monthly  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: employee; gross; deductions; net; bank/cheque; signature; month]  

DEPENDS_ON: 13  
FEEDS_INTO: 5, 6, 12  
TRIGGER: Monthly payroll cycle  
VALIDATION_RULES:  
- Establishment must match Namuna 13 [logical].  
OBSIDIAN_TAGS: #namuna #staff #payroll  
OBSIDIAN_LINKS: [[Namuna-13]] [[Namuna-5]] [[Namuna-6]] [[Namuna-12]]  
---

---
NAMUNA: 22  
NAME_EN: Immovable Property Register (excluding roads & land sheets)  
NAME_MR: स्थावर मालमत्ता नोंदवही (रस्ते व जमिनी व्यतिरिक्त)  
CATEGORY: Property  
LEGAL_REF: Lekha Sanhita, 2011 — immovable asset inventory [VERIFY].  
PURPOSE: Buildings, shops, community assets etc.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch + Gram Sevak joint annual April certification narrative [msdhulap]  
FREQUENCY: Annual + on change  
SUBMISSION_DEADLINE: **April** certification [VERIFY exact PS submission if any]  
SUBMITTED_TO: Internal [VERIFY]  

FIELDS_IN_REGISTER:  
- [VERIFY: property description; survey no.; acquisition details; cost; depreciation narrative if any]  

DEPENDS_ON: []  
FEEDS_INTO: []  
TRIGGER: Acquisition / renovation / revaluation  
VALIDATION_RULES:  
- [VERIFY: linkage to Namuna 4 if capitalised]  
OBSIDIAN_TAGS: #namuna #property #immovable  
OBSIDIAN_LINKS: []  
---

---
NAMUNA: 23  
NAME_EN: Roads Register  
NAME_MR: रस्त्याची नोंदवही  
CATEGORY: Property  
LEGAL_REF: Lekha Sanhita, 2011 — road asset register [VERIFY].  
PURPOSE: GP-maintained roads dimensions & works history.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch + Secretary annual April certification [msdhulap]  
FREQUENCY: Annual + per work  
SUBMISSION_DEADLINE: April certification  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: road name; length; width; surface; work history; cost]  

DEPENDS_ON: 20  
FEEDS_INTO: []  
TRIGGER: Road work executed  
VALIDATION_RULES:  
- New entries after Sarpanch site inspection & measurement narrative [msdhulap].  
OBSIDIAN_TAGS: #namuna #property #roads  
OBSIDIAN_LINKS: [[Namuna-20]]  
---

---
NAMUNA: 24  
NAME_EN: Land Register  
NAME_MR: जमिनीची नोंदवही  
CATEGORY: Property  
LEGAL_REF: Lekha Sanhita, 2011 — land asset inventory [VERIFY].  
PURPOSE: GP-owned parcels, open plots, gairan etc.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch + Secretary annual April certification [msdhulap]  
FREQUENCY: Annual + on mutation  
SUBMISSION_DEADLINE: April certification  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: survey no.; area; mode of acquisition; encumbrances; usage]  

DEPENDS_ON: []  
FEEDS_INTO: []  
TRIGGER: Purchase / transfer / classification change  
VALIDATION_RULES:  
- [VERIFY: integration with property tax Namuna 8 if same parcel]  
OBSIDIAN_TAGS: #namuna #property #land  
OBSIDIAN_LINKS: [[Namuna-8]]  
---

---
NAMUNA: 25  
NAME_EN: Investments Register  
NAME_MR: गुंतवणूक नोंदवही  
CATEGORY: Cash  
LEGAL_REF: Lekha Sanhita, 2011 — **Rule 15** cited in msdhulap for investments [VERIFY].  
PURPOSE: FDs / approved instruments — principal & interest.  
WHO_MAINTAINS: Gram Sevak + Sarpanch monthly reconcile to Namuna 5 [msdhulap]  
WHO_APPROVES: Sarpanch  
FREQUENCY: Monthly reconciliation; per new investment  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: institution; receipt no.; principal; rate; maturity; interest accrued/credited; TDS if any]  

DEPENDS_ON: 5  
FEEDS_INTO: 5, 6  
TRIGGER: Placement / maturity / interest credit  
VALIDATION_RULES:  
- Interest must hit cash book / bank statement [logical].  
OBSIDIAN_TAGS: #namuna #cash #investments  
OBSIDIAN_LINKS: [[Namuna-5]] [[Namuna-6]]  
---

---
NAMUNA: 26  
NAME_EN: Monthly Returns to Panchayat Samiti (Namuna 26क Income + 26ख Expenditure)  
NAME_MR: जमा मासिक विवरण + खर्चाचे मासिक विवरण  
CATEGORY: Reporting  
LEGAL_REF: Lekha Sanhita, 2011 — monthly reporting forms [VERIFY].  
PURPOSE: Structured PS supervision returns compiled from classified ledger.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: [VERIFY: Sarpanch signature requirement]  
FREQUENCY: Monthly  
SUBMISSION_DEADLINE: **15th** of following month to Panchayat Samiti (per both training articles) [VERIFY: holiday / e-filing rules].  
SUBMITTED_TO: Panchayat Samiti  

FIELDS_IN_REGISTER:  
- [VERIFY: receipt side schedules; payment side schedules; certification block]  

DEPENDS_ON: 6  
FEEDS_INTO: []  
TRIGGER: Month closed in Namuna 6  
VALIDATION_RULES:  
- Must be arithmetically consistent with Namuna 6 [logical].  
OBSIDIAN_TAGS: #namuna #reporting #ps-returns  
OBSIDIAN_LINKS: [[Namuna-6]]  
---

---
NAMUNA: 27  
NAME_EN: Audit Paras Compliance — Monthly Statement  
NAME_MR: लेखा परीक्षणातील आक्षेपांच्या पूर्ततेचे मासिक विवरण  
CATEGORY: Audit  
LEGAL_REF: Lekha Sanhita, 2011 — audit compliance tracking [VERIFY]; timelines: **3 months** compliance report after audit report narrative [msdhulap] [VERIFY].  
PURPOSE: Tracks para-wise compliance & PS / CEO ZP escalation path narrative.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Panchayat Samiti conclusions; CEO ZP for escalations narrative [msdhulap]  
FREQUENCY: Monthly (once audit in progress)  
SUBMISSION_DEADLINE: [VERIFY: monthly by date]  
SUBMITTED_TO: Panchayat Samiti → CEO ZP (escalation)  

FIELDS_IN_REGISTER:  
- [VERIFY: para no.; objection text summary; action taken; pending; authority decision; dates]  

DEPENDS_ON: []  
FEEDS_INTO: 30  
TRIGGER: Receipt of audit report / ongoing monitoring  
VALIDATION_RULES:  
- Should eventually close into Namuna 30 satisfaction narrative [logical].  
OBSIDIAN_TAGS: #namuna #audit #compliance  
OBSIDIAN_LINKS: [[Namuna-30]]  
---

---
NAMUNA: 28  
NAME_EN: SCSP / Women & Child Component Expenditure — Monthly Return  
NAME_MR: मागासवर्गीय १५ टक्के खर्च / महिला बालकल्याण १० टक्के खर्चाचे मासिक विवरण  
CATEGORY: Reporting  
LEGAL_REF: State reservation circulars / orders [VERIFY: current % & scheme names]; not a single MVP Act section in sources used.  
PURPOSE: Demonstrates reserved % utilisation vs budget.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: [VERIFY]  
FREQUENCY: Monthly  
SUBMISSION_DEADLINE: **First week** of month to PS (per msdhulap) [VERIFY exact day]  
SUBMITTED_TO: Panchayat Samiti  

FIELDS_IN_REGISTER:  
- [VERIFY: budget provision; expenditure; % utilisation; remarks]  

DEPENDS_ON: 1, 6  
FEEDS_INTO: []  
TRIGGER: Month-end  
VALIDATION_RULES:  
- % tests against Act / GR thresholds [VERIFY current law].  
OBSIDIAN_TAGS: #namuna #reporting #reservations  
OBSIDIAN_LINKS: [[Namuna-1]] [[Namuna-6]]  
---

---
NAMUNA: 29  
NAME_EN: Loans Register  
NAME_MR: कर्जाची नोंदवही  
CATEGORY: Advances  
LEGAL_REF: Lekha Sanhita, 2011 — borrowing register [VERIFY]; must align with budget Namuna 1 narrative [mygrampanchayat].  
PURPOSE: Principal, interest, repayment schedule for GP borrowings.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch quarterly certification narrative [msdhulap]  
FREQUENCY: Quarterly certification; per transaction  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal / lenders [VERIFY]  

FIELDS_IN_REGISTER:  
- [VERIFY: lender; purpose; sanction ref; principal; interest; repayment; balance]  

DEPENDS_ON: 1  
FEEDS_INTO: 5, 6  
TRIGGER: Loan drawdown / repayment  
VALIDATION_RULES:  
- Purpose tied to sanctioned use [mygrampanchayat narrative].  
OBSIDIAN_TAGS: #namuna #advances #loans  
OBSIDIAN_LINKS: [[Namuna-1]] [[Namuna-5]] [[Namuna-6]]  
---

---
NAMUNA: 30  
NAME_EN: Audit Objection Compliance Register  
NAME_MR: ग्रामपंचायत लेखापरीक्षण आक्षेप पूर्तता नोंदवही  
CATEGORY: Audit  
LEGAL_REF: Lekha Sanhita, 2011 — audit para closure documentation [VERIFY].  
PURPOSE: Formal tracking of audit paras cleared vs pending with resolutions.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Gram Panchayat resolutions narrative [msdhulap]  
FREQUENCY: Event-driven + periodic PS submission **within 3 months** narrative [msdhulap] [VERIFY].  
SUBMISSION_DEADLINE: See above [VERIFY]  
SUBMITTED_TO: Panchayat Samiti  

FIELDS_IN_REGISTER:  
- [VERIFY: audit year; para no.; objection; GP resolution no.; compliance evidence ref; amount recovered if any]  

DEPENDS_ON: 27  
FEEDS_INTO: 27  
TRIGGER: Audit report received  
VALIDATION_RULES:  
- Amounts recovered should reflect in Namuna 5 / 6 [logical].  
OBSIDIAN_TAGS: #namuna #audit #objections  
OBSIDIAN_LINKS: [[Namuna-27]]  
---

---
NAMUNA: 31  
NAME_EN: Travelling Allowance Bills  
NAME_MR: प्रवास भत्ता देयक  
CATEGORY: Expenditure  
LEGAL_REF: State TA rules for local bodies [VERIFY: rule booklet].  
PURPOSE: TA claims for Sarpanch / Upa-Sarpanch / members / staff for official travel.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch [VERIFY]  
FREQUENCY: As claims arise  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: traveller; dates; mode; distance; rate; amount; purpose; attendance evidence]  

DEPENDS_ON: []  
FEEDS_INTO: 5, 6, 12  
TRIGGER: Official travel  
VALIDATION_RULES:  
- **No TA** for travel within **8 km** of GP (msdhulap) [VERIFY: current rule].  
OBSIDIAN_TAGS: #namuna #expenditure #ta  
OBSIDIAN_LINKS: [[Namuna-5]] [[Namuna-6]] [[Namuna-12]]  
---

---
NAMUNA: 32  
NAME_EN: Refund Order for Deposits / Securities  
NAME_MR: रकमेच्या परताव्यासाठीचा आदेश  
CATEGORY: Advances  
LEGAL_REF: Lekha Sanhita, 2011 — refund documentation [VERIFY].  
PURPOSE: Formal order trail when returning EMD / security amounts recorded in Namuna 17.  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch / competent authority [VERIFY]  
FREQUENCY: Per refund  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: original receipt ref; payee bank details; amount; reason; order no.; signatures]  

DEPENDS_ON: 17  
FEEDS_INTO: 5  
TRIGGER: Work completion / bid rejection / encashment  
VALIDATION_RULES:  
- Must reference Namuna 17 line [msdhulap].  
- Payment through Namuna 5 pathway [logical].  
OBSIDIAN_TAGS: #namuna #advances #refunds  
OBSIDIAN_LINKS: [[Namuna-17]] [[Namuna-5]]  
---

---
NAMUNA: 33  
NAME_EN: Tree Register  
NAME_MR: वृक्ष नोंदवही  
CATEGORY: Property  
LEGAL_REF: [VERIFY: whether forest / tree preservation GR or Lekha Sanhita annex — not confirmed in sources used]  
PURPOSE: GP-managed plantations / avenue trees — inventory & income from produce / felling permissions narrative [msdhulap].  
WHO_MAINTAINS: Gram Sevak  
WHO_APPROVES: Sarpanch [VERIFY]  
FREQUENCY: Annual + on change  
SUBMISSION_DEADLINE: N/A  
SUBMITTED_TO: Internal  

FIELDS_IN_REGISTER:  
- [VERIFY: species; count; location; expected annual income; actual income; felling permission ref; replanting]  

DEPENDS_ON: []  
FEEDS_INTO: 7, 11  
TRIGGER: Plantation / harvest / damage  
VALIDATION_RULES:  
- Income should hit receipts (Namuna 7 / demand path) [logical].  
OBSIDIAN_TAGS: #namuna #property #trees  
OBSIDIAN_LINKS: [[Namuna-7]] [[Namuna-11]]  
---

## 1. MASTER DEPENDENCY MAP (edges)

**Legend types:** FEEDS | RECONCILES | VERIFIES | TRIGGERS | APPROVES  

| Source | Target | Type | Notes |
|--------|--------|------|-------|
| 1 | 2 | TRIGGERS | Supplement / reallocation cycle |
| 1 | 3 | FEEDS | Year-end totals vs budget heads |
| 1 | 6 | FEEDS | Monthly classified limits |
| 1 | 28 | FEEDS | Reserved % budgets |
| 1 | 29 | FEEDS | Loan provision |
| 2 | 3 | FEEDS | Revised head balances |
| 2 | 6 | FEEDS | Revised monthly limits |
| 5 | 6 | FEEDS | Month postings |
| 5 | 3 | RECONCILES | Annual cash vs abstract |
| 5 | 18 | FEEDS | Bank withdrawal to petty |
| 5 | 25 | RECONCILES | Investment movements |
| 5क (logical) | 5 | FEEDS | Daily to general cash [collapsed under Namuna 5] |
| 7 | 5 | FEEDS | Receipt chain |
| 10 | 5 | FEEDS | Tax receipt chain |
| 10 | 9 | FEEDS | Collection postings update demand balances |
| 10 | 6 | FEEDS | Via Namuna 5 → classified ledger |
| 8 | 9 | FEEDS | Demand build |
| 9 | 6 | RECONCILES | Year-end tax vs ledger |
| 11 | 4 | FEEDS | Liabilities / receivables |
| 11 | 5 | FEEDS | Collections |
| 12 | 5 | TRIGGERS | Payments / withdrawals |
| 12 | 15 | TRIGGERS | Store payment |
| 12 | 18 | TRIGGERS | Petty refill |
| 12 | 19 | TRIGGERS | Muster payments |
| 12 | 16 | FEEDS | Dead-stock acquisition / capitalisation [VERIFY] |
| 13 | 21 | FEEDS | Pay scales |
| 21 | 12 | FEEDS | Salary payment vouchers |
| 15 | 12 | VERIFIES | Stock before pay |
| 17 | 5 | FEEDS | Security lodged in cash |
| 17 | 32 | TRIGGERS | Refund processing |
| 19 | 18 | FEEDS | Petty eligibility |
| 20 | 12 | FEEDS | Work payments |
| 21 | 5 | FEEDS | Salary disbursement |
| 21 | 6 | FEEDS | Monthly head posting |
| 23 | 20 | FEEDS | Road works documentation |
| 25 | 5 | FEEDS | Investment cash |
| 25 | 6 | FEEDS | Interest booking |
| 26 | PS | FEEDS | Upward supervision [external node] |
| 6 | 26 | FEEDS | Monthly PS forms |
| 6 | 3 | FEEDS | Annual abstract |
| 27 | 30 | RECONCILES | Compliance lifecycle |
| 30 | 27 | FEEDS | Closure feedback |
| 31 | 12 | FEEDS | TA voucher |
| 32 | 5 | FEEDS | Refund payment |
| 33 | 7 | FEEDS | Tree income receipts |
| 33 | 11 | FEEDS | Demand if any [VERIFY] |

**Bidirectional check highlights:** 8↔9, 5↔6, 12↔15, 17↔32, 18↔19, 27↔30 are the strongest mutual control pairs for your graph tool.

---

## 2. CATEGORY GROUPS (functional)

**Budget & Planning:** 1, 2, 28 (also cross-reporting)  
**Daily Cash Chain:** 5 (incl. 5क), 7, 10, 17, 18, 25  
**Tax Chain:** 8, 9, 10 [+ possible 9क [VERIFY]]  
**Expenditure & Works:** 12, 19, 20, 31  
**Staff & Stores:** 13, 14, 15, 16, 21  
**Property Records:** 22, 23, 24, 33  
**Reporting & Audit:** 3, 4, 6, 26, 27, 28, 30  
**Advances / Loans:** 17, 29, 32  

*(Categories overlap by design — pick a primary for Obsidian folder.)*

---

## 3. CRITICAL PATH — minimum daily sequence (cash + tax)

1. **Issue receipts:** Namuna 7 / 10 for each collection.  
2. **Post to daily cash:** Namuna 5क (logical sub-book of **Namuna 5** in this file).  
3. **Bank deposit:** aggregate collections → bank; enter **Namuna 5** general cash.  
4. **Tax demand book:** update **Namuna 9** for collections against demand.  
5. **End-of-day:** Sarpanch + Gram Sevak tally counterfoils vs cash / bank scroll [VERIFY: exact checklist in Sanhita].  

**Weekly** (per training narrative): attest Namuna 5क against physical vouchers / cheques.

---

## 4. AUDIT RISK POINTS (quick flags)

| Namuna | High risk? | Why (from training narratives) |
|--------|------------|-----------------------------------|
| 1 | Yes | Missed **Jan/Feb** chain → statutory default; Sarpanch disqualification narrative [VERIFY]. |
| 2 | Yes | Head-shifting without PS approval. |
| 3 | Yes | Mismatch with Namuna 6 / bank passbook. |
| 5 | Yes | Cash where cheque mandated; split book tampering between 5 & 5क. |
| 6 | Yes | Wrong head posting vs budget. |
| 8–9 | Yes | Assessment total ≠ demand register total [explicit in msdhulap]. |
| 10 | Yes | Missing revenue stamp above threshold [msdhulap]. |
| 11 | Yes | Demands not carried to Namuna 4. |
| 12 | Yes | Payments without store / measurement trail. |
| 14 | Yes | Stamp stock vs usage mismatch. |
| 15 | Yes | Issues without Sarpanch authentication sequence. |
| 17 | Yes | Security refunds without Namuna 32 order trail. |
| 18–19 | Yes | Petty payments without muster / above limit [Rule 24 narrative]. |
| 20 | Yes | Bills without PS engineer measurement pages. |
| 21 | Yes | Ghost employees vs Namuna 13. |
| 25 | Yes | Interest not brought into cash book. |
| 26 | Yes | Late / non-submission by **15th** [training]. |
| 27–30 | Yes | Para pendency beyond 3-month narrative [VERIFY]. |
| 28 | Yes | Reservation % shortfall [policy risk]. |
| 31 | Yes | TA within **8 km** disallowance narrative [msdhulap]. |

---

## 5. OBSIDIAN VAULT STRUCTURE (suggested)

```
/Namune/
  /00-MOC/
    MOC-Budget.md
    MOC-Cash-Chain.md
    MOC-Tax.md
    MOC-Works.md
    MOC-Staff-Stores.md
    MOC-Property.md
    MOC-Reporting-Audit.md
  /Budget/
    Namuna-01.md … Namuna-02.md
  /Cash/
    Namuna-05.md  (embed or link Namuna-5K.md)
    Namuna-18.md
    Namuna-25.md
  /Tax/
    Namuna-08.md … Namuna-10.md
  /Receipts-Demands/
    Namuna-07.md
    Namuna-11.md
  /Expenditure/
    Namuna-12.md
    Namuna-19.md
    Namuna-20.md
    Namuna-31.md
  /Staff-Stores/
    Namuna-13.md … Namuna-16.md
    Namuna-21.md
  /Property/
    Namuna-22.md … Namuna-24.md
    Namuna-33.md
  /Advances-Loans/
    Namuna-17.md
    Namuna-29.md
    Namuna-32.md
  /Reporting-Audit/
    Namuna-03.md
    Namuna-04.md
    Namuna-06.md
    Namuna-26.md
    Namuna-27.md
    Namuna-28.md
    Namuna-30.md
```

**MOC pages recommended:** `MOC-Cash-Chain` (5–7–10–18–19), `MOC-Tax` (8–9–10), `MOC-Works` (20–12–23), `MOC-Reporting-Audit` (6–26–3–27–30).

---

## Brainstorming skill note (process)

Per your attached **brainstorming** skill: full spec-review subagent loop and `writing-plans` handoff were **not** executed here because you asked for a **separate research artefact** to compare across AIs first. Next step after you stabilise facts: run a **spec review** against an official PDF of *Lekha Sanhita 2011*, then invoke **writing-plans** for implementation.

---

## Git

Document added at: `docs/superpowers/specs/2026-04-18-maharashtra-gp-33-namune-machine-requirements.md`  
**Not committed** (you did not ask for a commit).
