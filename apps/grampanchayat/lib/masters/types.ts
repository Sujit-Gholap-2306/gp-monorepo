/** Tier-1 master entities — subset aligned with docs/specs/2026-04-18-maharashtra-gp-master-modules.md */

export interface GpProfile {
  id: string
  nameMr: string
  nameEn: string
  gpCode: string
  districtMr: string
  talukaMr: string
  panchayatSamitiMr: string
  sarpanchNameMr: string
  sarpanchMobile: string
  gramSevakNameMr: string
  gramSevakMobile: string
  addressMr: string
}

export interface FinancialYear {
  id: string
  labelMr: string
  labelEn: string
  /** ISO date */
  startDate: string
  endDate: string
  status: 'active' | 'closed'
}

export interface AssessmentYear {
  id: string
  labelMr: string
  labelEn: string
  resolutionNumber: string
  /** ISO date */
  resolutionDate: string
  status: 'active' | 'closed'
}

export interface AccountHead {
  id: string
  code: string
  descriptionMr: string
  descriptionEn: string
  category: 'income' | 'expenditure'
  subCategory: string
}

export interface BankAccount {
  id: string
  bankNameMr: string
  branchMr: string
  accountNumber: string
  ifsc: string
  accountType: 'savings' | 'current' | 'fd'
}

export interface Citizen {
  id: string
  nameMr: string
  nameEn?: string
  aadhaarLast4?: string
  mobile: string
  wardNumber: string
  addressMr: string
  householdId?: string
}

export type ElectedRole = 'sarpanch' | 'upa_sarpanch' | 'ward_member'

export interface ElectedMember {
  id: string
  nameMr: string
  wardNumber: string
  role: ElectedRole
  electionDate: string
  tenureEndDate: string
  mobile: string
}

export interface MasterSnapshot {
  gpProfile: GpProfile
  financialYears: FinancialYear[]
  assessmentYears: AssessmentYear[]
  accountHeads: AccountHead[]
  bankAccounts: BankAccount[]
  citizens: Citizen[]
  electedMembers: ElectedMember[]
}

export interface MasterSnapshotEnvelope {
  id: 'default'
  version: number
  data: MasterSnapshot
  updatedAt: string
}
