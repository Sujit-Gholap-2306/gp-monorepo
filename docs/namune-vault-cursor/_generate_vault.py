#!/usr/bin/env python3
"""One-off generator for namune-vault-cursor — run from repo root:
   python3 docs/superpowers/namune-vault-cursor/_generate_vault.py
"""
from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# (namuna_int, folder, yaml_category, audit_risk, who_maintains, who_approves, frequency, submitted_to,
#  deadline, legal_ref, name_en, name_mr, purpose_lines, fields, validation_rules, related_from_source)
# yaml_category must be one of the enum values user specified

DATA: dict[int, dict] = {
    1: {
        "folder": "Budget",
        "category": "Budget",
        "risk": "VERY HIGH",
        "maintains": "Gram Sevak",
        "approves": "Gram Sabha",
        "freq": "Annual",
        "submitted": "Panchayat Samiti",
        "deadline": "[VERIFY] Statutory budget calendar (Jan/Feb chain vs ZP circular)",
        "legal": "MVP Act 1958 Sec 62; Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Budget",
        "name_mr": "अर्थसंकल्प",
        "purpose": (
            "Defines the primary financial plan outlining estimated receipts and proposed expenditures for the upcoming financial year, "
            "serving as the legal basis for all GP spending. [VERIFY: reconcile with official Namuna 1 annex]"
        ),
        "fields": [
            "Major Head of Account (Receipts & Expenditure)",
            "Minor Head of Account",
            "Actuals of the previous financial year",
            "Revised Estimates of the current financial year",
            "Budget Estimates for the upcoming financial year",
            "Explanation for significant variations",
            "Gram Sevak Signature",
            "Sarpanch Signature",
        ],
        "validation": [
            "Opening balance must match the closing balance of the previous year's Namuna 3.",
            "Proposed expenditure cannot exceed estimated receipts plus the verified opening balance.",
            "Must contain explicit approval resolution number from the Gram Sabha.",
        ],
    },
    2: {
        "folder": "Budget",
        "category": "Budget",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Gram Sabha",
        "freq": "Annual",
        "submitted": "Panchayat Samiti",
        "deadline": "[VERIFY]",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Revised Budget",
        "name_mr": "सुधारित अर्थसंकल्प",
        "purpose": (
            "Re-appropriates funds and revises original budget estimates based on mid-year financial realities, unforeseen expenditures, and new grant inflows."
        ),
        "fields": [
            "Head of Account",
            "Original Budget Estimate (from Namuna 1)",
            "Actual Receipts/Expenditure to date",
            "Revised Estimate proposed",
            "Justification for revision",
            "Gram Sabha Resolution Number",
        ],
        "validation": [
            "Original Estimate column must strictly match the approved Namuna 1 figures.",
            "Deficit budgets are strictly prohibited; any new expenditure must be backed by newly validated receipts.",
        ],
    },
    3: {
        "folder": "Reporting",
        "category": "Reporting",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "Monthly",
        "submitted": "Internal",
        "deadline": "5th of every subsequent month [VERIFY vs PS deadline if different]",
        "legal": "MVP Act 1958 Sec 8; Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Statement of Income and Expenditure",
        "name_mr": "जमा-खर्च विवरण",
        "purpose": (
            "Aggregates classified financial data to present the actual income and expenditure against the approved budget, "
            "acting as the primary monthly reporting tool."
        ),
        "fields": [
            "Month and Year",
            "Budget Head (Receipts & Payments)",
            "Budgeted Amount (from Namuna 1/2)",
            "Actual Receipts/Expenditure for the month",
            "Progressive Total (Year-to-date)",
            "Variance (Budget vs. Progressive Total)",
            "Signatures of Gram Sevak and Sarpanch",
        ],
        "validation": [
            "Monthly totals must match exactly the sum of entries in Namuna 6 (Receipts) and Namuna 7 (Expenditure).",
            "Progressive expenditure cannot exceed the allotted budget without a valid Namuna 2 entry.",
            "Serves as the foundational dataset for the Annual Administration Report (Namuna 31).",
        ],
    },
    4: {
        "folder": "Reporting",
        "category": "Reporting",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "Annual",
        "submitted": "Internal",
        "deadline": "End of Financial Year",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Register of Assets and Liabilities",
        "name_mr": "मालमत्ता व दायित्वे",
        "purpose": (
            "Maintains an ongoing inventory of all movable and immovable assets owned by the GP, alongside a strict accounting of all outstanding debts and liabilities."
        ),
        "fields": [
            "Asset/Liability ID",
            "Description of Asset/Liability",
            "Date of Acquisition / Creation of Liability",
            "Original Value",
            "Depreciation / Amortization parameters",
            "Current Book Value",
            "Location of Asset",
            "Creditor Details (for liabilities)",
        ],
        "validation": [
            "New capital assets must have a corresponding expenditure entry tracing back to Namuna 5 and Namuna 22.",
            "Current liabilities must seamlessly reconcile with the Loan Register (Namuna 26) and Deposit Register (Namuna 29).",
        ],
    },
    5: {
        "folder": "Cash",
        "category": "Cash",
        "risk": "VERY HIGH",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "Daily",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "General Cash Book",
        "name_mr": "सामान्य रोकड वही",
        "purpose": (
            "The absolute financial core of the GP, recording every single cash, bank, and digital transaction chronologically to maintain the official balance. "
            "Source also describes a Daily Cash Book (Namuna 5A / नमुना ५ क) aggregated here — folded into this note [VERIFY vs official annex]."
        ),
        "fields": [
            "Date",
            "Receipt/Voucher Number",
            "Particulars (Source/Payee details)",
            "Ledger Folio (L.F.) cross-reference",
            "Cash Receipt Amount",
            "Bank Receipt Amount",
            "Cash Payment Amount",
            "Bank Payment Amount",
            "Daily Closing Balance (Cash & Bank)",
            "Signatures (Gram Sevak & Sarpanch)",
        ],
        "validation": [
            "Daily closing balance = (Opening Balance + Receipts) - Payments.",
            "No receipt entry is legally valid without a corresponding Namuna 10, 16, or 25 reference number [VERIFY: receipt types per Sanhita].",
            "No payment entry is legally valid without an authorized voucher (Namuna 20 bill chain, 21, 32, etc.) [VERIFY].",
            "Physical cash-in-hand limits must not exceed the maximum threshold established by the Zilla Parishad CEO [VERIFY].",
        ],
    },
    6: {
        "folder": "Receipt",
        "category": "Receipt",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Internal",
        "freq": "Daily",
        "submitted": "N/A",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Classified Register of Receipts",
        "name_mr": "जमा वर्गीकरण वही",
        "purpose": (
            "Segregates the chronological receipt entries from the Cash Book (Namuna 5) into specific statutory accounting heads for programmatic reporting."
        ),
        "fields": [
            "Date",
            "Namuna 5 Page/Entry Number",
            "Receipt Number",
            "Major/Minor Head of Account (e.g., Property Taxes, Water Charges, SFC Grants)",
            "Amount Apportioned",
        ],
        "validation": [
            "The sum total of all classified receipts for a given accounting period must exactly equal the total receipts in Namuna 5 for the same period.",
            "Government grant receipts must map directly to the specific scheme in the Grant Register (Namuna 25).",
        ],
    },
    7: {
        "folder": "Receipt",
        "category": "Receipt",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Internal",
        "freq": "Daily",
        "submitted": "N/A",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Classified Register of Expenditure",
        "name_mr": "खर्च वर्गीकरण वही",
        "purpose": (
            "Segregates the chronological payment entries from the Cash Book (Namuna 5) into specific accounting heads to monitor budget utilization against Namuna 1."
        ),
        "fields": [
            "Date",
            "Namuna 5 Page/Entry Number",
            "Voucher Number",
            "Major/Minor Head of Account (e.g., Public Works, Salaries, Admin, Sanitation)",
            "Amount Apportioned",
        ],
        "validation": [
            "The sum total of all classified expenditures for a given period must exactly equal the total payments in Namuna 5 for the same period.",
            "Capital work expenditures must reference specific Namuna 20 bill entries, preventing generalized bulk expenses [VERIFY: 20B folded under Namuna-20].",
        ],
    },
    8: {
        "folder": "Tax",
        "category": "Tax",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Gram Sabha / Sarpanch",
        "freq": "Annual",
        "submitted": "Internal",
        "deadline": "Prior to April 1st of the Financial Year [VERIFY]",
        "legal": "MVP Act 1958 Sec 124; Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Tax Assessment Register",
        "name_mr": "कर आकारणी नोंदवही",
        "purpose": (
            "The master demographic and property database of all structures, trades, and water connections liable for Gram Panchayat taxation, "
            "increasingly informed by SVAMITVA drone data [VERIFY: mapping to official Namuna 8]."
        ),
        "fields": [
            "Property/Assessment Number (Geo-tagged ID if SVAMITVA mapped)",
            "Name of Owner/Occupier",
            "Type of Property (Residential/Commercial/Open Plot)",
            "Capital Value / Annual Letting Value",
            "Rate of Tax applied",
            "Total Assessed General Tax",
            "Total Assessed Special Taxes (Water, Light, Health)",
            "Exemptions applied",
        ],
        "validation": [
            "Assessed value and tax rates must strictly conform to the bylaws approved by the Zilla Parishad or State Government.",
            "Must not assess properties specifically exempted under MVP Act Sec 124 (e.g., certain SC/ST habitations or religious structures).",
        ],
    },
    9: {
        "folder": "Tax",
        "category": "Tax",
        "risk": "VERY HIGH",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "Daily",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Tax Demand and Collection Register",
        "name_mr": "कर मागणी व वसुली नोंदवही",
        "purpose": (
            "Tracks the real-time financial demand (current and arrears) for each taxpayer, alongside the collections made during the year, highlighting defaulters."
        ),
        "fields": [
            "Property/Assessment Number",
            "Name of Assessee",
            "Arrears Demand (carried forward)",
            "Current Year Demand (from Namuna 8)",
            "Total Demand",
            "Collection (Segmented by Current vs Arrears)",
            "Receipt Number (Namuna 10 reference)",
            "Date of Payment",
            "Outstanding Balance",
            "Remission/Write-off authorized by Gram Sabha",
        ],
        "validation": [
            "Current demand must equal the total assessed tax calculated in Namuna 8.",
            "Every collection entry must map to a unique and valid Namuna 10 receipt number.",
            "Equation: Total Collection + Outstanding Balance + Remission must perfectly equal Total Demand.",
        ],
    },
    10: {
        "folder": "Tax",
        "category": "Tax",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "N/A (Issued directly to citizen) [VERIFY]",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Tax and Fee Receipt Book",
        "name_mr": "कर व फी पावती",
        "purpose": (
            "The official, legally binding counterfoil receipt issued to citizens upon their payment of property taxes, water charges, or administrative service fees."
        ),
        "fields": [
            "Receipt Number (Pre-printed and sequentially numbered)",
            "Date of Issue",
            "Name of Payer",
            "Property/Assessment Number",
            "Amount Paid (Figures and Words)",
            "Particulars of Payment (Tax type, Arrears vs Current split)",
            "Signature of Receiver (Gram Sevak)",
        ],
        "validation": [
            "Receipt numbers must be strictly sequential; any canceled or missing numbers must be documented, preserved, and audited.",
            "The amount on the receipt must be posted identically to Namuna 5 (Cash Book) and Namuna 9 (Tax Collection) on the very same day.",
        ],
    },
    11: {
        "folder": "Receipt",
        "category": "Tax",
        "freq": "As needed",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "submitted": "Tax Defaulter",
        "deadline": "Legally required to be served 15 days before any attachment proceedings can begin [VERIFY]",
        "legal": "MVP Act 1958 Sec 129 [VERIFY]",
        "risk": "VERY HIGH",
        "name_en": "Notice of Demand",
        "name_mr": "मागणी नोटीस",
        "purpose": (
            "The first stage of coercive tax recovery; a formal legal notice served to defaulters who have failed to pay Gram Panchayat taxes within the stipulated time."
        ),
        "fields": [
            "Notice Number",
            "Date of Issue",
            "Name and Address of Defaulter",
            "Assessment Number",
            "Details of Arrears (Amount due)",
            "Notice Fee levied on the defaulter",
            "Deadline for payment",
            "Signature of Sarpanch/Gram Sevak",
        ],
        "validation": [
            "Must only be issued if Namuna 9 shows a positive outstanding balance beyond the statutory grace period.",
            "The amount demanded in the notice must equal the outstanding balance in Namuna 9 plus legally applicable notice fees.",
        ],
    },
    12: {
        "folder": "Expenditure",
        "category": "Tax",
        "risk": "VERY HIGH",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "MVP Act 1958 Sec 129 [VERIFY]",
        "name_en": "Warrant of Attachment",
        "name_mr": "जप्ती वॉरंट",
        "purpose": (
            "A severe legal warrant authorizing the physical attachment (seizure) of a defaulter's movable property if the Notice of Demand (Namuna 11) is ignored. "
            "[VERIFY: Maharashtra Namuna 12 is often the contingent voucher register — this TXT uses alternate mapping; cross-check official annex]."
        ),
        "fields": [
            "Warrant Number",
            "Date of Issue",
            "Reference Notice Number (from Namuna 11)",
            "Name of Defaulter",
            "Total Amount Due (including warrant execution fees)",
            "Authorization text for attachment of movable goods",
            "Signature of Sarpanch",
        ],
        "validation": [
            "Strictly cannot be issued unless a valid Namuna 11 was previously served and documented with proof of service.",
            "Must be signed strictly by the Sarpanch or authorized executive to be legally binding.",
        ],
    },
    13: {
        "folder": "Staff",
        "category": "Tax",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "MVP Act 1958 Sec 129 [VERIFY]",
        "name_en": "Inventory of Attached Property",
        "name_mr": "जप्त केलेल्या मालमत्तेची यादी",
        "purpose": (
            "A detailed, witnessed log of physical items seized from a defaulter's premises during the execution of a Warrant of Attachment (Namuna 12)."
        ),
        "fields": [
            "Inventory Date and Time",
            "Reference Warrant Number (Namuna 12)",
            "Name of Defaulter",
            "Itemized list of seized movable property",
            "Estimated market value of seized property",
            "Signature of Executing Officer",
            "Signatures of independent civilian witnesses (Panchas)",
        ],
        "validation": [
            "To prevent legal disputes, the inventory must contain the signatures of at least two independent civilian witnesses (Panchas).",
            "The estimated value of the attached property should be reasonably proportionate to the total tax arrears.",
        ],
    },
    14: {
        "folder": "Staff",
        "category": "Tax",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "MVP Act 1958 Sec 129 [VERIFY]",
        "name_en": "Register of Sale of Attached Property",
        "name_mr": "विक्री नोंदवही",
        "purpose": (
            "Records the administrative details and financial proceeds from the public auction of properties seized under Namuna 13."
        ),
        "fields": [
            "Date of Auction",
            "Inventory Reference (Namuna 13)",
            "Description of Item Sold",
            "Name of Purchaser",
            "Sale Amount Realized",
            "Auctioneer Signature",
            "Adjustment against Tax Arrears and Fees",
            "Surplus Amount (if any, marked for refund)",
        ],
        "validation": [
            "Sale proceeds must be posted directly to the Cash Book (Namuna 5) on the day of the auction.",
            "Tax arrears must be marked as paid up to the amount realized, adjusting the balance in Namuna 9, with any surplus handled via Namuna 32 (Refund Order).",
        ],
    },
    15: {
        "folder": "Staff",
        "category": "Property",
        "risk": "MEDIUM",
        "maintains": "Gram Sevak / Designated Pound Keeper",
        "approves": "Sarpanch",
        "freq": "Daily",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Cattle Trespass Act / Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Cattle Pound Register",
        "name_mr": "कोंडवाडा नोंदवही",
        "purpose": (
            "Documents stray, trespassing, or abandoned cattle impounded by the Gram Panchayat, including daily feeding costs and ownership claims."
        ),
        "fields": [
            "Date and Time of Impounding",
            "Description of Animal (Type, Color, Distinguishing Marks)",
            "Name of Person bringing the animal",
            "Name of Owner (if claimed)",
            "Number of Days Impounded",
            "Fines and Feeding Charges Assessed",
            "Date of Release or Auction",
        ],
        "validation": [
            "Animals unreleased after the statutory waiting period must be officially marked for public auction.",
            "Fees and fines calculated must conform exactly to the standard rates set by the GP or Zilla Parishad.",
        ],
    },
    16: {
        "folder": "Property",
        "category": "Receipt",
        "risk": "MEDIUM",
        "maintains": "Pound Keeper / Gram Sevak",
        "approves": "N/A (Issued directly) [VERIFY]",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Cattle Pound Receipt",
        "name_mr": "कोंडवाडा पावती",
        "purpose": (
            "The counterfoil receipt issued to an owner paying fines and fees to release their impounded animal, or to a purchaser at a cattle auction."
        ),
        "fields": [
            "Receipt Number",
            "Date of Issue",
            "Reference Number from Namuna 15",
            "Name of Payer",
            "Amount Paid (Split into Fine + Feeding charges)",
            "Signature of Receiver",
        ],
        "validation": [
            "Must directly cross-reference an active, unresolved entry in Namuna 15.",
            "Collected funds must be deposited and logged into the General Cash Book (Namuna 5) immediately.",
        ],
    },
    17: {
        "folder": "Advances",
        "category": "Works",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch / Panchayat Samiti",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Works / Tender Register",
        "name_mr": "कामांची नोंदवही / निविदा",
        "purpose": (
            "The central tracking ledger for all infrastructure and public works undertaken by the GP, chronicling the lifecycle from administrative approval to tender allocation."
        ),
        "fields": [
            "Serial Number",
            "Name and Description of Work",
            "Resolution Date of Gram Sabha / GP approving the work",
            "Administrative Approval Details (Authority, Date, Sanctioned Amount)",
            "Technical Sanction Details (Authority, Date)",
            "Tender Notice Date and Publication Details",
            "Name of Contractor Awarded",
            "Work Order Date",
        ],
        "validation": [
            "A work order cannot be recorded without a valid Gram Sabha/GP resolution and verified Technical Sanction.",
            "Estimated administrative cost must not exceed the approved budget provision from Namuna 1 / 2.",
        ],
    },
    18: {
        "folder": "Cash",
        "category": "Advances",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "Advances must typically be adjusted within one month [VERIFY]",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Advance Register",
        "name_mr": "आगाऊ रक्कम नोंदवही",
        "purpose": (
            "Tracks all temporary cash advances paid to staff, contractors, or elected representatives for official purposes, ensuring timely adjustment or recovery. "
            "[VERIFY: official Namuna 18 is often petty cash book — source TXT uses different numbering]."
        ),
        "fields": [
            "Date of Advance",
            "Name and Designation of Recipient",
            "Purpose of Advance",
            "Amount of Advance",
            "GP Resolution Number approving the advance",
            "Date of Adjustment / Recovery",
            "Cash Book (Namuna 5) Reference for adjustment",
        ],
        "validation": [
            "A new advance cannot legally be issued to an individual who possesses a prior unadjusted advance.",
            "The initial payout must be perfectly linked to a Namuna 5 payment entry.",
            "Adjustment requires the submission of physical bills, linking the final expenditure to Namuna 7 and refunding any unspent balance to Namuna 5.",
        ],
    },
    19: {
        "folder": "Works",
        "category": "Staff",
        "risk": "HIGH",
        "maintains": "Mukadam (Foreman) / Gram Sevak",
        "approves": "Gram Sevak / Inspecting Engineer",
        "freq": "Daily",
        "submitted": "Internal",
        "deadline": "End of the billing week/cycle",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Muster Roll",
        "name_mr": "हजेरीपट",
        "purpose": (
            "The daily attendance and wage record for daily-wage laborers employed by the GP for public works, sanitation, or emergency relief."
        ),
        "fields": [
            "Name of Work / Project",
            "Month and Specific Dates",
            "Name of Laborer",
            "Father's/Husband's Name",
            "Daily Attendance Status (Present/Absent)",
            "Total Days Worked",
            "Daily Wage Rate",
            "Total Amount Payable",
            "Signature/Thumb Impression of Laborer",
        ],
        "validation": [
            "Total days worked cannot mathematically exceed the days in the specified billing cycle.",
            "Must be physically verified and signed by the overseeing authority before processing the Namuna 21 Salary Bill or Namuna 20 bill chain.",
        ],
    },
    20: {
        "folder": "Works",
        "category": "Works",
        "risk": "VERY HIGH",
        "maintains": "Technical Officer / Junior Engineer / Gram Sevak [VERIFY]",
        "approves": "BDO / Executive Engineer / Sarpanch [VERIFY]",
        "freq": "Per Project",
        "submitted": "Panchayat Samiti",
        "deadline": "Prior to Work Order issuance / bill [VERIFY]",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Works chain — Estimate, Measurement Book, Work Bill",
        "name_mr": "कामाचा अंदाज / मोजमाप वही / कामाचे देयक",
        "purpose": (
            "This note merges source **Namuna 20** (Estimate), **Namuna 20A** (Measurement Book), and **Namuna 20B** (Work Bill) because the vault layout has a single [[Namuna-20]] file."
        ),
        "fields": [
            "**Estimate (20):** Name of Work; Reference to Namuna 17; Item Description; Quantity Estimated; Unit Rate (DSR); Total Estimated Cost; Contingencies; Total.",
            "**Measurement (20A):** Date of Measurement; Name of Work; Contractor; Item Description; Dimensions; Quantity Executed; signatures.",
            "**Work Bill (20B):** Bill Number and Date; Contractor; Name of Work; Value executed (from 20A); Deductions; Net payable; payee signature; passing order.",
        ],
        "validation": [
            "Unit rates must not exceed the current year's approved DSR without written justification [VERIFY].",
            "Total estimated cost must align with administrative approval limits in Namuna 17.",
            "Executed quantities cannot arbitrarily exceed estimated quantities in Namuna 20 without revised estimate [VERIFY].",
            "Bill value must map to Quantity (from 20A) × Approved Rate (from 20); statutory deductions before payment [source].",
            "Net amount must be logged in Namuna 5 and Namuna 7 once passed [source].",
        ],
    },
    21: {
        "folder": "Expenditure",
        "category": "Staff",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "Monthly",
        "submitted": "Internal",
        "deadline": "1st week of the subsequent month",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Salary Bill",
        "name_mr": "वेतन देयक",
        "purpose": (
            "Monthly payroll register for all GP employees (excluding state-paid Gram Sevaks), calculating gross pay and executing statutory deductions."
        ),
        "fields": [
            "Month and Year",
            "Name of Employee",
            "Designation",
            "Basic Pay",
            "Allowances",
            "Gross Salary",
            "Deductions (Provident Fund, Professional Tax, Advances)",
            "Net Amount Payable",
            "Signature/Thumb Impression of Employee",
        ],
        "validation": [
            "Daily wagers' pay must be verified against the days marked present in the Muster Roll (Namuna 19).",
            "Advance deductions must reconcile with the outstanding balances in the Advance Register (Namuna 18).",
            "Net pay must be logged as an outflow in Namuna 5 (Cash Book) and Namuna 7 (Classified Expenditure).",
        ],
    },
    22: {
        "folder": "Property",
        "category": "Property",
        "risk": "MEDIUM",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Dead Stock Register",
        "name_mr": "जड वस्तू नोंदवही",
        "purpose": (
            "Inventory log for all non-consumable, permanent assets purchased for GP administration, such as furniture, computers, and heavy machinery."
        ),
        "fields": [
            "Serial Number",
            "Date of Purchase",
            "Description of Article",
            "Quantity",
            "Rate and Total Cost",
            "Bill Number and Vendor Name",
            "Location of Item",
            "Final Disposal/Write-off details (with GP resolution)",
        ],
        "validation": [
            "Every purchase logged here must have a corresponding payment entry authorized in the Cash Book (Namuna 5).",
            "Feeds aggregated asset data into the Annual Assets & Liabilities statement (Namuna 4).",
            "Items cannot be written off without a formal Gram Sabha resolution.",
        ],
    },
    23: {
        "folder": "Property",
        "category": "Cash",
        "risk": "MEDIUM",
        "maintains": "Gram Sevak / Clerk",
        "approves": "Internal",
        "freq": "Daily",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Stamp Register",
        "name_mr": "मुद्रांक नोंदवही",
        "purpose": (
            "Tracks the purchase, usage, and exact balance of postage and revenue stamps used for official GP correspondence and legal documents. "
            "[VERIFY: official Maharashtra Namuna 23 is often roads register — source TXT differs]."
        ),
        "fields": [
            "Date",
            "Opening Balance of Stamps (Financial Value)",
            "Stamps Purchased (Value)",
            "Reference to Namuna 5 (for purchase)",
            "Stamps Consumed (Value)",
            "Details of Dispatch/Usage (Addressee)",
            "Closing Balance",
        ],
        "validation": [
            "Equation: Closing Balance = Opening Balance + Purchases - Consumption.",
            "Stamp purchases must perfectly map to petty cash or main cash payments in Namuna 5.",
        ],
    },
    24: {
        "folder": "Property",
        "category": "Property",
        "risk": "MEDIUM",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Stock Register for Consumables",
        "name_mr": "सामग्री नोंदवही",
        "purpose": (
            "Manages the inventory of consumable items (e.g., stationery, cleaning supplies, bleaching powder, street light bulbs) purchased by the GP."
        ),
        "fields": [
            "Date",
            "Description of Item",
            "Opening Balance",
            "Quantity Received",
            "Reference to Vendor Bill / Namuna 5",
            "Quantity Issued",
            "Name of Receiver/Location (e.g., Ward 3 Streetlights)",
            "Closing Balance",
        ],
        "validation": [
            "Stock received must map to a financial payment recorded in Namuna 5.",
            "Stock cannot be issued in excess of the available physical balance.",
        ],
    },
    25: {
        "folder": "Advances",
        "category": "Receipt",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Grant-in-aid Register",
        "name_mr": "अनुदान नोंदवही",
        "purpose": (
            "A detailed ledger tracking scheme-specific grants received from State and Central governments (e.g., Finance Commission grants, Jal Jeevan Mission funds)."
        ),
        "fields": [
            "Date of Receipt",
            "Name of Grant / Scheme",
            "Sanction Order Number and Date",
            "Amount Received",
            "Credited to Bank Account Details (PFMS/SNA mapping)",
            "Progressive Total of Grant",
        ],
        "validation": [
            "Grants must be logged here immediately and posted to the General Cash Book (Namuna 5).",
            "Must be correctly categorized in the Classified Register of Receipts (Namuna 6) under the exact scheme head to ensure funds are not diverted.",
        ],
    },
    26: {
        "folder": "Reporting",
        "category": "Advances",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Gram Sabha / Zilla Parishad",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Loan Register",
        "name_mr": "कर्ज नोंदवही",
        "purpose": (
            "Tracks long-term borrowings made by the GP from banks or the Zilla Parishad, including principal and interest repayment schedules. "
            "[VERIFY: official Namuna 26 is often monthly PS return — source TXT uses loan register at 26]."
        ),
        "fields": [
            "Date of Loan",
            "Source of Loan",
            "Purpose of Loan",
            "Total Amount Sanctioned",
            "Rate of Interest",
            "Repayment Schedule (EMI details)",
            "Principal Repaid",
            "Interest Paid",
            "Outstanding Balance",
        ],
        "validation": [
            "Inflow of loan principal must be logged as a receipt in Namuna 5.",
            "Outflow of EMI (Principal + Interest) must be logged as an expenditure in Namuna 5.",
            "The outstanding principal must reflect accurately in the Liabilities section of Namuna 4.",
        ],
    },
    27: {
        "folder": "Reporting",
        "category": "Audit",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Gram Sabha / Auditor",
        "freq": "Upon receiving audit report",
        "submitted": "Panchayat Samiti",
        "deadline": "Compliance report typically due within 3 months of audit [VERIFY]",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Audit Objection Compliance Register",
        "name_mr": "आक्षेप पूर्तता नोंदवही",
        "purpose": (
            "Tracks the steps taken by the GP to rectify anomalies, correct procedural errors, or recover funds flagged during statutory financial audits."
        ),
        "fields": [
            "Audit Year",
            "Audit Paragraph / Objection Number (from Namuna 30)",
            "Description of Objection",
            "Amount Involved for Recovery (if any)",
            "Action Taken by GP",
            "Resolution Number of Gram Sabha approving compliance",
            "Date of Final Settlement by Auditor",
        ],
        "validation": [
            "Every active objection in Namuna 30 must have a corresponding tracking row in Namuna 27.",
            "An objection cannot be marked \"Settled\" in the system without documented approval from the statutory auditor.",
        ],
    },
    28: {
        "folder": "Reporting",
        "category": "Property",
        "risk": "MEDIUM",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Register of Investments",
        "name_mr": "गुंतवणूक नोंदवही",
        "purpose": (
            "Records reserve funds, fixed deposits, or surplus GP funds invested in authorized securities or cooperative banks to generate interest."
        ),
        "fields": [
            "Date of Investment",
            "Bank / Institution Name",
            "Type of Investment (FD, Bonds)",
            "Instrument Number",
            "Amount Invested",
            "Interest Rate & Maturity Date",
            "Maturity Value",
            "Date of Realization",
        ],
        "validation": [
            "Initial outflow of cash must map to a payment in Namuna 5.",
            "Active investments must feed into the Assets column of Namuna 4.",
            "Realized investments (principal + interest) must be returned to the Cash Book (Namuna 5) upon maturity.",
        ],
    },
    29: {
        "folder": "Advances",
        "category": "Advances",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Register of Deposits",
        "name_mr": "अनामत नोंदवही",
        "purpose": (
            "Tracks security deposits and earnest money deposits (EMD) collected from contractors, ensuring they are held in trust and accurately refunded or forfeited."
        ),
        "fields": [
            "Date of Receipt",
            "Name of Depositor (Contractor/Bidder)",
            "Tender/Work Reference (Namuna 17)",
            "Amount of Deposit",
            "Cash Book (Namuna 5) Receipt Reference",
            "Date of Refund or Forfeiture",
            "Cash Book (Namuna 5) Payment Reference (for refund)",
        ],
        "validation": [
            "Deposits must be logged as receipts in Namuna 5.",
            "Unrefunded deposits represent a liability and must feed into Namuna 4.",
            "Refunds must map to a payment in Namuna 5 and be authorized by the Sarpanch.",
        ],
    },
    30: {
        "folder": "Reporting",
        "category": "Audit",
        "risk": "VERY HIGH",
        "maintains": "Gram Sevak",
        "approves": "Auditor",
        "freq": "Annual",
        "submitted": "Gram Sabha",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Audit Objection Register",
        "name_mr": "लेखा आक्षेप नोंदवही",
        "purpose": (
            "The master log of all anomalies, missing vouchers, and financial irregularities identified by the Local Fund Audit or Accountant General."
        ),
        "fields": [
            "Audit Year",
            "Date of Audit Report",
            "Paragraph Number",
            "Brief Nature of Objection",
            "Financial Implication",
            "Status (Pending/Settled)",
        ],
        "validation": [
            "Derived from the auditing of the Annual Administration Report (Namuna 31) and associated ledgers.",
            "Remains 'Pending' until explicitly resolved in Namuna 27.",
        ],
    },
    31: {
        "folder": "Expenditure",
        "category": "Reporting",
        "risk": "VERY HIGH",
        "maintains": "Gram Sevak",
        "approves": "Gram Sabha",
        "freq": "Annual",
        "submitted": "Panchayat Samiti",
        "deadline": "[VERIFY]",
        "legal": "MVP Act 1958 Sec 62 / Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Annual Administration Report",
        "name_mr": "वार्षिक प्रशासन अहवाल",
        "purpose": (
            "The definitive annual summary representing the progress, financial health, and administrative actions of the Gram Panchayat, acting as a mirror of its overall performance."
        ),
        "fields": [
            "Financial Year",
            "Total Receipts (from Namuna 3)",
            "Total Expenditure (from Namuna 3)",
            "Tax Collection Efficiency (from Namuna 9)",
            "Infrastructure Works Completed (from Namuna 20)",
            "Gram Sabha Meeting Dates & Resolutions",
            "Status of Assets & Liabilities (from Namuna 4)",
        ],
        "validation": [
            "Financial aggregates must perfectly match the audited Namuna 3 and Namuna 4.",
            "Forms the basis upon which statutory auditors generate Namuna 30 (Objections).",
        ],
    },
    32: {
        "folder": "Expenditure",
        "category": "Receipt",
        "risk": "HIGH",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "Refund Order",
        "name_mr": "परतावा आदेश",
        "purpose": (
            "Formal authorization for refunding excess taxes collected, surplus auction proceeds, or erroneously credited fees back to citizens."
        ),
        "fields": [
            "Date of Order",
            "Name of Payee",
            "Original Receipt Number (Namuna 10) or Tax Register Reference (Namuna 9)",
            "Reason for Refund",
            "Amount to be Refunded",
            "Signature of Sarpanch",
        ],
        "validation": [
            "A refund cannot exceed the original amount paid in Namuna 10/Namuna 9.",
            "The approved order acts as a voucher to authorize an expenditure payout in the Cash Book (Namuna 5).",
        ],
    },
    33: {
        "folder": "Property",
        "category": "Reporting",
        "risk": "MEDIUM",
        "maintains": "Gram Sevak",
        "approves": "Sarpanch",
        "freq": "As needed",
        "submitted": "Internal",
        "deadline": "N/A",
        "legal": "Lekha Sanhita 2011 [VERIFY]",
        "name_en": "General / Miscellaneous Register",
        "name_mr": "इतर नोंदवही (किंवा सामान्य नोंदवही)",
        "purpose": (
            "A catch-all register for recording events, schemes, or specialized demographics not covered by the standard 32 registers."
        ),
        "fields": [
            "Date",
            "Subject / Category",
            "Description of Entry",
            "Relevant Financial Implication (if any)",
            "Signatures",
        ],
        "validation": [
            "Must absolutely not be used for transactions that legally require posting in Namuna 1 through 32 to prevent obfuscation of financial data.",
        ],
    },
}


