'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef, type FormEvent } from 'react';
import {
  Search, Star, MapPin, Clock, ArrowRight, ChevronDown,
  Shield, Diamond, Lock,
  Quote, Users, Compass, Award,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useCountUp } from '@/hooks/use-count-up';

// ─── Types ────────────────────────────────────────────────
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
  price: number;
  currency?: string;
  duration: string;
  maxPeople: number;
  location: string;
  image: string | null;
  rating: number;
  totalReviews: number;
  featured: boolean;
  provider: {
    companyName: string;
    rating: number;
    verified: boolean;
  };
  category: {
    nameAr: string;
    nameEn: string;
    icon: string;
  };
}

// ─── Icon Map ─────────────────────────────────────────────
const iconMap: Record<string, React.ReactNode> = {
  mountain: <Compass className="w-7 h-7" />,
  city: <Award className="w-7 h-7" />,
  beach: <Diamond className="w-7 h-7" />,
  desert: <Star className="w-7 h-7" />,
  cruise: <Shield className="w-7 h-7" />,
  diving: <Diamond className="w-7 h-7" />,
};

function getCategoryIcon(icon: string) {
  return iconMap[icon] || <Compass className="w-7 h-7" />;
}

// ─── Skeleton Card ────────────────────────────────────────
function ServiceSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-purple-500/10 animate-pulse">
      <div className="aspect-video bg-purple-500/10" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-purple-500/10 rounded-lg w-3/4" />
        <div className="h-3 bg-purple-500/10 rounded-lg w-1/2" />
        <div className="h-3 bg-purple-500/10 rounded-lg w-2/3" />
        <div className="flex gap-3 pt-2">
          <div className="h-3 bg-purple-500/10 rounded w-16" />
          <div className="h-3 bg-purple-500/10 rounded w-20" />
        </div>
        <div className="h-9 bg-purple-500/10 rounded-xl w-full mt-2" />
      </div>
    </div>
  );
}

