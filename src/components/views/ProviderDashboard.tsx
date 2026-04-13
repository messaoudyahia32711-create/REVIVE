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
  ChevronLeft,
  ChevronRight,
  Send,
  MapPin,
  Users,
  Loader2,
  Award,
  TrendingUp,
  Image as ImageIcon,
  Menu,
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowLeftRight,
  Clock,
  Inbox,
  MessageCircle,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// ── Animation Variants ─────────────────────────────────────────────────────

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// ── Animated Counter ───────────────────────────────────────────────────────

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
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

  return <span>{count.toLocaleString()}</span>;
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  gradient,
  glowColor,
  delay,
  isGold,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  suffix?: string;
  gradient: string;
  glowColor: string;
  delay: number;
  isGold?: boolean;
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative group">
        {/* Glow effect */}
        <div
          className={cn(
            'absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl',
            glowColor
          )}
        />
        <div
          className={cn(
            'relative glass rounded-2xl overflow-hidden p-6 border border-white/20 dark:border-white/10',
            'hover:border-white/40 dark:hover:border-white/15 transition-all duration-500'
          )}
        >
          {/* Subtle gradient overlay */}
          <div
            className={cn(
              'absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500',
              gradient
            )}
          />
          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                {label}
              </p>
              <p
                className={cn(
                  'text-3xl font-extrabold tracking-tight',
                  isGold ? 'text-gradient-gold text-4xl' : ''
                )}
              >
                {typeof value === 'number' ? <AnimatedCounter target={value} /> : value}
                {suffix && (
                  <span
                    className={cn(
                      'text-base font-semibold ms-1',
                      isGold ? 'text-gold-dark' : 'text-muted-foreground'
                    )}
                  >
                    {suffix}
                  </span>
                )}
              </p>
            </div>
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg',
                gradient
              )}
            >
              <Icon className="h-7 w-7 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Sidebar Navigation Items ───────────────────────────────────────────────

