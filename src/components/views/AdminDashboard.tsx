'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Building2, CalendarCheck, Settings,
  DollarSign, Star, Shield, TrendingUp, Menu,
  Search, CheckCircle2, XCircle, Ban, Globe, BarChart3,
  Database, HardDrive, RotateCcw, Download,
  Info, Zap, Loader2, Home, MessageSquareWarning, Send, Reply, ArrowLeft, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle,
} from '@/components/ui/sheet';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'users' | 'providers' | 'bookings' | 'complaints' | 'settings';

interface AdminData {
  totalUsers: number; totalProviders: number; totalServices: number;
  totalBookings: number; totalReviews: number; totalCategories: number;
  pendingBookings: number; completedBookings: number; cancelledBookings: number;
  openComplaints: number; inactiveUsers: number; unverifiedProviders: number;
  totalRevenue: number;
  monthlyData: { month: string; bookings: number; revenue: number }[];
  recentBookings: AdminBooking[];
  recentProviders: AdminProvider[];
  recentUsers: AdminUser[];
  recentServices: AdminService[];
}

interface AdminBooking {
  id: string; userId: string; serviceId: string; providerId: string;
  status: string; bookingDate: string; numberOfPeople: number;
  totalPrice: number; notes: string | null; createdAt: string;
  service: { id: string; titleAr: string; titleEn: string; image: string | null };
  user: { id: string; name: string; email: string };
}

interface AdminUser {
  id: string; name: string; email: string; role: string; active: boolean; createdAt: string;
}

interface AdminProvider {
  id: string; userId: string; companyName: string; description: string | null;
  location: string | null; rating: number; totalReviews: number; verified: boolean;
  createdAt: string;
  user: { name: string; email: string; active: boolean };
  _count: { services: number; bookings: number };
}

interface AdminService {
  id: string; providerId: string; categoryId: string;
  titleAr: string; titleEn: string; price: number; duration: string;
  location: string; image: string | null; active: boolean; featured: boolean;
  rating: number; totalReviews: number; createdAt: string;
  provider: { companyName: string } | null;
  category: { nameAr: string; nameEn: string } | null;
}

interface Complaint {
  id: string; userId: string; subject: string; content: string;
  status: string; adminReply: string | null; createdAt: string; updatedAt: string;
  user: { id: string; name: string; email: string; avatar: string | null; role: string };
}

// ── Animation ──────────────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
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

// ── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status, label }: { status: string; label: string }) {
  const cfg: Record<string, string> = {
    pending:   'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    confirmed: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    completed: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    cancelled: 'bg-red-500/10 border-red-500/30 text-red-400',
  };
  return <span className={cn('px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider', cfg[status] || cfg.pending)}>{label}</span>;
}

