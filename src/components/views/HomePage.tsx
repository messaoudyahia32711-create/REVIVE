'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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
  ChevronDown,
  Sparkles,
  Trophy,
  Award,
  TrendingUp,
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
  serviceCount: number;
}

interface Service {
  id: string;
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
  provider: { companyName: string; rating: number; verified: boolean };
  category: { nameAr: string; nameEn: string; icon: string };
}

// ── Icon Map ──────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ReactNode> = {
  compass: <Compass className="size-8" />,
  building: <Building2 className="size-8" />,
  umbrella: <Umbrella className="size-8" />,
  fish: <Fish className="size-8" />,
  mountain: <Mountain className="size-8" />,
  ship: <Ship className="size-8" />,
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
    roleAr: 'مستكشف',
    roleEn: 'Explorer',
    avatar: '/images/guide1.png',
    rating: 5,
  },
  {
    id: '2',
    quoteAr:
      'أفضل رحلة غطس خضتها في حياتي! الشعاب المرجانية مذهلة والفريق متعاون للغاية. أنصح الجميع بتجربتها.',
    quoteEn:
      'Best diving trip of my life! The coral reefs are amazing and the team is extremely helpful. I recommend it to everyone.',
    authorAr: 'نورة الشمري',
    authorEn: 'Noura Al-Shammari',
    roleAr: 'مغامرة',
    roleEn: 'Adventurer',
    avatar: '/images/guide2.png',
    rating: 5,
  },
  {
    id: '3',
    quoteAr:
      'إقامة رائعة في منتجع الشاطئ. الخدمة فائقة الجودة والمناظر ساحرة. سنعود بالتأكيد في العام القادم.',
    quoteEn:
      'Wonderful stay at the beach resort. Top-quality service and stunning views. We will definitely come back next year.',
    authorAr: 'فهد العتيبي',
    authorEn: 'Fahd Al-Otaibi',
    roleAr: 'مسافر',
    roleEn: 'Traveler',
    avatar: '/images/guide1.png',
    rating: 4,
  },
];

// ── Animation Variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

// ── Counter Hook ──────────────────────────────────────────────────────────────

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (isInView && !hasStarted.current) {
      hasStarted.current = true;
      const startTime = Date.now();
      const isDecimal = end % 1 !== 0;

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(isDecimal ? parseFloat((eased * end).toFixed(1)) : Math.floor(eased * end));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, [isInView, end, duration]);

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

// ── Loading Skeletons ─────────────────────────────────────────────────────────

function ServiceCardSkeleton() {
  return (
    <div className="min-w-[300px] sm:min-w-[340px] overflow-hidden rounded-2xl border bg-card">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-full mt-2" />
      </div>
    </div>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Skeleton className="h-56 w-full rounded-none" />
    </div>
  );
}

// ── Floating Particles Component ──────────────────────────────────────────────

