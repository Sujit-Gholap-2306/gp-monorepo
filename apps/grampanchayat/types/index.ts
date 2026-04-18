// ─── Namuna 8 — Property Tax Assessment Register ────────────────────────────
// Rule 32(1), Maharashtra Village Panchayats (Property Tax) Rules

export type PropertyType =
  | 'jhopdi_mati'     // झोपडी किंवा मातीचे घर
  | 'dagad_vit_mati'  // दगड विटांचे मातीचे घर
  | 'dagad_vit_pucca' // दगड विटांचे चुना / सिमेंट पक्के घर
  | 'navi_rcc'        // नवीन आर सी सी पद्धतीचे घर
  | 'bakhal'          // बखळ किंवा पडसर जागा

export type AgeBracket =
  | '0-2' | '2-5' | '5-10' | '10-20' | '20-30'
  | '30-40' | '40-50' | '50-60' | '60+'

export interface Namuna8Property {
  id: string
  serialNo: number
  propertyNo: string          // मालमत्ता क्रमांक
  streetName?: string         // रस्त्याचे नाव
  ownerName: string           // मालकाचे नाव
  occupantName: string        // भोगवटदाराचे नाव
  propertyType: PropertyType
  ageBracket: AgeBracket
  lengthFt: number
  widthFt: number
  // Rates (from master rate config)
  rrLandRate: number          // जमीन दर ₹/sqm
  rrConstructionRate: number  // बांधकाम दर ₹/sqm
  depreciationRate: number    // घसारा दर (0–1)
  usageWeightage: number      // भारांक
  taxRatePaise: number        // कराचा दर (पैसे)
  // Taxes (actual from register)
  houseTax: number            // घरपट्टी
  diwabatti: number           // दिवाबत्ती
  arogya: number              // आरोग्य
  panipatti: number           // पाणीपट्टी
  shera?: string              // शेरा
  // Meta
  assessmentPeriod: string    // e.g. "२०२१/२२ ते २०२४/२५"
  village: string
  taluka: string
  district: string
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  jhopdi_mati:     'झोपडी / मातीचे घर',
  dagad_vit_mati:  'दगड विटांचे मातीचे घर',
  dagad_vit_pucca: 'दगड विटांचे पक्के घर',
  navi_rcc:        'नवीन आर सी सी घर',
  bakhal:          'बखळ / पडसर जागा',
}

export const AGE_BRACKET_LABELS: Record<AgeBracket, string> = {
  '0-2':   '० ते २ वर्ष',
  '2-5':   '२ ते ५ वर्ष',
  '5-10':  '५ ते १० वर्ष',
  '10-20': '१० ते २० वर्ष',
  '20-30': '२० ते ३० वर्ष',
  '30-40': '३० ते ४० वर्ष',
  '40-50': '४० ते ५० वर्ष',
  '50-60': '५० ते ६० वर्ष',
  '60+':   '६० वर्षांपेक्षा जास्त',
}

// ─── Legacy types (kept for existing pages) ──────────────────────────────────

export type AreaUnit = 'acre' | 'hectare' | 'gunta'
export type LandType = 'irrigated' | 'non-irrigated' | 'barren' | 'residential' | 'commercial'
export type UtaraStatus = 'active' | 'pending' | 'disputed' | 'transferred'

export interface Utara {
  id: string
  surveyNumber: string
  khataNumber?: string
  ownerName: string
  ownerContact?: string
  village: string
  taluka: string
  district: string
  area: number
  areaUnit: AreaUnit
  landType: LandType
  status: UtaraStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export type UtaraInput = Omit<Utara, 'id' | 'createdAt' | 'updatedAt'>

export const AREA_UNIT_LABELS: Record<AreaUnit, string> = {
  acre: 'एकर',
  hectare: 'हेक्टर',
  gunta: 'गुंठा',
}

export const LAND_TYPE_LABELS: Record<LandType, string> = {
  irrigated: 'बागायत',
  'non-irrigated': 'जिरायत',
  barren: 'माळरान',
  residential: 'निवासी',
  commercial: 'व्यापारी',
}

export const STATUS_LABELS: Record<UtaraStatus, string> = {
  active: 'चालू',
  pending: 'प्रलंबित',
  disputed: 'वादग्रस्त',
  transferred: 'हस्तांतरित',
}

export const STATUS_COLORS: Record<UtaraStatus, string> = {
  active: 'text-green-700 bg-green-50 border-green-200',
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  disputed: 'text-red-700 bg-red-50 border-red-200',
  transferred: 'text-slate-600 bg-slate-100 border-slate-200',
}
