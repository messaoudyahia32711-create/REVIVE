'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, CalendarCheck, MessageSquare, Settings,
  DollarSign, Star, Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  Send, MapPin, Users, Loader2, Award, TrendingUp, Menu, Sparkles,
  CheckCircle2, XCircle, ShieldCheck, Clock, X, Globe, Building2, Eye, ChevronDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { WILAYAS, searchWilayas, getWilayaName } from '@/lib/wilayas';

// ── Types ──────────────────────────────────────────────────────────────────

type TabId = 'analytics' | 'services' | 'bookings' | 'messages' | 'settings';

interface DashboardStats {
  totalBookings: number; totalRevenue: number; totalServices: number;
  avgRating: number;
  monthlyData: { month: string; bookings: number; revenue: number }[];
  recentBookings: BookingItem[]; popularServices: PopularService[];
}

interface PopularService {
  id: string; titleAr: string; titleEn: string; image: string | null;
  price: number; rating: number; totalReviews: number; totalBookings: number;
}

interface ServiceItem {
  id: string; providerId: string; categoryId: string;
  titleAr: string; titleEn: string; descriptionAr: string; descriptionEn: string;
  price: number; currency: string; duration: string; maxPeople: number;
  wilaya: string; location: string; image: string | null; images: string;
  rating: number; totalReviews: number; totalBookings: number;
  featured: boolean; createdAt: string; active: boolean;
  category?: { id: string; nameAr: string; nameEn: string; icon: string };
}

interface ProviderProfile {
  id: string; userId: string; companyName: string; description: string | null;
  wilaya: string | null; website: string | null; rating: number;
  totalReviews: number; verified: boolean; createdAt: string; updatedAt: string;
  user: { id: string; name: string; email: string; phone: string | null; avatar: string | null };
}

interface BookingItem {
  id: string; userId: string; serviceId: string; providerId: string;
  status: string; bookingDate: string; numberOfPeople: number;
  totalPrice: number; notes: string | null; createdAt: string;
  service: { id: string; titleAr: string; titleEn: string; price: number; duration: string; image: string | null };
  user: { id: string; name: string; email: string; phone: string | null; avatar: string | null };
}

interface MessageItem {
  id: string; bookingId: string; senderId: string; content: string;
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null; role: string };
}

interface CategoryItem {
  id: string; nameAr: string; nameEn: string; icon: string;
  image: string | null; sort: number; serviceCount: number;
}

interface ServiceFormData {
  titleAr: string; titleEn: string; descriptionAr: string; descriptionEn: string;
  categoryId: string; price: string; duration: string; maxPeople: string;
  wilaya: string; location: string; image: string; featured: boolean;
}

// ── Animation ──────────────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
};

