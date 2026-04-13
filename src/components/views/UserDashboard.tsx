'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, AlertTriangle, User, LogOut, Clock, Send, X,
  CheckCircle2, XCircle, CreditCard, TrendingUp, Menu, ChevronRight,
  Users, MapPin, Shield, Mail, Save, Loader2, MessageSquare,
  Home, Calendar, ChevronDown, MessageCirclePlus, Reply,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getWilayaName } from '@/lib/wilayas';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ── Types ──────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  providerId: string;
  status: string;
  bookingDate: string;
  numberOfPeople: number;
  totalPrice: number;
  notes: string | null;
  createdAt: string;
  service: {
    id: string; titleAr: string; titleEn: string; price: number;
    duration: string; image: string | null;
  };
  user: { id: string; name: string; email: string; phone: string | null; avatar: string | null };
}

interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null; role: string };
}

interface Complaint {
  id: string;
  userId: string;
  subject: string;
  content: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string; avatar: string | null; role: string };
}

type DashboardTab = 'bookings' | 'complaints' | 'profile';

// ── Constants ──────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 280;

const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
  pending:    { bg: 'bg-yellow-500/10',   text: 'text-yellow-400',   border: 'border-yellow-500/30' },
  confirmed:  { bg: 'bg-emerald-500/10',  text: 'text-emerald-400',  border: 'border-emerald-500/30' },
  completed:  { bg: 'bg-purple-500/10',   text: 'text-purple-400',   border: 'border-purple-500/30' },
  cancelled:  { bg: 'bg-red-500/10',      text: 'text-red-400',      border: 'border-red-500/30' },
};

const complaintStatusConfig: Record<string, { bg: string; text: string; border: string; icon: typeof AlertTriangle }> = {
  open:        { bg: 'bg-amber-500/10',    text: 'text-amber-400',    border: 'border-amber-500/30',    icon: AlertTriangle },
  in_progress: { bg: 'bg-blue-500/10',     text: 'text-blue-400',     border: 'border-blue-500/30',     icon: Loader2 },
  resolved:    { bg: 'bg-emerald-500/10',  text: 'text-emerald-400',  border: 'border-emerald-500/30',  icon: CheckCircle2 },
  closed:      { bg: 'bg-gray-500/10',     text: 'text-gray-400',     border: 'border-gray-500/30',     icon: XCircle },
};

const filterTabs = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const;

