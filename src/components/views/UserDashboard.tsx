'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  DollarSign,
  Clock,
  Package,
  MessageSquare,
  X,
  Send,
  User,
  LogOut,
  MapPin,
  Star,
  Phone,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useAppStore } from '@/lib/store';

// ── Types ───────────────────────────────────────────────────────────────────
interface ServiceInfo {
  id: string;
  titleAr: string;
  titleEn: string;
  price: number;
  duration: number;
  image?: string;
}

interface BookingUserInfo {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface Booking {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
  numberOfPeople: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  service: ServiceInfo;
  user: BookingUserInfo;
}

interface Sender {
  id: string;
  name: string;
  avatar?: string;
  role: 'user' | 'provider';
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: Sender;
}

type BookingStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

// ── Helpers ─────────────────────────────────────────────────────────────────
const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    label: 'bookingPending',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'bookingConfirmed',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  completed: {
    label: 'bookingCompleted',
    bg: 'bg-sky-500/10 dark:bg-sky-500/15',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-500/20',
    dot: 'bg-sky-500',
  },
  cancelled: {
    label: 'bookingCancelled',
    bg: 'bg-red-500/10 dark:bg-red-500/15',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-500/20',
    dot: 'bg-red-500',
  },
};

const filterTabColors: Record<string, string> = {
  all: 'from-emerald-600 to-teal-500',
  pending: 'from-amber-500 to-orange-400',
  confirmed: 'from-emerald-500 to-green-400',
  completed: 'from-sky-500 to-blue-400',
  cancelled: 'from-red-500 to-rose-400',
};

// ── Animated Counter Hook ───────────────────────────────────────────────────
function useAnimatedNumber(target: number, duration = 800) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return display;
}

// ── Sidebar Content (shared between Sheet & desktop) ────────────────────────
function SidebarContent({ onNavigate, onClose }: { onNavigate: (page: string) => void; onClose?: () => void }) {
  const { user, t, navigateTo, isRTL } = useAppStore();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const navItems = [
    { id: 'bookings', label: t('myBookings'), icon: Package },
  ];

  const handleNav = (id: string) => {
    if (id === 'bookings') {
      // Stay on dashboard
    } else {
      navigateTo(id as 'home' | 'services' | 'profile');
    }
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* H Logo */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-dark via-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/30 animate-pulse-gold">
            <span className="text-3xl font-black text-white tracking-tighter">H</span>
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-gold/20 to-gold-light/20 blur-lg -z-10" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xs text-muted-foreground mt-2 tracking-widest uppercase"
        >
          H — Premium
        </motion.p>
      </div>

      <Separator className="bg-border/50" />

      {/* User info */}
      <motion.div
        initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 px-5 py-5"
      >
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-gold/30">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-300 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -end-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{user?.name || 'User'}</p>
          <Badge variant="outline" className="mt-1 text-[10px] px-2 py-0 border-gold/30 text-gold-dark bg-gold/5">
            <Star className="h-2.5 w-2.5 me-1" />
            {user?.role === 'provider' ? 'Provider' : 'Member'}
          </Badge>
        </div>
      </motion.div>

      <Separator className="bg-border/50" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              onClick={() => handleNav(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent text-foreground border border-gold/15 shadow-sm shadow-gold/5"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-gold-light/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-gold-dark" />
              </div>
              {item.label}
              <div className="ms-auto w-1.5 h-1.5 rounded-full bg-gold" />
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <Separator className="bg-border/50 mb-4" />
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => {
            navigateTo('home');
            onClose?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-600 hover:bg-red-500/5 transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <LogOut className="h-4 w-4" />
          </div>
          {t('logout')}
        </motion.button>
      </div>
    </div>
  );
}

// ── Desktop Sidebar ─────────────────────────────────────────────────────────
function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex w-72 flex-shrink-0 flex-col glass rounded-2xl m-4 me-0 p-0 overflow-hidden">
      <SidebarContent onNavigate={() => {}} />
    </aside>
  );
}

// ── Mobile Sidebar (Sheet) ──────────────────────────────────────────────────
function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { isRTL } = useAppStore();
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side={isRTL ? 'right' : 'left'}
        className="w-72 p-0 glass border-border/50"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>H Dashboard</SheetTitle>
          <SheetDescription>Navigation menu</SheetDescription>
        </SheetHeader>
        <SidebarContent onNavigate={() => {}} onClose={onClose} />
      </SheetContent>
    </Sheet>
  );
}

