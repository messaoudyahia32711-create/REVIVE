'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  MessageSquare,
  Settings,
  DollarSign,
  Star,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
  MapPin,
  Users,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Award,
  TrendingUp,
  Image as ImageIcon,
  Menu,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

type TabId = 'analytics' | 'services' | 'bookings' | 'messages' | 'settings';

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalServices: number;
  avgRating: number;
  monthlyData: { month: string; bookings: number; revenue: number }[];
  recentBookings: BookingItem[];
  popularServices: PopularService[];
}

interface PopularService {
  id: string;
  titleAr: string;
  titleEn: string;
  image: string | null;
  price: number;
  rating: number;
  totalReviews: number;
  totalBookings: number;
}

interface ServiceItem {
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
  createdAt: string;
  active: boolean;
  category?: { id: string; nameAr: string; nameEn: string; icon: string };
}

interface BookingItem {
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
    id: string;
    titleAr: string;
    titleEn: string;
    price: number;
    duration: string;
    image: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
}

interface MessageItem {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  };
}

interface CategoryItem {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  image: string | null;
  sort: number;
  serviceCount: number;
}

interface ServiceFormData {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  categoryId: string;
  price: string;
  duration: string;
  maxPeople: string;
  location: string;
  image: string;
  featured: boolean;
}