// ── Animated Counter ───────────────────────────────────────────────────────

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    animated.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <>{count.toLocaleString()}</>;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function UserDashboard() {
  const { locale, isRTL, user, isAuthenticated, setUser, navigateTo, showToast } = useAppStore();

  // ── State ─────────────────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState<DashboardTab>('bookings');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Complaints state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintContent, setComplaintContent] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  // Profile state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Auth Guard ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated || !user) { navigateTo('login'); return; }
    fetchBookings();
    fetchComplaints();
  }, [isAuthenticated, user]);

  // ── Bookings Fetch & Actions ─────────────────────────────────────────────

  const fetchBookings = async () => {
    if (!user) return;
    setBookingsLoading(true);
    try {
      const res = await fetch(`/api/bookings?userId=${user.id}`);
      if (res.ok) { const data = await res.json(); setBookings(data.bookings || []); }
    } catch { /* empty */ }
    finally { setBookingsLoading(false); }
  };

  const openMessages = async (booking: Booking) => {
    setSelectedBooking(booking);
    setMessageDialogOpen(true);
    try {
      const res = await fetch(`/api/messages?bookingId=${booking.id}`);
      if (res.ok) { const data = await res.json(); setMessages(data.messages || []); }
    } catch { /* empty */ }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!msgInput.trim() || !selectedBooking || !user) return;
    setMsgLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: selectedBooking.id, senderId: user.id, content: msgInput }),
      });
      if (res.ok) { const data = await res.json(); setMessages(prev => [...prev, data.message]); setMsgInput(''); }
    } catch { /* empty */ }
    finally { setMsgLoading(false); }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (res.ok) { showToast(locale === 'ar' ? 'تم إلغاء الحجز' : 'Booking cancelled', 'success'); fetchBookings(); }
    } catch { showToast(locale === 'ar' ? 'حدث خطأ' : 'Error occurred', 'error'); }
  };

  // ── Complaints Fetch & Actions ───────────────────────────────────────────

  const fetchComplaints = async () => {
    if (!user) return;
    setComplaintsLoading(true);
    try {
      const res = await fetch(`/api/complaints?userId=${user.id}`);
      if (res.ok) { const data = await res.json(); setComplaints(data.complaints || data || []); }
    } catch { /* empty */ }
    finally { setComplaintsLoading(false); }
  };

  const handleSubmitComplaint = async () => {
    if (!user || !complaintSubject.trim() || !complaintContent.trim()) return;
    setSubmittingComplaint(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, subject: complaintSubject, content: complaintContent }),
      });
      if (res.ok) {
        showToast(locale === 'ar' ? 'تم إرسال الشكوى بنجاح' : 'Complaint submitted successfully', 'success');
        setComplaintSubject('');
        setComplaintContent('');
        setShowComplaintForm(false);
        fetchComplaints();
      } else {
        showToast(locale === 'ar' ? 'حدث خطأ' : 'Error occurred', 'error');
      }
    } catch { showToast(locale === 'ar' ? 'حدث خطأ' : 'Error occurred', 'error'); }
    finally { setSubmittingComplaint(false); }
  };

  // ── Profile Actions ──────────────────────────────────────────────────────

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || '');
    }
  }, [user?.name, user?.phone]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name: editName, phone: editPhone }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          avatar: data.user.avatar || undefined,
          phone: data.user.phone || undefined,
          locale: locale,
          providerId: data.user.providerId || undefined,
          wilaya: data.user.wilaya || undefined,
          createdAt: data.user.createdAt || undefined,
        });
        showToast(locale === 'ar' ? 'تم حفظ الملف الشخصي' : 'Profile saved', 'success');
      } else {
        showToast(locale === 'ar' ? 'حدث خطأ' : 'Error occurred', 'error');
      }
    } catch { showToast(locale === 'ar' ? 'حدث خطأ' : 'Error occurred', 'error'); }
    finally { setSavingProfile(false); }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────

  const sn = (b: Booking) => locale === 'ar' ? b.service.titleAr : b.service.titleEn;

  const statusLabel = (s: string) => {
    const m: Record<string, string> = {
      pending: locale === 'ar' ? 'قيد الانتظار' : 'Pending',
      confirmed: locale === 'ar' ? 'مؤكد' : 'Confirmed',
      completed: locale === 'ar' ? 'مكتمل' : 'Completed',
      cancelled: locale === 'ar' ? 'ملغي' : 'Cancelled',
    };
    return m[s] || s;
  };

  const filterLabel = (f: string) => {
    const m: Record<string, string> = {
      all: locale === 'ar' ? 'الكل' : 'All',
      pending: locale === 'ar' ? 'قيد الانتظار' : 'Pending',
      confirmed: locale === 'ar' ? 'مؤكد' : 'Confirmed',
      completed: locale === 'ar' ? 'مكتمل' : 'Completed',
      cancelled: locale === 'ar' ? 'ملغي' : 'Cancelled',
    };
    return m[f] || f;
  };

  const complaintStatusLabel = (s: string) => {
    const m: Record<string, string> = {
      open: locale === 'ar' ? 'مفتوح' : 'Open',
      in_progress: locale === 'ar' ? 'قيد المعالجة' : 'In Progress',
      resolved: locale === 'ar' ? 'تم الحل' : 'Resolved',
      closed: locale === 'ar' ? 'مغلق' : 'Closed',
    };
    return m[s] || s;
  };

  const filtered = activeFilter === 'all' ? bookings : bookings.filter(b => b.status === activeFilter);

  const complaintSubjects = locale === 'ar'
    ? ['مشكلة في الحجز', 'مشكلة في الدفع', 'شكوى ضد مزود', 'مشكلة تقنية', 'أخرى']
    : ['Booking Issue', 'Payment Issue', 'Provider Complaint', 'Technical Issue', 'Other'];

  const navItems = [
    { id: 'bookings', icon: CalendarCheck, label: locale === 'ar' ? 'الحجوزات' : 'Bookings' },
    { id: 'complaints', icon: AlertTriangle, label: locale === 'ar' ? 'الشكاوى' : 'Complaints' },
    { id: 'profile', icon: User, label: locale === 'ar' ? 'الملف الشخصي' : 'Profile' },
  ];

  if (!user) return null;

  // ═══════════════════════════════════════════════════════════════════════
  // ── BOOKINGS TAB ───────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderBookingsTab = () => {
    const stats = [
      {
        label: locale === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings',
        icon: CalendarCheck, color: 'text-purple-400',
        gradient: 'bg-gradient-to-br from-purple-600 to-purple-800',
        value: bookings.length, isText: false,
      },
      {
        label: locale === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent',
        icon: CreditCard, color: 'text-amber-400',
        gradient: 'bg-gradient-to-br from-amber-600 to-amber-800',
        value: `${bookings.reduce((s, b) => s + b.totalPrice, 0).toLocaleString()} ${locale === 'ar' ? 'د.ج' : 'DZD'}`,
        isText: true,
      },
      {
        label: locale === 'ar' ? 'القادمة' : 'Upcoming',
        icon: TrendingUp, color: 'text-emerald-400',
        gradient: 'bg-gradient-to-br from-emerald-600 to-purple-700',
        value: bookings.filter(b => b.status === 'confirmed').length, isText: false,
      },
    ];

    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{stat.label}</p>
                    <p className={cn('text-2xl font-black', stat.color)}>
                      {stat.isText ? stat.value : <AnimatedCounter target={stat.value as number} />}
                    </p>
                  </div>
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.gradient)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(tab)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 border',
                activeFilter === tab
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/30'
                  : 'text-white/40 border-purple-500/10 hover:text-white/70 hover:bg-white/5'
              )}
            >
              {filterLabel(tab)}
            </motion.button>
          ))}
        </div>

        {/* Bookings List */}
        {bookingsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-40 rounded-xl bg-purple-500/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-16 text-center"
          >
            <Calendar className="w-14 h-14 text-purple-500/20 mx-auto mb-4" />
            <p className="text-white/40 mb-4">{locale === 'ar' ? 'لا توجد حجوزات' : 'No bookings found'}</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigateTo('services')}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-colors"
            >
              {locale === 'ar' ? 'استكشف الخدمات' : 'Explore Services'}
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((booking, idx) => {
                const sc = statusConfig[booking.status] || statusConfig.pending;
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-5 hover:bg-[#12121f]/80 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image */}
                      <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        {booking.service.image ? (
                          <img src={booking.service.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-purple-900/20" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-sm text-white truncate">{sn(booking)}</h3>
                          <span className={cn('px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex-shrink-0', sc.bg, sc.text, sc.border)}>
                            {statusLabel(booking.status)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-purple-400" />
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-purple-400" />
                            {booking.numberOfPeople} {locale === 'ar' ? 'أشخاص' : 'people'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-purple-400" />
                            {booking.service.duration}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-purple-500/10">
                          <p className="text-lg font-black text-purple-400">
                            {booking.totalPrice.toLocaleString()} <span className="text-xs text-white/30">{locale === 'ar' ? 'د.ج' : 'DZD'}</span>
                          </p>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openMessages(booking)}
                              className="px-3 py-1.5 rounded-lg border border-purple-500/15 bg-white/5 text-xs text-purple-400 hover:bg-purple-500/10 transition-all flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              {locale === 'ar' ? 'تواصل' : 'Contact'}
                            </motion.button>
                            {booking.status === 'pending' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCancelBooking(booking.id)}
                                className="px-3 py-1.5 rounded-lg border border-red-500/15 bg-red-500/5 text-xs text-red-400 hover:bg-red-500/10 transition-all"
                              >
                                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ── COMPLAINTS TAB ─────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderComplaintsTab = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <h1 className="text-xl font-bold text-white flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
        {locale === 'ar' ? 'الشكاوى' : 'Complaints'}
      </h1>

      {/* Submit New Complaint */}
      <div className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-5">
        <button
          onClick={() => setShowComplaintForm(!showComplaintForm)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <MessageCirclePlus className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">
              {locale === 'ar' ? 'تقديم شكوى جديدة' : 'Submit New Complaint'}
            </span>
          </div>
          <motion.div animate={{ rotate: showComplaintForm ? 180 : 0 }}>
            <ChevronDown className="w-4 h-4 text-white/40" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showComplaintForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4 pt-4 border-t border-purple-500/10">
                {/* Subject Select */}
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">
                    {locale === 'ar' ? 'الموضوع' : 'Subject'}
                  </label>
                  <Select value={complaintSubject} onValueChange={setComplaintSubject}>
                    <SelectTrigger className="bg-white/5 border-purple-500/15 text-white focus:ring-purple-500/30">
                      <SelectValue placeholder={locale === 'ar' ? 'اختر الموضوع' : 'Select subject'} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f0f1a] border-purple-500/20">
                      {complaintSubjects.map((s) => (
                        <SelectItem key={s} value={s} className="text-white/80 focus:text-white focus:bg-purple-500/10">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">
                    {locale === 'ar' ? 'تفاصيل الشكوى' : 'Complaint Details'}
                  </label>
                  <Textarea
                    value={complaintContent}
                    onChange={(e) => setComplaintContent(e.target.value)}
                    rows={4}
                    placeholder={locale === 'ar' ? 'اكتب تفاصيل شكواك هنا...' : 'Write your complaint details here...'}
                    className="bg-white/5 border-purple-500/15 text-white placeholder:text-white/20 focus-visible:ring-purple-500/30 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitComplaint}
                  disabled={submittingComplaint || !complaintSubject.trim() || !complaintContent.trim()}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submittingComplaint ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {locale === 'ar' ? 'إرسال الشكوى' : 'Submit Complaint'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complaints History */}
      <div>
        <h2 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          {locale === 'ar' ? 'سجل الشكاوى' : 'Complaints History'}
        </h2>

        {complaintsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-28 rounded-xl bg-purple-500/5" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-purple-500/20 mx-auto mb-3" />
            <p className="text-white/40">{locale === 'ar' ? 'لا توجد شكاوى سابقة' : 'No complaints yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((complaint, idx) => {
              const csc = complaintStatusConfig[complaint.status] || complaintStatusConfig.open;
              const StatusIcon = csc.icon;
              return (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-5 hover:bg-[#12121f]/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-sm text-white">{complaint.subject}</h3>
                    <span className={cn('px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex-shrink-0 flex items-center gap-1', csc.bg, csc.text, csc.border)}>
                      <StatusIcon className={cn('w-3 h-3', complaint.status === 'in_progress' && 'animate-spin')} />
                      {complaintStatusLabel(complaint.status)}
                    </span>
                  </div>

                  <p className="text-sm text-white/50 leading-relaxed mb-3">{complaint.content}</p>

                  <div className="flex items-center gap-2 text-[11px] text-white/25">
                    <Calendar className="w-3 h-3" />
                    {new Date(complaint.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </div>

                  {/* Admin Reply */}
                  {complaint.adminReply && (
                    <div className="mt-3 pt-3 border-t border-emerald-500/10">
                      <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Reply className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                            {locale === 'ar' ? 'رد الإدارة' : 'Admin Reply'}
                          </span>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">{complaint.adminReply}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // ── PROFILE TAB ────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderProfileTab = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <h1 className="text-xl font-bold text-white flex items-center gap-2">
        <User className="w-5 h-5 text-purple-400" />
        {locale === 'ar' ? 'الملف الشخصي' : 'Profile'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-5 flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 ring-4 ring-purple-500/20 mb-3">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-white">{user.name}</h3>
          <p className="text-sm text-white/30 mt-0.5">{user.email}</p>
          <Badge className={cn(
            'mt-3 px-2.5 py-0.5 rounded-md text-[10px] font-bold border',
            user.role === 'provider'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
          )}>
            <Shield className="w-3 h-3 me-1" />
            {user.role === 'provider' ? (locale === 'ar' ? 'مزود خدمة' : 'Provider') : (locale === 'ar' ? 'مستخدم' : 'User')}
          </Badge>

          <Separator className="bg-purple-500/10 my-4 w-full" />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="text-center p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <p className="text-lg font-black text-purple-400">{bookings.length}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{locale === 'ar' ? 'الحجوزات' : 'Bookings'}</p>
            </div>
            <div className="text-center p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <p className="text-lg font-black text-amber-400">{bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.totalPrice, 0).toLocaleString()}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{locale === 'ar' ? 'الإنفاق' : 'Spent'}</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            {locale === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">
                {locale === 'ar' ? 'الاسم' : 'Name'}
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-white/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30"
                placeholder={locale === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">
                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-purple-500/10 opacity-60">
                <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-sm text-white truncate">{user.email}</span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">
                {locale === 'ar' ? 'الهاتف' : 'Phone'}
              </label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="bg-white/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30"
                placeholder={locale === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone'}
              />
            </div>

            {/* Wilaya (read-only) */}
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">
                {locale === 'ar' ? 'الولاية' : 'Wilaya'}
              </label>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-purple-500/10 opacity-60">
                <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-sm text-white">
                  {user.wilaya ? getWilayaName(user.wilaya, locale) : (locale === 'ar' ? 'غير محدد' : 'Not set')}
                </span>
              </div>
            </div>

            {/* Role (read-only) */}
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">
                {locale === 'ar' ? 'الدور' : 'Role'}
              </label>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-purple-500/10 opacity-60">
                <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-sm text-white">
                  {user.role === 'provider' ? (locale === 'ar' ? 'مزود خدمة' : 'Provider') : (locale === 'ar' ? 'مستخدم' : 'User')}
                </span>
              </div>
            </div>

            {/* Joined Date (read-only) */}
            {user.createdAt && (
              <div className="sm:col-span-2">
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">
                  {locale === 'ar' ? 'تاريخ الانضمام' : 'Member Since'}
                </label>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-purple-500/10 opacity-60">
                  <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="text-sm text-white">
                    {new Date(user.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-purple-500/10 my-5" />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveProfile}
            disabled={savingProfile || (editName === user.name && editPhone === (user.phone || ''))}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // ── MESSAGE DIALOG ─────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderMessageDialog = () => (
    <Dialog open={messageDialogOpen} onOpenChange={(open) => { setMessageDialogOpen(open); if (!open) { setMessages([]); setSelectedBooking(null); } }}>
      <DialogTrigger asChild><span /></DialogTrigger>
      <DialogContent className="max-w-lg p-0 bg-[#0f0f1a] border-purple-500/15 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-purple-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {isRTL ? <ChevronRight className="w-4 h-4 text-white/40" /> : <X className="w-4 h-4 text-white/40" />}
            <DialogTitle className="text-sm font-semibold text-white truncate">
              {selectedBooking ? sn(selectedBooking) : (locale === 'ar' ? 'تواصل' : 'Contact Provider')}
            </DialogTitle>
          </div>
          {selectedBooking && (
            <span className={cn(
              'px-2 py-0.5 rounded-md border text-[10px] font-bold flex-shrink-0',
              statusConfig[selectedBooking.status]?.bg,
              statusConfig[selectedBooking.status]?.text,
              statusConfig[selectedBooking.status]?.border,
            )}>
              {statusLabel(selectedBooking.status)}
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-10 h-10 text-purple-500/20 mb-3" />
              <p className="text-sm text-white/40">{locale === 'ar' ? 'لا توجد رسائل' : 'No messages yet'}</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
                >
                  <div className={cn(
                    'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm',
                    isMine
                      ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-br-md'
                      : 'bg-white/5 border border-purple-500/15 text-white/90 rounded-bl-md'
                  )}>
                    {!isMine && (
                      <p className="text-[10px] text-purple-400 font-semibold mb-1">{msg.sender.name}</p>
                    )}
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className={cn('text-[10px] mt-1', isMine ? 'text-purple-200/60' : 'text-white/25')}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-purple-500/10">
          <div className="flex gap-2">
            <Input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={locale === 'ar' ? 'اكتب رسالتك...' : 'Type a message...'}
              className="flex-1 bg-white/5 border-purple-500/15 text-sm text-white placeholder:text-white/20 focus-visible:ring-purple-500/30"
            />
            <button
              onClick={sendMessage}
              disabled={msgLoading || !msgInput.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white disabled:opacity-40 hover:bg-purple-500 transition-colors"
            >
              {msgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // ── MAIN RENDER ───────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? SIDEBAR_WIDTH : 72 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex fixed top-0 right-0 bottom-0 z-40 flex-col bg-gradient-to-b from-[#0f0f1a] to-[#0a0a0f] border-s border-purple-500/10"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-purple-500/10">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5">
                <img src="/images/logo.png" alt="REVIVE" className="w-9 h-9 rounded-xl" />
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{locale === 'ar' ? 'لوحة المستخدم' : 'User Panel'}</p>
                  <p className="text-[10px] text-purple-400/60">Dashboard</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarOpen && (
            <div className="w-9 h-9 rounded-xl mx-auto">
              <img src="/images/logo.png" alt="REVIVE" className="w-9 h-9 rounded-xl" />
            </div>
          )}
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 py-3 border-b border-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-white/40 truncate">{user.email}</p>
              </div>
              <Badge className={cn(
                'ms-auto px-2 py-0.5 rounded-md text-[9px] font-bold border flex-shrink-0',
                user.role === 'provider'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
              )}>
                {user.role === 'provider' ? (locale === 'ar' ? 'مزود' : 'Provider') : (locale === 'ar' ? 'مستخدم' : 'User')}
              </Badge>
            </div>
          </motion.div>
        )}

        {/* Nav */}
        <ScrollArea className="flex-1 py-3 px-2">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id as DashboardTab)}
                  className={cn('w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 relative group',
                    sidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center',
                    isActive ? 'bg-purple-600/15 text-purple-300' : 'text-white/50 hover:text-white/80 hover:bg-white/5')}>
                  {isActive && <motion.div layoutId="sidebar-active" className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gradient-to-b from-purple-400 to-purple-600" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                  <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-purple-300')} />
                  {sidebarOpen && <span className="flex-1 text-start">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-purple-500/10">
          <button onClick={() => { setUser(null); navigateTo('home'); }}
            className={cn('w-full flex items-center gap-3 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all',
              sidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center')}>
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>}
          </button>
          <button onClick={() => navigateTo('home')}
            className={cn('w-full flex items-center gap-3 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all mt-1',
              sidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center')}>
            <Home className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>{locale === 'ar' ? 'العودة للموقع' : 'Back to Site'}</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main Area ───────────────────────────────────────────────────── */}
      <motion.main
        initial={false}
        animate={{ marginRight: sidebarOpen ? SIDEBAR_WIDTH : 72 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="min-h-screen flex flex-col lg:mr-0"
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b border-purple-500/10 bg-[#0a0a0f]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Desktop sidebar toggle */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 items-center justify-center text-white/50 hover:text-white transition-all">
              <Menu className="w-4 h-4" />
            </button>

            {/* Mobile hamburger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                  <Menu className="w-4 h-4" />
                </button>
              </SheetTrigger>
              <SheetContent side={isRTL ? 'right' : 'left'} className="w-72 p-0 bg-gradient-to-b from-[#0f0f1a] to-[#0a0a0f] border-purple-500/10">
                <SheetTitle className="sr-only">{locale === 'ar' ? 'القائمة' : 'Menu'}</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Logo */}
                  <div className="h-16 flex items-center gap-2.5 px-4 border-b border-purple-500/10">
                    <img src="/images/logo.png" alt="REVIVE" className="w-9 h-9 rounded-xl" />
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{locale === 'ar' ? 'لوحة المستخدم' : 'User Panel'}</p>
                      <p className="text-[10px] text-purple-400/60">Dashboard</p>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-purple-500/10">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-xs font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-white/40 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Nav */}
                  <ScrollArea className="flex-1 py-3 px-2">
                    <nav className="space-y-1">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button key={item.id} onClick={() => { setActiveTab(item.id as DashboardTab); setMobileMenuOpen(false); }}
                            className={cn('w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 px-3 py-2.5',
                              isActive ? 'bg-purple-600/15 text-purple-300' : 'text-white/50 hover:text-white/80 hover:bg-white/5')}>
                            <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-purple-300')} />
                            <span className="flex-1 text-start">{item.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </ScrollArea>

                  {/* Bottom */}
                  <div className="px-2 py-3 border-t border-purple-500/10">
                    <button onClick={() => { setUser(null); navigateTo('home'); }}
                      className="w-full flex items-center gap-3 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all px-3 py-2.5">
                      <LogOut className="h-5 w-5 flex-shrink-0" />
                      <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <h2 className="text-sm font-semibold text-white hidden sm:block">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <img src="/images/logo.png" alt="REVIVE" className="lg:hidden w-8 h-8 rounded-lg" />
            <Avatar className="h-8 w-8 ring-2 ring-purple-500/30">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'bookings' && <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderBookingsTab()}</motion.div>}
            {activeTab === 'complaints' && <motion.div key="complaints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderComplaintsTab()}</motion.div>}
            {activeTab === 'profile' && <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderProfileTab()}</motion.div>}
          </AnimatePresence>
        </div>
      </motion.main>

      {/* Message Dialog */}
      {renderMessageDialog()}
    </div>
  );
}
