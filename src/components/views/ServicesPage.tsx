'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, Star, Clock, MapPin, Users,
  ChevronDown, ChevronRight, X, Stethoscope, HeartPulse,
  Smile, Eye, Leaf, Pill, Bone, Apple, Home, Loader2,
  ChevronUp, MapPinned,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { WILAYAS, getWilayaName, searchWilayas } from '@/lib/wilayas';

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

interface Service {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  duration: string;
  maxPeople: number;
  wilaya: string;
  location: string;
  image: string | null;
  rating: number;
  totalReviews: number;
  featured: boolean;
  provider: { id: string; companyName: string; rating: number; verified: boolean; category?: { nameAr: string; nameEn: string; icon: string } | null };
  category: { id: string; nameAr: string; nameEn: string; icon: string };
}

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  serviceCount: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Static Maps — medical specialty icons
   ═══════════════════════════════════════════════════════════════════════════ */

const categoryIconMap: Record<string, React.ReactNode> = {
  generalMedicine: <Stethoscope className="w-4 h-4" />,
  dentalCare: <Smile className="w-4 h-4" />,
  physiotherapy: <HeartPulse className="w-4 h-4" />,
  dermatology: <Eye className="w-4 h-4" />,
  ophthalmology: <Eye className="w-4 h-4" />,
  alternativeMedicine: <Leaf className="w-4 h-4" />,
  cardiology: <HeartPulse className="w-4 h-4" />,
  orthopedics: <Bone className="w-4 h-4" />,
  nutrition: <Apple className="w-4 h-4" />,
  default: <Stethoscope className="w-4 h-4" />,
};

const medicalIconKeys = [
  'generalMedicine', 'dentalCare', 'physiotherapy', 'dermatology',
  'ophthalmology', 'alternativeMedicine', 'cardiology', 'orthopedics', 'nutrition',
] as const;

const getCategoryIcon = (icon: string): React.ReactNode => {
  return categoryIconMap[icon] ?? categoryIconMap.default;
};

/* ═══════════════════════════════════════════════════════════════════════════
   Sort Options
   ═══════════════════════════════════════════════════════════════════════════ */

