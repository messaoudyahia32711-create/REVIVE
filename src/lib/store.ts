import { create } from 'zustand';
import type { Locale, TranslationKeys } from './i18n';
import { translations } from './i18n';

export type Page = 
  | 'home'
  | 'services'
  | 'service-detail'
  | 'booking'
  | 'user-dashboard'
  | 'provider-dashboard'
  | 'admin-dashboard'
  | 'login'
  | 'register'
  | 'profile';

interface UserState {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'provider' | 'admin';
  avatar?: string;
  phone?: string;
  locale: Locale;
  providerId?: string;
  providerName?: string;
  wilaya?: string;
  createdAt?: string;
}

interface AppState {
  // Navigation
  currentPage: Page;
  previousPage: Page | null;
  navigateTo: (page: Page) => void;
  goBack: () => void;

  // Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof TranslationKeys) => string;
  isRTL: boolean;

  // Auth
  user: UserState | null;
  setUser: (user: UserState | null) => void;
  isAuthenticated: boolean;

  // Selected service for detail/booking
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string | null) => void;

  // Selected category for filtering
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;

  // Selected wilaya for filtering
  selectedWilaya: string | null;
  setSelectedWilaya: (wilaya: string | null) => void;

  // Booking form
  bookingDate: string;
  setBookingDate: (date: string) => void;
  bookingPeople: number;
  setBookingPeople: (count: number) => void;
  bookingNotes: string;
  setBookingNotes: (notes: string) => void;
  resetBooking: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Toast notification
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentPage: 'home',
  previousPage: null,
  navigateTo: (page) => {
    set((state) => ({
      previousPage: state.currentPage,
      currentPage: page,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  goBack: () => {
    const { previousPage } = get();
    if (previousPage) {
      set((state) => ({
        currentPage: state.previousPage || 'home',
        previousPage: null,
      }));
    } else {
      set({ currentPage: 'home' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Locale
  locale: 'ar',
  setLocale: (locale) => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    set({ locale, isRTL: locale === 'ar' });
  },
  t: (key) => {
    const { locale } = get();
    return translations[locale][key] || translations['en'][key] || key;
  },
  isRTL: true,

  // Auth
  user: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  isAuthenticated: false,

  // Selected service
  selectedServiceId: null,
  setSelectedServiceId: (id) => set({ selectedServiceId: id }),

  // Selected category
  selectedCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),

  // Selected wilaya
  selectedWilaya: null,
  setSelectedWilaya: (wilaya) => set({ selectedWilaya: wilaya }),

  // Booking form
  bookingDate: '',
  setBookingDate: (date) => set({ bookingDate: date }),
  bookingPeople: 1,
  setBookingPeople: (count) => set({ bookingPeople: count }),
  bookingNotes: '',
  setBookingNotes: (notes) => set({ bookingNotes: notes }),
  resetBooking: () => set({ bookingDate: '', bookingPeople: 1, bookingNotes: '' }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Toast
  toastMessage: null,
  toastType: 'success',
  showToast: (message, type = 'success') => {
    set({ toastMessage: message, toastType: type });
    setTimeout(() => set({ toastMessage: null }), 4000);
  },
  hideToast: () => set({ toastMessage: null }),
}));