// ── Animated Counter ───────────────────────────────────────────────────────

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const did = useRef(false);
  useEffect(() => {
    if (did.current) return; did.current = true;
    const s = performance.now();
    const tick = (n: number) => {
      const p = Math.min((n - s) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{count.toLocaleString()}</>;
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, suffix, gradient, isGold }: {
  icon: React.ElementType; label: string; value: number | string;
  suffix?: string; gradient: string; isGold?: boolean;
}) {
  return (
    <motion.div variants={staggerItem} whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <div className="glass corner-ornament rounded-2xl overflow-hidden p-5 border border-purple-500/10 glow-purple card-hover">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
            <p className={cn('text-2xl font-extrabold tracking-tight', isGold && 'text-gradient-gold')}>
              {typeof value === 'number' ? <AnimatedCounter target={value} /> : value}
              {suffix && <span className={cn('text-sm font-semibold ms-1', isGold ? 'text-gold-dark' : 'text-muted-foreground')}>{suffix}</span>}
            </p>
          </div>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center pulse-glow-purple', gradient)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status, label }: { status: string; label: string }) {
  const cfg: Record<string, string> = {
    pending:   'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    confirmed: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    completed: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    cancelled: 'bg-red-500/10 border-red-500/30 text-red-400',
  };
  return (
    <span className={cn('px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider', cfg[status] || cfg.pending)}>
      {label}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ProviderDashboard() {
  const { t, locale, isRTL, user, showToast } = useAppStore();

  // ── State ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
    categoryId: '', price: '', duration: '', maxPeople: '1', wilaya: '', location: '', image: '', featured: false,
  });
  const [savingService, setSavingService] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [wilayaSearch, setWilayaSearch] = useState('');
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);
  const wilayaDropdownRef = useRef<HTMLDivElement>(null);

  const [provider, setProvider] = useState<ProviderProfile | null>(null);

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  const [selectedConversation, setSelectedConversation] = useState<BookingItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const providerId = user?.providerId;

  // ── Wilaya dropdown close on outside click ──────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wilayaDropdownRef.current && !wilayaDropdownRef.current.contains(e.target as Node)) {
        setShowWilayaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    if (!providerId) return;
    try {
      const res = await fetch(`/api/dashboard?providerId=${providerId}`);
      if (res.ok) setStats(await res.json());
    } catch { /* silent */ }
  }, [providerId]);

  const fetchServices = useCallback(async () => {
    if (!providerId) return;
    try {
      const res = await fetch(`/api/services?providerId=${providerId}`);
      if (res.ok) { const d = await res.json(); setServices(d.services || []); }
    } catch { /* silent */ }
  }, [providerId]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) { const d = await res.json(); setCategories(d.categories || []); }
    } catch { /* silent */ }
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!providerId) return;
    try {
      const res = await fetch(`/api/bookings?providerId=${providerId}`);
      if (res.ok) { const d = await res.json(); setBookings(d.bookings || []); }
    } catch { /* silent */ }
  }, [providerId]);

  const fetchMessages = useCallback(async (bookingId: string) => {
    try {
      const res = await fetch(`/api/messages?bookingId=${bookingId}`);
      if (res.ok) { const d = await res.json(); setMessages(d.messages || []); }
    } catch { /* silent */ }
  }, []);

  const fetchProvider = useCallback(async () => {
    if (!providerId) return;
    try {
      const res = await fetch(`/api/providers/${providerId}`);
      if (res.ok) { const d = await res.json(); setProvider(d.provider || null); }
    } catch { /* silent */ }
  }, [providerId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchServices(), fetchCategories(), fetchBookings(), fetchProvider()]);
      setLoading(false);
    })();
  }, [fetchDashboard, fetchServices, fetchCategories, fetchBookings, fetchProvider]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const gt = (ar: string, en: string) => locale === 'ar' ? ar : en;
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

  // ── Service CRUD ─────────────────────────────────────────────────────────

  const resetForm = () => {
    setServiceForm({ titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
      categoryId: '', price: '', duration: '', maxPeople: '1', wilaya: '', location: '', image: '', featured: false });
    setEditingService(null);
    setWilayaSearch('');
    setShowWilayaDropdown(false);
  };

  const openAddService = () => {
    resetForm();
    // Default wilaya to the provider's own wilaya
    if (provider?.wilaya) {
      setServiceForm(prev => ({ ...prev, wilaya: provider.wilaya! }));
    }
    setServiceDialogOpen(true);
  };

  const openEditService = (s: ServiceItem) => {
    setEditingService(s);
    setServiceForm({
      titleAr: s.titleAr, titleEn: s.titleEn, descriptionAr: s.descriptionAr, descriptionEn: s.descriptionEn,
      categoryId: s.categoryId, price: String(s.price), duration: s.duration,
      maxPeople: String(s.maxPeople), wilaya: s.wilaya || '', location: s.location, image: s.image || '', featured: s.featured,
    });
    setWilayaSearch('');
    setShowWilayaDropdown(false);
    setServiceDialogOpen(true);
  };

  const handleSaveService = async () => {
    if (!providerId || !serviceForm.titleAr || !serviceForm.titleEn || !serviceForm.categoryId || !serviceForm.price || !serviceForm.duration || !serviceForm.wilaya) {
      showToast(locale === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة (بما في ذلك الولاية)' : 'Please fill all required fields (including wilaya)', 'error');
      return;
    }
    setSavingService(true);
    try {
      const body = { ...serviceForm, price: parseFloat(serviceForm.price), maxPeople: parseInt(serviceForm.maxPeople) || 1, location: serviceForm.location || getWilayaName(serviceForm.wilaya, locale) };
      if (editingService) {
        const res = await fetch(`/api/services/${editingService.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) { showToast(locale === 'ar' ? 'تم تحديث الخدمة' : 'Service updated', 'success'); fetchServices(); setServiceDialogOpen(false); resetForm(); }
        else showToast(locale === 'ar' ? 'فشل التحديث' : 'Update failed', 'error');
      } else {
        const res = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ providerId, ...body }) });
        if (res.ok) { showToast(locale === 'ar' ? 'تم إضافة الخدمة' : 'Service created', 'success'); fetchServices(); fetchDashboard(); setServiceDialogOpen(false); resetForm(); }
        else showToast(locale === 'ar' ? 'فشل الإضافة' : 'Create failed', 'error');
      }
    } catch { showToast(locale === 'ar' ? 'خطأ في الاتصال' : 'Connection error', 'error'); }
    setSavingService(false);
  };

  const handleDeleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast(locale === 'ar' ? 'تم حذف الخدمة' : 'Service deleted', 'success'); fetchServices(); fetchDashboard(); setDeleteServiceId(null); }
      else showToast(locale === 'ar' ? 'فشل الحذف' : 'Delete failed', 'error');
    } catch { showToast(locale === 'ar' ? 'خطأ' : 'Error', 'error'); }
  };

  // ── Booking Status ───────────────────────────────────────────────────────

  const updateBooking = async (id: string, status: string) => {
    setUpdatingBooking(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (res.ok) { showToast(statusLabel(status), 'success'); fetchBookings(); fetchDashboard(); }
    } catch { showToast(locale === 'ar' ? 'خطأ' : 'Error', 'error'); }
    setUpdatingBooking(null);
  };

  // ── Messages ─────────────────────────────────────────────────────────────

  const handleSelectConversation = (b: BookingItem) => { setSelectedConversation(b); fetchMessages(b.id); };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    setSendingMessage(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: selectedConversation.id, senderId: user.id, content: newMessage.trim() }),
      });
      if (res.ok) { setNewMessage(''); fetchMessages(selectedConversation.id); }
    } catch { showToast(locale === 'ar' ? 'فشل الإرسال' : 'Send failed', 'error'); }
    setSendingMessage(false);
  };

  // ── Nav ──────────────────────────────────────────────────────────────────

  const navItems: { id: TabId; icon: React.ElementType; label: string }[] = [
    { id: 'analytics', icon: LayoutDashboard, label: t('analytics') },
    { id: 'services', icon: Package, label: t('manageServices') },
    { id: 'bookings', icon: CalendarCheck, label: t('recentBookings') },
    { id: 'messages', icon: MessageSquare, label: locale === 'ar' ? 'الرسائل' : 'Messages' },
    { id: 'settings', icon: Settings, label: locale === 'ar' ? 'الإعدادات' : 'Settings' },
  ];

  const filteredBookings = bookingFilter === 'all' ? bookings : bookings.filter(b => b.status === bookingFilter);
  const conversations = bookings.slice(0, 15);

  // ── Sidebar Content ──────────────────────────────────────────────────────

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* H Logo */}
      <div className="p-6 pb-4 flex flex-col items-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="relative">
          <div className="text-5xl font-black text-gradient-purple select-none drop-shadow-lg">H</div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
        </motion.div>
        <p className="text-[10px] font-semibold tracking-[0.3em] text-purple-400/60 uppercase mt-1">
          {locale === 'ar' ? 'مزود خدمة' : 'Provider'}
        </p>
      </div>

      <Separator className="bg-purple-500/10" />

      {/* Provider Info */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-sm font-bold">
                {user?.name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -end-0.5 bg-emerald-500 rounded-full p-0.5 border-2 border-gray-900">
              <ShieldCheck className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate text-white">{user?.providerName || user?.name}</p>
            <p className="text-[11px] text-white/50 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden',
                isActive
                  ? 'bg-purple-600/20 text-purple-300 shadow-lg shadow-purple-500/5'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="prov-sidebar-active"
                  className={cn('absolute top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-purple-400 via-purple-600 to-purple-800', isRTL ? 'right-0' : 'left-0')}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-purple-300')} />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-purple-500/10">
        <button
          onClick={() => useAppStore.getState().navigateTo('home')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all"
        >
          {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          <span>{t('back')}</span>
        </button>
      </div>
    </div>
  );

  // ── Skeleton ─────────────────────────────────────────────────────────────

  const SkeletonGrid = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl bg-purple-500/5" />)}
      </div>
      <Skeleton className="h-80 rounded-2xl bg-purple-500/5" />
    </div>
  );

  const EmptyState = ({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-5">
        <Icon className="h-10 w-10 text-muted-foreground/30" />
      </div>
      <h3 className="font-semibold text-lg mb-2 text-white">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{desc}</p>
    </motion.div>
  );

  // ── Analytics Tab ────────────────────────────────────────────────────────

  const renderAnalyticsTab = () => {
    if (loading || !stats) return <SkeletonGrid />;
    return (
      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-4xl font-black text-gradient-purple">{user?.name?.split(' ')[0]}</span>
          </div>
          <p className="text-muted-foreground text-sm">{locale === 'ar' ? 'مرحباً بك في لوحة التحكم' : 'Welcome to your dashboard'}</p>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={CalendarCheck} label={t('totalBookings')} value={stats.totalBookings}
            gradient="bg-gradient-to-br from-teal-500 to-teal-700" />
          <StatCard icon={DollarSign} label={t('totalRevenue')} value={stats.totalRevenue} suffix={t('dzd')}
            gradient="bg-gradient-to-br from-gold-dark to-gold" isGold />
          <StatCard icon={Package} label={t('totalServices')} value={stats.totalServices}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
          <StatCard icon={Star} label={t('avgRating')} value={stats.avgRating.toFixed(1)}
            gradient="bg-gradient-to-br from-gold-dark to-gold" isGold />
        </div>

        {/* Revenue Chart */}
        <motion.div variants={staggerItem}>
          <div className="glass rounded-2xl p-6 border border-purple-500/10">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                {t('monthlyRevenue')}
              </CardTitle>
            </CardHeader>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="purpleBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                      <stop offset="50%" stopColor="#6D28D9" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#4C1D95" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(139,92,246,0.2)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)', backdropFilter: 'blur(16px)', background: 'rgba(10,10,15,0.95)' }}
                    formatter={(value: number) => [`${value.toLocaleString()} ${t('dzd')}`, t('totalRevenue')]}
                    cursor={{ fill: 'rgba(139,92,246,0.06)' }}
                  />
                  <Bar dataKey="revenue" fill="url(#purpleBarGrad)" radius={[8, 8, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Popular Services */}
        <motion.div variants={staggerItem}>
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white">
            <Award className="h-5 w-5 text-gold" />
            {t('popularServices')}
          </h2>
          {stats.popularServices.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scroll-snap-x">
              {stats.popularServices.map((service, idx) => {
                const rankCls = ['from-amber-400 to-yellow-500 text-white', 'from-gray-300 to-gray-400 text-white', 'from-amber-600 to-amber-700 text-white'];
                return (
                  <motion.div key={service.id} initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.1 * idx }}
                    whileHover={{ y: -8, scale: 1.03 }} className="flex-shrink-0 w-64 scroll-snap-start">
                    <div className="card-ornament glass rounded-2xl overflow-hidden border border-purple-500/10 card-hover">
                      <div className="aspect-video relative overflow-hidden">
                        {service.image ? (
                          <img src={service.image} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500/10 to-purple-900/10 flex items-center justify-center">
                            <Package className="h-8 w-8 text-purple-500/30" />
                          </div>
                        )}
                        <div className={cn('absolute top-3 start-3 w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm font-black shadow-lg',
                          idx < 3 ? rankCls[idx] : 'bg-white/10 text-white/60')}>
                          {idx + 1}
                        </div>
                        {idx === 0 && <div className="absolute top-3 end-3"><Sparkles className="h-5 w-5 text-gold drop-shadow-lg" /></div>}
                      </div>
                      <div className="p-4">
                        <p className="font-bold text-sm truncate mb-2 text-white">{gt(service.titleAr, service.titleEn)}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-gold star-filled">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="text-xs font-bold">{service.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-xs font-bold text-gradient-gold">{service.price} {t('dzd')}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Award} title={locale === 'ar' ? 'لا توجد خدمات شائعة' : 'No popular services'}
              desc={locale === 'ar' ? 'ابدأ بإضافة خدماتك' : 'Add your services to get started'} />
          )}
        </motion.div>
      </motion.div>
    );
  };

  // ── Services Tab ─────────────────────────────────────────────────────────

  const renderServicesTab = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-purple-400" />
          {t('manageServices')}
        </h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openAddService}
          className="btn-purple-gradient btn-shimmer px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('addService')}
        </motion.button>
      </div>

      {services.length === 0 ? (
        <EmptyState icon={Package} title={locale === 'ar' ? 'لا توجد خدمات' : 'No services'}
          desc={locale === 'ar' ? 'أضف خدماتك الأولى' : 'Add your first service'} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map((svc, idx) => (
            <motion.div key={svc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }} className="card-ornament glass rounded-2xl overflow-hidden border border-purple-500/10 card-hover">
              <div className="aspect-video relative overflow-hidden">
                {svc.image ? (
                  <img src={svc.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/15 to-purple-900/15 flex items-center justify-center">
                    <Package className="h-10 w-10 text-purple-500/20" />
                  </div>
                )}
                {svc.featured && (
                  <div className="absolute top-3 end-3 px-2 py-0.5 rounded-md bg-gold/90 text-[10px] font-bold text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {t('featured')}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-white truncate mb-1">{gt(svc.titleAr, svc.titleEn)}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3 text-purple-400" /> {svc.location}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-black text-gradient-gold">{svc.price} <span className="text-xs text-gold/60">{t('dzd')}</span></span>
                  <div className="flex items-center gap-1 text-gold star-filled">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-xs font-bold">{svc.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({svc.totalReviews})</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openEditService(svc)}
                    className="flex-1 px-3 py-2 rounded-lg glass border border-purple-500/15 text-xs text-purple-400 hover:bg-purple-500/10 transition-all flex items-center justify-center gap-1">
                    <Pencil className="w-3 h-3" /> {t('edit')}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteServiceId(svc.id)}
                    className="px-3 py-2 rounded-lg border border-red-500/15 bg-red-500/5 text-xs text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Service Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={(open) => { setServiceDialogOpen(open); if (!open) resetForm(); }}>
        <DialogTrigger asChild><span /></DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 glass border-purple-500/15 bg-gray-950/95">
          <div className="p-6 border-b border-purple-500/10 bg-gradient-to-r from-purple-500/5 to-transparent">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-gold" />
              {editingService ? t('editService') : t('addService')}
            </DialogTitle>
          </div>
          <div className="p-6 space-y-5">
            {/* Bilingual titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                  {t('serviceTitle')} ({locale === 'ar' ? 'العربية' : 'Arabic'})
                </Label>
                <Input value={serviceForm.titleAr} onChange={(e) => setServiceForm({ ...serviceForm, titleAr: e.target.value })}
                  placeholder={locale === 'ar' ? 'عنوان الخدمة بالعربية' : 'Title in Arabic'} dir="rtl"
                  className="bg-purple-500/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                  {t('serviceTitle')} (English)
                </Label>
                <Input value={serviceForm.titleEn} onChange={(e) => setServiceForm({ ...serviceForm, titleEn: e.target.value })}
                  placeholder="Title in English" dir="ltr"
                  className="bg-purple-500/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
              </div>
            </div>

            {/* Bilingual descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-purple-300">{t('serviceDescription')} (AR)</Label>
                <Textarea value={serviceForm.descriptionAr} onChange={(e) => setServiceForm({ ...serviceForm, descriptionAr: e.target.value })}
                  placeholder="الوصف بالعربية" dir="rtl" rows={3}
                  className="bg-purple-500/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-purple-300">{t('serviceDescription')} (EN)</Label>
                <Textarea value={serviceForm.descriptionEn} onChange={(e) => setServiceForm({ ...serviceForm, descriptionEn: e.target.value })}
                  placeholder="Description in English" dir="ltr" rows={3}
                  className="bg-purple-500/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
              </div>
            </div>

            {/* Category, Price, Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-purple-300">{t('serviceCategory')}</Label>
                <Select value={serviceForm.categoryId} onValueChange={(v) => setServiceForm({ ...serviceForm, categoryId: v })}>
                  <SelectTrigger className="bg-purple-500/5 border-purple-500/15 text-white">
                    <SelectValue placeholder={locale === 'ar' ? 'اختر تصنيفاً' : 'Select category'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-white">{gt(c.nameAr, c.nameEn)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-purple-300">{t('servicePrice')} ({t('dzd')})</Label>
                <Input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  placeholder="0" className="bg-purple-500/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-purple-300">{t('serviceDuration')}</Label>
                <Input value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                  placeholder={locale === 'ar' ? 'ساعتان' : '2 hours'}
                  className="bg-purple-500/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
              </div>
            </div>

            {/* Wilaya Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                <MapPin className="w-3 h-3 inline me-1 text-purple-400" />
                {locale === 'ar' ? 'الولاية' : 'Wilaya'} *
              </Label>
              <div className="relative" ref={wilayaDropdownRef}>
                <button
                  type="button"
                  onClick={() => { setShowWilayaDropdown(!showWilayaDropdown); setWilayaSearch(''); }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border',
                    'bg-purple-500/5 border-purple-500/15 text-white hover:border-purple-500/30 focus-visible:ring-2 focus-visible:ring-purple-500/30',
                    !serviceForm.wilaya && 'text-muted-foreground',
                  )}
                >
                  <span>
                    {serviceForm.wilaya
                      ? `${getWilayaName(serviceForm.wilaya, locale)} (${serviceForm.wilaya})`
                      : (locale === 'ar' ? 'اختر ولاية...' : 'Select wilaya...')}
                  </span>
                  {serviceForm.wilaya && (
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); setServiceForm({ ...serviceForm, wilaya: '' }); setWilayaSearch(''); }}
                      className="text-muted-foreground hover:text-white me-2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', showWilayaDropdown && 'rotate-180')} />
                </button>
                {showWilayaDropdown && (
                  <div className="absolute z-50 mt-2 w-full rounded-xl glass border border-purple-500/15 bg-gray-950/98 shadow-2xl shadow-purple-500/10 overflow-hidden">
                    <div className="p-2 border-b border-purple-500/10">
                      <div className="relative">
                        <input
                          autoFocus
                          type="text"
                          placeholder={locale === 'ar' ? 'ابحث عن ولاية...' : 'Search wilaya...'}
                          value={wilayaSearch}
                          onChange={(e) => setWilayaSearch(e.target.value)}
                          className="w-full bg-purple-500/5 border border-purple-500/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/30"
                        />
                        {wilayaSearch && (
                          <button type="button" onClick={() => setWilayaSearch('')}
                            className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <ScrollArea className="max-h-56">
                      <div className="p-1">
                        {searchWilayas(wilayaSearch).map((w) => {
                          const isActive = serviceForm.wilaya === w.code;
                          return (
                            <button
                              key={w.code}
                              type="button"
                              onClick={() => {
                                setServiceForm({ ...serviceForm, wilaya: w.code });
                                setShowWilayaDropdown(false);
                                setWilayaSearch('');
                              }}
                              className={cn(
                                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                                isActive ? 'bg-purple-500/20 text-purple-300' : 'text-white/80 hover:bg-purple-500/10 hover:text-white',
                              )}
                            >
                              <span>{locale === 'ar' ? w.nameAr : w.nameEn}</span>
                              <span className="text-xs text-muted-foreground ms-2">{w.code}</span>
                            </button>
                          );
                        })}
                        {searchWilayas(wilayaSearch).length === 0 && (
                          <p className="text-center text-sm text-muted-foreground py-4">
                            {locale === 'ar' ? 'لم يتم العثور على ولاية' : 'No wilaya found'}
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>

            {/* Location, MaxPeople, Image */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-purple-300">{t('serviceLocation')}</Label>
                <Input value={serviceForm.location} onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                  placeholder={locale === 'ar' ? 'الموقع' : 'Location'}
                  className="bg-purple-500/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-purple-300">{t('maxPeople')}</Label>
                <Input type="number" value={serviceForm.maxPeople} onChange={(e) => setServiceForm({ ...serviceForm, maxPeople: e.target.value })}
                  placeholder="1" className="bg-purple-500/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-purple-300">{t('serviceImage')}</Label>
                <Input value={serviceForm.image} onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                  placeholder="https://..." className="bg-purple-500/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end pt-2">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleSaveService} disabled={savingService}
                className="btn-purple-gradient btn-shimmer px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                {savingService && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('save')}
              </motion.button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteServiceId} onOpenChange={() => setDeleteServiceId(null)}>
        <AlertDialogContent className="glass border-purple-500/15 bg-gray-950/95">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{t('deleteService')}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {locale === 'ar' ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Are you sure you want to delete this service?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass border-purple-500/15 text-white">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteServiceId && handleDeleteService(deleteServiceId)}
              className="bg-red-600 hover:bg-red-700 text-white">{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );

  // ── Bookings Tab ─────────────────────────────────────────────────────────

  const renderBookingsTab = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <CalendarCheck className="h-5 w-5 text-purple-400" />
        {t('recentBookings')}
      </h2>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
          <motion.button key={f} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setBookingFilter(f)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 border',
              bookingFilter === f
                ? 'btn-purple-gradient btn-shimmer text-white border-purple-500/30 shadow-lg shadow-purple-500/20'
                : 'glass text-muted-foreground hover:text-purple-300 border-purple-500/10 hover:border-purple-500/20'
            )}>
            {filterLabel(f)}
          </motion.button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState icon={CalendarCheck} title={locale === 'ar' ? 'لا توجد حجوزات' : 'No bookings'}
          desc={locale === 'ar' ? 'لا توجد حجوزات تطابق الفلتر' : 'No bookings match the filter'} />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b, idx) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="card-ornament glass rounded-2xl p-5 border border-purple-500/10 card-hover">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  {b.service.image ? <img src={b.service.image} alt="" className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/15 to-purple-900/15" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm text-white truncate">{gt(b.service.titleAr, b.service.titleEn)}</h3>
                    <StatusBadge status={b.status} label={statusLabel(b.status)} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-purple-400" /> {b.user.name}</span>
                    <span className="flex items-center gap-1"><CalendarCheck className="w-3 h-3 text-purple-400" /> {new Date(b.bookingDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-purple-400" /> {b.numberOfPeople}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-purple-500/10">
                    <p className="text-lg font-black text-gradient-gold">{b.totalPrice.toLocaleString()} <span className="text-xs text-gold/60">{t('dzd')}</span></p>
                    <div className="flex gap-2">
                      {b.status === 'pending' && (
                        <>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => updateBooking(b.id, 'confirmed')} disabled={updatingBooking === b.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {t('bookingConfirmed')}
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => updateBooking(b.id, 'cancelled')} disabled={updatingBooking === b.id}
                            className="px-3 py-1.5 rounded-lg border border-red-500/15 bg-red-500/5 text-xs text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> {t('bookingCancelled')}
                          </motion.button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => updateBooking(b.id, 'completed')} disabled={updatingBooking === b.id}
                          className="btn-purple-gradient px-3 py-1.5 rounded-lg text-xs text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {t('bookingCompleted')}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  // ── Messages Tab ─────────────────────────────────────────────────────────

  const renderMessagesTab = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-purple-500/10 overflow-hidden flex h-[calc(100vh-12rem)]">
      {/* Conversation List */}
      <div className={cn('w-72 border-e border-purple-500/10 flex flex-col flex-shrink-0', selectedConversation && 'hidden md:flex')}>
        <div className="p-4 border-b border-purple-500/10">
          <h3 className="font-bold text-sm text-white">{locale === 'ar' ? 'المحادثات' : 'Conversations'}</h3>
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">{t('noData')}</div>
          ) : (
            conversations.map(b => (
              <button key={b.id} onClick={() => handleSelectConversation(b)}
                className={cn('w-full px-4 py-3 text-start transition-colors border-b border-purple-500/5',
                  selectedConversation?.id === b.id ? 'bg-purple-500/10' : 'hover:bg-purple-500/5')}>
                <p className="text-sm font-medium text-white truncate">{b.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{gt(b.service.titleAr, b.service.titleEn)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(b.createdAt).toLocaleDateString()}</p>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="px-4 py-3 border-b border-purple-500/10 flex items-center gap-2">
              <button onClick={() => setSelectedConversation(null)} className="md:hidden text-muted-foreground hover:text-white">
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{selectedConversation.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{gt(selectedConversation.service.titleAr, selectedConversation.service.titleEn)}</p>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">{t('noData')}</p>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[75%] px-4 py-2.5 rounded-2xl text-sm',
                        isMine
                          ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-br-md shadow-lg shadow-purple-500/20'
                          : 'glass border border-purple-500/15 text-white/90 rounded-bl-md'
                      )}>
                        {!isMine && <p className="text-[10px] text-purple-400 font-semibold mb-1">{msg.sender.name}</p>}
                        <p className="leading-relaxed">{msg.content}</p>
                        <p className={cn('text-[10px] mt-1', isMine ? 'text-purple-200/60' : 'text-muted-foreground')}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <div className="p-4 border-t border-purple-500/10">
              <div className="flex gap-2">
                <Input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t('sendMessage')}
                  className="flex-1 bg-purple-500/5 border-purple-500/15 text-white placeholder:text-muted-foreground focus-visible:ring-purple-500/30" />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}
                  className="btn-purple-gradient btn-shimmer px-4 py-2.5 rounded-xl disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-purple-500/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">{locale === 'ar' ? 'اختر محادثة' : 'Select a conversation'}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  // ── Settings Tab ─────────────────────────────────────────────────────────

  const renderSettingsTab = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Settings className="h-5 w-5 text-purple-400" />
        {locale === 'ar' ? 'الإعدادات' : 'Settings'}
      </h2>

      {provider ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Provider Card */}
          <motion.div variants={staggerItem} initial="hidden" animate="visible" className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 border border-purple-500/10 card-hover">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24 ring-4 ring-purple-500/20 shadow-xl shadow-purple-500/10">
                    <AvatarImage src={provider.user.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-2xl font-bold">
                      {provider.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -end-1 bg-emerald-500 rounded-full p-1 border-3 border-gray-950">
                    {provider.verified
                      ? <ShieldCheck className="h-4 w-4 text-white" />
                      : <Eye className="h-4 w-4 text-white" />}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-white">{provider.companyName}</h3>
                <p className="text-sm text-muted-foreground mt-1">{provider.user.email}</p>
                {provider.wilaya && (
                  <p className="text-xs text-purple-400 flex items-center gap-1 mt-2">
                    <MapPin className="w-3 h-3" /> {getWilayaName(provider.wilaya, locale)}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-3 text-gold star-filled">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-bold">{provider.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground ms-1">
                    ({provider.totalReviews} {locale === 'ar' ? 'تقييم' : 'reviews'})
                  </span>
                </div>
                <div className="mt-3">
                  <Badge className={cn(
                    'px-3 py-1 rounded-lg text-[11px] font-bold border',
                    provider.verified
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
                  )}>
                    {provider.verified
                      ? (locale === 'ar' ? 'حساب موثّق' : 'Verified Account')
                      : (locale === 'ar' ? 'بانتظار التوثيق' : 'Pending Verification')}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div variants={staggerItem} initial="hidden" animate="visible" className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 border border-purple-500/10 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4 text-purple-400" />
                {locale === 'ar' ? 'معلومات الملف الشخصي' : 'Profile Information'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {locale === 'ar' ? 'اسم الشركة' : 'Company Name'}
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5">{provider.companyName}</p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {locale === 'ar' ? 'الاسم' : 'Name'}
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5">{provider.user.name}</p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5">{provider.user.email}</p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {locale === 'ar' ? 'الهاتف' : 'Phone'}
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5">{provider.user.phone || '—'}</p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {locale === 'ar' ? 'الولاية' : 'Wilaya'}
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {provider.wilaya ? `${getWilayaName(provider.wilaya, locale)} (${provider.wilaya})` : '—'}
                  </p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {locale === 'ar' ? 'التقييم' : 'Rating'}
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-gold fill-current" />
                    {provider.rating.toFixed(1)}
                    <span className="text-muted-foreground font-normal ms-1">({provider.totalReviews})</span>
                  </p>
                </div>
              </div>

              {provider.description && (
                <div className="px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {locale === 'ar' ? 'الوصف' : 'Description'}
                  </p>
                  <p className="text-sm text-white/90 leading-relaxed">{provider.description}</p>
                </div>
              )}

              {provider.website && (
                <div className="px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {locale === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                  </p>
                  <a
                    href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-4 flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {provider.website}
                  </a>
                </div>
              )}

              <Separator className="bg-purple-500/10" />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {locale === 'ar' ? 'عضو منذ' : 'Member since'}
                  </p>
                  <p className="text-xs font-semibold text-white">
                    {new Date(provider.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <p>{locale === 'ar' ? 'آخر تحديث' : 'Last updated'}: {new Date(provider.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 border border-purple-500/10 text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'جارٍ تحميل البيانات...' : 'Loading data...'}</p>
        </div>
      )}
    </motion.div>
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
          <AvatarImage src={user?.avatar || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-xs font-bold">
            {user?.name?.charAt(0) || 'P'}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-72 z-30 glass border-e border-purple-500/10 bg-gradient-to-b from-gray-900 to-purple-950/30">
            {renderSidebarContent()}
        </aside>

        {/* Main */}
        <main className="flex-1 lg:ms-72 pt-20 lg:pt-0 min-h-screen">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'analytics' && <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderAnalyticsTab()}</motion.div>}
              {activeTab === 'services' && <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderServicesTab()}</motion.div>}
              {activeTab === 'bookings' && <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderBookingsTab()}</motion.div>}
              {activeTab === 'messages' && <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderMessagesTab()}</motion.div>}
              {activeTab === 'settings' && <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderSettingsTab()}</motion.div>}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