const sortOptions = [
  { value: 'newest', key: 'newest' as const },
  { value: 'price-asc', key: 'priceLow' as const },
  { value: 'price-desc', key: 'priceHigh' as const },
  { value: 'rating', key: 'topRated' as const },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════════════════ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const skeletonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

const dropdownTransition = { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };

/* ═══════════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function ServicesPage() {
  const {
    t, locale, isRTL, navigateTo,
    setSelectedServiceId, selectedCategoryId, setSelectedCategoryId,
    selectedWilaya, setSelectedWilaya,
    minRating, setMinRating,
    searchQuery, setSearchQuery,
  } = useAppStore();

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showSort, setShowSort] = useState(false);
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);
  const [wilayaSearch, setWilayaSearch] = useState('');
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 12;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const wilayaDropdownRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  /* ── Close dropdowns on outside click ───────────────────────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSort(false);
      }
      if (wilayaDropdownRef.current && !wilayaDropdownRef.current.contains(e.target as Node)) {
        setShowWilayaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Fetch services with wilaya filter and pagination ────────────────── */
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategoryId) params.set('categoryId', selectedCategoryId);
      if (searchQuery) params.set('search', searchQuery);
      if (selectedWilaya) params.set('wilaya', selectedWilaya);
      if (minRating > 0) params.set('minRating', String(minRating));
      if (sortBy) params.set('sort', sortBy);
      params.set('page', String(page));
      params.set('limit', String(ITEMS_PER_PAGE));

      const res = await fetch(`/api/services?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setServices(data.services);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch {
      setServices([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, searchQuery, selectedWilaya, minRating, sortBy, page]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  /* ── Fetch categories ───────────────────────────────────────────────── */
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories);
        }
      } catch { /* keep empty */ }
    }
    loadCategories();
  }, []);

  /* ── Debounced search (300ms) ───────────────────────────────────────── */
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  };

  /* ── Wilaya search filtering ────────────────────────────────────────── */
  const filteredWilayas = wilayaSearch
    ? searchWilayas(wilayaSearch)
    : WILAYAS;

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedWilaya(null);
    setSearchQuery('');
    setSearchInput('');
    setSortBy('newest');
    setWilayaSearch('');
    setMinRating(0);
    setPage(1);
  };

  const serviceName = (s: Service) => locale === 'ar' ? s.titleAr : s.titleEn;
  const serviceDesc = (s: Service) => locale === 'ar' ? s.descriptionAr : s.descriptionEn;

  const isFiltered = !!(selectedCategoryId || searchQuery || selectedWilaya || minRating > 0);

  /* ── Card click handler ─────────────────────────────────────────────── */
  const handleCardClick = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    navigateTo('service-detail');
  };

  /* ── Selected wilaya display ────────────────────────────────────────── */
  const selectedWilayaName = selectedWilaya
    ? getWilayaName(selectedWilaya, locale)
    : null;

  /* ── Pagination handler ─────────────────────────────────────────────── */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* ── Reset page on filter change ──────────────────────────────────────── */
  useEffect(() => {
    setPage(1);
  }, [selectedCategoryId, searchQuery, selectedWilaya, minRating, sortBy]);

  /* ═══════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={topRef}>
        {/* ═══ Breadcrumb ═══ */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
          aria-label="Breadcrumb"
        >
          <button
            onClick={() => navigateTo('home')}
            className="hover:text-purple-400 transition-colors flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>{t('home')}</span>
          </button>
          <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="text-purple-400 font-medium">{t('services')}</span>
        </motion.nav>

        {/* ═══ Title ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="text-xs text-purple-400 uppercase tracking-widest font-semibold mb-3">
            {t('allServices')}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gradient-purple">
            {locale === 'ar' ? 'جميع الخدمات الطبية' : 'All Medical Services'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">{t('servicesSubtitle')}</p>
        </motion.div>

        {/* ═══ Search Bar ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="glass rounded-2xl p-2 flex items-center gap-2 purple-glow-focus border border-purple-500/15">
            <div className="flex-1 flex items-center gap-3 px-3">
              <Search className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <input
                type="text"
                placeholder={t('searchServices')}
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2.5"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSearchQuery(searchInput)}
              className="btn-purple-gradient btn-shimmer px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">
                {locale === 'ar' ? 'بحث' : 'Search'}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* ═══ Wilaya Dropdown Filter ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <MapPinned className="w-3.5 h-3.5 text-purple-400" />
              {t('filterByWilaya')}
            </label>

            {/* Selected wilaya chip */}
            {selectedWilayaName && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-purple-gradient text-white text-xs font-semibold"
              >
                <MapPin className="w-3 h-3" />
                {selectedWilayaName}
                <button
                  onClick={() => setSelectedWilaya(null)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            )}

            {/* Wilaya dropdown trigger + panel */}
            <div className="relative" ref={wilayaDropdownRef}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setShowWilayaDropdown(!showWilayaDropdown);
                  setWilayaSearch('');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl glass border text-xs transition-all whitespace-nowrap ${
                  showWilayaDropdown
                    ? 'border-purple-500/40 text-purple-300'
                    : 'border-purple-500/15 text-muted-foreground hover:text-purple-300 purple-glow-focus'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedWilayaName ?? t('allWilayas')}</span>
                {showWilayaDropdown
                  ? <ChevronUp className="w-3.5 h-3.5" />
                  : <ChevronDown className="w-3.5 h-3.5" />}
              </motion.button>

              <AnimatePresence>
                {showWilayaDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={dropdownTransition}
                    className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-2 w-72 glass rounded-xl border border-purple-500/20 shadow-2xl z-30 overflow-hidden`}
                  >
                    {/* Search inside dropdown */}
                    <div className="p-2 border-b border-purple-500/10">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
                        <Search className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        <input
                          type="text"
                          placeholder={locale === 'ar' ? 'ابحث عن ولاية...' : 'Search wilaya...'}
                          value={wilayaSearch}
                          onChange={(e) => setWilayaSearch(e.target.value)}
                          autoFocus
                          className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        {wilayaSearch && (
                          <button
                            onClick={() => setWilayaSearch('')}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Wilaya list */}
                    <div className="max-h-64 overflow-y-auto scrollbar-none">
                      {/* All wilayas option */}
                      <button
                        onClick={() => {
                          setSelectedWilaya(null);
                          setShowWilayaDropdown(false);
                        }}
                        className={`w-full text-${isRTL ? 'right' : 'left'} px-4 py-2.5 text-xs transition-all border-b border-purple-500/5 ${
                          !selectedWilaya
                            ? 'bg-purple-500/15 text-purple-300 font-semibold'
                            : 'text-muted-foreground hover:text-purple-300 hover:bg-purple-500/5'
                        }`}
                      >
                        {t('allWilayas')}
                      </button>

                      {filteredWilayas.map((wilaya) => {
                        const isActive = selectedWilaya === wilaya.code;
                        const displayName = locale === 'ar' ? wilaya.nameAr : wilaya.nameEn;
                        return (
                          <button
                            key={wilaya.code}
                            onClick={() => {
                              setSelectedWilaya(isActive ? null : wilaya.code);
                              setShowWilayaDropdown(false);
                              setWilayaSearch('');
                            }}
                            className={`w-full text-${isRTL ? 'right' : 'left'} px-4 py-2.5 text-xs transition-all flex items-center justify-between ${
                              isActive
                                ? 'bg-purple-500/15 text-purple-300 font-semibold'
                                : 'text-muted-foreground hover:text-purple-300 hover:bg-purple-500/5'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-5 text-center text-[10px] text-purple-400/60 font-mono">
                                {wilaya.code}
                              </span>
                              {displayName}
                            </span>
                            {isActive && (
                              <span className="text-purple-400 text-[10px]">✓</span>
                            )}
                          </button>
                        );
                      })}

                      {filteredWilayas.length === 0 && (
                        <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                          <MapPin className="w-6 h-6 mx-auto mb-2 text-purple-500/30" />
                          {locale === 'ar' ? 'لم يتم العثور على ولاية' : 'No wilaya found'}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ═══ Star Rating Filter ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              {t('filterByRating')}
            </label>

            {minRating > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold"
              >
                <Star className="w-3 h-3 fill-current" />
                {minRating}+ {locale === 'ar' ? 'نجوم' : 'stars'}
                <button
                  onClick={() => setMinRating(0)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            )}

            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMinRating(star)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    minRating === star
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10'
                      : minRating === 0
                        ? 'glass border border-purple-500/15 text-muted-foreground hover:text-amber-300'
                        : 'glass border border-purple-500/10 text-muted-foreground/60 hover:text-amber-300'
                  }`}
                >
                  {star === 0 ? (
                    <span>{t('allRatings')}</span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Star className={`w-3 h-3 ${minRating >= star ? 'text-amber-400 fill-current' : ''}`} />
                      {star}+
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══ Category Filter Chips + Sort ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 flex items-center gap-4"
        >
          {/* Horizontal scrolling chips */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {/* "All" chip */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className={`flex-shrink-0 px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                !selectedCategoryId && !selectedWilaya && !searchQuery && minRating === 0
                  ? 'btn-purple-gradient text-white shadow-lg shadow-purple-500/25'
                  : 'glass border border-purple-500/15 text-muted-foreground glow-purple'
              }`}
            >
              {t('all')}
            </motion.button>

            {/* Category chips */}
            {categories.map((cat) => {
              const name = locale === 'ar' ? cat.nameAr : cat.nameEn;
              const isActive = selectedCategoryId === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategoryId(isActive ? null : cat.id)}
                  className={`flex-shrink-0 px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'btn-purple-gradient text-white shadow-lg shadow-purple-500/25'
                      : 'glass border border-purple-500/15 text-muted-foreground glow-purple'
                  }`}
                >
                  {getCategoryIcon(cat.icon)}
                  {name}
                </motion.button>
              );
            })}
          </div>

          {/* Sort dropdown */}
          <div className="relative flex-shrink-0" ref={sortRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-purple-500/15 text-xs text-muted-foreground hover:text-purple-300 purple-glow-focus transition-all whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('sortBy')}:</span>
              <span className="font-medium">
                {t(sortOptions.find(s => s.value === sortBy)?.key || 'newest')}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showSort ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-2 w-52 glass rounded-xl p-1 border border-purple-500/20 shadow-2xl z-30`}
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                      className={`w-full text-${isRTL ? 'right' : 'left'} px-4 py-2.5 rounded-lg text-xs transition-all ${
                        sortBy === opt.value
                          ? 'bg-purple-500/15 text-purple-300 font-semibold'
                          : 'text-muted-foreground hover:text-purple-300 hover:bg-purple-500/5'
                      }`}
                    >
                      {t(opt.key)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">
              {totalCount} {locale === 'ar' ? 'خدمة طبية متاحة' : 'medical services available'}
            </p>
            {!loading && totalCount > 0 && (
              <p className="text-[10px] border text-purple-400 bg-purple-500/10 border-purple-500/20 px-2 py-0.5 rounded-md w-fit">
                {locale === 'ar' ? `عرض ${Math.min((page - 1) * ITEMS_PER_PAGE + 1, totalCount)} - ${Math.min(page * ITEMS_PER_PAGE, totalCount)}` : `Showing ${Math.min((page - 1) * ITEMS_PER_PAGE + 1, totalCount)} - ${Math.min(page * ITEMS_PER_PAGE, totalCount)}`}
              </p>
            )}
          </div>
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              {locale === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
            </button>
          )}
        </motion.div>

        {/* ═══ Loading Skeletons ═══ */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`skel-${i}`}
                custom={i}
                variants={skeletonVariants}
                initial="hidden"
                animate="visible"
                className="glass rounded-2xl overflow-hidden border border-purple-500/10"
              >
                <div className="aspect-[4/3] bg-purple-500/5 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-purple-500/8 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-3 bg-purple-500/5 rounded-lg w-full animate-pulse" />
                  <div className="h-3 bg-purple-500/5 rounded-lg w-2/3 animate-pulse" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-8 bg-purple-500/5 rounded-lg w-20 animate-pulse" />
                    <div className="h-8 bg-purple-500/5 rounded-lg w-20 animate-pulse" />
                    <div className="h-8 bg-purple-500/5 rounded-lg w-20 animate-pulse" />
                  </div>
                  <div className="pt-3 border-t border-purple-500/10 flex justify-between items-center">
                    <div className="h-5 bg-purple-500/8 rounded-lg w-20 animate-pulse" />
                    <div className="h-8 bg-purple-500/8 rounded-lg w-28 animate-pulse" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : services.length === 0 ? (
          /* ═══ Empty State ═══ */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-2xl p-16 text-center border border-purple-500/10 card-ornament"
          >
            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-purple-500/40" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">{t('noServicesFound')}</p>
            <p className="text-sm text-muted-foreground mb-6">
              {locale === 'ar' ? 'حاول تغيير معايير البحث أو التصفية' : 'Try adjusting your search or filter criteria'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="btn-purple-gradient btn-shimmer px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              {locale === 'ar' ? 'عرض جميع الخدمات' : 'View all services'}
            </motion.button>
          </motion.div>
        ) : (
          /* ═══ Services Grid ═══ */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`${selectedCategoryId}-${searchQuery}-${selectedWilaya}-${sortBy}`}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service) => (
              <motion.div
                key={service.id}
                variants={cardVariants}
                className="card-3d"
              >
                <div className="card-3d-inner">
                  <div
                    className="card-ornament card-hover glass rounded-2xl overflow-hidden border border-purple-500/10 group cursor-pointer flex flex-col"
                    onClick={() => handleCardClick(service.id)}
                  >
                    {/* ── Image ──────────────────────────────────────── */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={serviceName(service)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-purple-900/20 flex items-center justify-center">
                          <Stethoscope className="w-12 h-12 text-purple-500/20" />
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-purple-900/20 to-transparent" />

                      {/* Category badge (top-left) */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg glass border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        {getCategoryIcon(service.category.icon)}
                        {locale === 'ar' ? service.category.nameAr : service.category.nameEn}
                      </span>

                      {/* Featured badge (top-right) */}
                      {service.featured && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-amber-500/25">
                          <Star className="w-3 h-3 fill-current" />
                          {t('featured')}
                        </span>
                      )}

                      {/* Provider strip at bottom of image */}
                      <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-[#0a0a0f]/90 via-[#0a0a0f]/60 to-transparent flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-purple-500/20 shadow-lg shadow-black/50">
                          {service.provider.companyName.charAt(0)}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-[11px] text-white/90 font-bold truncate flex items-center gap-1">
                            {service.provider.companyName}
                            {service.provider.verified && <span className="text-emerald-400 text-[9px] font-bold">✓</span>}
                          </span>
                          {service.provider.category && (
                            <span className="text-[9px] text-purple-300/80 truncate font-medium flex items-center gap-1">
                              {getCategoryIcon(service.provider.category.icon)}
                              {locale === 'ar' ? service.provider.category.nameAr : service.provider.category.nameEn}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Content ─────────────────────────────────────── */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Title */}
                      <h3 className="font-bold text-white text-sm mb-1.5 line-clamp-1 group-hover:text-purple-300 transition-colors">
                        {serviceName(service)}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-white/50 mb-3 line-clamp-2 leading-relaxed">
                        {serviceDesc(service)}
                      </p>

                      {/* Star rating + count */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.round(service.rating)
                                  ? 'star-filled fill-current'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-yellow-400">{service.rating}</span>
                        <span className="text-[10px] text-muted-foreground">
                          ({service.totalReviews} {t('reviews')})
                        </span>
                      </div>

                      {/* Duration / Wilaya / Max Sessions */}
                      <div className="flex items-center gap-4 mb-4 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          {service.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-purple-400" />
                          {getWilayaName(service.wilaya, locale)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                          {service.maxPeople}
                        </span>
                      </div>

                      {/* Spacer to push footer to bottom */}
                      <div className="flex-1" />

                      {/* Price + View Details */}
                      <div className="pt-3 border-t border-purple-500/10">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-2xl font-bold text-gradient-gold">
                            {service.price.toLocaleString(locale === 'ar' ? 'ar-DZ' : 'en-DZ')}
                            <span className="text-sm text-yellow-500/60 ml-1">{t('dzd')}</span>
                          </p>
                          <span className="text-[10px] text-muted-foreground">{t('perPerson')}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => { e.stopPropagation(); handleCardClick(service.id); }}
                          className="w-full py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/5 text-purple-300 text-xs font-semibold hover:bg-purple-500/15 hover:border-purple-500/50 transition-all duration-300 flex items-center justify-center gap-1.5"
                        >
                          {t('viewDetails')}
                          <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ═══ Pagination ═══ */}
        {!loading && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex justify-center"
          >
            <div className="flex items-center gap-2 bg-[#0f0f1a]/80 border border-purple-500/20 p-2 rounded-2xl">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous Page"
              >
                <ChevronRight className={`w-5 h-5 ${!isRTL ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  // Show max 5 page numbers: first, last, current, and adjacent
                  if (totalPages > 5 && p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
                    if (p === 2 && page > 3) return <span key={p} className="text-white/30 px-1">...</span>;
                    if (p === totalPages - 1 && page < totalPages - 2) return <span key={p} className="text-white/30 px-1">...</span>;
                    return null;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        p === page
                          ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-500/20'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
