'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Clock,
  Star,
  Filter,
  X,
  ChevronDown,
  Sparkles,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAppStore } from '@/lib/store';

/* ── Types ──────────────────────────────────────────────────────────────── */

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  image: string;
  serviceCount: number;
}

interface ServiceItem {
  id: string;
  providerId: string;
  categoryId: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  currency: string;
  duration: string;
  maxPeople: number;
  location: string;
  image: string | null;
  images: string;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  featured: boolean;
  reviewCount: number;
  provider: {
    id: string;
    companyName: string;
    rating: number;
    verified: boolean;
    user?: { name?: string; avatar?: string };
  };
  category: { id: string; nameAr: string; nameEn: string; icon: string };
}

/* ── Rating Stars ───────────────────────────────────────────────────────── */

function RatingStars({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`size-3.5 ${
              star <= Math.round(rating)
                ? 'text-gold fill-gold'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-foreground">{rating}</span>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
}

/* ── Service Card Component ─────────────────────────────────────────────── */

function ServiceCard({
  service,
  locale,
  isRTL,
  t,
  onClick,
  index,
}: {
  service: ServiceItem;
  locale: 'ar' | 'en';
  isRTL: boolean;
  t: (key: any) => string;
  onClick: () => void;
  index: number;
}) {
  const title = locale === 'ar' ? service.titleAr : service.titleEn;
  const desc =
    locale === 'ar' ? service.descriptionAr : service.descriptionEn;
  const categoryName = locale === 'ar' ? service.category.nameAr : service.category.nameEn;
  const providerName = service.provider.companyName;

  const images: string[] = [];
  try {
    const parsed = JSON.parse(service.images || '[]');
    if (Array.isArray(parsed)) images.push(...parsed);
  } catch {
    // ignore
  }
  const mainImage = service.image || images[0] || '/placeholder-service.jpg';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Card
        className="group cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card card-hover shadow-sm hover:shadow-xl"
        onClick={onClick}
      >
        {/* ── Image Section ──────────────────────────────────────────── */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={mainImage}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Category badge — top left */}
          <div className="absolute top-3 start-3">
            <Badge className="glass border-0 text-xs font-medium text-white shadow-sm px-2.5 py-1">
              <span className="me-1">{service.category.icon}</span>
              {categoryName}
            </Badge>
          </div>

          {/* Featured badge — top right */}
          {service.featured && (
            <div className="absolute top-3 end-3">
              <Badge className="border-0 text-xs font-semibold text-white shadow-sm px-2.5 py-1 bg-gradient-to-r from-gold-dark to-gold">
                <Sparkles className="size-3 me-1" />
                {locale === 'ar' ? 'مميز' : 'Featured'}
              </Badge>
            </div>
          )}

          {/* Provider info strip at bottom of image */}
          <div className="absolute bottom-0 inset-x-0 glass border-0 border-t border-white/10 px-3 py-2 flex items-center gap-2">
            <div className="flex items-center justify-center size-7 rounded-full bg-primary/20 ring-1 ring-white/20 text-xs font-bold text-white shrink-0">
              {providerName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-white truncate">
              {providerName}
            </span>
            {service.provider.verified && (
              <span className="text-[10px] text-emerald-light font-medium ms-auto shrink-0">
                ✓ {locale === 'ar' ? 'موثق' : 'Verified'}
              </span>
            )}
          </div>
        </div>

        {/* ── Content Section ────────────────────────────────────────── */}
        <CardContent className="p-5 space-y-3">
          {/* Title — 2 lines max */}
          <h3 className="font-semibold text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>

          {/* Short description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {desc}
          </p>

          {/* Rating */}
          <RatingStars rating={service.rating} count={service.reviewCount} />

          {/* Meta info row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary/70" />
              {service.duration}
            </span>
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="size-3.5 text-primary/70 shrink-0" />
              <span className="truncate">{service.location}</span>
            </span>
          </div>

          {/* Price */}
          <div className="pt-1">
            <span className="text-xl font-bold text-gold">
              {service.price}
            </span>
            <span className="text-sm font-medium text-gold-dark ms-1">
              {t('sar')}
            </span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              {t('perPerson')}
            </span>
          </div>

          {/* View Details Button */}
          <Button
            variant="outline"
            className="w-full mt-3 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {t('viewDetails')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Loading Skeleton ───────────────────────────────────────────────────── */

function ServiceCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-xl border border-border/60">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-10 w-full mt-3" />
      </CardContent>
    </Card>
  );
}

/* ── Star Rating for display ────────────────────────────────────────────── */

function EmptyState({
  locale,
  t,
  onClear,
}: {
  locale: 'ar' | 'en';
  t: (key: any) => string;
  onClear: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-24 text-center px-4"
    >
      <div className="relative mb-6">
        <div className="size-24 rounded-full bg-primary/5 flex items-center justify-center">
          <Compass className="size-10 text-primary/40" />
        </div>
        <motion.div
          className="absolute -top-1 -end-1 size-7 rounded-full bg-gold/10 flex items-center justify-center"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Sparkles className="size-4 text-gold" />
        </motion.div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{t('noServicesFound')}</h3>
      <p className="text-muted-foreground text-sm max-w-md mb-6">
        {locale === 'ar'
          ? 'لم نتمكن من العثور على تجارب تطابق بحثك. جرّب تعديل الفلاتر أو كلمة البحث.'
          : 'No experiences match your search. Try adjusting your filters or search query.'}
      </p>
      <Button
        variant="outline"
        className="gap-2 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
        onClick={onClear}
      >
        <Filter className="size-4" />
        {locale === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
      </Button>
    </motion.div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */

export default function ServicesPage() {
  const {
    locale,
    isRTL,
    t,
    navigateTo,
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    setSelectedServiceId,
  } = useAppStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<string>('newest');
  const [visibleCount, setVisibleCount] = useState(6);

  // Local search state for debouncing
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const chipsRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Debounced search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // Fetch services
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategoryId) params.set('categoryId', selectedCategoryId);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (sort) params.set('sort', sort);

      const res = await fetch(`/api/services?${params.toString()}`);
      const data = await res.json();
      if (data.services) setServices(data.services);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, searchQuery, sort]);

  useEffect(() => {
    fetchServices();
    setVisibleCount(6);
  }, [fetchServices]);

  // Visible services
  const visibleServices = useMemo(
    () => services.slice(0, visibleCount),
    [services, visibleCount],
  );
  const hasMore = visibleCount < services.length;

  // Sort options
  const sortOptions = [
    { value: 'newest', label: t('newest') },
    { value: 'price-asc', label: t('priceLow') },
    { value: 'price-desc', label: t('priceHigh') },
    { value: 'rating', label: t('topRated') },
  ];

  const handleClearFilters = () => {
    setSelectedCategoryId(null);
    setLocalSearch('');
    setSearchQuery('');
    setSort('newest');
  };

  const handleServiceClick = (id: string) => {
    setSelectedServiceId(id);
    navigateTo('service-detail');
  };

  return (
    <div className="min-h-screen">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <section className="pt-6 pb-2 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigateTo('home')}
              >
                {t('home')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('services')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-5 mb-6"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
            <span className="text-gradient-primary">{t('allServices')}</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-base md:text-lg max-w-2xl">
            {t('servicesSubtitle')}
          </p>
        </motion.div>
      </section>

      {/* ── Search Bar ──────────────────────────────────────────────── */}
      <section className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto mb-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="glass rounded-2xl p-1.5 gold-glow transition-all duration-300 border-gold/20">
            <div className="relative flex items-center">
              <Search className="absolute start-4 size-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder={t('searchServices')}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="ps-12 pe-10 py-6 text-base border-0 bg-transparent shadow-none focus-visible:ring-0 rounded-xl placeholder:text-muted-foreground/60"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute end-4 size-7 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Filter Chips & Sort Row ──────────────────────────────────── */}
      <section className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Filter Chips — horizontal scroll */}
          <div
            ref={chipsRef}
            className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none flex-1 min-w-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* "All" chip */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCategoryId(null)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedCategoryId === null
                  ? 'bg-gradient-to-r from-primary to-emerald-light text-white shadow-md shadow-primary/25'
                  : 'glass text-foreground/70 hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {locale === 'ar' ? 'الكل' : 'All'}
            </motion.button>

            {/* Category chips */}
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  setSelectedCategoryId(
                    selectedCategoryId === cat.id ? null : cat.id,
                  )
                }
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedCategoryId === cat.id
                    ? 'bg-gradient-to-r from-primary to-emerald-light text-white shadow-md shadow-primary/25'
                    : 'glass text-foreground/70 hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{locale === 'ar' ? cat.nameAr : cat.nameEn}</span>
                <span className="text-xs opacity-60">({cat.serviceCount})</span>
              </motion.button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="shrink-0">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-auto min-w-[170px] glass rounded-xl border-border/40 font-medium text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters summary */}
        <AnimatePresence>
          {(selectedCategoryId || searchQuery) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium">
                  {locale === 'ar' ? 'الفلاتر النشطة:' : 'Active filters:'}
                </span>
                {selectedCategoryId && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 bg-primary/5 text-primary border-primary/15 px-3 py-1 rounded-full"
                  >
                    <span>
                      {categories.find((c) => c.id === selectedCategoryId)
                        ? locale === 'ar'
                          ? categories.find((c) => c.id === selectedCategoryId)!
                              .nameAr
                          : categories.find((c) => c.id === selectedCategoryId)!
                              .nameEn
                        : ''}
                    </span>
                    <button
                      onClick={() => setSelectedCategoryId(null)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 bg-primary/5 text-primary border-primary/15 px-3 py-1 rounded-full"
                  >
                    &ldquo;{searchQuery}&rdquo;
                    <button
                      onClick={() => {
                        setLocalSearch('');
                        setSearchQuery('');
                      }}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Results Count ───────────────────────────────────────────── */}
      {!loading && services.length > 0 && (
        <section className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto mb-4">
          <p className="text-sm text-muted-foreground">
            {services.length}{' '}
            {locale === 'ar'
              ? 'تجربة متاحة'
              : services.length === 1
                ? 'experience available'
                : 'experiences available'}
          </p>
        </section>
      )}

      {/* ── Services Grid / Loading / Empty ─────────────────────────── */}
      <section className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        {loading ? (
          /* Skeleton grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            locale={locale}
            t={t}
            onClear={handleClearFilters}
          />
        ) : (
          <>
            {/* Services grid */}
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {visibleServices.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    locale={locale}
                    isRTL={isRTL}
                    t={t}
                    onClick={() => handleServiceClick(service.id)}
                    index={index % 6}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mt-12"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 px-10 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 font-medium shadow-sm"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                >
                  <ChevronDown className="size-4" />
                  {locale === 'ar' ? 'عرض المزيد' : 'Load More'}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