def pad(n: int) -> str:
    return f"{n:02d}"


# Directed edges: feeder FEEDS_INTO receiver (feeder -> receiver)
EDGES: list[tuple[int, int]] = [
    (1, 2),
    (1, 3),
    (2, 3),
    (5, 4),
    (5, 6),
    (5, 7),
    (5, 18),
    (5, 22),
    (5, 23),
    (5, 24),
    (5, 26),
    (5, 28),
    (5, 29),
    (6, 3),
    (7, 3),
    (8, 9),
    (9, 10),
    (9, 11),
    (9, 31),
    (9, 32),
    (10, 5),
    (10, 9),
    (11, 12),
    (12, 13),
    (13, 14),
    (14, 5),
    (14, 9),
    (14, 32),
    (15, 16),
    (16, 5),
    (17, 20),
    (17, 29),
    (18, 5),
    (18, 7),
    (19, 21),
    (19, 20),
    (20, 5),
    (20, 7),
    (21, 5),
    (21, 7),
    (22, 4),
    (23, 5),
    (24, 5),
    (25, 5),
    (25, 6),
    (26, 4),
    (26, 5),
    (27, 30),
    (28, 4),
    (28, 5),
    (29, 4),
    (29, 5),
    (30, 27),
    (31, 30),
    (32, 5),
    (3, 31),
    (4, 31),
    (9, 31),
    (20, 31),
    (18, 21),
    (10, 32),
]


