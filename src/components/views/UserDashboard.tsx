'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MessageSquare, User, LogOut, Clock, Send, X,
  CheckCircle2, CreditCard, TrendingUp, Menu, ChevronRight,
  Users, MapPin, Shield, Mail, Save, Loader2,
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

// ── Types ──────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  serviceId: string;
  providerId: string;
  userId: string;
  bookingDate: string;
  numberOfPeople: number;
  totalPrice: number;
  status: string;
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

// ── Helpers ────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
  pending:    { bg: 'bg-yellow-500/10',   text: 'text-yellow-400',   border: 'border-yellow-500/30' },
  confirmed:  { bg: 'bg-emerald-500/10',  text: 'text-emerald-400',  border: 'border-emerald-500/30' },
  completed:  { bg: 'bg-purple-500/10',   text: 'text-purple-400',   border: 'border-purple-500/30' },
  cancelled:  { bg: 'bg-red-500/10',      text: 'text-red-400',      border: 'border-red-500/30' },
};

const filterTabs = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const;

type DashboardTab = 'bookings' | 'profile';

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
  const { t, locale, isRTL, user, isAuthenticated, setUser, navigateTo, showToast } = useAppStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('bookings');
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated || !user) { navigateTo('login'); return; }
    fetchBookings();
  }, [isAuthenticated, user]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?userId=${user.id}`);
      if (res.ok) { const data = await res.json(); setBookings(data.bookings || []); }
    } catch { /* empty */ }
    finally { setLoading(false); }
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

  // Keep edit fields in sync when user changes
  useEffect(() => {
    setEditName(user.name);
    setEditPhone(user.phone || '');
  }, [user.name, user.phone]);

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
        showToast(t('success'), 'success');
      } else {
        showToast(t('error'), 'error');
      }
    } catch {
      showToast(t('error'), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (res.ok) { showToast(t('success'), 'success'); fetchBookings(); }
    } catch { showToast(t('error'), 'error'); }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────

  const sn = (b: Booking) => locale === 'ar' ? b.service.titleAr : b.service.titleEn;
  const statusLabel = (s: string) => {
    const m: Record<string, string> = {
      pending: t('bookingPending'), confirmed: t('bookingConfirmed'),
      completed: t('bookingCompleted'), cancelled: t('bookingCancelled'),
    };
    return m[s] || s;
  };
  const filterLabel = (f: string) => {
    const m: Record<string, string> = {
      all: t('all'), pending: t('bookingPending'), confirmed: t('bookingConfirmed'),
      completed: t('bookingCompleted'), cancelled: t('bookingCancelled'),
    };
    return m[f] || f;
  };

  const filtered = activeFilter === 'all' ? bookings : bookings.filter(b => b.status === activeFilter);

  const stats = [
    {
      label: t('totalBookings'), icon: Calendar, color: 'text-purple-400',
      gradient: 'bg-gradient-to-br from-purple-600 to-purple-800',
      value: bookings.length, isText: false,
    },
    {
      label: locale === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent', icon: CreditCard, color: 'text-gold',
      gradient: 'bg-gradient-to-br from-gold-dark to-gold',
      value: `${bookings.reduce((s, b) => s + b.totalPrice, 0).toLocaleString()} ${t('dzd')}`, isText: true,
    },
    {
      label: locale === 'ar' ? 'القادمة' : 'Upcoming', icon: TrendingUp, color: 'text-emerald-400',
      gradient: 'bg-gradient-to-br from-emerald-600 to-purple-700',
      value: bookings.filter(b => b.status === 'confirmed').length, isText: false,
    },
  ];

  const navItems = [
    { icon: Calendar, label: t('myBookings'), tab: 'bookings' as DashboardTab },
    { icon: User, label: t('profile'), tab: 'profile' as DashboardTab },
  ];

  if (!user) return null;

  // ── Sidebar ───────────────────────────────────────────────────────────────

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 pb-4 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative"
        >
          <div className="text-5xl font-black text-gradient-purple select-none drop-shadow-lg">H</div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
        </motion.div>
      </div>

      <Separator className="bg-purple-500/10" />

      {/* User Info */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/10">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate text-white">{user.name}</p>
            <p className="text-[11px] text-white/50 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-purple-500/10">
        <button
          onClick={() => { setUser(null); navigateTo('home'); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
        >
          <LogOut className="h-5 w-5" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-mesh-gradient">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 glass--scrolled border-b border-purple-500/10 px-4 py-3 flex items-center justify-between">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-purple-400 hover:bg-purple-500/10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={isRTL ? 'right' : 'left'} className="w-72 p-0 glass border-purple-500/10 bg-gradient-to-b from-gray-900 to-purple-950/30">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            {renderSidebarContent()}
          </SheetContent>
        </Sheet>
        <div className="text-2xl font-black text-gradient-purple">H</div>
        <Avatar className="h-8 w-8 ring-2 ring-purple-500/50">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-xs font-bold">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-72 z-30 glass border-e border-purple-500/10 bg-gradient-to-b from-gray-900 to-purple-950/30">
            {renderSidebarContent()}
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ms-72 pt-20 lg:pt-0 min-h-screen">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Welcome */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="text-gradient-purple">{t('welcome')},</span>{' '}
                <span className="text-white">{user.name}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{t('dashboardTitle')}</p>
            </motion.div>

            <AnimatePresence mode="wait">
            {activeTab === 'bookings' ? (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="glass rounded-2xl p-5 border border-purple-500/10 glow-purple card-hover"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</p>
                            <p className={cn('text-2xl font-black', stat.color)}>
                              {stat.isText ? stat.value : <AnimatedCounter target={stat.value as number} />}
                            </p>
                          </div>
                          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center pulse-glow-purple', stat.gradient)}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {filterTabs.map((tab) => (
                    <motion.button
                      key={tab}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveFilter(tab)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 border',
                        activeFilter === tab
                          ? 'btn-purple-gradient btn-shimmer text-white border-purple-500/30 shadow-lg shadow-purple-500/20'
                          : 'glass text-muted-foreground hover:text-purple-300 border-purple-500/10 hover:border-purple-500/20'
                      )}
                    >
                      {filterLabel(tab)}
                    </motion.button>
                  ))}
                </div>

                {/* Bookings */}
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-40 rounded-2xl bg-purple-500/5" />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-2xl p-16 text-center border border-purple-500/10"
                  >
                    <Calendar className="w-14 h-14 text-purple-500/20 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">{t('noData')}</p>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigateTo('services')}
                      className="btn-purple-gradient btn-shimmer px-6 py-2.5 rounded-xl text-sm font-semibold"
                    >
                      {t('heroCta')}
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
                            className="card-ornament glass rounded-2xl p-5 border border-purple-500/10 card-hover"
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

                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
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
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-purple-400" />
                                    {getWilayaName(booking.service.wilaya, locale)}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-purple-500/10">
                                  <p className="text-lg font-black text-gradient-gold">
                                    {booking.totalPrice.toLocaleString()} <span className="text-xs text-gold/60">{t('dzd')}</span>
                                  </p>
                                  <div className="flex gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => openMessages(booking)}
                                      className="px-3 py-1.5 rounded-lg glass border border-purple-500/15 text-xs text-purple-400 hover:bg-purple-500/10 transition-all flex items-center gap-1"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      {t('contactProvider')}
                                    </motion.button>
                                    {booking.status === 'pending' && (
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleCancelBooking(booking.id)}
                                        className="px-3 py-1.5 rounded-lg border border-red-500/15 bg-red-500/5 text-xs text-red-400 hover:bg-red-500/10 transition-all"
                                      >
                                        {t('cancelBooking')}
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
            ) : (
              /* ── Profile Tab ──────────────────────────────────────────────────── */
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Card */}
                  <div className="lg:col-span-1">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-2xl p-6 border border-purple-500/10 glow-purple text-center"
                    >
                      <div className="flex flex-col items-center">
                        <Avatar className="h-24 w-24 ring-4 ring-purple-500/30 shadow-xl shadow-purple-500/20 mb-4">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-2xl font-black">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                        <Badge
                          className={cn(
                            'px-4 py-1 text-xs font-semibold border',
                            user.role === 'provider'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          )}
                        >
                          <Shield className="w-3 h-3 me-1.5" />
                          {user.role === 'provider' ? t('providerRole') : t('userRole')}
                        </Badge>
                      </div>

                      <Separator className="bg-purple-500/10 my-6" />

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                          <p className="text-lg font-black text-purple-400">{bookings.length}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('totalBookings')}</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                          <p className="text-lg font-black text-gold">
                            {bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.totalPrice, 0).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent'}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Edit Profile Form */}
                  <div className="lg:col-span-2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="glass rounded-2xl p-6 border border-purple-500/10 glow-purple"
                    >
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-400" />
                        {t('edit')} {t('profile')}
                      </h3>

                      <div className="space-y-5">
                        {/* Name */}
                        <div>
                          <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                            {t('name')}
                          </label>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-purple-500/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30"
                            placeholder={locale === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                          />
                        </div>

                        {/* Email (read-only) */}
                        <div>
                          <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                            {t('email')}
                          </label>
                          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15 opacity-60">
                            <Mail className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-white">{user.email}</span>
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                            {t('phone')}
                          </label>
                          <Input
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="bg-purple-500/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30"
                            placeholder={locale === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                          />
                        </div>

                        {/* Wilaya (read-only) */}
                        <div>
                          <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                            {t('wilaya')}
                          </label>
                          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15 opacity-60">
                            <MapPin className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-white">
                              {user.wilaya ? getWilayaName(user.wilaya, locale) : (locale === 'ar' ? 'غير محدد' : 'Not set')}
                            </span>
                          </div>
                        </div>

                        {/* Role (read-only) */}
                        <div>
                          <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                            {t('role')}
                          </label>
                          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15 opacity-60">
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-white">
                              {user.role === 'provider' ? t('providerRole') : t('userRole')}
                            </span>
                          </div>
                        </div>

                        {/* Member Since (read-only) */}
                        {user.createdAt && (
                          <div>
                            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                              {locale === 'ar' ? 'تاريخ الانضمام' : 'Member Since'}
                            </label>
                            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15 opacity-60">
                              <Calendar className="w-4 h-4 text-purple-400" />
                              <span className="text-sm text-white">
                                {new Date(user.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
                                  year: 'numeric', month: 'long', day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        )}

                        <Separator className="bg-purple-500/10" />

                        {/* Save Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSaveProfile}
                          disabled={savingProfile || (editName === user.name && editPhone === (user.phone || ''))}
                          className="btn-purple-gradient btn-shimmer w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingProfile ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {t('save')}
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={(open) => { setMessageDialogOpen(open); if (!open) { setMessages([]); setSelectedBooking(null); }}}>
        <DialogTrigger asChild><span /></DialogTrigger>
        <DialogContent className="max-w-lg p-0 glass border-purple-500/15 bg-gray-950/95 backdrop-blur-2xl overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-purple-500/10 flex items-center justify-between bg-gradient-to-r from-purple-500/5 to-transparent">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => { setMessageDialogOpen(false); }}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </button>
              <DialogTitle className="text-sm font-semibold text-white truncate">
                {selectedBooking ? sn(selectedBooking) : t('contactProvider')}
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
          <div className="h-[400px] overflow-y-auto p-4 space-y-3 scrollbar-none">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-10 h-10 text-purple-500/20 mb-3" />
                <p className="text-sm text-muted-foreground">{t('noData')}</p>
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
                        ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-br-md shadow-lg shadow-purple-500/20'
                        : 'glass border border-purple-500/15 text-white/90 rounded-bl-md'
                    )}>
                      {!isMine && (
                        <p className="text-[10px] text-purple-400 font-semibold mb-1">{msg.sender.name}</p>
                      )}
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className={cn('text-[10px] mt-1', isMine ? 'text-purple-200/60' : 'text-muted-foreground')}>
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
            <div className="flex gap-2 purple-glow-focus rounded-xl">
              <Input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={t('sendMessage')}
                className="flex-1 bg-purple-500/5 border border-purple-500/15 rounded-xl text-sm text-white placeholder:text-muted-foreground focus-visible:ring-purple-500/30"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={msgLoading || !msgInput.trim()}
                className="btn-purple-gradient btn-shimmer px-4 py-2.5 rounded-xl disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
