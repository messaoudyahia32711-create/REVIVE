// =============================================================================
// i18n - Internationalization Translation System
// Supports: Arabic (ar) and English (en)
// =============================================================================

export type Locale = 'ar' | 'en';

const translations = {
  en: {
    // ── Navigation ─────────────────────────────────────────────────────────
    home: 'Home',
    services: 'Services',
    categories: 'Categories',
    dashboard: 'Dashboard',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    myBookings: 'My Bookings',
    becomeProvider: 'Become a Provider',
    language: 'Language',

    // ── Hero ───────────────────────────────────────────────────────────────
    heroTitle: 'Discover Amazing Tourism Experiences',
    heroSubtitle:
      'Explore the best tours, adventures, and destinations with trusted local providers. Book your next unforgettable journey today.',
    heroCta: 'Explore Services',
    heroSecondary: 'Browse Categories',

    // ── Categories ─────────────────────────────────────────────────────────
    categoriesTitle: 'Explore Categories',
    categoriesSubtitle: 'Find the perfect experience for your next adventure',
    adventureTours: 'Adventure Tours',
    cityTours: 'City Tours',
    beachResort: 'Beach & Resort',
    diving: 'Diving',
    desertSafari: 'Desert Safari',
    cruise: 'Cruise',

    // ── Services ───────────────────────────────────────────────────────────
    servicesTitle: 'Our Services',
    servicesSubtitle: 'Handpicked experiences from verified providers',
    viewDetails: 'View Details',
    bookNow: 'Book Now',
    perPerson: 'per person',
    duration: 'Duration',
    location: 'Location',
    rating: 'Rating',
    reviews: 'Reviews',
    featuredServices: 'Featured Services',
    allServices: 'All Services',
    searchServices: 'Search services...',
    filterBy: 'Filter By',
    sortBy: 'Sort By',
    priceLow: 'Price: Low to High',
    priceHigh: 'Price: High to Low',
    topRated: 'Top Rated',
    newest: 'Newest',
    noServicesFound: 'No services found matching your criteria',

    // ── Booking ────────────────────────────────────────────────────────────
    bookingTitle: 'Book This Service',
    selectDate: 'Select Date',
    numberOfPeople: 'Number of People',
    notes: 'Additional Notes',
    totalPrice: 'Total Price',
    confirmBooking: 'Confirm Booking',
    bookingSuccess: 'Booking confirmed successfully!',
    bookingPending: 'Pending',
    bookingConfirmed: 'Confirmed',
    bookingCancelled: 'Cancelled',
    bookingCompleted: 'Completed',
    cancelBooking: 'Cancel Booking',
    contactProvider: 'Contact Provider',
    sendMessage: 'Send Message',
    maxPeople: 'Max People',
    featured: 'Featured',

    // ── Auth ───────────────────────────────────────────────────────────────
    loginTitle: 'Welcome Back',
    registerTitle: 'Create Account',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    phone: 'Phone Number',
    role: 'Account Type',
    userRole: 'User',
    providerRole: 'Service Provider',
    loginBtn: 'Sign In',
    registerBtn: 'Create Account',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    forgotPassword: 'Forgot Password?',

    // ── Dashboard ──────────────────────────────────────────────────────────
    dashboardTitle: 'Dashboard',
    welcome: 'Welcome',
    totalBookings: 'Total Bookings',
    totalRevenue: 'Total Revenue',
    totalServices: 'Total Services',
    avgRating: 'Average Rating',
    recentBookings: 'Recent Bookings',
    manageServices: 'Manage Services',
    addService: 'Add Service',
    editService: 'Edit Service',
    deleteService: 'Delete Service',
    serviceTitle: 'Service Title',
    serviceDescription: 'Description',
    servicePrice: 'Price',
    serviceDuration: 'Duration',
    serviceLocation: 'Location',
    serviceCategory: 'Category',
    serviceImage: 'Service Image',
    analytics: 'Analytics',
    monthlyRevenue: 'Monthly Revenue',
    popularServices: 'Popular Services',
    pendingBookings: 'Pending Bookings',
    completedBookings: 'Completed Bookings',
    cancelledBookings: 'Cancelled Bookings',

    // ── Review ─────────────────────────────────────────────────────────────
    writeReview: 'Write a Review',
    submitReview: 'Submit Review',
    yourRating: 'Your Rating',
    yourComment: 'Your Comment',

    // ── Footer ─────────────────────────────────────────────────────────────
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    faq: 'FAQ',
    termsPrivacy: 'Terms & Privacy',
    socialMedia: 'Social Media',
    copyright: 'All rights reserved.',
    newsletter: 'Newsletter',
    subscribeEmail: 'Enter your email address',
    subscribe: 'Subscribe',

    // ── General ────────────────────────────────────────────────────────────
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Operation successful',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    noData: 'No data available',
    sar: 'SAR',
    all: 'All',
    maxPeople: 'Max People',
  },

  ar: {
    // ── Navigation ─────────────────────────────────────────────────────────
    home: 'الرئيسية',
    services: 'الخدمات',
    categories: 'التصنيفات',
    dashboard: 'لوحة التحكم',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    profile: 'الملف الشخصي',
    myBookings: 'حجوزاتي',
    becomeProvider: 'كن مزود خدمة',
    language: 'اللغة',

    // ── Hero ───────────────────────────────────────────────────────────────
    heroTitle: 'اكتشف تجارب سياحية مذهلة',
    heroSubtitle:
      'استكشف أفضل الرحلات والمغامرات والوجهات مع مزودين محليين موثوقين. احجز رحلتك القادمة التي لن تُنسى اليوم.',
    heroCta: 'استكشف الخدمات',
    heroSecondary: 'تصفح التصنيفات',

    // ── Categories ─────────────────────────────────────────────────────────
    categoriesTitle: 'استكشف التصنيفات',
    categoriesSubtitle: 'اعثر على التجربة المثالية لمغامرتك القادمة',
    adventureTours: 'رحلات المغامرات',
    cityTours: 'جولات المدن',
    beachResort: 'الشواطئ والمنتجعات',
    diving: 'الغطس',
    desertSafari: 'سفاري الصحراء',
    cruise: 'الرحلات البحرية',

    // ── Services ───────────────────────────────────────────────────────────
    servicesTitle: 'خدماتنا',
    servicesSubtitle: 'تجارب مختارة بعناية من مزودين موثقين',
    viewDetails: 'عرض التفاصيل',
    bookNow: 'احجز الآن',
    perPerson: 'للفرد الواحد',
    duration: 'المدة',
    location: 'الموقع',
    rating: 'التقييم',
    reviews: 'التقييمات',
    featuredServices: 'الخدمات المميزة',
    allServices: 'جميع الخدمات',
    searchServices: 'ابحث عن خدمات...',
    filterBy: 'تصفية حسب',
    sortBy: 'ترتيب حسب',
    priceLow: 'السعر: من الأقل للأعلى',
    priceHigh: 'السعر: من الأعلى للأقل',
    topRated: 'الأعلى تقييماً',
    newest: 'الأحدث',
    noServicesFound: 'لم يتم العثور على خدمات مطابقة لمعاييرك',

    // ── Booking ────────────────────────────────────────────────────────────
    bookingTitle: 'احجز هذه الخدمة',
    selectDate: 'اختر التاريخ',
    numberOfPeople: 'عدد الأشخاص',
    notes: 'ملاحظات إضافية',
    totalPrice: 'الإجمالي',
    confirmBooking: 'تأكيد الحجز',
    bookingSuccess: 'تم تأكيد الحجز بنجاح!',
    bookingPending: 'قيد الانتظار',
    bookingConfirmed: 'مؤكد',
    bookingCancelled: 'ملغي',
    bookingCompleted: 'مكتمل',
    cancelBooking: 'إلغاء الحجز',
    contactProvider: 'تواصل مع المزود',
    sendMessage: 'إرسال رسالة',
    maxPeople: 'الحد الأقصى للأشخاص',
    featured: 'مميز',

    // ── Auth ───────────────────────────────────────────────────────────────
    loginTitle: 'مرحباً بعودتك',
    registerTitle: 'إنشاء حساب جديد',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    name: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    role: 'نوع الحساب',
    userRole: 'مستخدم',
    providerRole: 'مزود خدمة',
    loginBtn: 'تسجيل الدخول',
    registerBtn: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    forgotPassword: 'نسيت كلمة المرور؟',

    // ── Dashboard ──────────────────────────────────────────────────────────
    dashboardTitle: 'لوحة التحكم',
    welcome: 'مرحباً',
    totalBookings: 'إجمالي الحجوزات',
    totalRevenue: 'إجمالي الإيرادات',
    totalServices: 'إجمالي الخدمات',
    avgRating: 'متوسط التقييم',
    recentBookings: 'الحجوزات الأخيرة',
    manageServices: 'إدارة الخدمات',
    addService: 'إضافة خدمة',
    editService: 'تعديل الخدمة',
    deleteService: 'حذف الخدمة',
    serviceTitle: 'عنوان الخدمة',
    serviceDescription: 'الوصف',
    servicePrice: 'السعر',
    serviceDuration: 'المدة',
    serviceLocation: 'الموقع',
    serviceCategory: 'التصنيف',
    serviceImage: 'صورة الخدمة',
    analytics: 'الإحصائيات',
    monthlyRevenue: 'الإيرادات الشهرية',
    popularServices: 'الخدمات الأكثر شعبية',
    pendingBookings: 'حجوزات قيد الانتظار',
    completedBookings: 'الحجوزات المكتملة',
    cancelledBookings: 'الحجوزات الملغاة',

    // ── Review ─────────────────────────────────────────────────────────────
    writeReview: 'اكتب تقييماً',
    submitReview: 'إرسال التقييم',
    yourRating: 'تقييمك',
    yourComment: 'تعليقك',

    // ── Footer ─────────────────────────────────────────────────────────────
    aboutUs: 'من نحن',
    contactUs: 'اتصل بنا',
    faq: 'الأسئلة الشائعة',
    termsPrivacy: 'الشروط والخصوصية',
    socialMedia: 'وسائل التواصل الاجتماعي',
    copyright: 'جميع الحقوق محفوظة.',
    newsletter: 'النشرة البريدية',
    subscribeEmail: 'أدخل بريدك الإلكتروني',
    subscribe: 'اشترك',

    // ── General ────────────────────────────────────────────────────────────
    loading: 'جارٍ التحميل...',
    error: 'حدث خطأ',
    success: 'تمت العملية بنجاح',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    delete: 'حذف',
    edit: 'تعديل',
    save: 'حفظ',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    noData: 'لا توجد بيانات',
    sar: 'ر.س',
    all: 'الكل',
    maxPeople: 'الحد الأقصى للأشخاص',
  },
} satisfies Record<Locale, Record<string, string>>;

// ── Types ──────────────────────────────────────────────────────────────────

export type TranslationKeys = typeof translations.en;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns `true` when the given locale is Arabic (right-to-left).
 */
export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}

/**
 * Returns the `dir` attribute value for the HTML root element.
 */
export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Returns a localized translation value for the given key.
 * Falls back to the English translation when the key is missing.
 */
export function t(
  locale: Locale,
  key: keyof TranslationKeys,
): TranslationKeys[keyof TranslationKeys] {
  return translations[locale][key] ?? translations.en[key];
}

/**
 * Returns the full translations object for a given locale.
 */
export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] ?? translations.en;
}

// ── Export ─────────────────────────────────────────────────────────────────

export { translations };
export default translations;