// ─── Stat Counter Component ───────────────────────────────
function StatItem({
  icon,
  value,
  suffix,
  label,
  delay,
}: {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
  delay: number;
}) {
  const { ref, value: count } = useCountUp({
    end: value,
    duration: 2200,
    decimals: value % 1 !== 0 ? 1 : 0,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="glass rounded-2xl p-6 sm:p-8 text-center border border-purple-500/10"
    >
      <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mx-auto mb-5 pulse-glow-purple">
        {icon}
      </div>
      <p ref={ref} className="text-3xl sm:text-4xl lg:text-5xl font-black text-gradient-gold mb-2 tabular-nums">
        {value >= 1000 ? `${count.toLocaleString()}` : count}
        {suffix}
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</p>
    </motion.div>
  );
}

// ─── Rating Stars ─────────────────────────────────────────
function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.round(rating) ? 'star-filled fill-current' : 'text-gray-600'
          }`}
        />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
export default function HomePage() {
  const {
    t, locale, isRTL,
    navigateTo, setSelectedCategoryId, setSelectedServiceId,
    searchQuery, setSearchQuery,
  } = useAppStore();

  // ─── Data State ────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);

  // ─── Fetch Categories ──────────────────────────────────
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories?.length > 0) {
            setCategories(data.categories);
          }
        }
      } catch {
        // silent fail
      } finally {
        setCatLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // ─── Fetch Featured Services ───────────────────────────
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services?featured=true');
        if (res.ok) {
          const data = await res.json();
          if (data.services?.length > 0) {
            setServices(data.services);
          }
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  // ─── Helpers ───────────────────────────────────────────
  const name = (item: { nameAr: string; nameEn: string }) =>
    locale === 'ar' ? item.nameAr : item.nameEn;

  const handleSearch = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const q = formData.get('search') as string;
      if (q?.trim()) {
        setSearchQuery(q.trim());
        navigateTo('services');
      }
    },
    [setSearchQuery, navigateTo]
  );

  // ─── Bouncing scroll indicator ref ─────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);

  // ─── Data for sections ─────────────────────────────────
  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      value: 10000,
      suffix: '+',
      label: locale === 'ar' ? 'مسافر سعيد' : 'Happy Travelers',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      value: 500,
      suffix: '+',
      label: locale === 'ar' ? 'مزود خدمة موثوق' : 'Verified Providers',
    },
    {
      icon: <Compass className="w-6 h-6" />,
      value: 50,
      suffix: '+',
      label: locale === 'ar' ? 'وجهة سياحية' : 'Destinations',
    },
    {
      icon: <Star className="w-6 h-6" />,
      value: 4.9,
      suffix: '',
      label: locale === 'ar' ? 'متوسط التقييم' : 'Average Rating',
    },
  ];

  const whyFeatures = [
    {
      icon: '🛡️',
      title: locale === 'ar' ? 'مزودون موثقون' : 'Verified Providers',
      desc:
        locale === 'ar'
          ? 'جميع مزودي الخدمة لدينا موثقون ومدققون بعناية لضمان تجارب آمنة وموثوقة'
          : 'All our service providers are verified and carefully vetted to ensure safe and trustworthy experiences',
    },
    {
      icon: '💎',
      title: locale === 'ar' ? 'تجارب فاخرة' : 'Premium Experiences',
      desc:
        locale === 'ar'
          ? 'رحلات سياحية مختارة بعناية تتميز بالفخامة والتميز لتحصل على أفضل تجربة'
          : 'Handpicked luxury tours that stand out with excellence and distinction for the best experience',
    },
    {
      icon: '🔒',
      title: locale === 'ar' ? 'حجز آمن' : 'Secure Booking',
      desc:
        locale === 'ar'
          ? 'دفع آمن ومحمي مع تأكيد فوري للحجز واسترداد سهل للأموال'
          : 'Safe and protected payments with instant booking confirmation and easy refunds',
    },
  ];

  const testimonials = [
    {
      name: locale === 'ar' ? 'أحمد الراشد' : 'Ahmed Al-Rashid',
      text:
        locale === 'ar'
          ? 'تجربة لا تُنسى! أفضل خدمة سفاري جربتها على الإطلاق. المنصة سهلة الاستخدام والمزود محترف جداً.'
          : 'An unforgettable experience! Best safari service I\'ve ever tried. The platform is easy to use and the provider is extremely professional.',
      rating: 5,
      avatar: '/images/avatar-1.png',
    },
    {
      name: locale === 'ar' ? 'سارة محمد' : 'Sara Mohammed',
      text:
        locale === 'ar'
          ? 'الحجز كان سهلاً جداً والتجربة فاقت توقعاتي. أنصح الجميع بتجربة منصة H.'
          : 'Booking was super easy and the experience exceeded my expectations. I recommend everyone to try the H platform.',
      rating: 5,
      avatar: '/images/avatar-2.png',
    },
    {
      name: locale === 'ar' ? 'خالد ناصر' : 'Khalid Nasser',
      text:
        locale === 'ar'
          ? 'سأعود بالتأكيد! الأسعار معقولة والخدمة ممتازة. فريق الدعم متجاوب جداً.'
          : 'Will definitely come back! Reasonable prices and excellent service. The support team is very responsive.',
      rating: 5,
      avatar: '/images/avatar-3.png',
    },
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════
  return (
    <div>
      {/* ════════════════════════════════════════════════════════════
          1. HERO SECTION — Full Viewport
          ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* BG Image */}
        <div
          className="absolute inset-0 hero-bg"
          style={{ backgroundImage: "url('/images/hero-desert.png')" }}
        />

        {/* Animated Purple Gradient Overlay */}
        <div className="absolute inset-0 animate-gradient-overlay" />

        {/* Giant "H" Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="watermark-h">H</span>
        </div>

        {/* 3 Floating Purple Orbs */}
        <div className="absolute top-[15%] left-[10%] w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-orbit-1" />
        <div className="absolute bottom-[20%] right-[15%] w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-orbit-2" />
        <div className="absolute top-[50%] right-[35%] w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-orbit-3" />

        {/* ─── Hero Content ──────────────────────────────── */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-28 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              <span className="text-shimmer-purple">
                {locale === 'ar' ? 'اكتشف' : 'Discover'}
              </span>
              <br />
              <span className="text-shimmer-purple">
                {locale === 'ar' ? 'المملكة مع' : 'the Kingdom with'}
              </span>{' '}
              <span className="text-gradient-gold">H</span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/70 text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              {locale === 'ar'
                ? 'رحلات سياحية فاخرة مع أفضل مزودي الخدمة الموثوقين في المملكة العربية السعودية'
                : 'Luxury tourism experiences with the most trusted service providers in Saudi Arabia'}
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onSubmit={handleSearch}
              className="max-w-xl mx-auto mb-8"
            >
              <div className="glass rounded-2xl p-2 flex items-center gap-2 purple-glow-focus border border-purple-500/20">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search className="w-5 h-5 text-purple-400 shrink-0" />
                  <input
                    name="search"
                    type="text"
                    placeholder={
                      locale === 'ar'
                        ? 'ابحث عن تجارب ووجهات...'
                        : 'Search experiences & destinations...'
                    }
                    defaultValue={searchQuery}
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2.5"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="btn-purple-gradient btn-shimmer px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {locale === 'ar' ? 'بحث' : 'Search'}
                  </span>
                </motion.button>
              </div>
            </motion.form>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigateTo('services')}
                className="btn-purple-gradient btn-shimmer px-8 py-3 rounded-xl font-semibold flex items-center gap-2 text-sm"
              >
                {locale === 'ar' ? 'استكشف الخدمات' : 'Explore Services'}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const el = document.getElementById('categories-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3 rounded-xl border border-purple-500/30 bg-purple-500/5 text-purple-300 font-semibold text-sm flex items-center gap-2 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all duration-300"
              >
                {locale === 'ar' ? 'تصفح الفئات' : 'Browse Categories'}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Bouncing Scroll Indicator */}
        <div
          ref={scrollRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce"
        >
          <span className="text-xs text-white/40 font-medium tracking-wider uppercase">
            {locale === 'ar' ? 'اكتشف المزيد' : 'Scroll Down'}
          </span>
          <ChevronDown className="w-5 h-5 text-purple-400" />
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. CATEGORIES SECTION
          ════════════════════════════════════════════════════════════ */}
      <section id="categories-section" className="py-20 bg-mesh-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs text-purple-400 uppercase tracking-widest font-semibold mb-3">
              {locale === 'ar' ? 'الفئات' : 'Categories'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient-purple">
              {locale === 'ar' ? 'استكشف الفئات' : 'Explore Categories'}
            </h2>
          </motion.div>

          {/* Category Grid */}
          {catLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-purple-500/10 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.slice(0, 6).map((cat, idx) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    navigateTo('services');
                  }}
                  className="group relative h-48 rounded-2xl overflow-hidden card-hover text-start cursor-pointer"
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: cat.image
                        ? `url(${cat.image})`
                        : `url('/images/category-${cat.icon || 'adventure'}.png')`,
                    }}
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-6">
                    {/* Icon */}
                    <div className="text-purple-400 text-3xl mb-2">
                      {getCategoryIcon(cat.icon)}
                    </div>

                    {/* Name */}
                    <h3 className="text-white font-semibold text-lg mb-2">{name(cat)}</h3>

                    {/* Service Count Badge */}
                    <div className="inline-flex self-start">
                      <span className="bg-purple-500/20 text-purple-300 text-xs font-medium px-3 py-1 rounded-full">
                        {cat.serviceCount}{' '}
                        {locale === 'ar' ? 'خدمة' : 'services'}
                      </span>
                    </div>

                    {/* Explore Text (revealed on hover) */}
                    <span className="explore-text text-sm text-purple-300 font-medium mt-2 flex items-center gap-1">
                      {locale === 'ar' ? 'استكشف الآن' : 'Explore Now'}{' '}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. FEATURED SERVICES SECTION
          ════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-3">
              {locale === 'ar' ? 'المميزة' : 'Featured'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-shimmer-gold">
              {locale === 'ar' ? 'تجارب مميزة' : 'Featured Experiences'}
            </h2>
          </motion.div>

          {loading ? (
            /* 6 Skeleton Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ServiceSkeleton key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {services.slice(0, 6).map((service) => (
                <motion.div key={service.id} variants={itemVariants} className="card-3d">
                  <div className="card-3d-inner">
                    <div className="card-ornament card-hover glass rounded-2xl overflow-hidden border border-purple-500/10 group">
                      {/* Image */}
                      <div className="relative aspect-video overflow-hidden">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={name(service)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-purple-900/30 flex items-center justify-center">
                            <Compass className="w-12 h-12 text-purple-400/40" />
                          </div>
                        )}

                        {/* Purple gradient overlay on image */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/60" />

                        {/* Price Tag — top-right, gold gradient pill */}
                        <div className="absolute top-3 right-3 z-10">
                          <span className="btn-gold-gradient rounded-full px-3 py-1 text-xs font-bold">
                            {service.price}{' '}
                            {locale === 'ar' ? 'ر.س' : (service.currency || 'SAR')}
                          </span>
                        </div>

                        {/* Provider strip — bottom of image */}
                        <div className="absolute bottom-0 left-0 right-0 z-10">
                          <div className="glass px-4 py-2 flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="text-xs text-white/80 font-medium truncate">
                              {service.provider.companyName}
                            </span>
                            {service.provider.verified && (
                              <Shield className="w-3 h-3 text-green-400 shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Title */}
                        <h3 className="text-white font-semibold text-base mb-2 line-clamp-1">
                          {name(service)}
                        </h3>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-2 mb-3">
                          <RatingStars rating={service.rating} />
                          <span className="text-xs text-muted-foreground">
                            {service.rating} ({service.totalReviews})
                          </span>
                        </div>

                        {/* Duration + Location */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            {service.duration}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-purple-400" />
                            {service.location}
                          </span>
                        </div>

                        {/* Book Now */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedServiceId(service.id);
                            navigateTo('service-detail');
                          }}
                          className="btn-purple-gradient btn-shimmer w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigateTo('services')}
              className="btn-purple-gradient btn-shimmer px-8 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto"
            >
              {locale === 'ar' ? 'عرض جميع الخدمات' : 'View All Services'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. STATS SECTION
          ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-mesh-gradient relative overflow-hidden">
        {/* Top separator line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient-purple">
              {locale === 'ar' ? 'أرقامنا تتحدث' : 'Our Numbers Speak'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, idx) => (
              <StatItem key={stat.label} {...stat} delay={idx * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. WHY H? SECTION
          ════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-3">
              Why H?
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient-mixed">
              {locale === 'ar' ? 'لماذا تختار H؟' : 'Why Choose H?'}
            </h2>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                whileHover={{ y: -6 }}
                className="card-ornament corner-ornament glass rounded-2xl p-8 text-center border border-purple-500/10 glow-purple group"
              >
                {/* Icon with glow */}
                <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-500 glow-purple inline-block">
                  {feature.icon}
                </div>

                <h3 className="font-bold text-foreground text-xl mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6. TESTIMONIALS SECTION
          ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-mesh-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs text-purple-400 uppercase tracking-widest font-semibold mb-3">
              {locale === 'ar' ? 'آراء العملاء' : 'Testimonials'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient-mixed">
              {locale === 'ar' ? 'ماذا يقول عملاؤنا' : 'What Our Clients Say'}
            </h2>
          </motion.div>

          {/* Testimonial Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="testimonial-card glass rounded-2xl p-6 sm:p-8 border border-purple-500/10 hover:border-purple-500/25 transition-all duration-300"
              >
                {/* Large Quote Icon */}
                <Quote className="w-10 h-10 text-purple-500/30 mb-5" />

                {/* Text */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {item.text}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5 border-t border-purple-500/10">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {item.name}
                    </p>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < item.rating ? 'star-filled fill-current' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
