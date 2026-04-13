// =============================================================================
// i18n - Internationalization Translation System
// Platform: REVIVE - Medical Tourism Algeria
// Supports: Arabic (ar) and English (en)
// =============================================================================

export type Locale = 'ar' | 'en';

const translations = {
  en: {
    // ── Navigation ─────────────────────────────────────────────────────────
    home: 'Home',
    services: 'Medical Services',
    categories: 'Specialties',
    dashboard: 'Dashboard',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    myBookings: 'My Appointments',
    becomeProvider: 'Join as Provider',
    language: 'Language',

    // ── Hero ───────────────────────────────────────────────────────────────
    heroTitle: 'Your Health Journey',
    heroSubtitle:
      'Discover the best medical and therapeutic services across Algeria. Trusted healthcare providers, world-class treatments, and seamless booking.',
    heroCta: 'Find Services',
    heroSecondary: 'Browse Specialties',

    // ── Categories (Medical Specialties) ───────────────────────────────────
    categoriesTitle: 'Medical Specialties',
    categoriesSubtitle: 'Find the right healthcare specialty for your needs',
    generalMedicine: 'General Medicine',
    dentalCare: 'Dental Care',
    physiotherapy: 'Physiotherapy',
    dermatology: 'Dermatology',
    ophthalmology: 'Ophthalmology',
    alternativeMedicine: 'Alternative Medicine',
    cardiology: 'Cardiology',
    orthopedics: 'Orthopedics',
    nutrition: 'Nutrition & Diet',

    // ── Services ───────────────────────────────────────────────────────────
    servicesTitle: 'Medical Services',
    servicesSubtitle: 'Healthcare services from verified providers across Algeria',
    viewDetails: 'View Details',
    bookNow: 'Book Now',
    perPerson: 'per session',
    duration: 'Duration',
    location: 'Wilaya',
    rating: 'Rating',
    reviews: 'Reviews',
    featuredServices: 'Featured Services',
    allServices: 'All Services',
    searchServices: 'Search services, specialties, wilayas...',
    filterBy: 'Filter By',
    sortBy: 'Sort By',
    priceLow: 'Price: Low to High',
    priceHigh: 'Price: High to Low',
    topRated: 'Top Rated',
    newest: 'Newest',
    noServicesFound: 'No services found matching your criteria',
    filterByWilaya: 'Filter by Wilaya',
    allWilayas: 'All Wilayas',
    filterByRating: 'Filter by Rating',
    allRatings: 'All Ratings',
    ratingAndUp: 'and up',
    reviewSubmitted: 'Review submitted successfully!',
    alreadyReviewed: 'You have already reviewed this service',

    // ── Booking ────────────────────────────────────────────────────────────
    bookingTitle: 'Book Appointment',
    selectDate: 'Select Date',
    numberOfPeople: 'Number of Sessions',
    notes: 'Additional Notes',
    totalPrice: 'Total Price',
    confirmBooking: 'Confirm Booking',
    bookingSuccess: 'Appointment booked successfully!',
    bookingPending: 'Pending',
    bookingConfirmed: 'Confirmed',
    bookingCancelled: 'Cancelled',
    bookingCompleted: 'Completed',
    cancelBooking: 'Cancel Appointment',
    contactProvider: 'Contact Provider',
    sendMessage: 'Send Message',
    maxPeople: 'Max Sessions',
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
    userRole: 'Patient',
    providerRole: 'Healthcare Provider',
    loginBtn: 'Sign In',
    registerBtn: 'Create Account',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    forgotPassword: 'Forgot Password?',
    wilaya: 'Wilaya',

    // ── Dashboard ──────────────────────────────────────────────────────────
    dashboardTitle: 'Dashboard',
    welcome: 'Welcome',
    totalBookings: 'Total Appointments',
    totalRevenue: 'Total Revenue',
    totalServices: 'Total Services',
    avgRating: 'Average Rating',
    recentBookings: 'Recent Appointments',
    manageServices: 'Manage Services',
    addService: 'Add Service',
    editService: 'Edit Service',
    deleteService: 'Delete Service',
    serviceTitle: 'Service Title',
    serviceDescription: 'Description',
    servicePrice: 'Price',
    serviceDuration: 'Duration',
    serviceLocation: 'Wilaya',
    serviceCategory: 'Specialty',
    serviceImage: 'Service Image',
    analytics: 'Analytics',
    monthlyRevenue: 'Monthly Revenue',
    popularServices: 'Popular Services',
    pendingBookings: 'Pending Appointments',
    completedBookings: 'Completed Appointments',
    cancelledBookings: 'Cancelled Appointments',

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
    dzd: 'DZD',
    all: 'All',
    maxPeople: 'Max Sessions',
  },

  ar: {
    // ── Navigation ─────────────────────────────────────────────────────────
    home: 'الرئيسية',
    services: 'الخدمات الطبية',
    categories: 'التخصصات',
    dashboard: 'لوحة التحكم',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    profile: 'الملف الشخصي',
    myBookings: 'مواعيدي',
    becomeProvider: 'انضم كمزود خدمة',
    language: 'اللغة',

    // ── Hero ───────────────────────────────────────────────────────────────
    heroTitle: 'رحلتك الصحية',
    heroSubtitle:
      'اكتشف أفضل الخدمات الطبية والعلاجية عبر الجزائر. مزودو رعاية صحية موثوقون وعلاجات عالمية وحجز سهل.',
    heroCta: 'ابحث عن خدمات',
    heroSecondary: 'تصفح التخصصات',

    // ── Categories (التخصصات الطبية) ──────────────────────────────────────
    categoriesTitle: 'التخصصات الطبية',
    categoriesSubtitle: 'اعثر على التخصص الطبي المناسب لاحتياجاتك',
    generalMedicine: 'الطب العام',
    dentalCare: 'طب الأسنان',
    physiotherapy: 'العلاج الطبيعي',
    dermatology: 'طب الجلدية',
    ophthalmology: 'طب العيون',
    alternativeMedicine: 'الطب البديل',
    cardiology: 'أمراض القلب',
    orthopedics: 'جراحة العظام',
    nutrition: 'التغذية والحمية',

    // ── Services ───────────────────────────────────────────────────────────
    servicesTitle: 'الخدمات الطبية',
    servicesSubtitle: 'خدمات صحية من مزودين موثقين في جميع أنحاء الجزائر',
    viewDetails: 'عرض التفاصيل',
    bookNow: 'احجز الآن',
    perPerson: 'للجلسة',
    duration: 'المدة',
    location: 'الولاية',
    rating: 'التقييم',
    reviews: 'التقييمات',
    featuredServices: 'الخدمات المميزة',
    allServices: 'جميع الخدمات',
    searchServices: 'ابحث عن خدمات، تخصصات، ولايات...',
    filterBy: 'تصفية حسب',
    sortBy: 'ترتيب حسب',
    priceLow: 'السعر: من الأقل للأعلى',
    priceHigh: 'السعر: من الأعلى للأقل',
    topRated: 'الأعلى تقييماً',
    newest: 'الأحدث',
    noServicesFound: 'لم يتم العثور على خدمات مطابقة لمعاييرك',
    filterByWilaya: 'تصفية حسب الولاية',
    allWilayas: 'جميع الولايات',
    filterByRating: 'تصفية حسب التقييم',
    allRatings: 'جميع التقييمات',
    ratingAndUp: 'فما فوق',
    reviewSubmitted: 'تم إرسال التقييم بنجاح!',
    alreadyReviewed: 'لقد قمت بتقييم هذه الخدمة مسبقاً',

    // ── Booking ────────────────────────────────────────────────────────────
    bookingTitle: 'حجز موعد',
    selectDate: 'اختر التاريخ',
    numberOfPeople: 'عدد الجلسات',
    notes: 'ملاحظات إضافية',
    totalPrice: 'الإجمالي',
    confirmBooking: 'تأكيد الحجز',
    bookingSuccess: 'تم حجز الموعد بنجاح!',
    bookingPending: 'قيد الانتظار',
    bookingConfirmed: 'مؤكد',
    bookingCancelled: 'ملغي',
    bookingCompleted: 'مكتمل',
    cancelBooking: 'إلغاء الموعد',
    contactProvider: 'تواصل مع المزود',
    sendMessage: 'إرسال رسالة',
    maxPeople: 'الحد الأقصى للجلسات',
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
    userRole: 'مريض',
    providerRole: 'مزود خدمة صحية',
    loginBtn: 'تسجيل الدخول',
    registerBtn: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    forgotPassword: 'نسيت كلمة المرور؟',
    wilaya: 'الولاية',

    // ── Dashboard ──────────────────────────────────────────────────────────
    dashboardTitle: 'لوحة التحكم',
    welcome: 'مرحباً',
    totalBookings: 'إجمالي المواعيد',
    totalRevenue: 'إجمالي الإيرادات',
    totalServices: 'إجمالي الخدمات',
    avgRating: 'متوسط التقييم',
    recentBookings: 'المواعيد الأخيرة',
    manageServices: 'إدارة الخدمات',
    addService: 'إضافة خدمة',
    editService: 'تعديل الخدمة',
    deleteService: 'حذف الخدمة',
    serviceTitle: 'عنوان الخدمة',
    serviceDescription: 'الوصف',
    servicePrice: 'السعر',
    serviceDuration: 'المدة',
    serviceLocation: 'الولاية',
    serviceCategory: 'التخصص',
    serviceImage: 'صورة الخدمة',
    analytics: 'الإحصائيات',
    monthlyRevenue: 'الإيرادات الشهرية',
    popularServices: 'الخدمات الأكثر شعبية',
    pendingBookings: 'مواعيد قيد الانتظار',
    completedBookings: 'المواعيد المكتملة',
    cancelledBookings: 'المواعيد الملغاة',

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
    dzd: 'د.ج',
    all: 'الكل',
    maxPeople: 'الحد الأقصى للجلسات',
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