function ComplaintStatusBadge({ status }: { status: string }) {
  const { locale } = useAppStore();
  const cfg: Record<string, { cls: string; label: string }> = {
    open:       { cls: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400', label: locale === 'ar' ? 'مفتوحة' : 'Open' },
    in_progress:{ cls: 'bg-blue-500/10 border-blue-500/30 text-blue-400', label: locale === 'ar' ? 'قيد المراجعة' : 'In Progress' },
    resolved:   { cls: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', label: locale === 'ar' ? 'تم الحل' : 'Resolved' },
    closed:     { cls: 'bg-gray-500/10 border-gray-500/30 text-gray-400', label: locale === 'ar' ? 'مغلقة' : 'Closed' },
  };
  const c = cfg[status] || cfg.open;
  return <span className={cn('px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider', c.cls)}>{c.label}</span>;
}

// ── Sidebar Width ──────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 280;

// ── Main Component ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { t, locale, isRTL, showToast } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminData | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [complaintFilter, setComplaintFilter] = useState('all');
  const [verifying, setVerifying] = useState<string | null>(null);
  const [togglingUser, setTogglingUser] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState<string | null>(null);

  // ── Fetch Admin Data ──────────────────────────────────────────────────────

  const fetchAdmin = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin');
      if (res.ok) setData(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  const fetchComplaints = useCallback(async () => {
    setComplaintsLoading(true);
    try {
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const d = await res.json();
        setComplaints(d.complaints || []);
      }
    } catch { /* silent */ }
    setComplaintsLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    fetchAdmin();
    fetchComplaints();

    // Real-time polling
    const interval = setInterval(() => {
      fetchAdmin();
      fetchComplaints();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [fetchAdmin, fetchComplaints]);

  // ── Provider Verify Toggle ───────────────────────────────────────────────

  const toggleVerifyProvider = async (providerId: string, verified: boolean) => {
    setVerifying(providerId);
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', providerId, verified }),
      });
      if (res.ok) {
        showToast(
          verified
            ? (locale === 'ar' ? 'تم توثيق المزود' : 'Provider verified')
            : (locale === 'ar' ? 'تم إلغاء توثيق المزود' : 'Provider unverified'),
          'success',
        );
        fetchAdmin();
      }
    } catch {
      showToast(locale === 'ar' ? 'خطأ' : 'Error', 'error');
    }
    setVerifying(null);
  };

  // ── User Activate/Deactivate (REAL API) ──────────────────────────────────

  const toggleUserActive = async (userId: string, currentActive: boolean, name: string) => {
    setTogglingUser(userId);
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleUserActive', userId, active: !currentActive }),
      });
      if (res.ok) {
        showToast(
          !currentActive
            ? (locale === 'ar' ? `تم تفعيل ${name}` : `${name} activated`)
            : (locale === 'ar' ? `تم تعطيل ${name}` : `${name} deactivated`),
          'success',
        );
        fetchAdmin();
      }
    } catch {
      showToast(locale === 'ar' ? 'خطأ' : 'Error', 'error');
    }
    setTogglingUser(null);
  };

  // ── Booking Status Update ────────────────────────────────────────────────

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      if (res.ok) { showToast(locale === 'ar' ? 'تم التحديث' : 'Updated', 'success'); fetchAdmin(); }
    } catch { showToast(locale === 'ar' ? 'خطأ' : 'Error', 'error'); }
  };

  // ── Complaint Reply ──────────────────────────────────────────────────────

  const handleReplyComplaint = async (complaintId: string) => {
    if (!replyText.trim()) return;
    setSendingReply(complaintId);
    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyText, status: 'in_progress' }),
      });
      if (res.ok) {
        showToast(locale === 'ar' ? 'تم إرسال الرد' : 'Reply sent', 'success');
        setReplyingTo(null);
        setReplyText('');
        fetchComplaints();
      }
    } catch {
      showToast(locale === 'ar' ? 'خطأ' : 'Error', 'error');
    }
    setSendingReply(null);
  };

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });
      if (res.ok) {
        showToast(locale === 'ar' ? 'تم حل الشكوى' : 'Complaint resolved', 'success');
        fetchComplaints();
      }
    } catch {
      showToast(locale === 'ar' ? 'خطأ' : 'Error', 'error');
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────

  const gt = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const statusLabel = (s: string) => {
    const m: Record<string, string> = {
      pending: t('bookingPending'), confirmed: t('bookingConfirmed'),
      completed: t('bookingCompleted'), cancelled: t('bookingCancelled'),
    };
    return m[s] || s;
  };

  // ── Nav Items ────────────────────────────────────────────────────────────

  const navItems: { id: TabId; icon: React.ElementType; label: string; badge?: number }[] = [
    { id: 'overview',  icon: LayoutDashboard, label: locale === 'ar' ? 'الإحصائيات' : 'Overview' },
    { id: 'users',     icon: Users,           label: locale === 'ar' ? 'المستخدمون' : 'Users' },
    { id: 'providers', icon: Building2,       label: locale === 'ar' ? 'المزودون' : 'Providers' },
    { id: 'bookings',  icon: CalendarCheck,   label: locale === 'ar' ? 'الحجوزات' : 'Bookings', badge: data?.pendingBookings },
    { id: 'complaints',icon: MessageSquareWarning, label: locale === 'ar' ? 'الشكاوى' : 'Complaints', badge: data?.openComplaints },
    { id: 'settings',  icon: Settings,        label: locale === 'ar' ? 'الإعدادات' : 'Settings' },
  ];

  // ── Sidebar Content (shared between desktop and mobile sheet) ────────────

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-4 border-b border-purple-500/10 flex-shrink-0">
        <img src="/images/logo.png" alt="REVIVE" className="w-9 h-9 rounded-xl" />
        <div>
          <p className="text-sm font-bold text-white leading-tight">{locale === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}</p>
          <p className="text-[10px] text-purple-400/60 flex items-center gap-1">
            <Shield className="w-2.5 h-2.5" />
            {locale === 'ar' ? 'مسؤول النظام' : 'System Admin'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3 px-2">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileSheetOpen(false); }}
                className={cn('w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 relative group',
                  'px-3 py-2.5',
                  isActive ? 'bg-purple-600/15 text-purple-300' : 'text-white/50 hover:text-white/80 hover:bg-white/5')}>
                {isActive && <motion.div layoutId="admin-sidebar-active" className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gradient-to-b from-purple-400 to-purple-600" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-purple-300')} />
                <span className="flex-1 text-start">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-md">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-purple-500/10">
        <button onClick={() => useAppStore.getState().navigateTo('home')}
          className="w-full flex items-center gap-3 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all px-3 py-2.5">
          <Home className="h-5 w-5 flex-shrink-0" />
          <span>{locale === 'ar' ? 'العودة للموقع' : 'Back to Home'}</span>
        </button>
      </div>
    </div>
  );

  // ── Skeleton ─────────────────────────────────────────────────────────────

  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl bg-purple-500/5" />)}
      </div>
      <Skeleton className="h-80 rounded-2xl bg-purple-500/5" />
      <Skeleton className="h-64 rounded-2xl bg-purple-500/5" />
    </div>
  );

  const EmptyState = ({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-[#0f0f1a]/80 border border-purple-500/10 flex items-center justify-center mb-5">
        <Icon className="h-10 w-10 text-muted-foreground/30" />
      </div>
      <h3 className="font-semibold text-lg mb-2 text-white">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{desc}</p>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // ── OVERVIEW TAB ────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderOverviewTab = () => {
    if (loading || !data) return <LoadingSkeleton />;

    const overviewStats = [
      { label: locale === 'ar' ? 'المستخدمون' : 'Users', value: data.totalUsers, icon: Users, gradient: 'bg-gradient-to-br from-purple-600 to-purple-800', isGold: false },
      { label: locale === 'ar' ? 'المزودون' : 'Providers', value: data.totalProviders, icon: Building2, gradient: 'bg-gradient-to-br from-indigo-600 to-purple-700', isGold: false },
      { label: locale === 'ar' ? 'الخدمات' : 'Services', value: data.totalServices, icon: Globe, gradient: 'bg-gradient-to-br from-emerald-600 to-emerald-800', isGold: false },
      { label: locale === 'ar' ? 'الحجوزات' : 'Bookings', value: data.totalBookings, icon: CalendarCheck, gradient: 'bg-gradient-to-br from-teal-500 to-teal-700', isGold: false },
      { label: locale === 'ar' ? 'الإيرادات' : 'Revenue', value: data.totalRevenue, icon: DollarSign, gradient: 'bg-gradient-to-br from-amber-700 to-amber-500', isGold: true, suffix: t('dzd') },
      { label: locale === 'ar' ? 'التقييمات' : 'Reviews', value: data.totalReviews, icon: Star, gradient: 'bg-gradient-to-br from-amber-600 to-yellow-500', isGold: true },
      { label: locale === 'ar' ? 'الشكاوى المفتوحة' : 'Open Complaints', value: data.openComplaints, icon: MessageSquareWarning, gradient: 'bg-gradient-to-br from-red-600 to-red-800', isGold: false },
      { label: locale === 'ar' ? 'قيد الانتظار' : 'Pending', value: data.pendingBookings, icon: TrendingUp, gradient: 'bg-gradient-to-br from-yellow-600 to-orange-700', isGold: false },
    ];

    return (
      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">
        {/* Header */}
        <motion.div variants={staggerItem} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Shield className="h-8 w-8 text-purple-400" />
              <div className="text-3xl font-black text-gradient-purple">{locale === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}</div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-pulse">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Live
              </div>
            </div>
            <p className="text-muted-foreground text-sm">{locale === 'ar' ? 'إدارة المنصة والمراقبة بتحديث حي' : 'Real-time platform management & monitoring'}</p>
          </div>
        </motion.div>

        {/* 8 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {overviewStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} variants={staggerItem} whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <div className="rounded-2xl overflow-hidden p-5 border border-purple-500/10 bg-[#0f0f1a]/80 hover:bg-[#0f0f1a] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                      <p className={cn('text-2xl font-extrabold tracking-tight', stat.isGold && 'text-gradient-gold')}>
                        <AnimatedCounter target={stat.value as number} />
                        {stat.suffix && <span className="text-sm font-semibold ms-1 text-amber-500/70">{stat.suffix}</span>}
                      </p>
                    </div>
                    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', stat.gradient)}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue & Bookings Chart */}
          <motion.div variants={staggerItem} className="lg:col-span-2">
            <div className="rounded-2xl p-6 border border-purple-500/10 bg-[#0f0f1a]/80 h-full">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-bold flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    {locale === 'ar' ? 'الإيرادات والحجوزات الشهرية' : 'Monthly Revenue & Bookings'}
                  </div>
                </CardTitle>
              </CardHeader>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminPurpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                        <stop offset="50%" stopColor="#6D28D9" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#4C1D95" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="adminGoldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4A853" stopOpacity={1} />
                        <stop offset="100%" stopColor="#B48631" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" stroke="#888" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#888" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: '1px solid rgba(139,92,246,0.2)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)', backdropFilter: 'blur(16px)', background: 'rgba(10,10,15,0.95)', color: '#fff' }}
                      cursor={{ fill: 'rgba(139,92,246,0.06)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar yAxisId="left" name={locale === 'ar' ? 'الإيرادات' : 'Revenue'} dataKey="revenue" fill="url(#adminPurpleGrad)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar yAxisId="right" name={locale === 'ar' ? 'الحجوزات' : 'Bookings'} dataKey="bookings" fill="url(#adminGoldGrad)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Bookings Status Pie Chart */}
          <motion.div variants={staggerItem}>
            <div className="rounded-2xl p-6 border border-purple-500/10 bg-[#0f0f1a]/80 h-full flex flex-col">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                  <PieChart className="h-5 w-5 text-purple-400" />
                  {locale === 'ar' ? 'حالة الحجوزات' : 'Booking Statuses'}
                </CardTitle>
              </CardHeader>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: locale === 'ar' ? 'مكتملة' : 'Completed', value: data.completedBookings, color: '#A855F7' },
                        { name: locale === 'ar' ? 'قيد الانتظار' : 'Pending', value: data.pendingBookings, color: '#EAB308' },
                        { name: locale === 'ar' ? 'ملغاة' : 'Cancelled', value: data.cancelledBookings, color: '#EF4444' },
                      ]}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                    >
                      {[
                        { color: '#A855F7' }, { color: '#EAB308' }, { color: '#EF4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(10,10,15,0.95)', color: '#fff' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Services Table */}
        <motion.div variants={staggerItem} className="mb-6">
          <div className="rounded-2xl border border-purple-500/10 bg-[#0f0f1a]/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-purple-500/10">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple-400" />
                {locale === 'ar' ? 'أحدث الخدمات المضافة' : 'Recently Added Services'}
              </h3>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#0a0a0f]">
                    <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الخدمة' : 'Service'}</th>
                    <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'المزود' : 'Provider'}</th>
                    <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'السعر' : 'Price'}</th>
                    <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'التقييم' : 'Rating'}</th>
                    <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentServices.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">{t('noData')}</td></tr>
                  ) : data.recentServices.map(s => (
                    <tr key={s.id} className="border-t border-purple-500/5 hover:bg-purple-500/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-purple-500/10">
                            {s.image ? <img src={s.image} alt="" className="w-full h-full object-cover" /> : null}
                          </div>
                          <div>
                            <p className="text-white/90 text-sm font-semibold truncate max-w-[200px]">{gt(s.titleAr, s.titleEn)}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{gt(s.category.nameAr, s.category.nameEn)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/80 text-xs truncate max-w-[150px]">{s.provider.companyName}</td>
                      <td className="px-4 py-3 text-xs font-bold text-gradient-gold">{s.price.toLocaleString()} {t('dzd')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                          <span className="text-xs text-white/80">{s.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border',
                          s.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>
                          {s.active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Bookings Table */}
          <motion.div variants={staggerItem}>
            <div className="rounded-2xl border border-purple-500/10 bg-[#0f0f1a]/80 overflow-hidden">
              <div className="px-5 py-4 border-b border-purple-500/10">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-purple-400" />
                  {locale === 'ar' ? 'أحدث الحجوزات' : 'Recent Bookings'}
                </h3>
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#0a0a0f]">
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'المستخدم' : 'User'}</th>
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الخدمة' : 'Service'}</th>
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'السعر' : 'Price'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentBookings.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-xs">{t('noData')}</td></tr>
                    ) : data.recentBookings.map(b => (
                      <tr key={b.id} className="border-t border-purple-500/5 hover:bg-purple-500/5 transition-colors">
                        <td className="px-4 py-3 text-white/80 text-xs truncate max-w-[100px]">{b.user.name}</td>
                        <td className="px-4 py-3 text-white/80 text-xs truncate max-w-[120px]">{gt(b.service.titleAr, b.service.titleEn)}</td>
                        <td className="px-4 py-3"><StatusBadge status={b.status} label={statusLabel(b.status)} /></td>
                        <td className="px-4 py-3 text-xs font-bold text-gradient-gold">{b.totalPrice.toLocaleString()} {t('dzd')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Recent Users Table */}
          <motion.div variants={staggerItem}>
            <div className="rounded-2xl border border-purple-500/10 bg-[#0f0f1a]/80 overflow-hidden">
              <div className="px-5 py-4 border-b border-purple-500/10">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-400" />
                  {locale === 'ar' ? 'أحدث المستخدمين' : 'Recent Users'}
                </h3>
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#0a0a0f]">
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('name')}</th>
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('email')}</th>
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الدور' : 'Role'}</th>
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentUsers.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-xs">{t('noData')}</td></tr>
                    ) : data.recentUsers.map(u => (
                      <tr key={u.id} className="border-t border-purple-500/5 hover:bg-purple-500/5 transition-colors">
                        <td className="px-4 py-3 text-white/80 text-xs">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-[140px]">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold',
                            u.role === 'provider' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-white/5 text-white/60 border border-white/10')}>
                            {u.role === 'provider' ? t('providerRole') : t('userRole')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold',
                            u.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20')}>
                            {u.active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'معطل' : 'Inactive')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Recent Providers Table */}
          <motion.div variants={staggerItem} className="xl:col-span-2">
            <div className="rounded-2xl border border-purple-500/10 bg-[#0f0f1a]/80 overflow-hidden">
              <div className="px-5 py-4 border-b border-purple-500/10">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-400" />
                  {locale === 'ar' ? 'أحدث المزودين' : 'Recent Providers'}
                </h3>
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#0a0a0f]">
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('name')}</th>
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الشركة' : 'Company'}</th>
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'التقييم' : 'Rating'}</th>
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الخدمات' : 'Services'}</th>
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الحجوزات' : 'Bookings'}</th>
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="text-start px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'إجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentProviders.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-xs">{t('noData')}</td></tr>
                    ) : data.recentProviders.map(p => (
                      <tr key={p.id} className="border-t border-purple-500/5 hover:bg-purple-500/5 transition-colors">
                        <td className="px-4 py-3 text-white/80 text-xs">{p.user.name}</td>
                        <td className="px-4 py-3 text-white/80 text-xs">{p.companyName}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-bold">{p.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-purple-400">{p._count.services}</td>
                        <td className="px-4 py-3 text-xs text-purple-400">{p._count.bookings}</td>
                        <td className="px-4 py-3">
                          {p.verified ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {locale === 'ar' ? 'موثق' : 'Verified'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                              {locale === 'ar' ? 'بانتظار التحقق' : 'Unverified'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            disabled={verifying === p.id}
                            onClick={() => toggleVerifyProvider(p.id, !p.verified)}
                            className={cn(
                              'px-2.5 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 w-fit transition-all',
                              p.verified
                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
                              verifying === p.id && 'opacity-60 pointer-events-none',
                            )}
                          >
                            {verifying === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : p.verified ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {p.verified ? (locale === 'ar' ? 'إلغاء التوثيق' : 'Unverify') : (locale === 'ar' ? 'توثيق' : 'Verify')}
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ── USERS TAB ──────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderUsersTab = () => {
    if (loading || !data) return <LoadingSkeleton />;
    const filtered = data.recentUsers.filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            {locale === 'ar' ? 'المستخدمون' : 'Users'} ({data.totalUsers})
          </h2>
          <div className="relative w-64">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
              className="ps-9 bg-purple-500/5 border-purple-500/15 text-white placeholder:text-muted-foreground focus-visible:ring-purple-500/30" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Users} title={locale === 'ar' ? 'لا يوجد مستخدمون' : 'No users'} desc={t('noData')} />
        ) : (
          <div className="rounded-2xl border border-purple-500/10 bg-[#0f0f1a]/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0a0a0f]">
                    <th className="text-start px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('name')}</th>
                    <th className="text-start px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('email')}</th>
                    <th className="text-start px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الدور' : 'Role'}</th>
                    <th className="text-start px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'تاريخ الانضمام' : 'Joined'}</th>
                    <th className="text-start px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="text-start px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'إجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} className="border-t border-purple-500/5 hover:bg-purple-500/5 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 ring-1 ring-purple-500/20">
                            <AvatarFallback className={cn(
                              'text-white text-xs font-bold',
                              !u.active
                                ? 'bg-gradient-to-br from-red-600 to-red-800'
                                : 'bg-gradient-to-br from-purple-600 to-purple-800',
                            )}>{u.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-white/90 text-sm font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={cn('px-2.5 py-0.5 rounded-lg text-[10px] font-bold',
                          u.role === 'provider' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-white/5 text-white/60 border border-white/10')}>
                          {u.role === 'provider' ? t('providerRole') : t('userRole')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <span className={cn('px-2.5 py-0.5 rounded-lg text-[10px] font-bold',
                          u.active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20')}>
                          {u.active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'معطل' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          disabled={togglingUser === u.id}
                          onClick={() => toggleUserActive(u.id, u.active, u.name)}
                          className={cn(
                            'px-3 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 w-fit transition-all',
                            u.active
                              ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
                            togglingUser === u.id && 'opacity-60 pointer-events-none',
                          )}
                        >
                          {togglingUser === u.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : u.active
                              ? <><Ban className="w-3 h-3" />{locale === 'ar' ? 'تعطيل' : 'Deactivate'}</>
                              : <><CheckCircle2 className="w-3 h-3" />{locale === 'ar' ? 'تفعيل' : 'Activate'}</>}
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ── PROVIDERS TAB ──────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderProvidersTab = () => {
    if (loading || !data) return <LoadingSkeleton />;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-400" />
          {locale === 'ar' ? 'المزودون' : 'Providers'} ({data.totalProviders})
        </h2>

        {data.recentProviders.length === 0 ? (
          <EmptyState icon={Building2} title={locale === 'ar' ? 'لا يوجد مزودون' : 'No providers'} desc={t('noData')} />
        ) : (
          <div className="rounded-2xl border border-purple-500/10 bg-[#0f0f1a]/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0a0a0f]">
                    <th className="text-start px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الشركة' : 'Company'}</th>
                    <th className="text-start px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'البريد' : 'Email'}</th>
                    <th className="text-start px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'التقييم' : 'Rating'}</th>
                    <th className="text-start px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الخدمات' : 'Services'}</th>
                    <th className="text-start px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'الحساب' : 'Account'}</th>
                    <th className="text-start px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'التوثيق' : 'Verified'}</th>
                    <th className="text-start px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'ar' ? 'إجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentProviders.map(p => (
                    <tr key={p.id} className="border-t border-purple-500/5 hover:bg-purple-500/5 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 ring-1 ring-purple-500/20">
                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-xs font-bold">{p.companyName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white/90 text-sm font-medium">{p.companyName}</p>
                            <p className="text-[10px] text-muted-foreground">{p.user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{p.user.email}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-bold">{p.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">({p.totalReviews})</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-purple-400">{p._count.services}</td>
                      <td className="px-5 py-3">
                        <span className={cn('px-2.5 py-0.5 rounded-lg text-[10px] font-bold',
                          p.user.active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20')}>
                          {p.user.active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'معطل' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {p.verified ? (
                            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {locale === 'ar' ? 'موثق' : 'Verified'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> {locale === 'ar' ? 'بانتظار' : 'Pending'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          disabled={verifying === p.id}
                          onClick={() => toggleVerifyProvider(p.id, !p.verified)}
                          className={cn(
                            'px-2.5 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all',
                            p.verified
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
                            verifying === p.id && 'opacity-60 pointer-events-none',
                          )}
                        >
                          {verifying === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : p.verified ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {p.verified ? (locale === 'ar' ? 'إلغاء' : 'Unverify') : (locale === 'ar' ? 'توثيق' : 'Verify')}
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ── BOOKINGS TAB ───────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderBookingsTab = () => {
    if (loading || !data) return <LoadingSkeleton />;
    const filtered = bookingStatusFilter === 'all'
      ? data.recentBookings
      : data.recentBookings.filter(b => b.status === bookingStatusFilter);

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-purple-400" />
            {locale === 'ar' ? 'جميع الحجوزات' : 'All Bookings'} ({data.totalBookings})
          </h2>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
              <motion.button key={f} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setBookingStatusFilter(f)}
                className={cn('px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border',
                  bookingStatusFilter === f
                    ? 'bg-purple-600 text-white border-purple-500/30 shadow-lg shadow-purple-500/20'
                    : 'bg-[#0f0f1a]/80 text-muted-foreground border-purple-500/10 hover:text-purple-300 hover:border-purple-500/20'
                )}>
                {f === 'all' ? t('all') : statusLabel(f)}
              </motion.button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={CalendarCheck} title={locale === 'ar' ? 'لا توجد حجوزات' : 'No bookings'} desc={t('noData')} />
        ) : (
          <div className="space-y-4">
            {filtered.map((b, idx) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-2xl p-5 border border-purple-500/10 bg-[#0f0f1a]/80 hover:bg-[#0f0f1a] transition-colors">
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
                    <p className="text-xs text-muted-foreground mb-2">{b.user.name} — {b.user.email}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><CalendarCheck className="w-3 h-3 text-purple-400" /> {new Date(b.bookingDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3 text-purple-400" /> {b.numberOfPeople}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-purple-500/10">
                      <p className="text-lg font-black text-gradient-gold">{b.totalPrice.toLocaleString()} <span className="text-xs text-amber-500/60">{t('dzd')}</span></p>
                      <div className="flex gap-2">
                        {b.status === 'pending' && (
                          <>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => updateBookingStatus(b.id, 'confirmed')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {t('bookingConfirmed')}
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => updateBookingStatus(b.id, 'cancelled')}
                              className="px-3 py-1.5 rounded-lg border border-red-500/15 bg-red-500/5 text-xs text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> {t('bookingCancelled')}
                            </motion.button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => updateBookingStatus(b.id, 'completed')}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 text-xs text-white flex items-center gap-1">
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
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ── COMPLAINTS TAB ─────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderComplaintsTab = () => {
    if (complaintsLoading) return <LoadingSkeleton />;

    const filtered = complaintFilter === 'all'
      ? complaints
      : complaints.filter(c => c.status === complaintFilter);

    const complaintStatuses = ['all', 'open', 'in_progress', 'resolved', 'closed'] as const;
    const complaintStatusLabel = (s: string) => {
      const m: Record<string, string> = {
        all: t('all'),
        open: locale === 'ar' ? 'مفتوحة' : 'Open',
        in_progress: locale === 'ar' ? 'قيد المراجعة' : 'In Progress',
        resolved: locale === 'ar' ? 'تم الحل' : 'Resolved',
        closed: locale === 'ar' ? 'مغلقة' : 'Closed',
      };
      return m[s] || s;
    };

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquareWarning className="h-5 w-5 text-purple-400" />
            {locale === 'ar' ? 'الشكاوى' : 'Complaints'} ({complaints.length})
          </h2>
          <div className="flex gap-2 flex-wrap">
            {complaintStatuses.map(f => (
              <motion.button key={f} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setComplaintFilter(f)}
                className={cn('px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border',
                  complaintFilter === f
                    ? 'bg-purple-600 text-white border-purple-500/30 shadow-lg shadow-purple-500/20'
                    : 'bg-[#0f0f1a]/80 text-muted-foreground border-purple-500/10 hover:text-purple-300 hover:border-purple-500/20'
                )}>
                {complaintStatusLabel(f)}
              </motion.button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={MessageSquareWarning} title={locale === 'ar' ? 'لا توجد شكاوى' : 'No complaints'} desc={t('noData')} />
        ) : (
          <div className="space-y-4">
            {filtered.map((c, idx) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-2xl p-5 border border-purple-500/10 bg-[#0f0f1a]/80 hover:bg-[#0f0f1a] transition-colors">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 ring-1 ring-purple-500/20">
                      <AvatarImage src={c.user.avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-xs font-bold">{c.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-white">{c.user.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.user.email} · {new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ComplaintStatusBadge status={c.status} />
                </div>

                {/* Subject & Content */}
                <h3 className="font-bold text-sm text-white mb-1.5">{c.subject}</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-4 line-clamp-3">{c.content}</p>

                {/* Admin Reply */}
                {c.adminReply && (
                  <div className="rounded-xl p-3 mb-4 bg-purple-500/5 border border-purple-500/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Reply className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{locale === 'ar' ? 'رد المسؤول' : 'Admin Reply'}</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">{c.adminReply}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {c.status !== 'resolved' && c.status !== 'closed' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText(''); }}
                        className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400 hover:bg-purple-500/20 transition-all flex items-center gap-1">
                        <Reply className="w-3 h-3" />
                        {locale === 'ar' ? 'رد' : 'Reply'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleResolveComplaint(c.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {locale === 'ar' ? 'حل' : 'Resolve'}
                      </motion.button>
                    </>
                  )}
                </div>

                {/* Inline Reply Form */}
                <AnimatePresence>
                  {replyingTo === c.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="flex gap-2">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder={locale === 'ar' ? 'اكتب ردك هنا...' : 'Write your reply here...'}
                          rows={3}
                          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-purple-500/15 text-white text-sm placeholder:text-white/20 focus-visible:ring-purple-500/30 resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => { setReplyingTo(null); setReplyText(''); }}
                          className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-white transition-all"
                        >
                          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          disabled={sendingReply === c.id || !replyText.trim()}
                          onClick={() => handleReplyComplaint(c.id)}
                          className="px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-500 transition-all flex items-center gap-1.5 disabled:opacity-40"
                        >
                          {sendingReply === c.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Send className="w-3 h-3" />}
                          {locale === 'ar' ? 'إرسال الرد' : 'Send Reply'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ── SETTINGS TAB ──────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const handleResetCache = () => {
    showToast(locale === 'ar' ? 'تم مسح ذاكرة التخزين المؤقت' : 'Cache cleared', 'success');
  };

  const handleExportData = () => {
    showToast(locale === 'ar' ? 'جارٍ تصدير البيانات...' : 'Exporting data...', 'success');
  };

  const renderSettingsTab = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Settings className="h-5 w-5 text-purple-400" />
        {locale === 'ar' ? 'الإعدادات' : 'Settings'}
      </h2>

      {/* Platform Information */}
      <div className="rounded-2xl p-6 border border-purple-500/10 bg-[#0f0f1a]/80 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{locale === 'ar' ? 'معلومات المنصة' : 'Platform Information'}</h3>
            <p className="text-[10px] text-muted-foreground">{locale === 'ar' ? 'التفاصيل الأساسية للمنصة' : 'Basic platform details'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{locale === 'ar' ? 'اسم المنصة' : 'Platform Name'}</p>
            </div>
            <p className="text-sm font-bold text-white">REVIVE - {locale === 'ar' ? 'منصة السياحة العلاجية' : 'Medical Tourism Platform'}</p>
          </div>
          <div className="px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{locale === 'ar' ? 'إصدار المنصة' : 'Platform Version'}</p>
            </div>
            <p className="text-sm font-bold text-white">v1.0.0</p>
          </div>
          <div className="px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{locale === 'ar' ? 'حالة قاعدة البيانات' : 'Database Status'}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm font-bold text-emerald-400">Connected</p>
            </div>
          </div>
          <div className="px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{locale === 'ar' ? 'إجمالي التخزين' : 'Total Storage'}</p>
            </div>
            <p className="text-sm font-bold text-white">{(data?.totalUsers || 0) + (data?.totalProviders || 0) + (data?.totalServices || 0) + (data?.totalBookings || 0) + (data?.totalReviews || 0)} {locale === 'ar' ? 'سجل' : 'records'}</p>
          </div>
        </div>
      </div>

      {/* Admin Permissions */}
      <div className="rounded-2xl p-6 border border-purple-500/10 bg-[#0f0f1a]/80 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{locale === 'ar' ? 'صلاحيات المسؤول' : 'Admin Permissions'}</h3>
            <p className="text-[10px] text-muted-foreground">{locale === 'ar' ? 'الصلاحيات المفعلة' : 'Active permissions'}</p>
          </div>
        </div>
        <div className="space-y-2.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {locale === 'ar' ? 'عرض جميع البيانات' : 'View all data'}</p>
          <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {locale === 'ar' ? 'إدارة الحجوزات' : 'Manage bookings'}</p>
          <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {locale === 'ar' ? 'التحقق من المزودين' : 'Verify providers'}</p>
          <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {locale === 'ar' ? 'إدارة المستخدمين (تفعيل/تعطيل)' : 'Manage users (activate/deactivate)'}</p>
          <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {locale === 'ar' ? 'الرد على الشكاوى' : 'Reply to complaints'}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl p-6 border border-purple-500/10 bg-[#0f0f1a]/80 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700 to-amber-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{locale === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
            <p className="text-[10px] text-muted-foreground">{locale === 'ar' ? 'أدوات إدارة المنصة' : 'Platform management tools'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleResetCache}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10 hover:bg-purple-500/10 transition-all text-start"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{locale === 'ar' ? 'مسح ذاكرة التخزين المؤقت' : 'Reset Cache'}</p>
              <p className="text-[10px] text-muted-foreground">{locale === 'ar' ? 'مسح البيانات المؤقتة' : 'Clear temporary data'}</p>
            </div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleExportData}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10 hover:bg-purple-500/10 transition-all text-start"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Download className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{locale === 'ar' ? 'تصدير البيانات' : 'Export Data'}</p>
              <p className="text-[10px] text-muted-foreground">{locale === 'ar' ? 'تنزيل تقرير شامل' : 'Download full report'}</p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-4 border border-purple-500/10 bg-[#0f0f1a]/80">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{locale === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}</p>
          <p className="text-xl font-bold text-gradient-purple mt-1"><AnimatedCounter target={data?.totalUsers || 0} /></p>
        </div>
        <div className="rounded-2xl p-4 border border-purple-500/10 bg-[#0f0f1a]/80">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{locale === 'ar' ? 'إجمالي المزودين' : 'Total Providers'}</p>
          <p className="text-xl font-bold text-gradient-purple mt-1"><AnimatedCounter target={data?.totalProviders || 0} /></p>
        </div>
        <div className="rounded-2xl p-4 border border-purple-500/10 bg-[#0f0f1a]/80">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{locale === 'ar' ? 'إجمالي الخدمات' : 'Total Services'}</p>
          <p className="text-xl font-bold text-gradient-purple mt-1"><AnimatedCounter target={data?.totalServices || 0} /></p>
        </div>
        <div className="rounded-2xl p-4 border border-purple-500/10 bg-[#0f0f1a]/80">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
          <p className="text-xl font-bold text-gradient-gold mt-1"><AnimatedCounter target={data?.totalRevenue || 0} /></p>
          <p className="text-[10px] text-amber-500/60 -mt-0.5">{t('dzd')}</p>
        </div>
      </div>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // ── MAIN RENDER ───────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#08080d]">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? SIDEBAR_WIDTH : 72 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:block fixed top-0 right-0 bottom-0 z-40 flex flex-col bg-gradient-to-b from-[#0f0f1a] to-[#0a0a0f] border-s border-purple-500/10"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-purple-500/10">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5">
                <img src="/images/logo.png" alt="REVIVE" className="w-9 h-9 rounded-xl" />
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{locale === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}</p>
                  <p className="text-[10px] text-purple-400/60 flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    {locale === 'ar' ? 'مسؤول النظام' : 'System Admin'}
                  </p>
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

        {/* Nav */}
        <ScrollArea className="flex-1 py-3 px-2">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={cn('w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 relative group',
                    sidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center',
                    isActive ? 'bg-purple-600/15 text-purple-300' : 'text-white/50 hover:text-white/80 hover:bg-white/5')}>
                  {isActive && <motion.div layoutId="admin-sidebar-active" className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gradient-to-b from-purple-400 to-purple-600" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                  <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-purple-300')} />
                  {sidebarOpen && <span className="flex-1 text-start">{item.label}</span>}
                  {sidebarOpen && item.badge && item.badge > 0 && <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-md">{item.badge}</span>}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-purple-500/10">
          <button onClick={() => useAppStore.getState().navigateTo('home')}
            className={cn('w-full flex items-center gap-3 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all',
              sidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center')}>
            <Home className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>{locale === 'ar' ? 'العودة للموقع' : 'Back to Home'}</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Area */}
      <motion.main
        initial={false}
        animate={{ marginRight: sidebarOpen ? SIDEBAR_WIDTH : 72 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="min-h-screen flex flex-col"
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b border-purple-500/10 bg-[#08080d]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                  <Menu className="w-4 h-4" />
                </button>
              </SheetTrigger>
              <SheetContent side={isRTL ? 'right' : 'left'} className="w-[280px] p-0 bg-gradient-to-b from-[#0f0f1a] to-[#0a0a0f] border-purple-500/10">
                <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                {renderSidebarContent()}
              </SheetContent>
            </Sheet>
            {/* Back button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => useAppStore.getState().goBack()}
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/5"
              title={locale === 'ar' ? 'العودة' : 'Back'}
            >
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            </motion.button>

            {/* Desktop toggle */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 items-center justify-center text-white/50 hover:text-white transition-all">
              <Menu className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold text-white hidden sm:block">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="REVIVE" className="w-7 h-7 rounded-lg lg:hidden" />
              <Shield className="w-4 h-4 text-amber-400 lg:hidden" />
            </div>
            <Avatar className="h-8 w-8 ring-2 ring-purple-500/30">
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-xs font-bold">A</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderOverviewTab()}</motion.div>}
            {activeTab === 'users' && <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderUsersTab()}</motion.div>}
            {activeTab === 'providers' && <motion.div key="providers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderProvidersTab()}</motion.div>}
            {activeTab === 'bookings' && <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderBookingsTab()}</motion.div>}
            {activeTab === 'complaints' && <motion.div key="complaints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderComplaintsTab()}</motion.div>}
            {activeTab === 'settings' && <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderSettingsTab()}</motion.div>}
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}
