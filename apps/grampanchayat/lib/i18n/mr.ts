export const mr = {
  // Nav
  'nav.home': 'मुख्यपृष्ठ',
  'nav.about': 'आमच्याबद्दल',
  'nav.post_holders': 'पदाधिकारी',
  'nav.events': 'कार्यक्रम',
  'nav.announcements': 'घोषणा',
  'nav.gallery': 'दालन',
  'nav.lang_toggle': 'English',

  // Home
  'home.welcome': 'आपले स्वागत आहे',
  'home.highlights': 'ठळक बातम्या',
  'home.latest_announcements': 'ताज्या घोषणा',
  'home.upcoming_events': 'येणारे कार्यक्रम',

  // Events
  'events.upcoming': 'येणारे कार्यक्रम',
  'events.past': 'मागील कार्यक्रम',
  'events.no_upcoming': 'सध्या कोणताही कार्यक्रम नाही',
  'events.no_past': 'मागील कार्यक्रम उपलब्ध नाहीत',
  'events.location': 'स्थान',
  'events.date': 'दिनांक',
  'events.photos': 'फोटो',

  // Announcements
  'announcements.title': 'घोषणा',
  'announcements.category.general': 'सामान्य',
  'announcements.category.scheme': 'योजना',
  'announcements.category.notice': 'सूचना',
  'announcements.download': 'डाउनलोड करा',
  'announcements.no_data': 'कोणतीही घोषणा नाही',

  // Gallery
  'gallery.title': 'दालन',
  'gallery.no_data': 'कोणतेही फोटो नाहीत',

  // Post holders
  'post_holders.title': 'पदाधिकारी',
  'post_holders.contact': 'संपर्क',

  // About
  'about.title': 'आमच्याबद्दल',
  'about.village': 'गाव',
  'about.taluka': 'तालुका',
  'about.district': 'जिल्हा',
  'about.established': 'स्थापना',

  // Admin
  'admin.login': 'प्रवेश करा',
  'admin.logout': 'बाहेर पडा',
  'admin.email': 'ईमेल',
  'admin.password': 'पासवर्ड',
  'admin.login_error': 'लॉगिन अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
  'admin.dashboard': 'डॅशबोर्ड',
  'admin.manage_events': 'कार्यक्रम व्यवस्थापन',
  'admin.manage_announcements': 'घोषणा व्यवस्थापन',
  'admin.manage_post_holders': 'पदाधिकारी व्यवस्थापन',
  'admin.manage_gallery': 'दालन व्यवस्थापन',
  'admin.gp_profile': 'ग्रामपंचायत प्रोफाइल',
  'admin.save': 'जतन करा',
  'admin.cancel': 'रद्द करा',
  'admin.delete': 'हटवा',
  'admin.new': 'नवीन',
  'admin.publish': 'प्रकाशित करा',
  'admin.unpublish': 'अप्रकाशित करा',

  // Common
  'common.loading': 'लोड होत आहे...',
  'common.error': 'काहीतरी चुकले',
  'common.not_found': 'पृष्ठ सापडले नाही',
  'common.back': 'मागे जा',
  'common.view_all': 'सर्व पाहा',
} as const

export type TranslationKey = keyof typeof mr
