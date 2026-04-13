'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Clock,
  Users,
  ChevronDown,
  X,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAppStore } from '@/lib/store';

// ── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
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
  provider: { id: string; companyName: string; rating: number; verified: boolean };
  category: { id: string; nameAr: string; nameEn: string; icon: string };
}

// ── Service Card Component ───────────────────────────────────────────────────

function ServiceCard({
  service,
  locale,
  isRTL,
  t,
  onClick,
}: {
  service: ServiceItem;
  locale: 'ar' | 'en';
  isRTL: boolean;
  t: (key: any) => string;
  onClick: () => void;
}) {
  const title = locale === 'ar' ? service.titleAr : service.titleEn;
  const desc =
    locale === 'ar' ? service.descriptionAr : service.descriptionEn;
  const shortDesc = desc.length > 100 ? desc.slice(0, 100) + '...' : desc;
  const category = locale === 'ar' ? service.category.nameAr : service.category.nameEn;

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="card-3d card-hover overflow-hidden cursor-pointer group border-0 shadow-md bg-card"
        onClick={onClick}
      >
        <div className="card-3d-inner">
          {/* Image */}
          <div className="relative h-52 overflow-hidden">
            <img
              src={mainImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Featured badge */}
            {service.featured && (
              <div className="absolute top-3 start-3">
                <Badge className="bg-gold text-gold-dark border-0 font-semibold shadow-sm">
                  <Star className="size-3 me-1 fill-gold-dark text-gold-dark" />
                  {locale === 'ar' ? 'مميز' : 'Featured'}
                </Badge>
              </div>
            )}

            {/* Category badge */}
            <div className="absolute top-3 end-3">
              <Badge variant="secondary" className="glass text-xs">
                {category}
              </Badge>
            </div>

            {/* Price */}
            <div className="absolute bottom-3 start-3">
              <span className="text-white text-lg font-bold drop-shadow-lg">
                {service.price}{' '}
                <span className="text-sm font-normal opacity-90">
                  {t('sar')} / {t('perPerson')}
                </span>
              </span>
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            {/* Title */}
            <h3 className="font-bold text-base line-clamp-1 group-hover:text-emerald-tourism transition-colors">
              {title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground text-sm line-clamp-2">{shortDesc}</p>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Star className="size-3.5 text-gold fill-gold" />
                <span className="font-medium text-foreground">{service.rating}</span>
                <span>({service.reviewCount})</span>
              </span>
              <Separator orientation="vertical" className="h-3" />
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {service.duration}
              </span>
              <Separator orientation="vertical" className="h-3" />
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                <span className="line-clamp-1">{service.location}</span>
              </span>
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {t('maxPeople')}: {service.maxPeople}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-emerald-tourism hover:text-emerald-dark text-xs font-semibold px-3"
              >
                {t('viewDetails')}
                <ChevronLeft
                  className={`size-3.5 ms-1 ${isRTL ? 'rotate-180' : ''}`}
                />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────

function ServiceCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <Skeleton className="h-52 w-full rounded-none" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

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
    selectedServiceId,
    setSelectedServiceId,
  } = useAppStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<string>('newest');
  const [visibleCount, setVisibleCount] = useState(9);
  const [filterOpen, setFilterOpen] = useState(false);

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
    setVisibleCount(9);
  }, [fetchServices]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

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

  // Filter sidebar content
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm mb-3">{t('filterBy')}</h3>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategoryId === null ? 'default' : 'outline'}
            className="cursor-pointer transition-all hover:bg-emerald-tourism/10 hover:text-emerald-tourism hover:border-emerald-tourism/30 px-3 py-1.5"
            onClick={() => setSelectedCategoryId(null)}
          >
            {t('all')}
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategoryId === cat.id ? 'default' : 'outline'}
              className={`cursor-pointer transition-all px-3 py-1.5 ${
                selectedCategoryId === cat.id
                  ? 'bg-emerald-tourism text-white border-emerald-tourism'
                  : 'hover:bg-emerald-tourism/10 hover:text-emerald-tourism hover:border-emerald-tourism/30'
              }`}
              onClick={() => setSelectedCategoryId(cat.id)}
            >
              <span className="me-1">{cat.icon}</span>
              {locale === 'ar' ? cat.nameAr : cat.nameEn}
              <span className="ms-1 text-xs opacity-70">({cat.serviceCount})</span>
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Sort */}
      <div>
        <h3 className="font-semibold text-sm mb-3">{t('sortBy')}</h3>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Active filters summary */}
      {(selectedCategoryId || searchQuery) && (
        <div>
          <h3 className="font-semibold text-sm mb-3">
            {locale === 'ar' ? 'الفلاتر النشطة' : 'Active Filters'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedCategoryId && (
              <Badge
                variant="secondary"
                className="gap-1 bg-emerald-tourism/10 text-emerald-tourism border-emerald-tourism/20"
              >
                {categories.find((c) => c.id === selectedCategoryId)
                  ? locale === 'ar'
                    ? categories.find((c) => c.id === selectedCategoryId)!.nameAr
                    : categories.find((c) => c.id === selectedCategoryId)!.nameEn
                  : ''}
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
                className="gap-1 bg-emerald-tourism/10 text-emerald-tourism border-emerald-tourism/20"
              >
                &ldquo;{searchQuery}&rdquo;
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header section with breadcrumb */}
      <section className="pt-6 pb-4 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-pointer hover:text-emerald-tourism"
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

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6 mb-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="text-gradient-primary">{t('allServices')}</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            {t('servicesSubtitle')}
          </p>
        </motion.div>
      </section>

      {/* Search bar */}
      <section className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative"
        >
          <div className="glass rounded-xl p-1 gold-glow transition-shadow">
            <div className="relative flex items-center">
              <Search className="absolute start-4 size-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('searchServices')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-12 pe-4 py-6 text-base border-0 bg-transparent shadow-none focus-visible:ring-0 rounded-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute end-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Main content area */}
      <section className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Card className="glass border-0 shadow-md p-5 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="size-4 text-emerald-tourism" />
                  <h2 className="font-semibold">{t('filterBy')}</h2>
                </div>
                <FilterContent />
              </Card>
            </motion.div>
          </aside>

          {/* Main grid area */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter + sort bar */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="size-4" />
                    {t('filterBy')}
                  </Button>
                </SheetTrigger>
                <SheetContent side={isRTL ? 'right' : 'left'} className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{t('filterBy')}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-auto min-w-[140px]" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop sort bar */}
            <div className="hidden lg:flex items-center justify-end mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t('sortBy')}:</span>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-auto min-w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            {!loading && (
              <p className="text-sm text-muted-foreground mb-4">
                {services.length}{' '}
                {locale === 'ar'
                  ? 'خدمة متاحة'
                  : services.length === 1
                    ? 'service available'
                    : 'services available'}
              </p>
            )}

            {/* Services grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            ) : services.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t('noServicesFound')}
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {locale === 'ar'
                    ? 'جرّب تغيير الفلاتر أو كلمة البحث'
                    : 'Try adjusting your filters or search query'}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setSearchQuery('');
                    setSort('newest');
                  }}
                >
                  {locale === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {visibleServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        locale={locale}
                        isRTL={isRTL}
                        t={t}
                        onClick={() => {
                          setSelectedServiceId(service.id);
                          navigateTo('service-detail');
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Show More */}
                {hasMore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center mt-10"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 px-8 border-emerald-tourism/30 text-emerald-tourism hover:bg-emerald-tourism hover:text-white hover:border-emerald-tourism"
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                    >
                      <ChevronDown className="size-4" />
                      {locale === 'ar' ? 'عرض المزيد' : 'Show More'}
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
