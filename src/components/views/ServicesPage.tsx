'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, Star, Clock, MapPin, Users,
  ChevronDown, ChevronRight, X, Mountain, Building2, Waves,
  Fish, Compass, Ship, Crown, Home, Loader2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

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
  location: string;
  image: string | null;
  rating: number;
  totalReviews: number;
  featured: boolean;
  provider: { id: string; companyName: string; rating: number; verified: boolean };
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
   Static Maps
   ═══════════════════════════════════════════════════════════════════════════ */

const categoryIconMap: Record<string, React.ReactNode> = {
  adventure: <Mountain className="w-4 h-4" />,
  city: <Building2 className="w-4 h-4" />,
  beach: <Waves className="w-4 h-4" />,
  diving: <Fish className="w-4 h-4" />,
  desert: <Compass className="w-4 h-4" />,
  cruise: <Ship className="w-4 h-4" />,
};

const catKeys = ['adventure', 'city', 'beach', 'diving', 'desert', 'cruise'] as const;

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
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const skeletonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

/* ═══════════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function ServicesPage() {
  const {
    t, locale, isRTL, navigateTo,
    setSelectedServiceId, selectedCategoryId, setSelectedCategoryId,
    searchQuery, setSearchQuery,
  } = useAppStore();

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showSort, setShowSort] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  /* ── Close sort dropdown on outside click ─────────────────────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSort(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Fetch services ───────────────────────────────────────────────────── */
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategoryId) params.set('categoryId', selectedCategoryId);
      if (searchQuery) params.set('search', searchQuery);
      if (sortBy) params.set('sort', sortBy);
      const res = await fetch(`/api/services?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setServices(data.services);
      }
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, searchQuery, sortBy]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  /* ── Fetch categories ─────────────────────────────────────────────────── */
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

  /* ── Debounced search (300ms) ─────────────────────────────────────────── */
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  };

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSearchQuery('');
    setSearchInput('');
    setSortBy('newest');
  };

  const serviceName = (s: Service) => locale === 'ar' ? s.titleAr : s.titleEn;
  const serviceDesc = (s: Service) => locale === 'ar' ? s.descriptionAr : s.descriptionEn;

  const isFiltered = !!(selectedCategoryId || searchQuery);

  /* ── Card click handler ───────────────────────────────────────────────── */
  const handleCardClick = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    navigateTo('service-detail');
  };

  /* ═══════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
            {t('services')}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gradient-purple">
            {locale === 'ar' ? 'جميع التجارب' : 'All Experiences'}
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
              <span className="hidden sm:inline">{locale === 'ar' ? 'بحث' : 'Search'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* ═══ Filter Chips + Sort ═══ */}
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
                !selectedCategoryId && !searchQuery
                  ? 'btn-purple-gradient text-white shadow-lg shadow-purple-500/25'
                  : 'glass border border-purple-500/15 text-muted-foreground glow-purple'
              }`}
            >
              {t('all')}
            </motion.button>

            {/* Category chips */}
            {categories.map((cat) => {
              const catKey = catKeys.includes(cat.icon as any) ? cat.icon : 'adventure';
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
                  {categoryIconMap[catKey]}
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

        {/* ═══ Results Count + Clear ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <p className="text-xs text-muted-foreground">
            {services.length} {locale === 'ar' ? 'تجربة متاحة' : 'experiences available'}
          </p>
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
                  </div>
                  <div className="pt-3 border-t border-purple-500/10 flex justify-between items-center">
                    <div className="h-5 bg-purple-500/8 rounded-lg w-16 animate-pulse" />
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
              {locale === 'ar' ? 'عرض جميع التجارب' : 'View all experiences'}
            </motion.button>
          </motion.div>
        ) : (
          /* ═══ Services Grid ═══ */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`${selectedCategoryId}-${searchQuery}-${sortBy}`}
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
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-purple-900/20" />
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-purple-900/20 to-transparent" />

                      {/* Category badge (top-left) */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg glass border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        {categoryIconMap[catKeys.includes(service.category.icon as any) ? service.category.icon : 'adventure']}
                        {locale === 'ar' ? service.category.nameAr : service.category.nameEn}
                      </span>

                      {/* Featured badge (top-right) */}
                      {service.featured && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg btn-gold-gradient text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          {t('featured')}
                        </span>
                      )}

                      {/* Provider strip at bottom of image */}
                      <div className="absolute bottom-0 inset-x-0 px-4 py-2 bg-gradient-to-t from-[#0a0a0f]/90 to-transparent flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-[9px] font-bold ring-1 ring-purple-500/30">
                          {service.provider.companyName.charAt(0)}
                        </div>
                        <span className="text-[11px] text-white/80 font-medium truncate flex-1">
                          {service.provider.companyName}
                        </span>
                        {service.provider.verified && (
                          <span className="text-[9px] text-purple-300 font-semibold flex items-center gap-0.5">
                            ✓
                          </span>
                        )}
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
                        <span className="text-xs font-semibold text-gold">{service.rating}</span>
                        <span className="text-[10px] text-muted-foreground">
                          ({service.totalReviews} {t('reviews')})
                        </span>
                      </div>

                      {/* Duration / Location with purple icons */}
                      <div className="flex items-center gap-4 mb-4 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          {service.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-purple-400" />
                          {service.location}
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
                            {service.price}
                            <span className="text-sm text-gold/60 ml-1">{t('sar')}</span>
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
      </div>
    </div>
  );
}
