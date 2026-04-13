'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  User,
  Settings,
  List,
  Calendar,
  Users,
  CreditCard,
  Clock,
  X,
  Send,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Menu,
  ImageOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppStore } from '@/lib/store';

// ── Types ───────────────────────────────────────────────────────────────────
interface Booking {
  id: string;
  serviceId: string;
  providerId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
  numberOfPeople: number;
  totalPrice: number;
  notes?: string;
  service?: {
    id: string;
    titleAr: string;
    titleEn: string;
    image?: string;
    price: number;
  };
  provider?: {
    id: string;
    companyName: string;
    user?: {
      name: string;
      avatar?: string;
    };
  };
}

interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    name: string;
    avatar?: string;
  };
}

type BookingStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

// ── Status badge helper ─────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  confirmed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  completed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
};

// ── Sidebar ─────────────────────────────────────────────────────────────────
function DashboardSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, t, navigateTo } = useAppStore();
  const [activeTab, setActiveTab] = useState('bookings');

  const navItems = [
    { id: 'bookings', label: t('myBookings'), icon: BookOpen },
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: 0,
        }}
        className={`
          fixed top-0 start-0 bottom-0 z-50 w-72 bg-card border-e shadow-xl
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gradient-primary">{t('dashboardTitle')}</h2>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <Separator />

            {/* User info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-emerald-tourism/30">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-emerald-tourism/10 text-emerald-tourism font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'profile') navigateTo('profile');
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-emerald-tourism/10 text-emerald-tourism shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => navigateTo('home')}
            >
              <ArrowLeft className="h-4 w-4" />
              {t('back')}
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

// ── Stats cards ─────────────────────────────────────────────────────────────
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

  const stats = [
    {
      label: t('totalBookings'),
      value: totalBookings,
      icon: BookOpen,
      color: 'text-emerald-tourism',
      bg: 'bg-emerald-tourism/10',
    },
    {
      label: 'Total Spent',
      value: `${totalSpent.toFixed(0)} ${t('sar')}`,
      icon: CreditCard,
      color: 'text-gold-dark',
      bg: 'bg-gold/10',
    },
    {
      label: 'Upcoming',
      value: upcoming,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="card-hover border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-xl`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Booking card ────────────────────────────────────────────────────────────
function BookingCard({
  booking,
  locale,
  onContact,
  onCancel,
}: {
  booking: Booking;
  locale: string;
  onContact: (b: Booking) => void;
  onCancel: (b: Booking) => void;
}) {
  const { t } = useAppStore();

  const title = locale === 'ar' ? booking.service?.titleAr : booking.service?.titleEn;
  const dateStr = new Date(booking.bookingDate).toLocaleDateString(
    locale === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="card-hover border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Thumbnail */}
            <div className="relative w-full sm:w-40 h-40 sm:h-auto flex-shrink-0 bg-muted">
              {booking.service?.image ? (
                <img
                  src={booking.service.image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
              {/* Status badge overlay */}
              <Badge
                variant="outline"
                className={`absolute top-3 start-3 text-xs font-semibold ${statusStyles[booking.status] || ''}`}
              >
                {t(booking.status === 'pending'
                  ? 'bookingPending'
                  : booking.status === 'confirmed'
                    ? 'bookingConfirmed'
                    : booking.status === 'cancelled'
                      ? 'bookingCancelled'
                      : 'bookingCompleted')}
              </Badge>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3">
              <div>
                <h3 className="font-bold text-base mb-2">{title || 'Service'}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-emerald-tourism" />
                    {dateStr}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-emerald-tourism" />
                    {booking.numberOfPeople} {t('numberOfPeople').toLowerCase()}
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <CreditCard className="h-3.5 w-3.5 text-gold" />
                    {booking.totalPrice.toFixed(0)} {t('sar')}
                  </span>
                </div>
                {booking.notes && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {booking.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                {booking.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20"
                    onClick={() => onCancel(booking)}
                  >
                    <X className="h-3.5 w-3.5 me-1.5" />
                    {t('cancelBooking')}
                  </Button>
                )}
                {booking.status !== 'cancelled' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-emerald-tourism border-emerald-tourism/30 hover:bg-emerald-tourism/10"
                    onClick={() => onContact(booking)}
                  >
                    <MessageSquare className="h-3.5 w-3.5 me-1.5" />
                    {t('contactProvider')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Message dialog ──────────────────────────────────────────────────────────
function MessageDialog({
  booking,
  open,
  onClose,
}: {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
}) {
  const { user, t, showToast } = useAppStore();
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

  const providerName = booking?.provider?.companyName || 'Provider';
  const serviceName =
    booking?.service
      ? (useAppStore.getState().locale === 'ar'
          ? booking.service.titleAr
          : booking.service.titleEn)
      : 'Service';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 max-h-[80vh] flex flex-col">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5 text-emerald-tourism" />
            {t('contactProvider')} — {providerName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Re: {serviceName}
          </p>
        </DialogHeader>

        <Separator />

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[200px] max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = user?.id === msg.senderId;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[80%] rounded-2xl px-4 py-2.5 text-sm
                      ${
                        isMe
                          ? 'bg-emerald-tourism text-white rounded-ee-sm'
                          : 'bg-muted text-foreground rounded-es-sm'
                      }
                    `}
                  >
                    <p className="font-medium text-xs mb-0.5 opacity-80">
                      {isMe ? 'You' : msg.sender?.name || 'Provider'}
                    </p>
                    <p>{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMe ? 'text-emerald-100' : 'text-muted-foreground'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString(
                        useAppStore.getState().locale === 'ar' ? 'ar-SA' : 'en-US',
                        { hour: '2-digit', minute: '2-digit' }
                      )}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <Separator />

        {/* Input area */}
        <div className="p-4 flex items-center gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[44px] max-h-[100px] resize-none text-sm"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            size="icon"
            className="h-11 w-11 flex-shrink-0 bg-emerald-tourism hover:bg-emerald-dark text-white"
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyState() {
  const { t } = useAppStore();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <List className="h-10 w-10 text-muted-foreground/40" />
      </div>
      <h3 className="font-semibold text-lg mb-1">{t('noData')}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        You don&apos;t have any bookings yet. Explore our services and book your first adventure!
      </p>
    </motion.div>
  );
}

// ── Main UserDashboard ──────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user, locale, t, showToast } = useAppStore();

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
        showToast(t('cancelBooking') + ' — Success', 'success');
      } else {
        showToast('Failed to cancel booking', 'error');
      }
    } catch {
      showToast('Failed to cancel booking', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  // Tab definitions
  const statusTabs: { value: BookingStatus; label: string }[] = [
    { value: 'all', label: t('all') },
    { value: 'pending', label: t('bookingPending') },
    { value: 'confirmed', label: t('bookingConfirmed') },
    { value: 'completed', label: t('bookingCompleted') },
    { value: 'cancelled', label: t('bookingCancelled') },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar (mobile) */}
        <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b px-4 py-3 lg:hidden flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-gradient-primary">{t('dashboardTitle')}</h1>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold">
              {t('welcome')},{' '}
              <span className="text-gradient-gold">{user?.name?.split(' ')[0] || 'User'}</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {t('myBookings')} — manage your tourism adventures
            </p>
          </motion.div>

          {/* Stats */}
          <StatsCards bookings={bookings} />

          {/* Bookings section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-emerald-tourism" />
                    {t('myBookings')}
                  </CardTitle>
                </div>

                {/* Status filter tabs */}
                <Tabs
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as BookingStatus)}
                >
                  <TabsList className="w-full sm:w-auto overflow-x-auto">
                    {statusTabs.map((tab) => (
                      <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent>
                {loadingBookings ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-tourism" />
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
                          onContact={(b) => setMessageBooking(b)}
                          onCancel={handleCancel}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
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