// ── Animated Counter ───────────────────────────────────────────────────────

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  gradient,
  delay,
  isGold,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  suffix?: string;
  gradient: string;
  delay: number;
  isGold?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="perspective-1000"
    >
      <Card
        className={cn(
          'relative overflow-hidden border-0 shadow-lg transition-all duration-300',
          'hover:shadow-2xl hover:-translate-y-1',
          'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl',
          'group'
        )}
      >
        <div
          className={cn(
            'absolute inset-0 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500',
            gradient
          )}
        />
        <CardContent className="relative p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <p className={cn('text-3xl font-bold tracking-tight', isGold && 'text-amber-600')}>
                {typeof value === 'number' ? (
                  <AnimatedCounter target={value} />
                ) : (
                  value
                )}
                {suffix && (
                  <span className={cn('text-lg font-medium ml-1', isGold && 'text-amber-500')}>
                    {suffix}
                  </span>
                )}
              </p>
            </div>
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl',
                gradient
              )}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ProviderDashboard() {
  const { t, locale, isRTL, user, showToast } = useAppStore();

  // ── State ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Analytics
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Services
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    categoryId: '',
    price: '',
    duration: '',
    maxPeople: '1',
    location: '',
    image: '',
    featured: false,
  });
  const [savingService, setSavingService] = useState(false);

  // Bookings
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  // Messages
  const [conversations, setConversations] = useState<BookingItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<BookingItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Data Fetching ────────────────────────────────────────────────────────

  const providerId = user?.providerId;

  const fetchDashboard = useCallback(async () => {
    if (!providerId) return;
    try {
      const res = await fetch(`/api/dashboard?providerId=${providerId}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silent
    }
  }, [providerId]);

  const fetchServices = useCallback(async () => {
    if (!providerId) return;
    try {
      const res = await fetch(`/api/services?providerId=${providerId}`);
      if (res.ok) {
        const data = await res.json();
        setServices(data.services);
      }
    } catch {
      // silent
    }
  }, [providerId]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!providerId) return;
    try {
      const res = await fetch(`/api/bookings?providerId=${providerId}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
        // For messages: extract bookings that have messages (unique conversations)
        // We show all bookings as potential conversations
        setConversations(data.bookings.slice(0, 20));
      }
    } catch {
      // silent
    }
  }, [providerId]);

  const fetchMessages = useCallback(async (bookingId: string) => {
    try {
      const res = await fetch(`/api/messages?bookingId=${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchServices(), fetchCategories(), fetchBookings()]);
      setLoading(false);
    };
    init();
  }, [fetchDashboard, fetchServices, fetchCategories, fetchBookings]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Service CRUD ─────────────────────────────────────────────────────────

  const resetServiceForm = () => {
    setServiceForm({
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      categoryId: '',
      price: '',
      duration: '',
      maxPeople: '1',
      location: '',
      image: '',
      featured: false,
    });
    setEditingService(null);
  };

  const openAddService = () => {
    resetServiceForm();
    setServiceDialogOpen(true);
  };

  const openEditService = (service: ServiceItem) => {
    setEditingService(service);
    setServiceForm({
      titleAr: service.titleAr,
      titleEn: service.titleEn,
      descriptionAr: service.descriptionAr,
      descriptionEn: service.descriptionEn,
      categoryId: service.categoryId,
      price: String(service.price),
      duration: service.duration,
      maxPeople: String(service.maxPeople),
      location: service.location,
      image: service.image || '',
      featured: service.featured,
    });
    setServiceDialogOpen(true);
  };

  const handleSaveService = async () => {
    if (!providerId) return;
    if (!serviceForm.titleAr || !serviceForm.titleEn || !serviceForm.categoryId || !serviceForm.price || !serviceForm.duration || !serviceForm.location) {
      showToast(locale === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields', 'error');
      return;
    }

    setSavingService(true);
    try {
      if (editingService) {
        // Update
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...serviceForm,
            price: parseFloat(serviceForm.price),
            maxPeople: parseInt(serviceForm.maxPeople) || 1,
          }),
        });
        if (res.ok) {
          showToast(locale === 'ar' ? 'تم تحديث الخدمة بنجاح' : 'Service updated successfully', 'success');
          fetchServices();
          setServiceDialogOpen(false);
          resetServiceForm();
        } else {
          showToast(locale === 'ar' ? 'فشل تحديث الخدمة' : 'Failed to update service', 'error');
        }
      } else {
        // Create
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerId,
            ...serviceForm,
            price: parseFloat(serviceForm.price),
            maxPeople: parseInt(serviceForm.maxPeople) || 1,
          }),
        });
        if (res.ok) {
          showToast(locale === 'ar' ? 'تم إضافة الخدمة بنجاح' : 'Service created successfully', 'success');
          fetchServices();
          fetchDashboard();
          setServiceDialogOpen(false);
          resetServiceForm();
        } else {
          showToast(locale === 'ar' ? 'فشل إضافة الخدمة' : 'Failed to create service', 'error');
        }
      }
    } catch {
      showToast(locale === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error', 'error');
    }
    setSavingService(false);
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const res = await fetch(`/api/services/${serviceId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(locale === 'ar' ? 'تم حذف الخدمة' : 'Service deleted', 'success');
        fetchServices();
        fetchDashboard();
      } else {
        showToast(locale === 'ar' ? 'فشل حذف الخدمة' : 'Failed to delete service', 'error');
      }
    } catch {
      showToast(locale === 'ar' ? 'حدث خطأ' : 'An error occurred', 'error');
    }
  };

  const handleToggleFeatured = async (service: ServiceItem) => {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !service.featured }),
      });
      if (res.ok) {
        showToast(
          !service.featured
            ? (locale === 'ar' ? 'تم تمييز الخدمة' : 'Service featured')
            : (locale === 'ar' ? 'تم إلغاء التمييز' : 'Feature removed'),
          'success'
        );
        fetchServices();
      }
    } catch {
      // silent
    }
  };

  // ── Booking Status Updates ───────────────────────────────────────────────

  const updateBookingStatus = async (bookingId: string, status: string) => {
    setUpdatingBooking(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const statusMsg: Record<string, string> = {
          confirmed: locale === 'ar' ? 'تم تأكيد الحجز' : 'Booking confirmed',
          completed: locale === 'ar' ? 'تم إكمال الحجز' : 'Booking completed',
          cancelled: locale === 'ar' ? 'تم إلغاء الحجز' : 'Booking cancelled',
        };
        showToast(statusMsg[status] || 'Updated', 'success');
        fetchBookings();
        fetchDashboard();
      }
    } catch {
      showToast(locale === 'ar' ? 'حدث خطأ' : 'An error occurred', 'error');
    }
    setUpdatingBooking(null);
  };

  // ── Messages ─────────────────────────────────────────────────────────────

  const handleSelectConversation = (booking: BookingItem) => {
    setSelectedConversation(booking);
    fetchMessages(booking.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    setSendingMessage(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedConversation.id,
          senderId: user.id,
          content: newMessage.trim(),
        }),
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation.id);
      }
    } catch {
      showToast(locale === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message', 'error');
    }
    setSendingMessage(false);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getLocaleText = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: t('bookingPending') },
      confirmed: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: t('bookingConfirmed') },
      completed: { className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: t('bookingCompleted') },
      cancelled: { className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: t('bookingCancelled') },
    };
    return variants[status] || variants.pending;
  };

  const filteredBookings = bookingFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === bookingFilter);

  // ── Sidebar Navigation Items ─────────────────────────────────────────────

  const navItems: { id: TabId; icon: React.ElementType; label: string }[] = [
    { id: 'analytics', icon: LayoutDashboard, label: t('analytics') },
    { id: 'services', icon: Package, label: t('manageServices') },
    { id: 'bookings', icon: CalendarCheck, label: t('recentBookings') },
    { id: 'messages', icon: MessageSquare, label: t('sendMessage') },
    { id: 'settings', icon: Settings, label: isRTL ? 'الإعدادات' : 'Settings' },
  ];

  // ── Sidebar Content Render ────────────────────────────────────────────────

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Provider Info */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border-2 border-primary/20">
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'P'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{user?.providerName || user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-border/50">
        <button
          onClick={() => useAppStore.getState().navigateTo('home')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
        >
          {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          <span>{t('back')}</span>
        </button>
      </div>
    </div>
  );

  // ── Loading Skeleton Render ─────────────────────────────────────────────────

  const renderLoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  );

  // ── Analytics Tab ────────────────────────────────────────────────────────

  const renderAnalyticsTab = () => {
    if (loading || !stats) return renderLoadingSkeleton();

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">{t('analytics')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('welcome')}, {user?.name} 👋
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={CalendarCheck}
            label={t('totalBookings')}
            value={stats.totalBookings}
            gradient="bg-gradient-to-br from-teal-500 to-emerald-600"
            delay={0}
          />
          <StatCard
            icon={DollarSign}
            label={t('totalRevenue')}
            value={stats.totalRevenue}
            suffix={t('sar')}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            delay={0.1}
            isGold
          />
          <StatCard
            icon={Package}
            label={t('totalServices')}
            value={stats.totalServices}
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            delay={0.2}
          />
          <StatCard
            icon={Star}
            label={t('avgRating')}
            value={stats.avgRating.toFixed(1)}
            gradient="bg-gradient-to-br from-rose-500 to-pink-600"
            delay={0.3}
          />
        </div>

        {/* Revenue Chart */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              {t('monthlyRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.08)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(10px)',
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} ${t('sar')}`, t('totalRevenue')]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="url(#goldGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Popular Services */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            {t('popularServices')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {stats.popularServices.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer hover:-translate-y-1">
                  <div className="aspect-video relative overflow-hidden">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={getLocaleText(service.titleAr, service.titleEn)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-100 to-emerald-200 dark:from-teal-900/40 dark:to-emerald-900/40 flex items-center justify-center">
                        <Package className="h-8 w-8 text-teal-400" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">
                        #{idx + 1}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="font-semibold text-sm truncate">
                      {getLocaleText(service.titleAr, service.titleEn)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="text-xs font-medium">{service.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CalendarCheck className="h-3.5 w-3.5" />
                        <span className="text-xs">{service.totalBookings}</span>
                      </div>
                      <span className="text-xs font-semibold text-teal-600">
                        {service.price} {t('sar')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  // ── Services Tab ─────────────────────────────────────────────────────────

  const renderServicesTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('manageServices')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {locale === 'ar' ? 'إدارة خدماتك وتحديثها' : 'Manage and update your services'}
          </p>
        </div>
        <Dialog open={serviceDialogOpen} onOpenChange={(open) => {
          setServiceDialogOpen(open);
          if (!open) resetServiceForm();
        }}>
          <DialogTrigger asChild>
            <Button
              onClick={openAddService}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 transition-all duration-300"
            >
              <Plus className="h-4 w-4 me-2" />
              {t('addService')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingService ? t('editService') : t('addService')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('serviceTitle')} ({locale === 'ar' ? 'العربية' : 'Arabic'})</Label>
                  <Input
                    value={serviceForm.titleAr}
                    onChange={(e) => setServiceForm({ ...serviceForm, titleAr: e.target.value })}
                    placeholder={locale === 'ar' ? 'عنوان الخدمة بالعربية' : 'Service title in Arabic'}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('serviceTitle')} (English)</Label>
                  <Input
                    value={serviceForm.titleEn}
                    onChange={(e) => setServiceForm({ ...serviceForm, titleEn: e.target.value })}
                    placeholder="Service title in English"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('serviceDescription')} ({locale === 'ar' ? 'العربية' : 'Arabic'})</Label>
                  <Textarea
                    value={serviceForm.descriptionAr}
                    onChange={(e) => setServiceForm({ ...serviceForm, descriptionAr: e.target.value })}
                    placeholder={locale === 'ar' ? 'وصف الخدمة بالعربية' : 'Description in Arabic'}
                    dir="rtl"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('serviceDescription')} (English)</Label>
                  <Textarea
                    value={serviceForm.descriptionEn}
                    onChange={(e) => setServiceForm({ ...serviceForm, descriptionEn: e.target.value })}
                    placeholder="Description in English"
                    dir="ltr"
                    rows={4}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>{t('serviceCategory')}</Label>
                <Select
                  value={serviceForm.categoryId}
                  onValueChange={(v) => setServiceForm({ ...serviceForm, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={locale === 'ar' ? 'اختر التصنيف' : 'Select category'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {getLocaleText(cat.nameAr, cat.nameEn)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price, Duration, MaxPeople */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('servicePrice')} ({t('sar')})</Label>
                  <Input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('serviceDuration')}</Label>
                  <Input
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    placeholder={locale === 'ar' ? 'مثال: ساعتان' : 'e.g., 2 hours'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('maxPeople')}</Label>
                  <Input
                    type="number"
                    value={serviceForm.maxPeople}
                    onChange={(e) => setServiceForm({ ...serviceForm, maxPeople: e.target.value })}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>{t('serviceLocation')}</Label>
                <Input
                  value={serviceForm.location}
                  onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                  placeholder={locale === 'ar' ? 'موقع الخدمة' : 'Service location'}
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  {t('serviceImage')} URL
                </Label>
                <Input
                  value={serviceForm.image}
                  onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                  placeholder={locale === 'ar' ? 'رابط الصورة' : 'Image URL'}
                />
                {serviceForm.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border/50 max-w-xs">
                    <img
                      src={serviceForm.image}
                      alt="Preview"
                      className="w-full h-24 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-amber-500" />
                  <div>
                    <Label className="font-medium">{t('featured')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {locale === 'ar' ? 'عرض الخدمة في قسم المميزة' : 'Show service in featured section'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={serviceForm.featured}
                  onCheckedChange={(checked) => setServiceForm({ ...serviceForm, featured: checked })}
                />
              </div>

              {/* Actions */}
              <Separator />
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setServiceDialogOpen(false);
                    resetServiceForm();
                  }}
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleSaveService}
                  disabled={savingService}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                >
                  {savingService && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                  {t('save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-lg font-medium">{t('noData')}</p>
            <p className="text-muted-foreground text-sm mt-1">
              {locale === 'ar' ? 'لم تقم بإضافة أي خدمات بعد' : "You haven't added any services yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg">
          {/* Mobile Cards */}
          <div className="block lg:hidden divide-y divide-border/50">
            {services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4"
              >
                <div className="flex gap-3">
                  <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                    {service.image ? (
                      <img src={service.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-100 to-emerald-200 dark:from-teal-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                        <Package className="h-5 w-5 text-teal-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm truncate">
                          {getLocaleText(service.titleAr, service.titleEn)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {service.category ? getLocaleText(service.category.nameAr, service.category.nameEn) : ''}
                        </p>
                      </div>
                      <Badge
                        variant={service.active ? 'default' : 'secondary'}
                        className={service.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                      >
                        {service.active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="text-teal-600 font-semibold">{service.price} {t('sar')}</span>
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-amber-500 fill-current" />
                        {service.rating.toFixed(1)}
                      </span>
                      <span>{service.totalBookings} {t('recentBookings')}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => openEditService(service)}
                      >
                        <Pencil className="h-3 w-3 me-1" />
                        {t('edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="h-3 w-3 me-1" />
                        {t('delete')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          'h-8 text-xs',
                          service.featured
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-muted-foreground'
                        )}
                        onClick={() => handleToggleFeatured(service)}
                      >
                        {service.featured ? <Eye className="h-3 w-3 me-1" /> : <EyeOff className="h-3 w-3 me-1" />}
                        {t('featured')}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16"></TableHead>
                  <TableHead>{t('serviceTitle')}</TableHead>
                  <TableHead>{t('serviceCategory')}</TableHead>
                  <TableHead>{t('servicePrice')}</TableHead>
                  <TableHead>{t('avgRating')}</TableHead>
                  <TableHead>{t('totalBookings')}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-end">{t('edit')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id} className="group">
                    <TableCell>
                      <div className="h-10 w-14 rounded-md overflow-hidden">
                        {service.image ? (
                          <img src={service.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-teal-100 to-emerald-200 dark:from-teal-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                            <Package className="h-4 w-4 text-teal-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{getLocaleText(service.titleAr, service.titleEn)}</p>
                        {service.featured && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 mt-1 text-[10px] px-1.5 py-0">
                            <Star className="h-2.5 w-2.5 me-0.5 fill-current" />
                            {t('featured')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {service.category ? getLocaleText(service.category.nameAr, service.category.nameEn) : '-'}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-teal-600">{service.price} {t('sar')}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                        <span className="text-sm">{service.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{service.totalBookings}</TableCell>
                    <TableCell>
                      <Badge
                        variant={service.active ? 'default' : 'secondary'}
                        className={
                          service.active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : ''
                        }
                      >
                        {service.active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditService(service)}
                          title={t('edit')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteService(service.id)}
                          title={t('delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            'h-8 w-8 p-0',
                            service.featured
                              ? 'text-amber-500 hover:bg-amber-50'
                              : 'text-muted-foreground'
                          )}
                          onClick={() => handleToggleFeatured(service)}
                          title={t('featured')}
                        >
                          {service.featured ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </motion.div>
  );

  // ── Bookings Tab ─────────────────────────────────────────────────────────

  const renderBookingsTab = () => {
    const statusFilters = [
      { value: 'all', label: t('all') },
      { value: 'pending', label: t('bookingPending') },
      { value: 'confirmed', label: t('bookingConfirmed') },
      { value: 'completed', label: t('bookingCompleted') },
      { value: 'cancelled', label: t('bookingCancelled') },
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold">{t('recentBookings')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {locale === 'ar' ? 'إدارة حجوزات العملاء' : 'Manage customer bookings'}
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={bookingFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBookingFilter(filter.value)}
              className={
                bookingFilter === filter.value
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                  : ''
              }
            >
              {filter.label}
              {filter.value !== 'all' && (
                <Badge variant="secondary" className="ms-1.5 bg-white/20 text-inherit">
                  {bookings.filter((b) => b.status === filter.value).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Booking Cards */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CalendarCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg font-medium">{t('noData')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking, idx) => {
              const badge = getStatusBadge(booking.status);
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Service Image */}
                        <div className="h-24 w-full sm:h-auto sm:w-36 rounded-lg overflow-hidden flex-shrink-0">
                          {booking.service.image ? (
                            <img
                              src={booking.service.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-teal-100 to-emerald-200 dark:from-teal-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                              <Package className="h-8 w-8 text-teal-400" />
                            </div>
                          )}
                        </div>

                        {/* Booking Info */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-base">
                                {getLocaleText(booking.service.titleAr, booking.service.titleEn)}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <CalendarCheck className="h-3.5 w-3.5" />
                                  {new Date(booking.bookingDate).toLocaleDateString(
                                    locale === 'ar' ? 'ar-SA' : 'en-US',
                                    { year: 'numeric', month: 'short', day: 'numeric' }
                                  )}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  {booking.numberOfPeople}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {booking.service.duration}
                                </span>
                              </div>
                            </div>
                            <Badge className={cn('flex-shrink-0', badge.className)}>
                              {badge.label}
                            </Badge>
                          </div>

                          <Separator />

                          {/* User Info */}
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={booking.user.avatar || undefined} />
                                <AvatarFallback className="text-xs">
                                  {booking.user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{booking.user.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{booking.user.email}</span>
                                  {booking.user.phone && (
                                    <>
                                      <span>•</span>
                                      <span>{booking.user.phone}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <p className="font-bold text-lg text-teal-600">
                                {booking.totalPrice.toLocaleString()} {t('sar')}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  disabled={updatingBooking === booking.id}
                                >
                                  {updatingBooking === booking.id ? (
                                    <Loader2 className="h-4 w-4 me-1 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4 me-1" />
                                  )}
                                  {t('confirmBooking')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  disabled={updatingBooking === booking.id}
                                >
                                  {updatingBooking === booking.id ? (
                                    <Loader2 className="h-4 w-4 me-1 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 me-1" />
                                  )}
                                  {t('cancelBooking')}
                                </Button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                                  disabled={updatingBooking === booking.id}
                                >
                                  {updatingBooking === booking.id ? (
                                    <Loader2 className="h-4 w-4 me-1 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4 me-1" />
                                  )}
                                  {t('bookingCompleted')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  disabled={updatingBooking === booking.id}
                                >
                                  {updatingBooking === booking.id ? (
                                    <Loader2 className="h-4 w-4 me-1 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 me-1" />
                                  )}
                                  {t('cancelBooking')}
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:bg-blue-50"
                              onClick={() => {
                                setActiveTab('messages');
                                handleSelectConversation(booking);
                              }}
                            >
                              <MessageSquare className="h-4 w-4 me-1" />
                              {t('sendMessage')}
                            </Button>
                          </div>

                          {/* Notes */}
                          {booking.notes && (
                            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                              <p className="font-medium text-xs uppercase tracking-wider mb-1">
                                {t('notes')}
                              </p>
                              {booking.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  };

  // ── Messages Tab ─────────────────────────────────────────────────────────

  const renderMessagesTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 h-[calc(100vh-12rem)]"
    >
      <div>
        <h1 className="text-2xl font-bold">
          <MessageSquare className="h-6 w-6 inline me-2" />
          {t('sendMessage')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {locale === 'ar' ? 'محادثات الحجوزات' : 'Booking conversations'}
        </p>
      </div>

      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-lg overflow-hidden flex flex-col h-full">
        <div className="flex h-full">
          {/* Conversations List */}
          <div
            className={cn(
              'w-full md:w-80 border-e border-border/50 flex flex-col flex-shrink-0',
              selectedConversation ? 'hidden md:flex' : 'flex'
            )}
          >
            <div className="p-3 border-b border-border/50">
              <Input
                placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
                className="h-9 text-sm"
              />
            </div>
            <ScrollArea className="flex-1">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">{t('noData')}</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const badge = getStatusBadge(conv.status);
                  const isSelected = selectedConversation?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 text-start transition-colors hover:bg-accent/50',
                        isSelected && 'bg-accent'
                      )}
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={conv.user.avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {conv.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">{conv.user.name}</p>
                          <Badge className={cn('text-[10px] px-1.5 py-0 flex-shrink-0', badge.className)}>
                            {badge.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {getLocaleText(conv.service.titleAr, conv.service.titleEn)}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                          {new Date(conv.createdAt).toLocaleDateString(
                            locale === 'ar' ? 'ar-SA' : 'en-US',
                            { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </ScrollArea>
          </div>

          {/* Message Thread */}
          <div
            className={cn(
              'flex-1 flex flex-col min-w-0',
              !selectedConversation && 'hidden md:flex'
            )}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border/50 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden h-8 w-8 p-0"
                    onClick={() => setSelectedConversation(null)}
                  >
                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={selectedConversation.user.avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {selectedConversation.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{selectedConversation.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getLocaleText(selectedConversation.service.titleAr, selectedConversation.service.titleEn)}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
                        <p className="text-sm">
                          {locale === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}
                        </p>
                      </div>
                    )}
                    {messages.map((msg) => {
                      const isSentByMe = msg.senderId === user?.id;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn('flex gap-2', isSentByMe ? 'justify-end' : 'justify-start')}
                        >
                          {!isSentByMe && (
                            <Avatar className="h-8 w-8 flex-shrink-0 mt-auto">
                              <AvatarImage src={msg.sender.avatar || undefined} />
                              <AvatarFallback className="text-[10px]">
                                {msg.sender.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={cn('max-w-[75%] space-y-1')}>
                            <div
                              className={cn(
                                'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                                isSentByMe
                                  ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-ee-sm'
                                  : 'bg-muted rounded-es-sm'
                              )}
                            >
                              {msg.content}
                            </div>
                            <p
                              className={cn(
                                'text-[10px] text-muted-foreground',
                                isSentByMe ? 'text-end' : 'text-start'
                              )}
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
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-3 border-t border-border/50">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={locale === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                      className="flex-1"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white flex-shrink-0"
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">
                  {locale === 'ar' ? 'اختر محادثة' : 'Select a conversation'}
                </p>
                <p className="text-sm mt-1">
                  {locale === 'ar' ? 'اختر حجزاً لعرض الرسائل' : 'Choose a booking to view messages'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  // ── Settings Tab ─────────────────────────────────────────────────────────

  const renderSettingsTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">
          <Settings className="h-6 w-6 inline me-2" />
          {isRTL ? 'الإعدادات' : 'Settings'}
        </h1>
      </div>

      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle>{t('profile')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-2xl font-bold">
                {user?.name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-bold">{user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
              <Badge className="mt-2 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                {user?.role === 'provider' ? t('providerRole') : t('userRole')}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('name')}</Label>
              <Input defaultValue={user?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>{t('email')}</Label>
              <Input defaultValue={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>{t('phone')}</Label>
              <Input defaultValue={user?.phone || '-'} disabled />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'اسم الشركة' : 'Company Name'}</Label>
              <Input defaultValue={user?.providerName || '-'} disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={cn('flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900', isRTL && 'rtl')}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-e border-border/50 sticky top-0 h-screen z-30">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side={isRTL ? 'right' : 'left'} className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
                {user?.name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm truncate">
              {user?.providerName || user?.name}
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && renderAnalyticsTab()}
            {activeTab === 'services' && renderServicesTab()}
            {activeTab === 'bookings' && renderBookingsTab()}
            {activeTab === 'messages' && renderMessagesTab()}
            {activeTab === 'settings' && renderSettingsTab()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