function FloatingParticles() {
  const particles = [
    { className: 'animate-float-1', style: 'top-[12%] left-[8%]', size: 'h-5 w-5' },
    { className: 'animate-float-2', style: 'top-[22%] right-[12%]', size: 'h-3 w-3' },
    { className: 'animate-float-3', style: 'top-[55%] left-[15%]', size: 'h-4 w-4' },
    { className: 'animate-float-4', style: 'top-[40%] right-[18%]', size: 'h-6 w-6' },
    { className: 'animate-float-5', style: 'top-[70%] left-[25%]', size: 'h-3.5 w-3.5' },
    { className: 'animate-float-1', style: 'top-[65%] right-[8%]', size: 'h-4 w-4' },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${p.className} ${p.size} ${
            i % 2 === 0
              ? 'border border-white/15 bg-white/5'
              : 'border border-[#D4A853]/20 bg-[#D4A853]/8'
          }`}
          style={{ ...{ [p.style.split(' ')[0]]: p.style.split(' ')[1], [p.style.split(' ')[2]]: p.style.split(' ')[3] } }}
        />
      ))}
    </div>
  );
}

// ── Section Title Component ───────────────────────────────────────────────────

function SectionTitle({ label, title, description }: { label: string; title: string; description?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={staggerContainer}
      className="mb-14 text-center sm:mb-20"
    >
      <motion.p
        variants={fadeUp}
        custom={0}
        className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#D4A853]"
      >
        {label}
      </motion.p>
      <motion.h2
        variants={fadeUp}
        custom={1}
        className="text-gradient-gold text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          variants={fadeUp}
          custom={2}
          className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg"
        >
          {description}
        </motion.p>
      )}
      {/* Gradient underline decoration */}
      <motion.div
        variants={fadeIn}
        className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#D4A853] via-[#F0D78C] to-[#D4A853]"
      />
    </motion.div>
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
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION — CINEMATIC                                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 hero-bg"
          style={{ backgroundImage: 'url(/images/hero-desert.png)' }}
        />

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 animate-gradient-overlay" />

        {/* Giant "H" Watermark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="watermark-h select-none">H</span>
        </div>

        {/* Floating Particles */}
        <FloatingParticles />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center gap-7"
          >
            {/* Brand Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <Badge
                variant="outline"
                className="border-[#D4A853]/40 bg-[#D4A853]/10 px-5 py-2 text-sm text-[#F0D78C] backdrop-blur-sm"
              >
                <Sparkles className="me-2 size-4 fill-[#F0D78C]" />
                {locale === 'ar' ? 'منصة السياحة الأولى في السعودية' : "Saudi Arabia's #1 Tourism Platform"}
              </Badge>
            </motion.div>

            {/* Giant Title */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}
            >
              {t('heroTitle')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto max-w-2xl text-lg text-white/80 sm:text-xl md:text-2xl"
            >
              {t('heroSubtitle')}
            </motion.p>

            {/* Search Bar — Glass Morphism + Gold Glow */}
            <motion.form
              variants={fadeUp}
              custom={3}
              onSubmit={handleSearch}
              className="mt-2 w-full max-w-2xl"
            >
              <div className="glass gold-glow-focus flex items-center gap-3 rounded-2xl border border-white/20 px-5 py-3.5">
                <Search className="size-5 shrink-0 text-[#D4A853]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('searchServices')}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none sm:text-base"
                />
                <Button
                  type="submit"
                  className="shrink-0 rounded-xl bg-gradient-gold px-6 font-semibold text-white shadow-lg shadow-[#D4A853]/20 transition-all hover:shadow-xl hover:shadow-[#D4A853]/30"
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
                className="group gap-2 rounded-full bg-gradient-gold px-8 text-white font-bold shadow-xl shadow-[#D4A853]/25 transition-all hover:shadow-2xl hover:shadow-[#D4A853]/40 hover:scale-[1.02]"
              >
                {t('heroCta')}
                <DirectionIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  const catSection = document.getElementById('categories-section');
                  catSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="gap-2 rounded-full border border-white/20 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
              >
                {t('heroSecondary')}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs tracking-widest text-white/40 uppercase">
              {locale === 'ar' ? 'اكتشف المزيد' : 'Discover More'}
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="size-6 text-white/50" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 2. CATEGORIES SECTION — PREMIUM CARDS                                 */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section id="categories-section" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            label={t('categoriesTitle')}
            title={t('categoriesSubtitle')}
          />

          {/* Category Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loadingCategories
              ? Array.from({ length: 6 }).map((_, i) => <CategoryCardSkeleton key={i} />)
              : categories.slice(0, 6).map((cat, i) => (
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
                      className="group relative block h-56 w-full overflow-hidden rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-2 transition-transform duration-500 hover:scale-[1.03]"
                    >
                      {/* Full Image Background */}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${cat.image})` }}
                      />

                      {/* Dark Gradient Overlay from Bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                      {/* Glass Overlay on Hover */}
                      <div className="glass absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {/* Shimmer effect */}
                      <div className="animate-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                        {/* Icon */}
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-[#D4A853]/20 backdrop-blur-sm text-[#F0D78C] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#D4A853]/30 group-hover:shadow-lg group-hover:shadow-[#D4A853]/20">
                          {iconMap[cat.icon] || <Compass className="size-8" />}
                        </div>

                        {/* Name */}
                        <h3 className="text-xl font-bold text-white drop-shadow-lg">
                          {locale === 'ar' ? cat.nameAr : cat.nameEn}
                        </h3>

                        {/* Service Count Badge */}
                        <Badge className="border-0 bg-white/15 backdrop-blur-sm text-white/90 text-xs">
                          {cat.serviceCount} {locale === 'ar' ? 'خدمة' : 'services'}
                        </Badge>

                        {/* Explore Text on Hover */}
                        <span className="explore-text mt-1 flex items-center gap-1.5 text-sm font-medium text-[#F0D78C]">
                          {locale === 'ar' ? 'استكشف' : 'Explore'}
                          <DirectionIcon className="size-3.5" />
                        </span>
                      </div>
                    </button>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 3. FEATURED SERVICES — 3D CAROUSEL                                     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            label={locale === 'ar' ? 'خيارات موثوقة' : 'Top Picks'}
            title={locale === 'ar' ? 'تجارب مميزة' : 'Featured Experiences'}
            description={locale === 'ar' ? 'خدمات مختارة بعناية من أفضل مزودي الخدمات' : 'Handpicked experiences from the best service providers'}
          />

          {/* Horizontal Scrollable Section with Snap */}
          <div className="-mx-4 sm:-mx-6 lg:-mx-8">
            <div className="scroll-snap-x flex gap-6 overflow-x-auto px-4 pb-4 sm:px-6 sm:gap-8 lg:px-8">
              <AnimatePresence mode="wait">
                {loadingServices
                  ? Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={`skel-${i}`} />)
                  : services.slice(0, 8).map((service, i) => (
                      <motion.div
                        key={service.id}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        variants={scaleIn}
                        custom={i}
                        className="card-3d min-w-[300px] max-w-[340px] flex-shrink-0 sm:min-w-[340px]"
                      >
                        <div className="card-3d-inner h-full">
                          <Card className="card-hover group h-full overflow-hidden border-0 bg-card shadow-lg">
                            {/* Image Container */}
                            <div className="group/img relative aspect-video overflow-hidden">
                              <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/img:scale-110"
                                style={{
                                  backgroundImage: `url(${service.image || '/images/hero-desert.png'})`,
                                }}
                              />
                              {/* Gradient Overlay on Image */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                              {/* Floating Glass Price Tag */}
                              <div className="absolute top-3 end-3">
                                <div className="glass rounded-lg px-3 py-1.5 border border-white/20">
                                  <span className="text-lg font-bold text-white">{service.price}</span>
                                  <span className="ms-1 text-xs text-white/70">{t('sar')}</span>
                                </div>
                              </div>

                              {/* Provider at bottom of image */}
                              <div className="absolute bottom-3 start-3 flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-full bg-[#D4A853]/90 text-xs font-bold text-white shadow-md">
                                  {service.provider.companyName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-white drop-shadow-md">
                                    {service.provider.companyName}
                                  </p>
                                  {service.provider.verified && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-[#F0D78C]">
                                      <Award className="size-2.5 fill-[#F0D78C]" />
                                      {locale === 'ar' ? 'موثق' : 'Verified'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            <CardContent className="p-5">
                              {/* Category */}
                              <p className="mb-1.5 text-xs font-medium text-[#D4A853]">
                                {locale === 'ar' ? service.category.nameAr : service.category.nameEn}
                              </p>

                              {/* Title */}
                              <h3 className="mb-3 line-clamp-1 text-lg font-semibold leading-tight text-foreground">
                                {locale === 'ar' ? service.titleAr : service.titleEn}
                              </h3>

                              {/* Star Rating + Reviews */}
                              <div className="mb-3 flex items-center gap-2">
                                <StarRating rating={service.rating} />
                                <span className="text-sm font-semibold text-foreground">{service.rating}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({service.totalReviews} {t('reviews')})
                                </span>
                              </div>

                              {/* Duration + Location */}
                              <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="size-3.5 text-[#D4A853]" />
                                  {service.duration}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="size-3.5 text-[#D4A853]" />
                                  {service.location}
                                </span>
                              </div>

                              {/* Book Now Button */}
                              <Button
                                className="w-full gap-2 rounded-xl bg-gradient-gold font-semibold text-white shadow-md shadow-[#D4A853]/15 transition-all hover:shadow-lg hover:shadow-[#D4A853]/30 hover:scale-[1.01]"
                                onClick={() => handleServiceClick(service.id)}
                              >
                                {t('bookNow')}
                                <DirectionIcon className="size-3.5" />
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </motion.div>
                    ))}
              </AnimatePresence>
            </div>
          </div>

          {/* View All Button */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mt-12 flex justify-center"
          >
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigateTo('services')}
              className="gap-2 rounded-full border-[#D4A853]/40 px-8 text-[#D4A853] transition-all hover:bg-[#D4A853] hover:text-white hover:border-[#D4A853]"
            >
              {t('allServices')}
              <DirectionIcon className="size-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 4. STATS SECTION — ANIMATED                                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-mesh-gradient py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4"
          >
            {/* Stat 1 — Satisfied Travelers */}
            <motion.div
              ref={stat1.ref}
              variants={fadeUp}
              custom={0}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm sm:p-8"
            >
              <div className="relative mb-1 flex size-16 items-center justify-center rounded-full bg-[#D4A853]/10 pulse-glow-ring">
                <Users className="size-7 text-[#D4A853]" />
              </div>
              <span className="text-gradient-gold text-3xl font-black sm:text-4xl">
                {stat1.count.toLocaleString()}+
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {locale === 'ar' ? 'مسافر سعيد' : 'Satisfied Travelers'}
              </span>
            </motion.div>

            {/* Stat 2 — Service Providers */}
            <motion.div
              ref={stat2.ref}
              variants={fadeUp}
              custom={1}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm sm:p-8"
            >
              <div className="relative mb-1 flex size-16 items-center justify-center rounded-full bg-[#D4A853]/10 pulse-glow-ring">
                <Building2 className="size-7 text-[#D4A853]" />
              </div>
              <span className="text-gradient-gold text-3xl font-black sm:text-4xl">
                {stat2.count.toLocaleString()}+
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {locale === 'ar' ? 'مزود خدمة' : 'Service Providers'}
              </span>
            </motion.div>

            {/* Stat 3 — Destinations */}
            <motion.div
              ref={stat3.ref}
              variants={fadeUp}
              custom={2}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm sm:p-8"
            >
              <div className="relative mb-1 flex size-16 items-center justify-center rounded-full bg-[#D4A853]/10 pulse-glow-ring">
                <MapPin className="size-7 text-[#D4A853]" />
              </div>
              <span className="text-gradient-gold text-3xl font-black sm:text-4xl">
                {stat3.count}+
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {locale === 'ar' ? 'وجهة سياحية' : 'Destinations'}
              </span>
            </motion.div>

            {/* Stat 4 — Average Rating */}
            <motion.div
              ref={stat4.ref}
              variants={fadeUp}
              custom={3}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm sm:p-8"
            >
              <div className="relative mb-1 flex size-16 items-center justify-center rounded-full bg-[#D4A853]/10 pulse-glow-ring">
                <Trophy className="size-7 text-[#D4A853]" />
              </div>
              <span className="text-gradient-gold text-3xl font-black sm:text-4xl">
                {stat4.count}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {locale === 'ar' ? 'متوسط التقييم' : 'Average Rating'}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 5. TESTIMONIALS SECTION — ELEGANT CARDS                               */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            label={locale === 'ar' ? 'آراء المسافرين' : 'Traveler Reviews'}
            title={locale === 'ar' ? 'ماذا يقول عملاؤنا' : 'What Our Customers Say'}
          />

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
                <Card className="testimonial-card gold-glow group h-full border border-[#D4A853]/15 bg-card p-7 transition-all duration-300 hover:border-[#D4A853]/30 hover:shadow-xl">
                  {/* Large Quote Mark */}
                  <div className="relative mb-5">
                    <Quote className="size-10 text-[#D4A853]/20" />
                    <Quote className="absolute -top-1 -start-1 size-10 text-[#D4A853]/40" />
                  </div>

                  {/* Star Rating */}
                  <div className="mb-4">
                    <StarRating rating={testimonial.rating} size="md" />
                  </div>

                  {/* Quote Text */}
                  <p className="mb-6 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{locale === 'ar' ? testimonial.quoteAr : testimonial.quoteEn}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 border-t border-border/50 pt-5">
                    <div className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-[#D4A853]/10 border-2 border-[#D4A853]/20">
                      <img
                        src={testimonial.avatar}
                        alt={locale === 'ar' ? testimonial.authorAr : testimonial.authorEn}
                        className="h-full w-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {locale === 'ar' ? testimonial.authorAr : testimonial.authorEn}
                      </p>
                      <p className="text-xs text-[#D4A853]">
                        {locale === 'ar' ? testimonial.roleAr : testimonial.roleEn}
                      </p>
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