// ── Stats Cards ─────────────────────────────────────────────────────────────
function StatsCards({ bookings }: { bookings: Booking[] }) {
  const { t } = useAppStore();

  const totalBookings = bookings.length;
  const totalSpent = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const upcoming = bookings.filter(
    (b) =>
      (b.status === 'pending' || b.status === 'confirmed') &&
      new Date(b.bookingDate) >= new Date()
  ).length;

  const animatedTotal = useAnimatedNumber(totalBookings);
  const animatedSpent = useAnimatedNumber(Math.round(totalSpent));
  const animatedUpcoming = useAnimatedNumber(upcoming);

  const stats = [
    {
      label: t('totalBookings'),
      value: animatedTotal,
      icon: Package,
      gradient: 'from-sky-500 to-teal-400',
      glow: 'shadow-sky-500/20',
      iconBg: 'bg-sky-500/10',
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      label: t('totalRevenue').replace('Revenue', 'Spent'),
      value: animatedSpent,
      suffix: ` ${t('sar')}`,
      icon: DollarSign,
      gradient: 'from-gold-dark to-gold-light',
      glow: 'shadow-gold/25',
      iconBg: 'bg-gold/10',
      iconColor: 'text-gold-dark',
    },
    {
      label: t('pendingBookings').replace('Pending ', 'Upcoming'),
      value: animatedUpcoming,
      icon: Clock,
      gradient: 'from-emerald-600 to-emerald-400',
      glow: 'shadow-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="glass rounded-2xl p-5 group hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-base font-semibold text-muted-foreground ms-1">
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                </div>
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center`}>
                    <Icon className={`h-7 w-7 ${stat.iconColor}`} />
                  </div>
                  <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-10 blur-lg -z-10 group-hover:opacity-20 transition-opacity`} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Filter Tabs ─────────────────────────────────────────────────────────────
function FilterTabs({
  active,
  onChange,
  counts,
}: {
  active: BookingStatus;
  onChange: (v: BookingStatus) => void;
  counts: Record<string, number>;
}) {
  const { t } = useAppStore();

  const tabs: { value: BookingStatus; labelKey: string }[] = [
    { value: 'all', labelKey: 'all' },
    { value: 'pending', labelKey: 'bookingPending' },
    { value: 'confirmed', labelKey: 'bookingConfirmed' },
    { value: 'completed', labelKey: 'bookingCompleted' },
    { value: 'cancelled', labelKey: 'bookingCancelled' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        const count = tab.value === 'all' ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[tab.value] || 0;
        return (
          <motion.button
            key={tab.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(tab.value)}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
              ${
                isActive
                  ? `bg-gradient-to-r ${filterTabColors[tab.value]} text-white shadow-lg`
                  : 'glass text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }
            `}
          >
            {t(tab.labelKey as keyof import('@/lib/i18n').TranslationKeys)}
            <span
              className={`
                text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[22px] text-center
                ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Booking Card ────────────────────────────────────────────────────────────
function BookingCard({
  booking,
  locale,
  isRTL,
  onContact,
  onCancel,
  cancellingId,
}: {
  booking: Booking;
  locale: string;
  isRTL: boolean;
  onContact: (b: Booking) => void;
  onCancel: (b: Booking) => void;
  cancellingId: string | null;
}) {
  const { t } = useAppStore();
  const cfg = statusConfig[booking.status];
  const title = locale === 'ar' ? booking.service.titleAr : booking.service.titleEn;
  const isCancelling = cancellingId === booking.id;

  const dateStr = new Date(booking.bookingDate).toLocaleDateString(
    locale === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  const formattedPrice = booking.totalPrice.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gold/5 hover:border-gold/20 border border-transparent">
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail */}
          <div className="relative w-full sm:w-44 h-44 sm:h-auto flex-shrink-0 overflow-hidden">
            {booking.service.image ? (
              <motion.img
                src={booking.service.image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
            {/* Status badge overlay */}
            <div className="absolute top-3 start-3">
              <Badge
                variant="outline"
                className={`${cfg.bg} ${cfg.text} ${cfg.border} text-xs font-semibold border backdrop-blur-sm rounded-full px-3`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} me-1.5`} />
                {t(cfg.label as keyof import('@/lib/i18n').TranslationKeys)}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 flex flex-col justify-between gap-3">
            <div>
              <h3 className="font-bold text-base mb-3 line-clamp-1">{title || 'Service'}</h3>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-teal-500" />
                  {dateStr}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-teal-500" />
                  {booking.numberOfPeople} {t('numberOfPeople').toLowerCase()}
                </span>
                <span className="flex items-center gap-1.5 font-bold text-gold-dark dark:text-gold-light">
                  <DollarSign className="h-3.5 w-3.5 text-gold" />
                  {formattedPrice} {t('sar')}
                </span>
              </div>
              {booking.notes && (
                <p className="text-xs text-muted-foreground mt-3 line-clamp-2 italic">
                  &ldquo;{booking.notes}&rdquo;
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-border/30">
              {booking.status === 'pending' && (
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isCancelling}
                    className="text-red-500 border-red-300/50 hover:bg-red-500/5 hover:text-red-600 hover:border-red-400/60 rounded-full px-4"
                    onClick={() => onCancel(booking)}
                  >
                    <X className="h-3.5 w-3.5 me-1.5" />
                    {isCancelling ? '...' : t('cancelBooking')}
                  </Button>
                </motion.div>
              )}
              {booking.status !== 'cancelled' && (
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full px-4"
                    onClick={() => onContact(booking)}
                  >
                    <MessageSquare className="h-3.5 w-3.5 me-1.5" />
                    {t('contactProvider')}
                  </Button>
                </motion.div>
              )}
              {booking.status === 'completed' && (
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gold-dark border-gold/30 hover:bg-gold/5 hover:border-gold/50 rounded-full px-4"
                  >
                    <Star className="h-3.5 w-3.5 me-1.5" />
                    {t('writeReview')}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Message Dialog ──────────────────────────────────────────────────────────
function MessageDialog({
  booking,
  open,
  onClose,
}: {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
}) {
  const { user, locale, t, showToast } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!booking?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/messages?bookingId=${booking.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [booking?.id]);

  useEffect(() => {
    if (open && booking?.id) {
      fetchMessages();
      setNewMessage('');
    }
  }, [open, booking?.id, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !booking?.id || !user) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          senderId: user.id,
          content: newMessage.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage('');
      } else {
        showToast('Failed to send message', 'error');
      }
    } catch {
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const serviceName = booking?.service
    ? locale === 'ar'
      ? booking.service.titleAr
      : booking.service.titleEn
    : 'Service';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 max-h-[85vh] flex flex-col glass rounded-2xl border-gold/10 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold-light/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-gold-dark" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">{serviceName}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                #{booking?.id?.slice(-8)} &middot; {t('contactProvider')}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[200px] max-h-80">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-muted-foreground"
            >
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <MessageSquare className="h-7 w-7 opacity-30" />
              </div>
              <p className="text-sm font-medium">
                {locale === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}
              </p>
              <p className="text-xs mt-1 opacity-60">
                {locale === 'ar' ? 'ابدأ المحادثة الآن!' : 'Start the conversation!'}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((msg) => {
                const isMe = user?.id === msg.sender.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1 ring-1 ring-border/50">
                      <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} />
                      <AvatarFallback className="text-[10px] font-semibold bg-muted">
                        {msg.sender.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isMe
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-500 text-white rounded-tr-sm'
                          : 'glass rounded-tl-sm'
                      }`}
                    >
                      <p
                        className={`text-[11px] font-semibold mb-1 ${
                          isMe ? 'text-emerald-100' : 'text-muted-foreground'
                        }`}
                      >
                        {isMe
                          ? (locale === 'ar' ? 'أنت' : 'You')
                          : msg.sender.name}
                      </p>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1.5 ${
                          isMe ? 'text-emerald-200/70' : 'text-muted-foreground/60'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString(
                          locale === 'ar' ? 'ar-SA' : 'en-US',
                          { hour: '2-digit', minute: '2-digit' }
                        )}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                locale === 'ar'
                  ? 'اكتب رسالتك...'
                  : 'Type your message...'
              }
              className="flex-1 rounded-full glass border-border/50 focus-visible:ring-gold/30 focus-visible:border-gold/30"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sending}
            />
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                className="h-11 w-11 rounded-full bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-light text-white shadow-lg shadow-gold/25 flex-shrink-0 disabled:opacity-50"
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
              >
                {sending ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Empty State ─────────────────────────────────────────────────────────────
function EmptyState() {
  const { t, navigateTo, locale } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold/10 to-gold-light/5 flex items-center justify-center">
          <Package className="h-11 w-11 text-gold/40" />
        </div>
        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-gold/5 to-transparent blur-xl -z-10" />
      </motion.div>
      <h3 className="font-bold text-xl mb-2">
        {locale === 'ar' ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {locale === 'ar'
          ? 'استكشف خدماتنا واكتشف تجارب سياحية مذهلة!'
          : "You don't have any bookings yet. Explore our services and book your first adventure!"}
      </p>
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Button
          onClick={() => navigateTo('services')}
          className="btn-gold-gradient rounded-full px-8 py-5 text-sm font-semibold btn-shimmer"
        >
          <Star className="h-4 w-4 me-2" />
          {t('heroCta')}
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ── Main UserDashboard ──────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user, locale, isRTL, t, showToast, navigateTo } = useAppStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messageBooking, setMessageBooking] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch bookings
  useEffect(() => {
    if (!user?.id) return;
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const res = await fetch(`/api/bookings?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [user?.id]);

  // Filtered bookings
  const filteredBookings =
    statusFilter === 'all'
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  // Status counts
  const statusCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
  });

  // Cancel booking
  const handleCancel = async (booking: Booking) => {
    if (cancellingId) return;
    setCancellingId(booking.id);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === booking.id ? { ...b, status: 'cancelled' as const } : b
          )
        );
        showToast(
          locale === 'ar' ? 'تم إلغاء الحجز بنجاح' : 'Booking cancelled successfully',
          'success'
        );
      } else {
        showToast(
          locale === 'ar' ? 'فشل إلغاء الحجز' : 'Failed to cancel booking',
          'error'
        );
      }
    } catch {
      showToast(
        locale === 'ar' ? 'فشل إلغاء الحجز' : 'Failed to cancel booking',
        'error'
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-background bg-mesh-gradient">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 glass--scrolled px-4 py-3 lg:hidden flex items-center gap-3 border-b border-border/30">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-muted/80"
            onClick={() => setSidebarOpen(true)}
          >
            <Package className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center shadow-sm shadow-gold/20">
              <span className="text-xs font-black text-white">H</span>
            </div>
            <h1 className="font-bold text-sm">{t('dashboardTitle')}</h1>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <h2 className="text-2xl sm:text-3xl font-bold">
              {t('welcome')},{' '}
              <span className="text-shimmer-gold">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
              {' '}
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2.5, delay: 0.5, ease: 'easeInOut' }}
                className="inline-block origin-bottom"
              >
                👋
              </motion.span>
            </h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              {t('myBookings')} — {locale === 'ar' ? 'إدارة مغامراتك السياحية' : 'manage your tourism adventures'}
            </p>
          </motion.div>

          {/* Stats */}
          <StatsCards bookings={bookings} />

          {/* Bookings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-4"
          >
            {/* Section header + filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold/15 to-gold-light/10 flex items-center justify-center">
                  <Package className="h-4 w-4 text-gold-dark" />
                </div>
                <h3 className="font-bold text-lg">{t('myBookings')}</h3>
              </div>
              <FilterTabs
                active={statusFilter}
                onChange={setStatusFilter}
                counts={statusCounts}
              />
            </div>

            {/* Bookings list */}
            {loadingBookings ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
                <p className="text-sm text-muted-foreground">{t('loading')}</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      locale={locale}
                      isRTL={isRTL}
                      onContact={(b) => setMessageBooking(b)}
                      onCancel={handleCancel}
                      cancellingId={cancellingId}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Message dialog */}
      <MessageDialog
        booking={messageBooking}
        open={!!messageBooking}
        onClose={() => setMessageBooking(null)}
      />
    </div>
  );
}
