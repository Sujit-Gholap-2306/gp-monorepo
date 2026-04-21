/**
 * Mock data for the /preview Civic Elegant showcase.
 * Represents a fictional Gram Panchayat ("Satara-Karhad / Mauje Deshmukhwadi").
 * All bilingual (mr/en) to mirror the real tenant shape.
 */

export const previewVillage = {
  name_mr: 'ग्रामपंचायत देशमुखवाडी',
  name_en: 'Gram Panchayat Deshmukhwadi',
  tagline_mr: 'परंपरेचे मूळ, प्रगतीची दिशा',
  tagline_en: 'Rooted in tradition · Moving with progress',
  taluka: 'कराड',
  taluka_en: 'Karhad',
  district: 'सातारा',
  district_en: 'Satara',
  pincode: '415110',
  established: 1952,
  area_hectares: 842,
  wards: 9,
  households: 1284,
  population: 5632,
  literacy_pct: 87.4,
  sarpanch_name_mr: 'श्रीमती सुनिता विठ्ठल देशमुख',
  sarpanch_name_en: 'Smt. Sunita Vitthal Deshmukh',
}

export type PreviewAnnouncement = {
  id: string
  title_mr: string
  title_en: string
  category_mr: string
  category_en: string
  date: string
  summary_mr: string
  summary_en: string
  priority: 'high' | 'normal'
}

export const previewAnnouncements: PreviewAnnouncement[] = [
  {
    id: 'a1',
    title_mr: 'ग्रामसभा — फेब्रुवारी २०२६',
    title_en: 'Gram Sabha — February 2026',
    category_mr: 'ग्रामसभा',
    category_en: 'Gram Sabha',
    date: '2026-05-02',
    summary_mr: 'सर्व ग्रामस्थांनी उपस्थित राहावे. अर्थसंकल्प, पाणीपुरवठा व रस्ते दुरुस्तीवर चर्चा.',
    summary_en: 'All residents are invited. Agenda: budget, water supply, road repair.',
    priority: 'high',
  },
  {
    id: 'a2',
    title_mr: 'घरपट्टी भरण्यास २०% सूट — अंतिम मुदत',
    title_en: '20% Property Tax Rebate — Final Window',
    category_mr: 'कर',
    category_en: 'Tax',
    date: '2026-04-30',
    summary_mr: '३० एप्रिलपूर्वी पूर्ण घरपट्टी भरल्यास २०% सूट लागू.',
    summary_en: 'Pay in full before 30 April and receive a 20% rebate.',
    priority: 'normal',
  },
  {
    id: 'a3',
    title_mr: 'सौर पथदिवे — प्रभाग ३ व ५',
    title_en: 'Solar Streetlights — Wards 3 & 5',
    category_mr: 'पायाभूत सुविधा',
    category_en: 'Infrastructure',
    date: '2026-04-18',
    summary_mr: '४२ नवीन सौर पथदिवे यशस्वीरित्या कार्यान्वित.',
    summary_en: '42 new solar streetlights commissioned and live.',
    priority: 'normal',
  },
  {
    id: 'a4',
    title_mr: 'स्वच्छता अभियान — मे महिना',
    title_en: 'Swachhata Abhiyan — May Month',
    category_mr: 'कार्यक्रम',
    category_en: 'Programme',
    date: '2026-05-01',
    summary_mr: 'दर रविवारी सकाळी ७ वाजता स्वच्छता मोहीम.',
    summary_en: 'Weekly Sunday cleanliness drives at 7:00 AM.',
    priority: 'normal',
  },
]

export type PreviewMember = {
  id: string
  name_mr: string
  name_en: string
  role_mr: string
  role_en: string
  ward: number
  tenure: string
  initials: string
  accentHue: number
}

export const previewMembers: PreviewMember[] = [
  {
    id: 'm1',
    name_mr: 'श्रीमती सुनिता वि. देशमुख',
    name_en: 'Smt. Sunita V. Deshmukh',
    role_mr: 'सरपंच',
    role_en: 'Sarpanch',
    ward: 1,
    tenure: '2024—2029',
    initials: 'सु',
    accentHue: 35,
  },
  {
    id: 'm2',
    name_mr: 'श्री. अनिल रा. पाटील',
    name_en: 'Shri. Anil R. Patil',
    role_mr: 'उपसरपंच',
    role_en: 'Deputy Sarpanch',
    ward: 4,
    tenure: '2024—2029',
    initials: 'अ',
    accentHue: 20,
  },
  {
    id: 'm3',
    name_mr: 'श्री. प्रकाश जा. शिंदे',
    name_en: 'Shri. Prakash J. Shinde',
    role_mr: 'ग्रामसेवक',
    role_en: 'Gram Sevak',
    ward: 0,
    tenure: '—',
    initials: 'प्र',
    accentHue: 190,
  },
  {
    id: 'm4',
    name_mr: 'श्रीमती नंदा मा. जाधव',
    name_en: 'Smt. Nanda M. Jadhav',
    role_mr: 'सदस्य',
    role_en: 'Member',
    ward: 2,
    tenure: '2024—2029',
    initials: 'न',
    accentHue: 300,
  },
  {
    id: 'm5',
    name_mr: 'श्री. राजेंद्र द. मोरे',
    name_en: 'Shri. Rajendra D. More',
    role_mr: 'सदस्य',
    role_en: 'Member',
    ward: 5,
    tenure: '2024—2029',
    initials: 'रा',
    accentHue: 260,
  },
  {
    id: 'm6',
    name_mr: 'श्रीमती स्वाती हि. साळुंखे',
    name_en: 'Smt. Swati H. Salunkhe',
    role_mr: 'सदस्य',
    role_en: 'Member',
    ward: 7,
    tenure: '2024—2029',
    initials: 'स्वा',
    accentHue: 150,
  },
]