def build_links() -> dict[int, tuple[set[int], set[int]]]:
    feeds: dict[int, set[int]] = {i: set() for i in DATA}
    deps: dict[int, set[int]] = {i: set() for i in DATA}
    for a, b in EDGES:
        if a in DATA and b in DATA:
            feeds[a].add(b)
            deps[b].add(a)
    return {i: (deps[i], feeds[i]) for i in DATA}


LINKS = build_links()


def fmt_links(ids: set[int]) -> str:
    if not ids:
        return "None"
    return ", ".join(f"[[Namuna-{pad(i)}]]" for i in sorted(ids))


def render_note(n: int) -> str:
    d = DATA[n]
    category = d["category"]
    dep, fed = LINKS[n]
    purpose = d["purpose"] if isinstance(d["purpose"], str) else " ".join(d["purpose"])
    fields = "\n".join(f"- {x}" for x in d["fields"])
    val = "\n".join(f"- {x}" for x in d["validation"])
    related = sorted(dep | fed)
    related_s = ", ".join(f"[[Namuna-{pad(i)}]]" for i in related) if related else "None"

    return f"""---
namuna: {n}
name_en: {d['name_en']}
name_mr: {d['name_mr']}
category: {category}
who_maintains: {d['maintains']}
who_approves: {d['approves']}
frequency: {d['freq']}
submitted_to: {d['submitted']}
audit_risk: {d['risk']}
tags: [namuna, {category.lower()}, gram-panchayat]
---

# Namuna {pad(n)} — {d['name_mr']} ({d['name_en']})

| Category | Who Maintains | Who Approves | Frequency | Submission Deadline | Submitted To | Audit Risk | Legal Reference |
|----------|---------------|--------------|-----------|----------------------|--------------|------------|-----------------|
| {category} | {d['maintains']} | {d['approves']} | {d['freq']} | {d['deadline']} | {d['submitted']} | {d['risk']} | {d['legal']} |

## Purpose

{purpose}

## Key Fields

{fields}

## Dependencies

- Depends On: {fmt_links(dep)}
- Feeds Into: {fmt_links(fed)}

## Validation Rules

{val}

## Audit Risk — {d['risk']}

- Source-derived controls and common audit focus; cross-check every numeric rule against **Lekha Sanhita 2011** and current **GR**s [VERIFY].
- This vault mirrors **Gram Panchayat Namune Requirements Document.txt** (workspace); numbering may differ from ZP-printed **Namuna 1–33** titles [VERIFY].

## Related Registers

{related_s}
"""


