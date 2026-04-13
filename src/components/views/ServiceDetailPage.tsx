'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Clock, MapPin, Users, ArrowLeft, ChevronRight, Home,
  Calendar, Crown, Shield, CheckCircle2, X, MessageSquare,
  Send, Minus, Plus, AlertCircle, Loader2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getWilayaName } from '@/lib/wilayas';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

interface ServiceDetail {
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
  wilaya?: string;
  image: string | null;
  images: string;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  featured: boolean;
  avgRating: number;
  provider: {
    id: string;
    companyName: string;
    description: string | null;
    rating: number;
    verified: boolean;
    wilaya?: string | null;
    user: { name: string; phone: string | null; avatar: string | null };
  };
  category: { id: string; nameAr: string; nameEn: string; icon: string };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
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
  totalReviews: number;
  featured: boolean;
  provider: { companyName: string };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function ServiceDetailPage() {
  const {
    t, locale, isRTL, navigateTo, goBack,
    user, isAuthenticated,
    selectedServiceId, setSelectedServiceId,
    bookingDate, setBookingDate,
    bookingPeople, setBookingPeople,
    bookingNotes, setBookingNotes,
    resetBooking, showToast,
  } = useAppStore();

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingProcessing, setBookingProcessing] = useState(false);
  const [bookingProcessMessage, setBookingProcessMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [relatedServices, setRelatedServices] = useState<RelatedService[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Check if current user already reviewed
  const userAlreadyReviewed = isAuthenticated && user && reviews.some(r => r.user.id === user.id);

  /* ── Fetch service detail ─────────────────────────────────────────────── */
  const fetchService = useCallback(async () => {
    if (!selectedServiceId) { navigateTo('services'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/services/${selectedServiceId}`);
      if (res.ok) {
        const data = await res.json();
        setService(data.service);
      } else {
        navigateTo('services');
      }
    } catch {
      navigateTo('services');
    } finally {
      setLoading(false);
    }
  }, [selectedServiceId, navigateTo]);

  useEffect(() => { fetchService(); }, [fetchService]);

  /* ── Fetch reviews ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!selectedServiceId) return;
    async function loadReviews() {
      try {
        const res = await fetch(`/api/reviews?serviceId=${selectedServiceId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        }
      } catch { /* keep empty */ }
    }
    loadReviews();
  }, [selectedServiceId]);

  /* ── Fetch related services ───────────────────────────────────────────── */
  useEffect(() => {
    if (!service) return;
    async function loadRelated() {
      try {
        const res = await fetch(`/api/services?categoryId=${service.category.id}&sort=rating`);
        if (res.ok) {
          const data = await res.json();
          setRelatedServices(
            data.services
              .filter((s: RelatedService) => s.id !== service.id)
              .slice(0, 4)
          );
        }
      } catch { /* keep empty */ }
    }
    loadRelated();
  }, [service]);

  /* ── Localized helpers ────────────────────────────────────────────────── */
  const serviceName = () => service ? (locale === 'ar' ? service.titleAr : service.titleEn) : '';
  const serviceDesc = () => service ? (locale === 'ar' ? service.descriptionAr : service.descriptionEn) : '';

  const avgRating = (() => {
    if (!service) return 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      return (sum / reviews.length).toFixed(1);
    }
    return (service.avgRating || service.rating).toFixed(1);
  })();

  /* ── Booking handler ──────────────────────────────────────────────────── */
  const handleBooking = async () => {
    if (!isAuthenticated || !user || !service) {
      showToast(locale === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first', 'error');
      navigateTo('login');
      return;
    }
    if (!bookingDate) {
      showToast(locale === 'ar' ? 'يرجى اختيار التاريخ' : 'Please select a date', 'error');
      return;
    }

    // Show processing modal FIRST
    setBookingProcessing(true);
    setBookingProcessMessage(locale === 'ar' ? 'جارٍ المعالجة من قبل المزود...' : 'Processing with provider...');
    setBookingSuccess(false);
    setBookingLoading(true);
    
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          serviceId: service.id,
          providerId: service.provider.id,
          bookingDate,
          numberOfPeople: bookingPeople,
          notes: bookingNotes,
        }),
      });
      
      if (res.ok) {
        // Update to success state
        setBookingProcessMessage(locale === 'ar' ? '✅ تم إرسال الحجز بنجاح!\nقريباً سيصل تأكيد من المزود' : '✅ Booking sent successfully!\nYou will receive confirmation soon');
        setBookingSuccess(true);
        setBookingLoading(false);
        
        // Keep success message visible for 2.5 seconds, then close and reset
        setTimeout(() => {
          setBookingProcessing(false);
          setBookingSuccess(false);
          showToast(t('bookingSuccess'), 'success');
          resetBooking();
        }, 2500);
      } else {
        setBookingLoading(false);
        setBookingProcessing(false);
        const err = await res.json();
        showToast(err.error || t('error'), 'error');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingLoading(false);
      setBookingProcessing(false);
      showToast(t('error'), 'error');
    }
  };

  /* ── Review handler ───────────────────────────────────────────────────── */
  const handleReview = async () => {
    if (!isAuthenticated || !user || !service || reviewRating < 1) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          serviceId: service.id,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        }),
      });
      if (res.ok) {
        showToast(t('reviewSubmitted'), 'success');
        setReviewComment('');
        setReviewRating(5);
        // Refresh reviews
        const revRes = await fetch(`/api/reviews?serviceId=${selectedServiceId}`);
        if (revRes.ok) setReviews((await revRes.json()).reviews || []);
        // Refresh service for updated rating
        const svcRes = await fetch(`/api/services/${selectedServiceId}`);
        if (svcRes.ok) setService((await svcRes.json()).service);
      } else {
        const err = await res.json();
        if (res.status === 409) {
          showToast(t('alreadyReviewed'), 'error');
        } else {
          showToast(err.error || t('error'), 'error');
        }
      }
    } catch {
      showToast(t('error'), 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════
     Loading State
     ═══════════════════════════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse space-y-6">
            <div className="glass rounded-2xl aspect-video bg-purple-500/5" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="glass rounded-2xl h-48 bg-purple-500/5" />
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass rounded-xl h-24 bg-purple-500/5" />
                  ))}
                </div>
                <div className="glass rounded-2xl h-40 bg-purple-500/5" />
              </div>
              <div className="glass rounded-2xl h-80 bg-purple-500/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) return null;

  const images: string[] = (() => { try { return JSON.parse(service.images || '[]'); } catch { return []; } })();
  const displayImages = service.image ? [service.image, ...images] : images;

  /* ═══════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ═══ Back + Breadcrumb ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <motion.button
            whileHover={{ x: isRTL ? 4 : -4 }}
            onClick={goBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t('back')}
          </motion.button>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <button onClick={() => navigateTo('home')} className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              {t('home')}
            </button>
            <ChevronRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
            <button onClick={() => navigateTo('services')} className="hover:text-purple-400 transition-colors">
              {t('services')}
            </button>
            <ChevronRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-purple-400 font-medium truncate max-w-[160px]">{serviceName()}</span>
          </nav>
        </motion.div>

        {/* ═══ Hero Image ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative card-ornament rounded-2xl overflow-hidden mb-8 group"
        >
          <div className="aspect-video">
            {displayImages[0] ? (
              <img
                src={displayImages[0]}
                alt={serviceName()}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-purple-900/30" />
            )}
          </div>
          {/* Purple gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-purple-900/40 to-purple-900/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent" />

          {/* Featured badge */}
          {service.featured && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute top-4 left-4 px-3 py-1.5 rounded-xl btn-gold-gradient text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5" /> {t('featured')}
            </motion.span>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-3">
              {locale === 'ar' ? service.category.nameAr : service.category.nameEn}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 drop-shadow-lg">
              {serviceName()}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-400" />{service.wilaya ? getWilayaName(service.wilaya, locale) : service.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />{service.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 star-filled fill-current" />
                <span className="text-gold font-semibold">{avgRating}</span>
                <span className="text-gray-400">({reviews.length} {t('reviews')})</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* ═══ Main Layout: 2/3 + 1/3 ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ──────── Left Column ──────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Category badge + Title + Rating pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="inline-block px-3 py-1 rounded-lg bg-purple-500/15 border border-purple-500/25 text-purple-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                {locale === 'ar' ? service.category.nameAr : service.category.nameEn}
              </span>
              <h2 className="text-2xl font-black text-white mb-3">{serviceName()}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl glass border border-purple-500/15">
                  <Star className="w-4 h-4 star-filled fill-current" />
                  <span className="text-sm font-bold text-gold">{avgRating}</span>
                  <span className="text-[10px] text-muted-foreground">/5</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl glass border border-purple-500/15">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-muted-foreground">{reviews.length} {t('reviews')}</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl glass border border-purple-500/15">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-muted-foreground">{service.totalBookings} {locale === 'ar' ? 'حجز' : 'bookings'}</span>
                </div>
              </div>
            </motion.div>

            {/* ── 3 Glass Info Cards ────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: <Clock className="w-5 h-5" />,
                  label: t('duration'),
                  value: service.duration,
                },
                {
                  icon: <MapPin className="w-5 h-5" />,
                  label: t('location'),
                  value: service.wilaya ? getWilayaName(service.wilaya, locale) : service.location,
                },
                {
                  icon: <Users className="w-5 h-5" />,
                  label: t('maxPeople'),
                  value: service.maxPeople.toString(),
                },
              ].map((info, idx) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="glass rounded-xl p-5 text-center border border-purple-500/10 glow-purple"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mx-auto mb-3">
                    {info.icon}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{info.label}</p>
                  <p className="text-sm font-bold text-foreground">{info.value}</p>
                </motion.div>
              ))}
            </div>

            {/* ── Description ──────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-purple-500/10 corner-ornament"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">
                {locale === 'ar' ? 'الوصف' : 'Description'}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                {serviceDesc()}
              </p>
            </motion.div>

            {/* ── Provider Card ────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-2xl p-6 border border-purple-500/10"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">
                {locale === 'ar' ? 'مزود الخدمة' : 'Service Provider'}
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-lg ring-2 ring-purple-500/20">
                    {service.provider.companyName.charAt(0)}
                  </div>
                  {service.provider.verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center ring-2 ring-background">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground">{service.provider.companyName}</p>
                    {service.provider.verified && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20">
                        <Shield className="w-3 h-3" />
                        {locale === 'ar' ? 'موثق' : 'Verified'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{service.provider.user?.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 star-filled fill-current" />
                    <span className="text-xs font-semibold text-gold">{service.provider.rating}</span>
                    <span className="text-[10px] text-muted-foreground">/ 5</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!isAuthenticated || !user) {
                      showToast(locale === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first', 'error');
                      navigateTo('login');
                      return;
                    }
                    // Navigate to booking page where messaging is available
                    showToast(locale === 'ar' ? 'قم بحجز الخدمة أولاً للتواصل مع المزود' : 'Book the service first to contact the provider', 'info');
                  }}
                  className="btn-purple-gradient btn-shimmer px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t('contactProvider')}
                </motion.button>
              </div>
            </motion.div>

            {/* ── Reviews Section ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 border border-purple-500/10"
            >
              {/* Average rating display */}
              <div className="flex items-center gap-6 mb-8 pb-6 border-b border-purple-500/10">
                <div className="text-center">
                  <p className="text-5xl font-black text-gradient-gold">{avgRating}</p>
                  <div className="flex items-center gap-0.5 mt-2 justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(Number(avgRating)) ? 'star-filled fill-current' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {reviews.length} {t('reviews')}
                  </p>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-muted-foreground w-3">{star}</span>
                        <Star className="w-3 h-3 star-filled fill-current" />
                        <div className="flex-1 h-1.5 rounded-full bg-purple-500/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-5 text-end">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review list */}
              <div className="space-y-4 mb-8 max-h-96 overflow-y-auto scrollbar-none">
                {reviews.length === 0 ? (
                  <div className="text-center py-10">
                    <Star className="w-10 h-10 text-purple-500/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {locale === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
                    </p>
                  </div>
                ) : (
                  reviews.map((review, idx) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + idx * 0.05 }}
                      className="glass rounded-xl p-4 border border-purple-500/10"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-xs font-bold ring-1 ring-purple-500/30">
                          {review.user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-foreground block truncate">{review.user.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? 'star-filled fill-current' : 'text-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-white/60 leading-relaxed">{review.comment}</p>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Write Review (auth users only) */}
              {isAuthenticated ? (
                userAlreadyReviewed ? (
                  <div className="border-t border-purple-500/10 pt-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-amber-400 fill-current" />
                      <span className="text-sm font-semibold text-amber-400">
                        {locale === 'ar' ? 'شكراً لتقييمك!' : 'Thanks for your review!'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {locale === 'ar' ? 'لقد قمت بتقييم هذه الخدمة مسبقاً' : 'You have already reviewed this service'}
                    </p>
                  </div>
                ) : (
                <div className="border-t border-purple-500/10 pt-6">
                  <h4 className="text-sm font-bold text-foreground mb-4">{t('writeReview')}</h4>
                  <div className="flex items-center gap-1 mb-4">
                    <span className="text-xs text-muted-foreground ms-1">{t('yourRating')}:</span>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setReviewRating(i + 1)}
                        className={`transition-colors ${
                          i < reviewRating ? 'star-filled fill-current' : 'text-gray-600 hover:text-gold'
                        }`}
                      >
                        <Star className="w-6 h-6" />
                      </motion.button>
                    ))}
                    {reviewRating > 0 && (
                      <span className="text-xs text-amber-400 ms-2 font-semibold">{reviewRating}/5</span>
                    )}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={locale === 'ar' ? 'أضف تعليقاً (اختياري)...' : 'Add a comment (optional)...'}
                    className="w-full bg-purple-500/5 border border-purple-500/15 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/40 focus:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all resize-none h-20 mb-3"
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReview}
                    disabled={submittingReview || reviewRating < 1}
                    className="btn-purple-gradient btn-shimmer px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                  >
                    {submittingReview ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t('submitReview')}
                      </>
                    )}
                  </motion.button>
                </div>
                )
              ) : (
                <div className="border-t border-purple-500/10 pt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ar'
                      ? 'سجل دخولك لتتمكن من كتابة تقييم'
                      : 'Sign in to write a review'}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigateTo('login')}
                    className="mt-3 btn-purple-gradient btn-shimmer px-6 py-2 rounded-xl text-xs font-semibold"
                  >
                    {t('login')}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>

          {/* ──────── Right Column: Sticky Booking Card ──────── */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="sticky top-24"
            >
              <div className="card-ornament glass rounded-2xl p-6 border border-purple-500/15 glow-purple">
                {/* Price header */}
                <div className="text-center mb-6 pb-6 border-b border-purple-500/10">
                  <p className="text-xs text-muted-foreground mb-1">{t('perPerson')}</p>
                  <p className="text-4xl font-black text-shimmer-gold">
                    {service.price}
                    <span className="text-base text-gold/50 ms-1">{t('dzd')}</span>
                  </p>
                </div>

                {/* Date input */}
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t('selectDate')}</label>
                  <div className="relative purple-glow-focus rounded-xl">
                    <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-purple-500/5 border border-purple-500/15 rounded-xl ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-500/40 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* People counter */}
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    {t('numberOfPeople')}
                    <span className="text-purple-400 ms-1">({t('maxPeople')}: {service.maxPeople})</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setBookingPeople(Math.max(1, bookingPeople - 1))}
                      disabled={bookingPeople <= 1}
                      className="w-10 h-10 rounded-xl glass border border-purple-500/15 flex items-center justify-center text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <span className="text-lg font-bold text-foreground flex-1 text-center tabular-nums">
                      {bookingPeople}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setBookingPeople(Math.min(service.maxPeople, bookingPeople + 1))}
                      disabled={bookingPeople >= service.maxPeople}
                      className="w-10 h-10 rounded-xl glass border border-purple-500/15 flex items-center justify-center text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-5">
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t('notes')}</label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder={locale === 'ar' ? 'أضف ملاحظاتك هنا...' : 'Add your notes here...'}
                    rows={3}
                    className="w-full bg-purple-500/5 border border-purple-500/15 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/40 transition-all resize-none"
                  />
                </div>

                {/* Total price */}
                <div className="flex items-center justify-between py-4 border-t border-purple-500/10 mb-5">
                  <span className="text-sm text-muted-foreground font-medium">{t('totalPrice')}</span>
                  <span className="text-2xl font-black text-gradient-gold">
                    {service.price * bookingPeople}
                    <span className="text-sm text-gold/50 ms-1">{t('dzd')}</span>
                  </span>
                </div>

                {/* Book Now / Login to Book */}
                {isAuthenticated ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBooking}
                    disabled={bookingLoading || !bookingDate}
                    className="w-full btn-purple-gradient btn-shimmer py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {bookingLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        {t('bookNow')}
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigateTo('login')}
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-purple-500/30 bg-purple-500/5 text-purple-300 hover:bg-purple-500/15 transition-all"
                  >
                    {locale === 'ar' ? 'سجل دخولك للحجز' : 'Login to Book'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ═══ Related Services ═══ */}
        {relatedServices.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gradient-purple">
                {locale === 'ar' ? 'خدمات مشابهة' : 'Related Services'}
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateTo('services')}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
              >
                {locale === 'ar' ? 'عرض الكل' : 'View All'}
                <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              </motion.button>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-none scroll-snap-x pb-2">
              {relatedServices.map((svc, idx) => (
                <motion.div
                  key={svc.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -6 }}
                  onClick={() => { setSelectedServiceId(svc.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex-shrink-0 w-64 card-ornament card-hover glass rounded-2xl overflow-hidden border border-purple-500/10 cursor-pointer scroll-snap-x group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {svc.image ? (
                      <img src={svc.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-purple-900/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
                    {svc.featured && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md btn-gold-gradient text-white text-[9px] font-bold flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" />
                        {t('featured')}
                      </span>
                    )}
                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg glass border border-gold/30 text-gold font-bold text-xs">
                      {svc.price} <span className="text-[9px] text-gold/60">{t('dzd')}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-white line-clamp-1 mb-2 group-hover:text-purple-300 transition-colors">
                      {locale === 'ar' ? svc.titleAr : svc.titleEn}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 star-filled fill-current" />
                        <span className="text-xs text-gold font-semibold">{svc.rating}</span>
                        <span className="text-[10px] text-muted-foreground">({svc.totalReviews})</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{svc.provider?.companyName}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          Booking Processing Dialog
          ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {bookingProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            onClick={() => !bookingSuccess && setBookingProcessing(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl border-2 border-purple-500/30 p-8 w-full max-w-md shadow-2xl shadow-purple-500/20 backdrop-blur-xl"
            >
              <div className="text-center">
                {!bookingSuccess ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-600/40 flex items-center justify-center mx-auto mb-6 border-2 border-purple-400/50 shadow-lg shadow-purple-500/30"
                    >
                      <Loader2 className="w-8 h-8 text-purple-300" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {locale === 'ar' ? '⏳ جارٍ المعالجة' : '⏳ Processing'}
                    </h3>
                    <p className="text-sm text-white/70 whitespace-pre-line leading-relaxed">
                      {bookingProcessMessage}
                    </p>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/40 to-emerald-600/40 flex items-center justify-center mx-auto mb-6 border-2 border-green-400/50 shadow-lg shadow-green-500/30"
                    >
                      <CheckCircle2 className="w-8 h-8 text-green-300" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {locale === 'ar' ? '✅ تم بنجاح!' : '✅ Success!'}
                    </h3>
                    <p className="text-sm text-white/70 whitespace-pre-line leading-relaxed">
                      {bookingProcessMessage}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