export type PreviewEvent = {
  id: string
  title_mr: string
  title_en: string
  date: string
  time: string
  venue_mr: string
  venue_en: string
  tag_mr: string
  tag_en: string
}

export const previewEvents: PreviewEvent[] = [
  {
    id: 'e1',
    title_mr: 'महाराष्ट्र दिन — ध्वजारोहण',
    title_en: 'Maharashtra Day — Flag Hoisting',
    date: '2026-05-01',
    time: '08:00',
    venue_mr: 'ग्रामपंचायत कार्यालय',
    venue_en: 'Gram Panchayat Office',
    tag_mr: 'राष्ट्रीय',
    tag_en: 'National',
  },
  {
    id: 'e2',
    title_mr: 'वटपौर्णिमा उत्सव',
    title_en: 'Vat Purnima Festival',
    date: '2026-06-11',
    time: '06:30',
    venue_mr: 'वडाच्या झाडाखाली',
    venue_en: 'Under the Banyan Tree',
    tag_mr: 'सण',
    tag_en: 'Festival',
  },
  {
    id: 'e3',
    title_mr: 'वृक्षारोपण मोहीम',
    title_en: 'Tree Plantation Drive',
    date: '2026-07-05',
    time: '07:00',
    venue_mr: 'गायरान जमीन, प्रभाग ४',
    venue_en: 'Gairan Land, Ward 4',
    tag_mr: 'पर्यावरण',
    tag_en: 'Environment',
  },
  {
    id: 'e4',
    title_mr: 'आरोग्य शिबिर',
    title_en: 'Health Camp',
    date: '2026-05-18',
    time: '09:00',
    venue_mr: 'जिल्हा परिषद शाळा',
    venue_en: 'ZP School Hall',
    tag_mr: 'आरोग्य',
    tag_en: 'Health',
  },
]

export type PreviewAchievement = {
  year: string
  title_mr: string
  title_en: string
  body_mr: string
  body_en: string
  medal: 'gold' | 'silver' | 'bronze'
}

export const previewAchievements: PreviewAchievement[] = [
  {
    year: '2025',
    title_mr: 'स्मार्ट ग्राम पुरस्कार — राज्य',
    title_en: 'Smart Gram Award — State',
    body_mr: 'महाराष्ट्र शासनाच्या ग्रामविकास विभागाकडून "स्मार्ट ग्राम" पुरस्कार.',
    body_en: 'Conferred by Maharashtra Rural Development Dept.',
    medal: 'gold',
  },
  {
    year: '2024',
    title_mr: 'ODF+ प्रमाणपत्र',
    title_en: 'ODF+ Certification',
    body_mr: 'स्वच्छ भारत मिशनांतर्गत ODF+ दर्जा यशस्वीरित्या प्राप्त.',
    body_en: 'ODF+ status under Swachh Bharat Mission.',
    medal: 'silver',
  },
  {
    year: '2023',
    title_mr: 'पाणीदार गाव — जिल्हा',
    title_en: 'Paanidar Gaon — District',
    body_mr: 'जलसंधारण कार्यातील उत्कृष्टतेबद्दल जिल्हास्तरीय पारितोषिक.',
    body_en: 'District award for watershed excellence.',
    medal: 'gold',
  },
  {
    year: '2022',
    title_mr: '१००% शाळा प्रवेश',
    title_en: '100% School Enrolment',
    body_mr: '६-१४ वयोगटातील प्रत्येक बालक शाळेत नोंदणीकृत.',
    body_en: 'Every child aged 6—14 enrolled in school.',
    medal: 'silver',
  },
  {
    year: '2021',
    title_mr: 'सौर ग्राम — पहिला टप्पा',
    title_en: 'Solar Gram — Phase I',
    body_mr: 'सर्व सार्वजनिक इमारतींवर सौर ऊर्जा यंत्रणा.',
    body_en: 'Solar on every public building.',
    medal: 'bronze',
  },
]

