'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Search,
  Compass,
  Building2,
  Umbrella,
  Fish,
  Mountain,
  Ship,
  Star,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  image: string;
  sort: number;
  serviceCount: number;
}

interface Service {
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
  image: string;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  featured: boolean;
  provider: { id: string; companyName: string; rating: number; verified: boolean };
  category: { id: string; nameAr: string; nameEn: string; icon: string };
  reviewCount: number;
}

// ── Icon Map ──────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ReactNode> = {
  compass: <Compass className="size-7" />,
  building: <Building2 className="size-7" />,
  umbrella: <Umbrella className="size-7" />,
  fish: <Fish className="size-7" />,
  mountain: <Mountain className="size-7" />,
  ship: <Ship className="size-7" />,
};

// ── Testimonials Static Data ──────────────────────────────────────────────────

const testimonials = [
  {
    id: '1',
    quoteAr:
      'تجربة سياحية لا تُنسى! تنظيم الرحلة كان ممتازاً من البداية للنهاية. المرشد السياحي كان محترفاً وودوداً جداً.',
    quoteEn:
      'An unforgettable tourism experience! The trip organization was excellent from start to finish. The guide was very professional and friendly.',
    authorAr: 'خالد المحمدي',
    authorEn: 'Khalid Al-Mohammadi',
    avatar: '/images/guide1.png',
    rating: 5,
    service: 'جولة السفاري الصحراوية الملكية',
  },
  {
    id: '2',
    quoteAr:
      'أفضل رحلة غطس خضتها في حياتي! الشعاب المرجانية مذهلة والفريق متعاون للغاية. أنصح الجميع بتجربتها.',
    quoteEn:
      'Best diving trip of my life! The coral reefs are amazing and the team is extremely helpful. I recommend it to everyone.',
    authorAr: 'نورة الشمري',
    authorEn: 'Noura Al-Shammari',
    avatar: '/images/guide2.png',
    rating: 5,
    service: 'غوص الشعاب المرجانية',
  },
  {
    id: '3',
    quoteAr:
      'إقامة رائعة في منتجع الشاطئ. الخدمة فائقة الجودة والمناظر ساحرة. سنعود بالتأكيد في العام القادم.',
    quoteEn:
      'Wonderful stay at the beach resort. Top-quality service and stunning views. We will definitely come back next year.',
    authorAr: 'فهد العتيبي',
    authorEn: 'Fahd Al-Otaibi',
    avatar: '/images/guide1.png',
    rating: 4,
    service: 'إجازة الشاطئ الفاخرة',
  },
];

// ── Animation Variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ── Counter Hook ──────────────────────────────────────────────────────────────

function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!startOnView || isInView) {
      if (hasStarted.current) return;
      hasStarted.current = true;
      const startTime = Date.now();
      const isDecimal = end % 1 !== 0;

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(isDecimal ? parseFloat((eased * end).toFixed(1)) : Math.floor(eased * end));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, [isInView, end, duration, startOnView]);

  return { count, ref };
}

// ── Star Rating Component ─────────────────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'sm' ? 'size-3.5' : 'size-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= Math.round(rating)
              ? 'fill-[#F0D78C] text-[#F0D78C]'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

// ── Loading Skeleton for Service Cards ────────────────────────────────────────

function ServiceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </div>
  );
}

// ── Category Card Skeleton ────────────────────────────────────────────────────

function CategoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-24 mx-auto" />
        <Skeleton className="h-4 w-16 mx-auto" />
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function HomePage() {
  const {
    navigateTo,
    t,
    locale,
    isRTL,
    setSelectedCategoryId,
    setSelectedServiceId,
    setSearchQuery,
  } = useAppStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [searchInput, setSearchInput] = useState('');

  // ── Fetch Categories ──────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // ── Fetch Featured Services ───────────────────────────────────────────────

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services?featured=true');
        const data = await res.json();
        if (data.services) setServices(data.services);
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  // ── Stats Counters ────────────────────────────────────────────────────────

  const stat1 = useCountUp(10000, 2500);
  const stat2 = useCountUp(500, 2000);
  const stat3 = useCountUp(50, 1800);
  const stat4 = useCountUp(4.9, 2200);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchInput.trim()) {
        setSearchQuery(searchInput.trim());
        navigateTo('services');
      }
    },
    [searchInput, setSearchQuery, navigateTo]
  );

  const handleCategoryClick = useCallback(
    (id: string) => {
      setSelectedCategoryId(id);
      navigateTo('services');
    },
    [setSelectedCategoryId, navigateTo]
  );

  const handleServiceClick = useCallback(
    (id: string) => {
      setSelectedServiceId(id);
      navigateTo('service-detail');
    },
    [setSelectedServiceId, navigateTo]
  );

  const DirectionIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <main className="min-h-screen bg-background">
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 hero-bg"
          style={{ backgroundImage: 'url(/images/hero-desert.png)' }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/50" />

        {/* Floating Decorative Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute top-[15%] left-[10%] h-20 w-20 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" />
          <div className="animate-float-delayed absolute top-[25%] right-[15%] h-14 w-14 rounded-full border border-[#D4A853]/20 bg-[#D4A853]/5 backdrop-blur-sm" />
          <div className="animate-float absolute bottom-[30%] left-[20%] h-10 w-10 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm rotate-45" />
          <div className="animate-float-delayed absolute bottom-[20%] right-[10%] h-16 w-16 rounded-full border border-[#D4A853]/15 bg-[#D4A853]/5 backdrop-blur-sm" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center gap-6"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <Badge
                variant="outline"
                className="border-[#D4A853]/40 bg-[#D4A853]/10 px-4 py-1.5 text-sm text-[#F0D78C] backdrop-blur-sm"
              >
                <Star className="mr-1.5 size-3.5 fill-[#F0D78C]" />
                {locale === 'ar' ? 'منصة السياحة الأولى في السعودية' : 'Saudi Arabia\'s #1 Tourism Platform'}
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-gradient-gold text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {t('heroTitle')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto max-w-2xl text-base text-white/85 sm:text-lg md:text-xl"
            >
              {t('heroSubtitle')}
            </motion.p>

            {/* Search Bar */}
            <motion.form
              variants={fadeUp}
              custom={3}
              onSubmit={handleSearch}
              className="mt-4 w-full max-w-xl"
            >
              <div className="glass flex items-center rounded-full px-4 py-2">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('searchServices')}
                  className="mx-3 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-base"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="shrink-0 rounded-full bg-[#D4A853] text-background hover:bg-[#B8860B] px-5"
                >
                  {locale === 'ar' ? 'بحث' : 'Search'}
                </Button>
              </div>
            </motion.form>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-4 flex flex-wrap items-center justify-center gap-4"
            >
              <Button
                size="lg"
                onClick={() => navigateTo('services')}
                className="gap-2 rounded-full bg-[#D4A853] px-8 text-background font-semibold hover:bg-[#B8860B] shadow-lg shadow-[#D4A853]/20 transition-all hover:shadow-xl hover:shadow-[#D4A853]/30"
              >
                {t('heroCta')}
                <DirectionIcon className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  const catSection = document.getElementById('categories-section');
                  catSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="gap-2 rounded-full border border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                {t('heroSecondary')}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-white/50">
              {locale === 'ar' ? 'اكتشف المزيد' : 'Discover More'}
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="h-8 w-5 rounded-full border-2 border-white/30 p-1">
                <div className="h-1.5 w-1.5 rounded-full bg-white/60 mx-auto" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 2. CATEGORIES SECTION                                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section id="categories-section" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="mb-12 text-center sm:mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#D4A853]"
            >
              {t('categoriesTitle')}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-gradient-gold text-3xl font-bold sm:text-4xl"
            >
              {t('categoriesSubtitle')}
            </motion.h2>
          </motion.div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loadingCategories
              ? Array.from({ length: 6 }).map((_, i) => <CategoryCardSkeleton key={i} />)
              : categories.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={fadeUp}
                    custom={i}
                  >
                    <button
                      onClick={() => handleCategoryClick(cat.id)}
                      className="card-hover group relative block h-52 w-full overflow-hidden rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-2"
                    >
                      {/* Category Background Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${cat.image})` }}
                      />

                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                      {/* Glass Overlay */}
                      <div className="glass absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                        <div className="flex size-14 items-center justify-center rounded-full bg-[#D4A853]/20 backdrop-blur-sm text-[#F0D78C] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#D4A853]/30">
                          {iconMap[cat.icon] || <Compass className="size-7" />}
                        </div>
                        <h3 className="text-lg font-bold text-white drop-shadow-lg sm:text-xl">
                          {locale === 'ar' ? cat.nameAr : cat.nameEn}
                        </h3>
                        <span className="text-xs text-white/70">
                          {cat.serviceCount}{' '}
                          {locale === 'ar' ? 'خدمة' : 'services'}
                        </span>
                      </div>
                    </button>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 3. FEATURED SERVICES SECTION                                        */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="mb-12 flex flex-col items-center gap-4 sm:mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-sm font-semibold uppercase tracking-widest text-[#0D9488]"
            >
              {locale === 'ar' ? 'خيارات موثوقة' : 'Top Picks'}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-gradient-gold text-3xl font-bold sm:text-4xl"
            >
              {t('featuredServices')}
            </motion.h2>
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loadingServices
              ? Array.from({ length: 3 }).map((_, i) => <ServiceCardSkeleton key={i} />)
              : services.slice(0, 6).map((service, i) => (
                  <motion.div
                    key={service.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={scaleIn}
                    custom={i}
                    className="card-3d"
                  >
                    <div className="card-3d-inner h-full">
                      <Card className="card-hover h-full overflow-hidden border-0 shadow-md">
                        {/* Image */}
                        <div className="group/img relative h-48 overflow-hidden">
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/img:scale-110"
                            style={{
                              backgroundImage: `url(${service.image || '/images/hero-desert.png'})`,
                            }}
                          />
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                          {/* Featured Badge */}
                          {service.featured && (
                            <Badge className="absolute top-3 start-3 border-0 bg-[#D4A853] text-background shadow-sm">
                              <Star className="me-1 size-3 fill-background" />
                              {locale === 'ar' ? 'مميز' : 'Featured'}
                            </Badge>
                          )}

                          {/* Price Tag */}
                          <div className="absolute bottom-3 start-3">
                            <div className="glass rounded-lg px-3 py-1.5">
                              <span className="text-lg font-bold text-white">
                                {service.price}
                              </span>
                              <span className="ms-1 text-xs text-white/80">{t('sar')}</span>
                              <span className="ms-1 text-xs text-white/60">/ {t('perPerson')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <CardContent className="p-4">
                          {/* Provider */}
                          <p className="mb-1 text-xs text-muted-foreground">
                            {service.provider.companyName}
                            {service.provider.verified && (
                              <Badge
                                variant="secondary"
                                className="ms-1.5 border-[#0D9488]/20 bg-[#0D9488]/10 px-1.5 py-0 text-[10px] text-[#0D9488]"
                              >
                                ✓
                              </Badge>
                            )}
                          </p>

                          {/* Title */}
                          <h3 className="mb-3 line-clamp-1 text-base font-semibold leading-tight">
                            {locale === 'ar' ? service.titleAr : service.titleEn}
                          </h3>

                          {/* Rating & Reviews */}
                          <div className="mb-3 flex items-center gap-2">
                            <StarRating rating={service.rating} />
                            <span className="text-sm font-medium text-foreground">
                              {service.rating}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({service.totalReviews} {t('reviews')})
                            </span>
                          </div>

                          {/* Duration & Location */}
                          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5" />
                              {service.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3.5" />
                              {service.location}
                            </span>
                          </div>

                          {/* View Details Button */}
                          <Button
                            variant="outline"
                            className="w-full gap-2 rounded-lg border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853] hover:text-background transition-colors"
                            onClick={() => handleServiceClick(service.id)}
                          >
                            {t('viewDetails')}
                            <DirectionIcon className="size-3.5" />
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mt-10 flex justify-center sm:mt-14"
          >
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigateTo('services')}
              className="gap-2 rounded-full border-[#D4A853]/40 px-8 text-[#D4A853] hover:bg-[#D4A853] hover:text-background transition-all"
            >
              {t('allServices')}
              <DirectionIcon className="size-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 4. STATS SECTION                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0D9488] to-[#065F46] py-20 sm:py-28">
        {/* Decorative Background Pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4"
          >
            {/* Stat 1 - Satisfied Travelers */}
            <motion.div
              ref={stat1.ref}
              variants={fadeUp}
              custom={0}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm sm:p-8"
            >
              <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-white/10">
                <Users className="size-6 text-[#F0D78C]" />
              </div>
              <span className="text-gradient-gold text-3xl font-extrabold sm:text-4xl">
                {stat1.count.toLocaleString()}+
              </span>
              <span className="text-sm text-white/80">
                {locale === 'ar' ? 'مسافر سعيد' : 'Satisfied Travelers'}
              </span>
            </motion.div>

            {/* Stat 2 - Service Providers */}
            <motion.div
              ref={stat2.ref}
              variants={fadeUp}
              custom={1}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm sm:p-8"
            >
              <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-white/10">
                <Building2 className="size-6 text-[#F0D78C]" />
              </div>
              <span className="text-gradient-gold text-3xl font-extrabold sm:text-4xl">
                {stat2.count.toLocaleString()}+
              </span>
              <span className="text-sm text-white/80">
                {locale === 'ar' ? 'مزود خدمة' : 'Service Providers'}
              </span>
            </motion.div>

            {/* Stat 3 - Destinations */}
            <motion.div
              ref={stat3.ref}
              variants={fadeUp}
              custom={2}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm sm:p-8"
            >
              <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-white/10">
                <MapPin className="size-6 text-[#F0D78C]" />
              </div>
              <span className="text-gradient-gold text-3xl font-extrabold sm:text-4xl">
                {stat3.count}+
              </span>
              <span className="text-sm text-white/80">
                {locale === 'ar' ? 'وجهة سياحية' : 'Destinations'}
              </span>
            </motion.div>

            {/* Stat 4 - Average Rating */}
            <motion.div
              ref={stat4.ref}
              variants={fadeUp}
              custom={3}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm sm:p-8"
            >
              <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-white/10">
                <Star className="size-6 fill-[#F0D78C] text-[#F0D78C]" />
              </div>
              <span className="text-gradient-gold text-3xl font-extrabold sm:text-4xl">
                {stat4.count}
              </span>
              <span className="text-sm text-white/80">
                {locale === 'ar' ? 'متوسط التقييم' : 'Average Rating'}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 5. TESTIMONIALS SECTION                                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="mb-12 text-center sm:mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#D4A853]"
            >
              {locale === 'ar' ? 'آراء المسافرين' : 'Traveler Reviews'}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-gradient-gold text-3xl font-bold sm:text-4xl"
            >
              {locale === 'ar' ? 'ماذا يقول عملاؤنا' : 'What Our Customers Say'}
            </motion.h2>
          </motion.div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="gold-glow h-full border border-[#D4A853]/20 bg-card p-6 transition-all hover:border-[#D4A853]/40">
                  {/* Quote Icon */}
                  <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-[#D4A853]/10">
                    <Quote className="size-5 text-[#D4A853]" />
                  </div>

                  {/* Rating */}
                  <div className="mb-4">
                    <StarRating rating={testimonial.rating} size="md" />
                  </div>

                  {/* Quote Text */}
                  <p className="mb-6 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                    {locale === 'ar' ? testimonial.quoteAr : testimonial.quoteEn}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 border-t border-border pt-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#0D9488]/10 overflow-hidden">
                      <img
                        src={testimonial.avatar}
                        alt={locale === 'ar' ? testimonial.authorAr : testimonial.authorEn}
                        className="h-full w-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {locale === 'ar' ? testimonial.authorAr : testimonial.authorEn}
                      </p>
                      <p className="text-xs text-muted-foreground">{testimonial.service}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