MOC_SPECS = [
    ("Budget", "Budget", 2, ["01", "02"]),
    ("Cash", "Cash", 2, ["05", "18"]),
    ("Tax", "Tax", 3, ["08", "09", "10"]),
    ("Receipt", "Receipt", 3, ["06", "07", "11"]),
    ("Expenditure", "Expenditure", 4, ["12", "21", "31", "32"]),
    ("Works", "Works", 2, ["19", "20"]),
    ("Staff", "Staff", 3, ["13", "14", "15"]),
    ("Property", "Property", 5, ["16", "22", "23", "24", "33"]),
    ("Advances", "Advances", 3, ["17", "25", "29"]),
    ("Reporting", "Reporting", 6, ["03", "04", "26", "27", "28", "30"]),
]


def render_moc(folder_name: str, tag: str, count: int, files: list[str]) -> str:
    # table rows
    rows = []
    for f in files:
        n = int(f)
        d = DATA[n]
        rows.append(
            f"| [[Namuna-{f}]] | {d['name_mr']} | {d['name_en']} | {d['freq']} | {d['risk']} |"
        )
    table = "\n".join(rows)
    nums = [int(x) for x in files]
    return f"""---
moc: true
group: {folder_name}
namune_count: {count}
tags: [moc, {tag}, gram-panchayat]
---

# MOC — {folder_name}

## Overview

This map-of-content groups Maharashtra Gram Panchayat registers (Namune) that sit in **Namune/{folder_name}/** for the Cursor draft vault. Links use `[[Namuna-XX]]` (zero-padded) for graph consistency.

## Namune in This Group

| Namuna | Name (MR) | English | Frequency | Audit Risk |
|--------|-----------|---------|-----------|------------|
{table}

## Flow / Dependencies

ASCII overview (see individual notes for exact Depends On / Feeds Into):

```
[Upstream ledgers] --> Namune in {folder_name} --> Cash Book (05) / Reporting (03/04/31) / Audit (27/30)
```

## Key Rules

- Keep **bidirectional** wikilinks aligned: if A lists B under Feeds Into, B lists A under Depends On [VERIFY during edits].
- Reconcile totals to **Namuna-05** (cash book) unless the source explicitly exempts [VERIFY].

## Dataview Query

```dataview
TABLE name_mr, frequency, audit_risk, submitted_to
FROM "Namune/{folder_name}"
WHERE namuna > 0
SORT namuna ASC
```
"""