export type PreviewProgress = {
  id: string
  title_mr: string
  title_en: string
  progress: number
  budget_lakh: number
  spent_lakh: number
  icon: 'road' | 'water' | 'solar' | 'school' | 'health' | 'drain'
}

export const previewProgress: PreviewProgress[] = [
  {
    id: 'p1',
    title_mr: 'अंतर्गत रस्ते — सिमेंट काँक्रिटीकरण',
    title_en: 'Internal Roads — Cement Concretisation',
    progress: 82,
    budget_lakh: 145,
    spent_lakh: 119,
    icon: 'road',
  },
  {
    id: 'p2',
    title_mr: 'पिण्याच्या पाण्याची जलवाहिनी',
    title_en: 'Potable Water Pipeline',
    progress: 94,
    budget_lakh: 88,
    spent_lakh: 83,
    icon: 'water',
  },
  {
    id: 'p3',
    title_mr: 'सौर पथदिवे — ग्रामपंचायत',
    title_en: 'Solar Streetlights — Village-wide',
    progress: 100,
    budget_lakh: 42,
    spent_lakh: 42,
    icon: 'solar',
  },
  {
    id: 'p4',
    title_mr: 'प्राथमिक शाळा डिजिटलायझेशन',
    title_en: 'Primary School Digitalisation',
    progress: 68,
    budget_lakh: 28,
    spent_lakh: 19,
    icon: 'school',
  },
  {
    id: 'p5',
    title_mr: 'उपकेंद्र आरोग्य सुविधा',
    title_en: 'Sub-centre Health Facility',
    progress: 55,
    budget_lakh: 65,
    spent_lakh: 36,
    icon: 'health',
  },
  {
    id: 'p6',
    title_mr: 'सांडपाणी निचरा प्रणाली',
    title_en: 'Stormwater Drainage System',
    progress: 40,
    budget_lakh: 110,
    spent_lakh: 44,
    icon: 'drain',
  },
]

export type PreviewGalleryItem = {
  id: string
  title_mr: string
  title_en: string
  aspect: number
  hue: number
  type: 'photo' | 'video'
}

export const previewGallery: PreviewGalleryItem[] = [
  { id: 'g1', title_mr: 'गणेशोत्सव', title_en: 'Ganeshotsav', aspect: 4 / 5, hue: 30, type: 'photo' },
  { id: 'g2', title_mr: 'शेतकरी मेळावा', title_en: 'Farmers\u2019 Meet', aspect: 16 / 10, hue: 110, type: 'photo' },
  { id: 'g3', title_mr: 'ग्रामसभा — एप्रिल', title_en: 'Gram Sabha — April', aspect: 3 / 4, hue: 200, type: 'video' },
  { id: 'g4', title_mr: 'स्वच्छता मोहीम', title_en: 'Cleanliness Drive', aspect: 1, hue: 160, type: 'photo' },
  { id: 'g5', title_mr: 'वृक्षारोपण', title_en: 'Tree Plantation', aspect: 4 / 5, hue: 140, type: 'photo' },
  { id: 'g6', title_mr: 'सौर दिवे उद्घाटन', title_en: 'Solar Light Opening', aspect: 3 / 2, hue: 45, type: 'video' },
  { id: 'g7', title_mr: 'महिला बचत गट', title_en: 'Women\u2019s SHG', aspect: 4 / 3, hue: 330, type: 'photo' },
  { id: 'g8', title_mr: 'शालेय स्नेहसंमेलन', title_en: 'School Annual Day', aspect: 3 / 4, hue: 260, type: 'photo' },
  { id: 'g9', title_mr: 'होळी उत्सव', title_en: 'Holi Festival', aspect: 1, hue: 15, type: 'photo' },
]

export type PreviewMapPin = {
  id: string
  name_mr: string
  name_en: string
  kind: 'office' | 'school' | 'temple' | 'health' | 'water' | 'market'
  x: number
  y: number
}

export const previewMapPins: PreviewMapPin[] = [
  { id: 'pin-office', name_mr: 'ग्रामपंचायत कार्यालय', name_en: 'Gram Panchayat Office', kind: 'office', x: 50, y: 48 },
  { id: 'pin-school', name_mr: 'जिल्हा परिषद शाळा', name_en: 'ZP School', kind: 'school', x: 34, y: 38 },
  { id: 'pin-temple', name_mr: 'श्री विठ्ठल मंदिर', name_en: 'Shri Vitthal Temple', kind: 'temple', x: 64, y: 36 },
  { id: 'pin-health', name_mr: 'उपकेंद्र', name_en: 'Health Sub-centre', kind: 'health', x: 42, y: 62 },
  { id: 'pin-water', name_mr: 'पाणी टाकी', name_en: 'Water Tank', kind: 'water', x: 72, y: 58 },
  { id: 'pin-market', name_mr: 'आठवडा बाजार', name_en: 'Weekly Market', kind: 'market', x: 58, y: 70 },
]
