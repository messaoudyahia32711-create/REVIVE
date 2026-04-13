'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Star,
  MapPin,
  Clock,
  Users,
  Calendar,
  Shield,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Heart,
  Check,
  ChevronRight,
  Send,
  Minus,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface ServiceDetail {
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
  avgRating: number;
  provider: {
    id: string;
    userId: string;
    companyName: string;
    description: string | null;
    rating: number;
    totalReviews: number;
    verified: boolean;
    user: { name: string; phone: string | null; avatar: string | null };
  };
  category: { id: string; nameAr: string; nameEn: string; icon: string };
  reviews: ReviewItem[];
}

interface ReviewItem {
  id: string;
  userId: string;
  serviceId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
}

interface RelatedService {
  id: string;
  titleAr: string;
  titleEn: string;
  price: number;
  image: string | null;
  rating: number;
  reviewCount: number;
  duration: string;
  location: string;
}

// ── Star Rating Component ────────────────────────────────────────────────────

function StarRating({
  rating,
  size = 'sm',
  interactive = false,
  onChange,
}: {
  rating: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
    xl: 'size-8',
  };

  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${
            interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'
          } transition-transform duration-200`}
          onClick={() => interactive && onChange?.(star)}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-gold fill-gold star-filled'
                : 'text-muted-foreground/25'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Animated Section Wrapper ─────────────────────────────────────────────────

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function ServiceDetailPage() {
  const {
    locale,
    isRTL,
    t,
    navigateTo,
    goBack,
    selectedServiceId,
    bookingDate,
    setBookingDate,
    bookingPeople,
    setBookingPeople,
    bookingNotes,
    setBookingNotes,
    resetBooking,
    user,
    isAuthenticated,
    showToast,
  } = useAppStore();

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [relatedServices, setRelatedServices] = useState<RelatedService[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch service detail
  useEffect(() => {
    if (!selectedServiceId) return;
    async function fetchService() {
      setLoading(true);
      try {
        const res = await fetch(`/api/services/${selectedServiceId}`);
        const data = await res.json();
        if (data.service) {
          setService(data.service);
          setReviews(data.service.reviews || []);
        }
      } catch (err) {
        console.error('Failed to fetch service:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [selectedServiceId]);

  // Fetch related services
  useEffect(() => {
    if (!service) return;
    async function fetchRelated() {
      try {
        const res = await fetch(
          `/api/services?categoryId=${service.categoryId}`,
        );
        const data = await res.json();
        if (data.services) {
          setRelatedServices(
            data.services
              .filter((s: RelatedService) => s.id !== service.id)
              .slice(0, 4),
          );
        }
      } catch (err) {
        console.error('Failed to fetch related services:', err);
      }
    }
    fetchRelated();
  }, [service]);

  // Images
  const images: string[] = useMemo(() => {
    if (!service) return [];
    const imgs: string[] = [];
    try {
      const parsed = JSON.parse(service.images || '[]');
      if (Array.isArray(parsed)) imgs.push(...parsed);
    } catch {
      // ignore
    }
    if (service.image && !imgs.includes(service.image)) {
      imgs.unshift(service.image);
    }
    return imgs.length > 0 ? imgs : ['/placeholder-service.jpg'];
  }, [service]);

  // Average rating
  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1);
  }, [reviews]);

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
    });
    return dist;
  }, [reviews]);

  // Localized helpers
  const title = service
    ? locale === 'ar'
      ? service.titleAr
      : service.titleEn
    : '';
  const description = service
    ? locale === 'ar'
      ? service.descriptionAr
      : service.descriptionEn
    : '';
  const categoryName = service
    ? locale === 'ar'
      ? service.category.nameAr
      : service.category.nameEn
    : '';
  const totalPrice = service ? service.price * bookingPeople : 0;

  // Back arrow
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const ForwardArrow = isRTL ? ArrowLeft : ArrowRight;

  // ── Booking handler ──────────────────────────────────────────────────────
  async function handleBooking() {
    if (!service || !isAuthenticated || !user) {
      navigateTo('login');
      return;
    }
    if (!bookingDate) {
      showToast(
        locale === 'ar' ? 'يرجى اختيار التاريخ' : 'Please select a date',
        'error',
      );
      return;
    }
    if (bookingPeople < 1) {
      showToast(
        locale === 'ar'
          ? 'يجب اختيار شخص واحد على الأقل'
          : 'At least 1 person is required',
        'error',
      );
      return;
    }

    setSubmittingBooking(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          serviceId: service.id,
          providerId: service.providerId,
          bookingDate,
          numberOfPeople: bookingPeople,
          notes: bookingNotes || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.booking) {
        showToast(t('bookingSuccess'), 'success');
        resetBooking();
        navigateTo('user-dashboard');
      } else {
        showToast(data.error || t('error'), 'error');
      }
    } catch {
      showToast(t('error'), 'error');
    } finally {
      setSubmittingBooking(false);
    }
  }

  // ── Review handler ───────────────────────────────────────────────────────
  async function handleReviewSubmit() {
    if (!service || !isAuthenticated || !user) return;
    if (reviewRating < 1) {
      showToast(
        locale === 'ar' ? 'يرجى اختيار التقييم' : 'Please select a rating',
        'error',
      );
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          serviceId: service.id,
          rating: reviewRating,
          comment: reviewComment || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.review) {
        showToast(
          locale === 'ar' ? 'تم إرسال التقييم بنجاح' : 'Review submitted!',
          'success',
        );
        setReviews((prev) => [data.review, ...prev]);
        setReviewRating(0);
        setReviewComment('');
      } else {
        showToast(data.error || t('error'), 'error');
      }
    } catch {
      showToast(t('error'), 'error');
    } finally {
      setSubmittingReview(false);
    }
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-60" />
        </div>
        <Skeleton className="w-full aspect-video rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <div>
            <Skeleton className="h-[500px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('noData')}</p>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-16">
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-6 space-y-8">
        {/* ── Breadcrumb + Back Button ──────────────────────────────────── */}
        <AnimatedSection>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-emerald-tourism/10 hover:text-emerald-tourism transition-colors"
              onClick={goBack}
            >
              <BackArrow className="size-5" />
            </Button>
            <Breadcrumb className="flex-1">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="cursor-pointer hover:text-emerald-tourism transition-colors"
                    onClick={() => navigateTo('home')}
                  >
                    {t('home')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="cursor-pointer hover:text-emerald-tourism transition-colors"
                    onClick={() => navigateTo('services')}
                  >
                    {t('services')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1 max-w-[180px] font-medium">
                    {title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </AnimatedSection>

        {/* ── Hero Image Gallery ────────────────────────────────────────── */}
        <AnimatedSection delay={0.05}>
          <div className="relative group">
            {/* Main hero image */}
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video md:aspect-video">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={images[activeImage] || '/placeholder-service.jpg'}
                  alt={title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </AnimatePresence>

              {/* Gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Featured badge */}
              {service.featured && (
                <Badge className="absolute top-4 start-4 bg-gold text-gold-dark border-0 shadow-lg font-semibold">
                  <Star className="size-3 me-1.5 fill-gold-dark text-gold-dark" />
                  {locale === 'ar' ? 'مميز' : 'Featured'}
                </Badge>
              )}

              {/* Favorite button */}
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="absolute top-4 end-4 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/80 transition-all duration-300 hover:scale-110"
              >
                <Heart
                  className={`size-5 transition-colors duration-300 ${
                    isFavorited
                      ? 'text-red-500 fill-red-500'
                      : 'text-white'
                  }`}
                />
              </button>

              {/* Image navigation arrows */}
              {images.length > 1 && (
                <>
                  {activeImage > 0 && (
                    <button
                      onClick={() =>
                        setActiveImage((p) => Math.max(0, p - 1))
                      }
                      className="absolute start-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full glass flex items-center justify-center hover:bg-white/90 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                    >
                      <BackArrow className="size-5 text-foreground" />
                    </button>
                  )}
                  {activeImage < images.length - 1 && (
                    <button
                      onClick={() =>
                        setActiveImage((p) =>
                          Math.min(images.length - 1, p + 1),
                        )
                      }
                      className="absolute end-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full glass flex items-center justify-center hover:bg-white/90 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                    >
                      <ForwardArrow className="size-5 text-foreground" />
                    </button>
                  )}
                </>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 end-4 glass rounded-full px-3 py-1.5 text-white text-xs font-medium">
                  {activeImage + 1} / {images.length}
                </div>
              )}

              {/* Title overlay on bottom of image */}
              <div className="absolute bottom-0 inset-x-0 p-6">
                <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {title}
                </h1>
              </div>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1 scrollbar-thin">
                {images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      idx === activeImage
                        ? 'border-gold shadow-lg ring-2 ring-gold/30'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/50'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* ── Main Layout: 2 columns (2/3 + 1/3) ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Category badge + Rating row */}
            <AnimatedSection delay={0.1}>
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="glass text-foreground font-medium px-3 py-1"
                  >
                    {service.category.icon} {categoryName}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gold/10 rounded-full px-3 py-1">
                      <span className="text-lg font-bold text-gold">
                        {service.avgRating}
                      </span>
                      <StarRating
                        rating={Math.round(service.avgRating)}
                        size="sm"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({service.totalReviews} {t('reviews')})
                    </span>
                  </div>
                </div>

                {/* Info grid: Duration, Location, Max People */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="glass rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-tourism/10 flex items-center justify-center shrink-0">
                      <Clock className="size-5 text-emerald-tourism" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {t('duration')}
                      </p>
                      <p className="font-semibold text-sm truncate">
                        {service.duration}
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="glass rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-tourism/10 flex items-center justify-center shrink-0">
                      <MapPin className="size-5 text-emerald-tourism" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {t('location')}
                      </p>
                      <p className="font-semibold text-sm truncate">
                        {service.location}
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="glass rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-tourism/10 flex items-center justify-center shrink-0">
                      <Users className="size-5 text-emerald-tourism" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {t('maxPeople')}
                      </p>
                      <p className="font-semibold text-sm truncate">
                        {service.maxPeople}{' '}
                        {locale === 'ar' ? 'أشخاص' : 'people'}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </AnimatedSection>

            {/* Description */}
            <AnimatedSection delay={0.15}>
              <div className="glass rounded-2xl p-6 md:p-8">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 rounded-full bg-emerald-tourism" />
                  {locale === 'ar' ? 'عن الخدمة' : 'About This Service'}
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-[1.85] text-[15px] whitespace-pre-wrap">
                    {description}
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <Separator className="opacity-50" />

            {/* ── Provider Section ─────────────────────────────────────── */}
            <AnimatedSection delay={0.2}>
              <div className="glass rounded-2xl p-6 md:p-8">
                <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 rounded-full bg-gold" />
                  {locale === 'ar' ? 'مزود الخدمة' : 'Service Provider'}
                </h2>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="size-16 border-2 border-emerald-tourism/20 shadow-md">
                        <AvatarImage
                          src={service.provider.user.avatar || undefined}
                        />
                        <AvatarFallback className="bg-emerald-tourism/10 text-emerald-tourism font-bold text-lg">
                          {service.provider.companyName.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {service.provider.verified && (
                        <div className="absolute -bottom-1 -end-1 bg-emerald-tourism rounded-full p-0.5 border-2 border-background">
                          <Shield className="size-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">
                          {service.provider.companyName}
                        </h3>
                        {service.provider.verified && (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-tourism/10 text-emerald-tourism border-0 text-xs font-medium"
                          >
                            <Check className="size-3 me-1" />
                            {locale === 'ar' ? 'موثّق' : 'Verified'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <StarRating
                          rating={Math.round(service.provider.rating)}
                          size="sm"
                        />
                        <span className="font-medium text-foreground">
                          {service.provider.rating}
                        </span>
                        <span>
                          ({service.provider.totalReviews} {t('reviews')})
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2 border-emerald-tourism/30 text-emerald-tourism hover:bg-emerald-tourism hover:text-white rounded-xl px-5 h-10"
                    onClick={() => {
                      if (isAuthenticated) {
                        showToast(
                          locale === 'ar'
                            ? 'سيتم فتح المحادثة قريباً'
                            : 'Chat coming soon!',
                          'info',
                        );
                      } else {
                        navigateTo('login');
                      }
                    }}
                  >
                    <MessageCircle className="size-4" />
                    {t('contactProvider')}
                  </Button>
                </div>
              </div>
            </AnimatedSection>

            {/* ── Reviews Section ──────────────────────────────────────── */}
            <AnimatedSection delay={0.25}>
              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <div className="w-1 h-6 rounded-full bg-gold" />
                  <Star className="size-5 text-gold fill-gold" />
                  {t('reviews')} ({reviews.length})
                </h2>

                {/* Average rating + bar chart */}
                <Card className="glass border-0 shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      {/* Large rating number */}
                      <div className="text-center shrink-0">
                        <motion.div
                          className="text-6xl font-extrabold text-gradient-gold leading-none"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 15,
                            delay: 0.3,
                          }}
                        >
                          {avgRating || '—'}
                        </motion.div>
                        <StarRating
                          rating={Math.round(Number(avgRating) || 0)}
                          size="lg"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          {reviews.length}{' '}
                          {locale === 'ar' ? 'تقييم' : 'reviews'}
                        </p>
                      </div>

                      {/* Bar chart */}
                      <div className="flex-1 w-full space-y-2.5">
                        {[5, 4, 3, 2, 1].map((star, idx) => {
                          const count = ratingDistribution[star - 1];
                          const pct =
                            reviews.length > 0
                              ? (count / reviews.length) * 100
                              : 0;
                          return (
                            <div
                              key={star}
                              className="flex items-center gap-3 text-sm"
                            >
                              <span className="w-4 text-center font-medium text-muted-foreground">
                                {star}
                              </span>
                              <Star className="size-3.5 text-gold fill-gold shrink-0" />
                              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{
                                    duration: 0.8,
                                    delay: 0.4 + idx * 0.1,
                                    ease: 'easeOut',
                                  }}
                                />
                              </div>
                              <span className="w-8 text-end text-xs text-muted-foreground font-medium tabular-nums">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Write a review form (authenticated only) */}
                {isAuthenticated && (
                  <Card className="glass border-0 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base flex items-center gap-2 font-bold">
                        <Send className="size-4 text-emerald-tourism" />
                        {t('writeReview')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div>
                        <label className="text-sm font-medium mb-3 block text-muted-foreground">
                          {t('yourRating')}
                        </label>
                        <div className="flex items-center gap-1" dir="ltr">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              type="button"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="cursor-pointer transition-transform"
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setHoveredStar(star)}
                              onMouseLeave={() => setHoveredStar(0)}
                            >
                              <Star
                                className={`size-7 transition-colors duration-200 ${
                                  star <= (hoveredStar || reviewRating)
                                    ? 'text-gold fill-gold'
                                    : 'text-muted-foreground/25'
                                }`}
                              />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-muted-foreground">
                          {t('yourComment')}
                        </label>
                        <Textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder={
                            locale === 'ar'
                              ? 'شارك تجربتك...'
                              : 'Share your experience...'
                          }
                          rows={3}
                          className="resize-none rounded-xl"
                        />
                      </div>
                      <Button
                        onClick={handleReviewSubmit}
                        disabled={submittingReview || reviewRating < 1}
                        className="bg-emerald-tourism hover:bg-emerald-dark text-white rounded-xl px-6"
                      >
                        {submittingReview ? (
                          <span className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                ease: 'linear',
                              }}
                              className="size-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            {t('loading')}
                          </span>
                        ) : (
                          t('submitReview')
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Individual review cards */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                  <AnimatePresence>
                    {reviews.map((review, idx) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.05 }}
                      >
                        <Card className="glass border-0 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-3.5">
                              <Avatar className="size-11 shrink-0 border border-border">
                                <AvatarImage
                                  src={review.user.avatar || undefined}
                                />
                                <AvatarFallback className="bg-emerald-tourism/10 text-emerald-tourism text-xs font-semibold">
                                  {review.user.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-semibold text-sm">
                                    {review.user.name}
                                  </h4>
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {new Date(
                                      review.createdAt,
                                    ).toLocaleDateString(
                                      locale === 'ar' ? 'ar-SA' : 'en-US',
                                      {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                      },
                                    )}
                                  </span>
                                </div>
                                <StarRating
                                  rating={review.rating}
                                  size="sm"
                                />
                                {review.comment && (
                                  <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">
                                    {review.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {reviews.length === 0 && (
                    <div className="text-center py-12">
                      <Star className="size-12 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        {locale === 'ar'
                          ? 'لا توجد تقييمات بعد. كن أول من يقيّم!'
                          : 'No reviews yet. Be the first to review!'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* ── RIGHT COLUMN: Sticky Booking Card ─────────────────────── */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <AnimatedSection delay={0.15}>
                <Card className="glass border-0 shadow-xl gold-glow rounded-2xl overflow-hidden">
                  <CardContent className="p-6 space-y-6">
                    {/* ── Price Display ─────────────────────────────────── */}
                    <div className="text-center space-y-1">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                        {locale === 'ar' ? 'السعر' : 'Price'}
                      </p>
                      <div className="flex items-baseline justify-center gap-1.5">
                        <motion.span
                          className="text-5xl font-extrabold text-gradient-gold tabular-nums"
                          key={service.price}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          {service.price}
                        </motion.span>
                        <span className="text-lg text-muted-foreground font-medium">
                          {t('sar')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        / {t('perPerson')}
                      </p>
                    </div>

                    <Separator className="opacity-50" />

                    {/* ── Date Picker ───────────────────────────────────── */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-4 text-emerald-tourism" />
                        {t('selectDate')}
                      </label>
                      <Input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-xl h-11"
                      />
                    </div>

                    {/* ── People Counter ────────────────────────────────── */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <Users className="size-4 text-emerald-tourism" />
                        {t('numberOfPeople')}
                      </label>
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                            bookingPeople <= 1
                              ? 'border-muted text-muted-foreground/40 cursor-not-allowed'
                              : 'border-emerald-tourism/30 text-emerald-tourism hover:bg-emerald-tourism hover:text-white hover:border-emerald-tourism cursor-pointer'
                          }`}
                          onClick={() =>
                            setBookingPeople(Math.max(1, bookingPeople - 1))
                          }
                          disabled={bookingPeople <= 1}
                        >
                          <Minus className="size-4" />
                        </motion.button>
                        <div className="flex-1 text-center">
                          <span className="text-2xl font-bold tabular-nums">
                            {bookingPeople}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                            bookingPeople >= service.maxPeople
                              ? 'border-muted text-muted-foreground/40 cursor-not-allowed'
                              : 'border-emerald-tourism/30 text-emerald-tourism hover:bg-emerald-tourism hover:text-white hover:border-emerald-tourism cursor-pointer'
                          }`}
                          onClick={() =>
                            setBookingPeople(
                              Math.min(service.maxPeople, bookingPeople + 1),
                            )
                          }
                          disabled={bookingPeople >= service.maxPeople}
                        >
                          <Plus className="size-4" />
                        </motion.button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {t('maxPeople')}: {service.maxPeople}
                      </p>
                    </div>

                    {/* ── Notes ─────────────────────────────────────────── */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground block">
                        {t('notes')}
                      </label>
                      <Textarea
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        placeholder={
                          locale === 'ar'
                            ? 'أضف ملاحظات خاصة (اختياري)...'
                            : 'Add special notes (optional)...'
                        }
                        rows={2}
                        className="resize-none rounded-xl text-sm"
                      />
                    </div>

                    <Separator className="opacity-50" />

                    {/* ── Total Price (animated) ───────────────────────── */}
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {t('totalPrice')}
                      </span>
                      <motion.span
                        className="text-3xl font-extrabold text-gradient-gold tabular-nums"
                        key={totalPrice}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        {totalPrice}{' '}
                        <span className="text-base font-medium text-muted-foreground">
                          {t('sar')}
                        </span>
                      </motion.span>
                    </div>

                    {/* ── Book Now Button ───────────────────────────────── */}
                    {isAuthenticated ? (
                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                          className={`w-full btn-gold-gradient btn-shimmer text-lg py-7 rounded-xl font-bold shadow-lg disabled:opacity-60 relative overflow-hidden`}
                          onClick={handleBooking}
                          disabled={submittingBooking}
                        >
                          {submittingBooking ? (
                            <span className="flex items-center gap-2.5">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 1,
                                  ease: 'linear',
                                }}
                                className="size-5 border-2 border-white/30 border-t-white rounded-full"
                              />
                              {t('loading')}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2.5">
                              <CheckCircle2 className="size-5" />
                              {t('confirmBooking')}
                            </span>
                          )}
                        </Button>
                      </motion.div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full text-lg py-7 rounded-xl font-semibold border-gold/30 text-gold-dark hover:bg-gold hover:text-white hover:border-gold transition-all duration-300"
                        onClick={() => navigateTo('login')}
                      >
                        {locale === 'ar'
                          ? 'سجّل دخولك لحجز الخدمة'
                          : 'Login to Book'}
                      </Button>
                    )}

                    {/* Contact Provider link */}
                    <Button
                      variant="ghost"
                      className="w-full gap-2 text-muted-foreground hover:text-emerald-tourism"
                      onClick={() => {
                        if (isAuthenticated) {
                          showToast(
                            locale === 'ar'
                              ? 'سيتم فتح المحادثة قريباً'
                              : 'Chat coming soon!',
                            'info',
                          );
                        } else {
                          navigateTo('login');
                        }
                      }}
                    >
                      <MessageCircle className="size-4" />
                      {t('contactProvider')}
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>

        {/* ── Related Services: Similar Experiences ───────────────────── */}
        {relatedServices.length > 0 && (
          <AnimatedSection delay={0.1}>
            <div className="mt-16 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {locale === 'ar'
                      ? 'تجارب مشابهة'
                      : 'Similar Experiences'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {locale === 'ar'
                      ? 'قد يعجبك أيضاً'
                      : 'You might also like'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="text-emerald-tourism gap-1 hover:text-emerald-dark"
                  onClick={() => navigateTo('services')}
                >
                  {t('allServices')}
                  <ChevronRight
                    className={`size-4 ${isRTL ? 'rotate-180' : ''}`}
                  />
                </Button>
              </div>

              {/* Horizontal scroll on mobile, grid on desktop */}
              <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible scrollbar-thin snap-x snap-mandatory md:snap-none">
                {relatedServices.map((rs, idx) => {
                  const rsTitle =
                    locale === 'ar' ? rs.titleAr : rs.titleEn;
                  const rsImage = rs.image || '/placeholder-service.jpg';
                  return (
                    <motion.div
                      key={rs.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.08 }}
                      className="shrink-0 w-64 md:w-auto snap-start"
                    >
                      <Card
                        className="overflow-hidden cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                        onClick={() => {
                          const store = useAppStore.getState();
                          store.setSelectedServiceId(rs.id);
                          store.navigateTo('service-detail');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <div className="h-40 overflow-hidden relative">
                          <img
                            src={rsImage}
                            alt={rsTitle}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-3 start-3 end-3 flex items-end justify-between">
                            <span className="text-white font-bold text-sm drop-shadow">
                              {rs.price} {t('sar')}
                            </span>
                            <div className="flex items-center gap-1 text-white/90 text-xs">
                              <Star className="size-3 fill-gold text-gold" />
                              {rs.rating}
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-sm line-clamp-1 mb-2">
                            {rsTitle}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {rs.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {rs.location}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