def master_moc() -> str:
    rows = []
    moc_rows = []
    for folder, tag, count, files in MOC_SPECS:
        moc_name = f"MOC-{folder}.md"
        moc_rows.append(f"| {folder} | {', '.join(f'[[Namuna-{f}]]' for f in files)} | [[MOC-{folder}]] |")
        for f in files:
            n = int(f)
            d = DATA[n]
            rows.append(
                f"| {n} | {d['name_mr']} | {d['name_en']} | {d['category']} | {d['risk']} | [[Namuna-{f}]] | [[MOC-{folder}]] |"
            )
    all_rows = "\n".join(rows)
    all_moc = "\n".join(moc_rows)
    return f"""---
moc: true
title: Maharashtra GP 33 Namune — Master Map of Content (Cursor Draft)
jurisdiction: Maharashtra — Gram Panchayat level only
legal_basis: Maharashtra Village Panchayats Act 1958; Maharashtra GP Lekha Sanhita 2011
source: Cursor draft (2026-04-18) — for cross-AI reconciliation
tags: [moc, master, gram-panchayat, namune, lekha-sanhita]
---

> **Cursor draft** — compare with Claude draft at `docs/superpowers/namune-vault/MOC-Master.md` [VERIFY path exists].

# Maharashtra GP — 33 Namune: Master Map of Content (Cursor Draft)

## All Namune

| # | Marathi Name | English | Category | Risk | Note | MOC |
|---|--------------|---------|----------|------|------|-----|
{all_rows}

## Group MOC table

| Group | Namune | MOC |
|-------|--------|-----|
{all_moc}

## Critical Daily Path

1. **[[Namuna-10]]** / **[[Namuna-16]]** / **[[Namuna-25]]** receipts posted same day to **[[Namuna-05]]**.
2. **[[Namuna-06]]** / **[[Namuna-07]]** classified postings from **[[Namuna-05]]** (typically daily).
3. **[[Namuna-09]]** tax collections tied to **[[Namuna-10]]** and cash book.

## High-Risk Registers (VERY HIGH only)

| Namuna | Why |
|--------|-----|
| [[Namuna-01]] | Budget is statutory root; errors cascade [source]. |
| [[Namuna-05]] | Central cash hub; highest linkage [source narrative]. |
| [[Namuna-09]] | Tax demand vs collection equation [source]. |
| [[Namuna-12]] | Coercive recovery instrument [source]. |
| [[Namuna-20]] | Works estimate / measurement / billing chain [source]. |
| [[Namuna-30]] | Audit objections master [source]. |
| [[Namuna-31]] | Annual administration report feeds audit [source]. |

## Open VERIFY Items

1. Align every **Namuna title** with ZP-printed **Lekha Sanhita 2011** annex (this TXT remaps several numbers vs standard Maharashtra tables).
2. Confirm **Namuna-12** as warrant vs **contingent voucher** in official set.
3. Confirm **Namuna-18** as advance register vs **petty cash book** in official set.
4. Confirm **Namuna-23** as stamp register vs **roads register** in official set.
5. Confirm **Namuna-26** as loan register vs **monthly PS return** in official set.
6. Replace `[VERIFY]` deadlines with **CEO ZP / PS** circular dates for your district.
"""


def main() -> None:
    for n, d in DATA.items():
        folder = d["folder"]
        path = ROOT / "Namune" / folder / f"Namuna-{pad(n)}.md"
        path.write_text(render_note(n), encoding="utf-8")
    for folder, tag, count, files in MOC_SPECS:
        (ROOT / "Namune" / folder / f"MOC-{folder}.md").write_text(
            render_moc(folder, tag, count, files), encoding="utf-8"
        )
    (ROOT / "MOC-Master.md").write_text(master_moc(), encoding="utf-8")
    print("Wrote", len(DATA), "namuna notes +", len(MOC_SPECS), "category MOCs + MOC-Master.md")


if __name__ == "__main__":
    main()
