'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  ArrowLeft,
  Shield,
  ChevronRight,
  Calendar,
  MessageSquare,
  Send,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  };

  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          onClick={() => interactive && onChange?.(star)}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-gold fill-gold star-filled'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Stagger animation helper ─────────────────────────────────────────────────

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

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
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [relatedServices, setRelatedServices] = useState<RelatedService[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

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
              .filter((s: any) => s.id !== service.id)
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
    } catch (err) {
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

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div>
            <Skeleton className="h-96 w-full rounded-xl" />
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
    <div className="min-h-screen">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-6"
      >
        {/* Breadcrumb + Back button */}
        <motion.div
          variants={staggerItem}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-emerald-tourism/10"
            onClick={goBack}
          >
            <BackArrow className="size-5" />
          </Button>
          <Breadcrumb className="flex-1">
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
                <BreadcrumbLink
                  className="cursor-pointer hover:text-emerald-tourism"
                  onClick={() => navigateTo('services')}
                >
                  {t('services')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1 max-w-[200px]">
                  {title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* Main layout: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Images + Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div variants={staggerItem} className="space-y-3">
              {/* Main image */}
              <div className="relative rounded-xl overflow-hidden aspect-video bg-muted">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={images[activeImage] || '/placeholder-service.jpg'}
                    alt={title}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
                {images.length > 1 && (
                  <>
                    {activeImage > 0 && (
                      <button
                        onClick={() =>
                          setActiveImage((p) => Math.max(0, p - 1))
                        }
                        className="absolute start-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/90 transition-colors"
                      >
                        <ArrowLeft
                          className={`size-5 ${isRTL ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                    {activeImage < images.length - 1 && (
                      <button
                        onClick={() =>
                          setActiveImage((p) =>
                            Math.min(images.length - 1, p + 1),
                          )
                        }
                        className="absolute end-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/90 transition-colors"
                      >
                        <ArrowRight
                          className={`size-5 ${isRTL ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </>
                )}
                {service.featured && (
                  <Badge className="absolute top-4 start-4 bg-gold text-gold-dark border-0 shadow-sm">
                    <Star className="size-3 me-1 fill-gold-dark text-gold-dark" />
                    {locale === 'ar' ? 'مميز' : 'Featured'}
                  </Badge>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === activeImage
                          ? 'border-emerald-tourism shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Service info */}
            <motion.div variants={staggerItem} className="space-y-4">
              <div>
                <Badge variant="secondary" className="mb-3">
                  {service.category.icon} {categoryName}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>

                {/* Rating + meta row */}
                <div className="flex items-center gap-4 mt-3 flex-wrap text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={Math.round(service.avgRating)} size="sm" />
                    <span className="font-medium text-foreground">
                      {service.avgRating}
                    </span>
                    <span>
                      ({service.totalReviews} {t('reviews')})
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" />
                    {service.duration}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    {service.location}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="flex items-center gap-1">
                    <Users className="size-4" />
                    {t('maxPeople')}: {service.maxPeople}
                  </span>
                </div>
              </div>

              {/* Description */}
              <Card className="border-0 shadow-sm bg-muted/50">
                <CardContent className="p-6">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Provider info */}
            <motion.div variants={staggerItem}>
              <Card className="glass border-0 shadow-md overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="size-14 border-2 border-emerald-tourism/20">
                        <AvatarImage
                          src={service.provider.user.avatar || undefined}
                        />
                        <AvatarFallback className="bg-emerald-tourism/10 text-emerald-tourism font-semibold">
                          {service.provider.companyName.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">
                            {service.provider.companyName}
                          </h3>
                          {service.provider.verified && (
                            <Shield className="size-5 text-emerald-tourism fill-emerald-tourism/20" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <StarRating rating={Math.round(service.provider.rating)} size="sm" />
                          <span>{service.provider.rating}</span>
                          <span>
                            ({service.provider.totalReviews})
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2 border-emerald-tourism/30 text-emerald-tourism hover:bg-emerald-tourism hover:text-white"
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
                      <MessageSquare className="size-4" />
                      {t('contactProvider')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reviews section */}
            <motion.div variants={staggerItem} className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star className="size-5 text-gold fill-gold" />
                {t('reviews')} ({reviews.length})
              </h2>

              {/* Average rating display */}
              <Card className="glass border-0 shadow-sm">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gradient-gold">
                      {avgRating || '—'}
                    </div>
                    <StarRating
                      rating={Math.round(Number(avgRating) || 0)}
                      size="md"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {reviews.length} {t('reviews')}
                    </p>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="hidden sm:block h-20"
                  />
                  <div className="flex-1 w-full">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter(
                        (r) => r.rating === star,
                      ).length;
                      const pct =
                        reviews.length > 0
                          ? (count / reviews.length) * 100
                          : 0;
                      return (
                        <div
                          key={star}
                          className="flex items-center gap-2 text-sm mb-1"
                        >
                          <span className="w-3">{star}</span>
                          <Star className="size-3.5 text-gold fill-gold" />
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gold"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: 0.3 }}
                            />
                          </div>
                          <span className="w-8 text-muted-foreground text-xs">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Write review form */}
              {isAuthenticated && (
                <Card className="border-0 shadow-sm bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Send className="size-4 text-emerald-tourism" />
                      {t('writeReview')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t('yourRating')}
                      </label>
                      <StarRating
                        rating={reviewRating}
                        size="lg"
                        interactive
                        onChange={setReviewRating}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
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
                      />
                    </div>
                    <Button
                      onClick={handleReviewSubmit}
                      disabled={submittingReview || reviewRating < 1}
                      className="bg-emerald-tourism hover:bg-emerald-dark text-white"
                    >
                      {submittingReview ? t('loading') : t('submitReview')}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Individual review cards */}
              <div className="space-y-4">
                <AnimatePresence>
                  {reviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="size-10 shrink-0">
                              <AvatarImage
                                src={review.user.avatar || undefined}
                              />
                              <AvatarFallback className="bg-muted text-xs">
                                {review.user.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm">
                                  {review.user.name}
                                </h4>
                                <span className="text-xs text-muted-foreground">
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
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
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
                  <p className="text-center text-muted-foreground py-8">
                    {locale === 'ar'
                      ? 'لا توجد تقييمات بعد. كن أول من يقيّم!'
                      : 'No reviews yet. Be the first to review!'}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right column: Booking card (sticky) */}
          <motion.div variants={staggerItem} className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Card className="glass border-0 shadow-lg gold-glow overflow-hidden">
                <CardContent className="p-6 space-y-5">
                  {/* Price */}
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">
                      {locale === 'ar' ? 'السعر' : 'Price'}
                    </div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gradient-gold">
                        {service.price}
                      </span>
                      <span className="text-lg text-muted-foreground">
                        {t('sar')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      / {t('perPerson')}
                    </p>
                  </div>

                  <Separator />

                  {/* Date picker */}
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Calendar className="size-4 text-emerald-tourism" />
                      {t('selectDate')}
                    </label>
                    <Input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={
                        new Date().toISOString().split('T')[0]
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Number of people */}
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Users className="size-4 text-emerald-tourism" />
                      {t('numberOfPeople')}
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-10 rounded-full shrink-0"
                        onClick={() =>
                          setBookingPeople(Math.max(1, bookingPeople - 1))
                        }
                        disabled={bookingPeople <= 1}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        max={service.maxPeople}
                        value={bookingPeople}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setBookingPeople(
                            Math.min(
                              Math.max(1, val),
                              service.maxPeople,
                            ),
                          );
                        }}
                        className="text-center text-lg font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-10 rounded-full shrink-0"
                        onClick={() =>
                          setBookingPeople(
                            Math.min(service.maxPeople, bookingPeople + 1),
                          )
                        }
                        disabled={bookingPeople >= service.maxPeople}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('maxPeople')}: {service.maxPeople}
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
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
                      rows={3}
                    />
                  </div>

                  <Separator />

                  {/* Total price */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{t('totalPrice')}</span>
                    <span className="text-2xl font-bold text-gradient-gold">
                      {totalPrice} {t('sar')}
                    </span>
                  </div>

                  {/* Book button */}
                  {isAuthenticated ? (
                    <Button
                      className="w-full bg-emerald-tourism hover:bg-emerald-dark text-white text-lg py-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                      onClick={handleBooking}
                      disabled={submittingBooking}
                    >
                      {submittingBooking ? (
                        <span className="flex items-center gap-2">
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
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="size-5" />
                          {t('confirmBooking')}
                        </span>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full text-lg py-6 rounded-xl font-semibold border-emerald-tourism text-emerald-tourism hover:bg-emerald-tourism hover:text-white"
                      onClick={() => navigateTo('login')}
                    >
                      {locale === 'ar'
                        ? 'سجّل دخولك لحجز الخدمة'
                        : 'Login to Book This Service'}
                    </Button>
                  )}

                  {/* Contact provider */}
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
                    <MessageSquare className="size-4" />
                    {t('contactProvider')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <motion.div variants={staggerItem} className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {locale === 'ar' ? 'خدمات مشابهة' : 'Related Services'}
              </h2>
              <Button
                variant="ghost"
                className="text-emerald-tourism gap-1"
                onClick={() => navigateTo('services')}
              >
                {t('allServices')}
                <ChevronRight
                  className={`size-4 ${isRTL ? 'rotate-180' : ''}`}
                />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedServices.map((rs) => {
                const rsTitle =
                  locale === 'ar' ? rs.titleAr : rs.titleEn;
                const rsImage = rs.image || '/placeholder-service.jpg';
                return (
                  <motion.div
                    key={rs.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className="card-3d card-hover overflow-hidden cursor-pointer border-0 shadow-md"
                      onClick={() => {
                        const store = useAppStore.getState();
                        store.setSelectedServiceId(rs.id);
                        store.navigateTo('service-detail');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <div className="card-3d-inner">
                        <div className="h-36 overflow-hidden relative">
                          <img
                            src={rsImage}
                            alt={rsTitle}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-2 start-3">
                            <span className="text-white font-bold text-sm">
                              {rs.price} {t('sar')}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-semibold text-sm line-clamp-1">
                            {rsTitle}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Star className="size-3 text-gold fill-gold" />
                              {rs.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {rs.duration}
                            </span>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