const navItemsDef: { id: TabId; icon: React.ElementType; labelKey: string; labelFallback: string }[] = [
  { id: 'analytics', icon: LayoutDashboard, labelKey: 'analytics', labelFallback: 'Analytics' },
  { id: 'services', icon: Package, labelKey: 'manageServices', labelFallback: 'My Services' },
  { id: 'bookings', icon: CalendarCheck, labelKey: 'recentBookings', labelFallback: 'Bookings' },
  { id: 'messages', icon: MessageSquare, labelKey: 'sendMessage', labelFallback: 'Messages' },
  { id: 'settings', icon: Settings, labelKey: '', labelFallback: 'Settings' },
];

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
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);

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
  const [loadingMessages, setLoadingMessages] = useState(false);
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
      /* silent */
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
      /* silent */
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
      /* silent */
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!providerId) return;
    try {
      const res = await fetch(`/api/bookings?providerId=${providerId}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
        setConversations(data.bookings.slice(0, 20));
      }
    } catch {
      /* silent */
    }
  }, [providerId]);

  const fetchMessages = useCallback(async (bookingId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages?bookingId=${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch {
      /* silent */
    }
    setLoadingMessages(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchServices(), fetchCategories(), fetchBookings()]);
      setLoading(false);
    };
    init();
  }, [fetchDashboard, fetchServices, fetchCategories, fetchBookings]);

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
    if (
      !serviceForm.titleAr ||
      !serviceForm.titleEn ||
      !serviceForm.categoryId ||
      !serviceForm.price ||
      !serviceForm.duration ||
      !serviceForm.location
    ) {
      showToast(locale === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields', 'error');
      return;
    }
    setSavingService(true);
    try {
      if (editingService) {
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
        setDeleteServiceId(null);
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
            ? locale === 'ar'
              ? 'تم تمييز الخدمة'
              : 'Service featured'
            : locale === 'ar'
              ? 'تم إلغاء التمييز'
              : 'Feature removed',
          'success'
        );
        fetchServices();
      }
    } catch {
      /* silent */
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
      pending: {
        className:
          'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        label: t('bookingPending'),
      },
      confirmed: {
        className:
          'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
        label: t('bookingConfirmed'),
      },
      completed: {
        className:
          'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        label: t('bookingCompleted'),
      },
      cancelled: {
        className:
          'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        label: t('bookingCancelled'),
      },
    };
    return variants[status] || variants.pending;
  };

  const filteredBookings = bookingFilter === 'all' ? bookings : bookings.filter((b) => b.status === bookingFilter);

  const navItems = navItemsDef.map((item) => ({
    ...item,
    label: item.labelKey ? t(item.labelKey as keyof ReturnType<typeof t>) : item.labelFallback,
  }));

  // ── Sidebar Content ──────────────────────────────────────────────────────

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* H Logo */}
      <div className="p-6 pb-4 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative"
        >
          <div className="text-5xl font-black text-gradient-gold select-none drop-shadow-lg">H</div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </motion.div>
        <p className="text-[10px] font-semibold tracking-[0.3em] text-gold-dark/60 uppercase mt-1">
          {locale === 'ar' ? 'لوحة التحكم' : 'Provider'}
        </p>
      </div>

      <Separator className="bg-white/10 dark:bg-white/5" />

      {/* Provider Info */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-gold/30 shadow-md">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-gold-dark to-gold text-white text-sm font-bold">
                {user?.name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -end-0.5 bg-emerald-500 rounded-full p-0.5 border-2 border-white dark:border-gray-900">
              <ShieldCheck className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate text-white">
              {user?.providerName || user?.name}
            </p>
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
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden',
                isActive
                  ? 'bg-white/15 text-white shadow-lg shadow-black/10 backdrop-blur-md'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              )}
            >
              {/* Active indicator - gradient left border */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className={cn(
                    'absolute top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-gold-light via-gold to-gold-dark',
                    isRTL ? 'right-0' : 'left-0'
                  )}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-gold-light')} />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => useAppStore.getState().navigateTo('home')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all duration-300"
        >
          {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          <span>{t('back')}</span>
        </button>
      </div>
    </div>
  );

  // ── Loading Skeleton ─────────────────────────────────────────────────────

  const renderLoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );

  // ── Empty State ──────────────────────────────────────────────────────────

  const renderEmptyState = ({ icon: EmptyIcon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-5">
        <EmptyIcon className="h-10 w-10 text-muted-foreground/30" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </motion.div>
  );

  // ── Analytics Tab ────────────────────────────────────────────────────────

  const renderAnalyticsTab = () => {
    if (loading || !stats) return renderLoadingSkeleton();

    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
        {/* Header */}
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-3 mb-1">
            <div className="text-4xl font-black text-gradient-gold">
              {user?.name?.split(' ')[0]}
            </div>
            <div className="text-2xl">👋</div>
          </div>
          <p className="text-muted-foreground text-sm">
            {locale === 'ar' ? 'مرحباً بك في لوحة التحكم الخاصة بك' : 'Welcome to your provider dashboard'}
          </p>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={CalendarCheck}
            label={t('totalBookings')}
            value={stats.totalBookings}
            gradient="bg-gradient-to-br from-teal-500 to-emerald-600"
            glowColor="bg-teal-500/20"
            delay={0}
          />
          <StatCard
            icon={DollarSign}
            label={t('totalRevenue')}
            value={stats.totalRevenue}
            suffix={t('sar')}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            glowColor="bg-amber-500/20"
            delay={0.1}
            isGold
          />
          <StatCard
            icon={Package}
            label={t('totalServices')}
            value={stats.totalServices}
            gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            glowColor="bg-emerald-500/20"
            delay={0.2}
          />
          <StatCard
            icon={Star}
            label={t('avgRating')}
            value={stats.avgRating.toFixed(1)}
            gradient="bg-gradient-to-br from-gold-dark to-gold-light"
            glowColor="bg-gold/20"
            delay={0.3}
            isGold
          />
        </div>

        {/* Revenue Chart */}
        <motion.div variants={staggerItem}>
          <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gold-dark" />
                {t('monthlyRevenue')}
              </CardTitle>
            </CardHeader>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F0D78C" stopOpacity={1} />
                      <stop offset="50%" stopColor="#D4A853" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#B8860B" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid rgba(212,168,83,0.2)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      backdropFilter: 'blur(16px)',
                      background: 'rgba(255,255,255,0.85)',
                    }}
                    formatter={(value: number) => [
                      `${value.toLocaleString()} ${t('sar')}`,
                      t('totalRevenue'),
                    ]}
                    cursor={{ fill: 'rgba(212,168,83,0.06)' }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="url(#goldBarGradient)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Popular Services */}
        <motion.div variants={staggerItem}>
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
            <Award className="h-5 w-5 text-gold" />
            {t('popularServices')}
          </h2>
          {stats.popularServices.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scroll-snap-x">
              {stats.popularServices.map((service, idx) => {
                const rankColors = [
                  'from-amber-400 to-yellow-500 text-white',
                  'from-gray-300 to-gray-400 text-white',
                  'from-amber-600 to-amber-700 text-white',
                ];
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    whileHover={{ y: -8, scale: 1.03 }}
                    className="flex-shrink-0 w-64 scroll-snap-start"
                  >
                    <div className="glass rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-white/10">
                      <div className="aspect-video relative overflow-hidden">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={getLocaleText(service.titleAr, service.titleEn)}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gold/10 to-emerald-tourism/10 flex items-center justify-center">
                            <Package className="h-8 w-8 text-gold/40" />
                          </div>
                        )}
                        <div
                          className={cn(
                            'absolute top-3 start-3 w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm font-black shadow-lg',
                            idx < 3 ? rankColors[idx] : 'bg-white/80 dark:bg-black/60 text-foreground'
                          )}
                        >
                          {idx + 1}
                        </div>
                        {idx === 0 && (
                          <div className="absolute top-3 end-3">
                            <Sparkles className="h-5 w-5 text-amber-400 drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-bold text-sm truncate mb-2">
                          {getLocaleText(service.titleAr, service.titleEn)}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-gold-dark">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="text-xs font-bold">{service.rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarCheck className="h-3.5 w-3.5" />
                            <span className="text-xs">{service.totalBookings}</span>
                          </div>
                          <span className="text-xs font-bold text-gradient-gold">
                            {service.price} {t('sar')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            renderEmptyState({
              icon: Award,
              title: locale === 'ar' ? 'لا توجد خدمات شائعة بعد' : 'No popular services yet',
              description:
                locale === 'ar'
                  ? 'ابدأ بإضافة خدماتك واجذب المزيد من الحجوزات'
                  : 'Add your services and attract more bookings',
            })
          )}
        </motion.div>
      </motion.div>
    );
  };

  // ── Service Dialog ───────────────────────────────────────────────────────

  const renderServiceDialog = () => (
    <Dialog
      open={serviceDialogOpen}
      onChange={(open) => {
        setServiceDialogOpen(open);
        if (!open) resetServiceForm();
      }}
    >
      <DialogTrigger asChild>
        <span />
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 glass border-white/20 dark:border-white/10">
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-gold/5 to-emerald-tourism/5">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            {editingService ? t('editService') : t('addService')}
          </DialogTitle>
        </div>
        <div className="p-6 space-y-5">
          {/* Titles - side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">
                {t('serviceTitle')} ({locale === 'ar' ? 'العربية' : 'Arabic'})
              </Label>
              <Input
                value={serviceForm.titleAr}
                onChange={(e) => setServiceForm({ ...serviceForm, titleAr: e.target.value })}
                placeholder={locale === 'ar' ? 'عنوان الخدمة بالعربية' : 'Service title in Arabic'}
                dir="rtl"
                className="glass border-white/20 dark:border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">
                {t('serviceTitle')} (English)
              </Label>
              <Input
                value={serviceForm.titleEn}
                onChange={(e) => setServiceForm({ ...serviceForm, titleEn: e.target.value })}
                placeholder="Service title in English"
                dir="ltr"
                className="glass border-white/20 dark:border-white/10"
              />
            </div>
          </div>

          {/* Descriptions - side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">
                {t('serviceDescription')} ({locale === 'ar' ? 'العربية' : 'Arabic'})
              </Label>
              <Textarea
                value={serviceForm.descriptionAr}
                onChange={(e) => setServiceForm({ ...serviceForm, descriptionAr: e.target.value })}
                placeholder={locale === 'ar' ? 'وصف الخدمة بالعربية' : 'Description in Arabic'}
                dir="rtl"
                rows={4}
                className="glass border-white/20 dark:border-white/10 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">
                {t('serviceDescription')} (English)
              </Label>
              <Textarea
                value={serviceForm.descriptionEn}
                onChange={(e) => setServiceForm({ ...serviceForm, descriptionEn: e.target.value })}
                placeholder="Description in English"
                dir="ltr"
                rows={4}
                className="glass border-white/20 dark:border-white/10 resize-none"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider">{t('serviceCategory')}</Label>
            <Select
              value={serviceForm.categoryId}
              onValueChange={(v) => setServiceForm({ ...serviceForm, categoryId: v })}
            >
              <SelectTrigger className="glass border-white/20 dark:border-white/10">
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
              <Label className="text-xs font-semibold uppercase tracking-wider">
                {t('servicePrice')} ({t('sar')})
              </Label>
              <Input
                type="number"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                placeholder="0"
                min="0"
                className="glass border-white/20 dark:border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">{t('serviceDuration')}</Label>
              <Input
                value={serviceForm.duration}
                onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                placeholder={locale === 'ar' ? 'مثال: ساعتان' : 'e.g., 2 hours'}
                className="glass border-white/20 dark:border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">{t('maxPeople')}</Label>
              <Input
                type="number"
                value={serviceForm.maxPeople}
                onChange={(e) => setServiceForm({ ...serviceForm, maxPeople: e.target.value })}
                placeholder="1"
                min="1"
                className="glass border-white/20 dark:border-white/10"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider">{t('serviceLocation')}</Label>
            <Input
              value={serviceForm.location}
              onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
              placeholder={locale === 'ar' ? 'موقع الخدمة' : 'Service location'}
              className="glass border-white/20 dark:border-white/10"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="h-3.5 w-3.5" />
              {t('serviceImage')} URL
            </Label>
            <Input
              value={serviceForm.image}
              onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
              placeholder={locale === 'ar' ? 'رابط الصورة' : 'Image URL'}
              className="glass border-white/20 dark:border-white/10"
            />
            {serviceForm.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 rounded-xl overflow-hidden border border-white/20 max-w-xs shadow-md"
              >
                <img
                  src={serviceForm.image}
                  alt="Preview"
                  className="w-full h-28 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </motion.div>
            )}
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between rounded-xl glass border border-white/20 p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-gold" />
              </div>
              <div>
                <Label className="font-semibold">{t('featured')}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
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
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setServiceDialogOpen(false);
                resetServiceForm();
              }}
              className="rounded-xl"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSaveService}
              disabled={savingService}
              className="btn-gold-gradient rounded-xl px-6 shadow-lg shadow-gold/20"
            >
              {savingService && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ── Services Tab ─────────────────────────────────────────────────────────

  const renderServicesTab = () => (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('manageServices')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {locale === 'ar' ? 'إدارة خدماتك وتحديثها' : 'Manage and update your services'}
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={openAddService}
            className="btn-gold-gradient rounded-xl px-6 h-12 text-sm font-semibold shadow-lg shadow-gold/25"
          >
            <Sparkles className="h-4 w-4 me-2" />
            {t('addService')}
          </Button>
        </motion.div>
      </motion.div>

      {/* Service Dialog */}
      {renderServiceDialog()}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteServiceId} onOpenChange={() => setDeleteServiceId(null)}>
        <AlertDialogContent className="glass border-white/20 dark:border-white/10 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">
              {locale === 'ar' ? 'حذف الخدمة' : 'Delete Service'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === 'ar'
                ? 'هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this service? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteServiceId && handleDeleteService(deleteServiceId)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        renderEmptyState({
          icon: Package,
          title: locale === 'ar' ? 'لا توجد خدمات بعد' : 'No services yet',
          description:
            locale === 'ar'
              ? 'ابدأ بإضافة خدمتك الأولى وانطلق في رحلتك'
              : 'Start by adding your first service and get started',
        })
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="glass rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-white/10 group h-full flex flex-col">
                {/* Image */}
                <div className="aspect-video relative overflow-hidden">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={getLocaleText(service.titleAr, service.titleEn)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gold/10 to-emerald-tourism/10 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gold/30" />
                    </div>
                  )}
                  {/* Featured badge */}
                  {service.featured && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 end-3"
                    >
                      <Badge className="bg-gradient-to-r from-gold-dark to-gold text-white text-[10px] px-2.5 py-0.5 shadow-md font-bold border-0">
                        <Star className="h-3 w-3 me-1 fill-current" />
                        {t('featured')}
                      </Badge>
                    </motion.div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base truncate flex-1">
                      {getLocaleText(service.titleAr, service.titleEn)}
                    </h3>
                  </div>

                  {service.category && (
                    <Badge variant="outline" className="w-fit text-[10px] mb-3 border-white/20 dark:border-white/10">
                      {getLocaleText(service.category.nameAr, service.category.nameEn)}
                    </Badge>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1 text-gold-dark">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="text-xs font-semibold">{service.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarCheck className="h-3.5 w-3.5" />
                      <span className="text-xs">{service.totalBookings}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-xs">{service.maxPeople}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-gradient-gold">
                        {service.price} {t('sar')}
                      </span>
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditService(service)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                          title={t('editService')}
                        >
                          <Pencil className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleFeatured(service)}
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            service.featured
                              ? 'text-gold hover:bg-gold/10'
                              : 'text-muted-foreground hover:bg-white/10 hover:text-gold'
                          )}
                          title={t('featured')}
                        >
                          <Star className={cn('h-4 w-4', service.featured && 'fill-current')} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDeleteServiceId(service.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                          title={t('delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
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

  // ── Bookings Tab ─────────────────────────────────────────────────────────

  const renderBookingsTab = () => {
    const statusTabs: { value: string; label: string }[] = [
      { value: 'all', label: t('all') },
      { value: 'pending', label: t('bookingPending') },
      { value: 'confirmed', label: t('bookingConfirmed') },
      { value: 'completed', label: t('bookingCompleted') },
      { value: 'cancelled', label: t('bookingCancelled') },
    ];

    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem}>
          <h1 className="text-2xl font-bold">{t('recentBookings')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {locale === 'ar' ? 'إدارة الحجوزات وتحديث حالاتها' : 'Manage and update booking statuses'}
          </p>
        </motion.div>

        {/* Status Filter */}
        <motion.div variants={staggerItem}>
          <Tabs value={bookingFilter} onValueChange={setBookingFilter}>
            <TabsList className="glass rounded-xl border border-white/20 dark:border-white/10 p-1">
              {statusTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-dark data-[state=active]:to-gold data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Booking Cards */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          renderEmptyState({
            icon: CalendarCheck,
            title: locale === 'ar' ? 'لا توجد حجوزات' : 'No bookings found',
            description:
              locale === 'ar'
                ? 'لا توجد حجوزات تطابق الفلتر المحدد'
                : 'No bookings match the selected filter',
          })
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const statusInfo = getStatusBadge(booking.status);
                return (
                  <motion.div
                    key={booking.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="glass rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-white/10">
                      <div className="flex flex-col sm:flex-row">
                        {/* Service Image */}
                        <div className="relative w-full sm:w-44 h-40 sm:h-auto flex-shrink-0">
                          {booking.service?.image ? (
                            <img
                              src={booking.service.image}
                              alt={getLocaleText(booking.service.titleAr, booking.service.titleEn)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gold/10 to-emerald-tourism/10 flex items-center justify-center">
                              <Package className="h-8 w-8 text-gold/30" />
                            </div>
                          )}
                          {/* Status badge */}
                          <div className="absolute top-3 start-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[11px] font-semibold backdrop-blur-md rounded-lg px-2.5',
                                statusInfo.className
                              )}
                            >
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                          {/* User info */}
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 border border-white/20 shadow-sm flex-shrink-0">
                              <AvatarImage src={booking.user?.avatar || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-emerald-tourism to-emerald-dark text-white text-xs font-bold">
                                {booking.user?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate">{booking.user?.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{booking.user?.email}</p>
                            </div>
                          </div>

                          {/* Service & details */}
                          <div>
                            <p className="font-semibold text-sm mb-1.5">
                              {getLocaleText(booking.service?.titleAr || '', booking.service?.titleEn || '')}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <CalendarCheck className="h-3.5 w-3.5 text-emerald-tourism" />
                                {new Date(booking.bookingDate).toLocaleDateString(
                                  locale === 'ar' ? 'ar-SA' : 'en-US',
                                  { year: 'numeric', month: 'short', day: 'numeric' }
                                )}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-emerald-tourism" />
                                {booking.numberOfPeople} {t('numberOfPeople').toLowerCase()}
                              </span>
                              <span className="flex items-center gap-1.5 font-bold text-foreground">
                                <DollarSign className="h-3.5 w-3.5 text-gold" />
                                <span className="text-gradient-gold">
                                  {booking.totalPrice.toLocaleString()} {t('sar')}
                                </span>
                              </span>
                            </div>
                            {booking.notes && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                                &ldquo;{booking.notes}&rdquo;
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                            {booking.status === 'pending' && (
                              <Button
                                size="sm"
                                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm"
                                disabled={updatingBooking === booking.id}
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              >
                                {updatingBooking === booking.id ? (
                                  <Loader2 className="h-3.5 w-3.5 me-1 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5 me-1" />
                                )}
                                {t('bookingConfirmed')}
                              </Button>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button
                                size="sm"
                                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-sm"
                                disabled={updatingBooking === booking.id}
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                              >
                                {updatingBooking === booking.id ? (
                                  <Loader2 className="h-3.5 w-3.5 me-1 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5 me-1" />
                                )}
                                {t('bookingCompleted')}
                              </Button>
                            )}
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20 text-xs"
                                disabled={updatingBooking === booking.id}
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              >
                                {updatingBooking === booking.id ? (
                                  <Loader2 className="h-3.5 w-3.5 me-1 animate-spin" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 me-1" />
                                )}
                                {t('bookingCancelled')}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-lg text-xs"
                              onClick={() => {
                                setActiveTab('messages');
                                handleSelectConversation(booking);
                              }}
                            >
                              <MessageSquare className="h-3.5 w-3.5 me-1" />
                              {t('contactProvider')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    );
  };

  // ── Messages Tab ─────────────────────────────────────────────────────────

  const renderMessagesTab = () => (
    <motion.div variants={fadeSlideUp} initial="hidden" animate="visible" exit="exit" className="h-[calc(100vh-8rem)]">
      <div className="glass rounded-2xl overflow-hidden shadow-xl border border-white/20 dark:border-white/10 h-full flex">
        {/* Conversation List */}
        <div
          className={cn(
            'w-full sm:w-80 lg:w-96 border-e border-white/10 flex flex-col flex-shrink-0',
            selectedConversation ? 'hidden sm:flex' : 'flex'
          )}
        >
          <div className="p-5 border-b border-white/10">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-gold" />
              {t('sendMessage')}
            </h2>
          </div>
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <Inbox className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'لا توجد محادثات بعد' : 'No conversations yet'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    whileHover={{ x: isRTL ? 4 : -4 }}
                    onClick={() => handleSelectConversation(conv)}
                    className={cn(
                      'w-full text-start rounded-xl p-4 transition-all duration-200 group',
                      selectedConversation?.id === conv.id
                        ? 'bg-white/15 dark:bg-white/8'
                        : 'hover:bg-white/8'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border border-white/20 flex-shrink-0">
                        <AvatarImage src={conv.user?.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-tourism to-emerald-dark text-white text-xs font-bold">
                          {conv.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm truncate">{conv.user?.name}</p>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {new Date(conv.createdAt).toLocaleDateString(
                              locale === 'ar' ? 'ar-SA' : 'en-US',
                              { month: 'short', day: 'numeric' }
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {getLocaleText(conv.service?.titleAr || '', conv.service?.titleEn || '')}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] mt-1.5 rounded-md font-semibold',
                            getStatusBadge(conv.status).className
                          )}
                        >
                          {getStatusBadge(conv.status).label}
                        </Badge>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Thread View */}
        <div
          className={cn(
            'flex-1 flex flex-col min-w-0',
            !selectedConversation ? 'hidden sm:flex' : 'flex'
          )}
        >
          {selectedConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <button
                  className="sm:hidden p-1.5 rounded-lg hover:bg-white/10"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <Avatar className="h-9 w-9 border border-white/20">
                  <AvatarImage src={selectedConversation.user?.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-tourism to-emerald-dark text-white text-xs font-bold">
                    {selectedConversation.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate">{selectedConversation.user?.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {getLocaleText(selectedConversation.service?.titleAr || '', selectedConversation.service?.titleEn || '')}
                  </p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-gold" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium">
                      {locale === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}
                    </p>
                    <p className="text-xs mt-1">
                      {locale === 'ar' ? 'ابدأ المحادثة الآن' : 'Start the conversation'}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = user?.id === msg.senderId;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-md',
                            isMe
                              ? 'bg-gradient-to-br from-emerald-tourism to-emerald-dark text-white rounded-ee-md'
                              : 'bg-white/10 dark:bg-white/5 backdrop-blur-sm text-foreground rounded-es-md border border-white/10'
                          )}
                        >
                          <p className="font-medium text-[10px] mb-0.5 opacity-70">
                            {isMe
                              ? locale === 'ar'
                                ? 'أنت'
                                : 'You'
                              : msg.sender?.name || selectedConversation.user?.name}
                          </p>
                          <p>{msg.content}</p>
                          <p
                            className={cn(
                              'text-[10px] mt-1',
                              isMe ? 'text-emerald-100/70' : 'text-muted-foreground'
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
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={locale === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                    className="min-h-[44px] max-h-[100px] resize-none text-sm glass border-white/20 dark:border-white/10 rounded-xl"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="h-11 w-11 flex-shrink-0 rounded-xl bg-gradient-to-br from-emerald-tourism to-emerald-dark hover:from-emerald-dark hover:to-emerald-tourism text-white shadow-lg shadow-emerald-tourism/20"
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">
                  {locale === 'ar' ? 'اختر محادثة للعرض' : 'Select a conversation'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // ── Settings Tab ─────────────────────────────────────────────────────────

  const renderSettingsTab = () => (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold">{isRTL ? 'الإعدادات' : 'Settings'}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {locale === 'ar' ? 'إعدادات الحساب والتفضيلات' : 'Account settings and preferences'}
        </p>
      </motion.div>

      <motion.div variants={staggerItem} className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-gold/30 shadow-lg">
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-gold-dark to-gold text-white text-xl font-bold">
              {user?.name?.charAt(0) || 'P'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-lg">{user?.providerName || user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge className="mt-1 bg-emerald-tourism/10 text-emerald-tourism border-emerald-tourism/20 text-xs">
              <ShieldCheck className="h-3 w-3 me-1" />
              {locale === 'ar' ? 'موثق' : 'Verified Provider'}
            </Badge>
          </div>
        </div>

        <Separator className="bg-white/10 mb-6" />

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">{locale === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === 'ar' ? 'تلقي إشعارات عند حجز جديد' : 'Receive notifications for new bookings'}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">{locale === 'ar' ? 'الإشعارات الفورية' : 'Push Notifications'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === 'ar' ? 'تلقي إشعارات فورية على جهازك' : 'Get instant notifications on your device'}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">{locale === 'ar' ? 'تحديثات الرسائل' : 'Message Updates'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === 'ar' ? 'إشعار عند وصول رسالة جديدة' : 'Get notified on new messages'}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10">
        <h3 className="font-bold text-base mb-4">{locale === 'ar' ? 'معلومات الحساب' : 'Account Info'}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">
                {locale === 'ar' ? 'اسم الشركة' : 'Company Name'}
              </Label>
              <Input
                defaultValue={user?.providerName || user?.name || ''}
                className="glass border-white/20 dark:border-white/10 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">
                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </Label>
              <Input
                defaultValue={user?.email || ''}
                className="glass border-white/20 dark:border-white/10 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider">
              {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </Label>
            <Input
              defaultValue={user?.phone || ''}
              className="glass border-white/20 dark:border-white/10 rounded-xl"
            />
          </div>
          <Button className="btn-gold-gradient rounded-xl px-6 shadow-lg shadow-gold/20 mt-2">
            {locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );

  // ── Main Layout ──────────────────────────────────────────────────────────

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'analytics':
        return renderAnalyticsTab();
      case 'services':
        return renderServicesTab();
      case 'bookings':
        return renderBookingsTab();
      case 'messages':
        return renderMessagesTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderAnalyticsTab();
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] flex-shrink-0 flex-col fixed inset-y-0 start-0 z-30">
        <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 dark:from-black dark:via-gray-950 dark:to-black rounded-none">
          {renderSidebarContent()}
        </div>
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 start-4 z-50 glass rounded-xl shadow-lg border border-white/20 dark:border-white/10 h-10 w-10"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side={isRTL ? 'right' : 'left'} className="w-[280px] p-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 dark:from-black dark:via-gray-950 dark:to-black border-e-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{t('analytics')}</SheetTitle>
          </SheetHeader>
          <div className="h-full">{renderSidebarContent()}</div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 lg:ms-[280px]">
        {/* Mobile Header */}
        <div className="sticky top-0 z-20 glass--scrolled px-4 py-3 lg:hidden flex items-center gap-3">
          <div className="w-10" />
          <h1 className="font-bold text-gradient-gold text-lg flex items-center gap-2">
            <span className="text-xl font-black">H</span>
            <span className="text-xs font-normal text-foreground/50">
              {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </span>
          </h1>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 bg-mesh-gradient min-h-screen">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <div key={activeTab}>{renderActiveTab()}</div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
