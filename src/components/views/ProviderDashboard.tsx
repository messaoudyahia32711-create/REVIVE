'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, CalendarCheck, MessageSquare, Settings,
  DollarSign, Star, Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  Send, MapPin, Users, Loader2, Award, TrendingUp, Sparkles,
  CheckCircle2, XCircle, ShieldCheck, Clock, X, Globe, Building2, Eye, ChevronDown,
  Menu, Upload, ImageIcon, ArrowRight, ArrowLeft, Home, Bell, Search, FileText,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { WILAYAS, searchWilayas, getWilayaName } from '@/lib/wilayas';

// ── Types ──────────────────────────────────────────────────────────────────

type TabId = 'analytics' | 'services' | 'addService' | 'bookings' | 'messages' | 'settings';

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

// ── Constants ──────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 280;
const PIE_COLORS = ['#8B5CF6', '#D4A853', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

// ── Main Component ─────────────────────────────────────────────────────────

export default function ProviderDashboard() {
  const { t, locale, isRTL, user, showToast } = useAppStore();

  // ── Sidebar State ────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarHover, setSidebarHover] = useState(false);

  // ── Page State ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('analytics');
  const [loading, setLoading] = useState(true);

  // ── Data State ───────────────────────────────────────────────────────────
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  // ── Service Form State ───────────────────────────────────────────────────
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
    categoryId: '', price: '', duration: '', maxPeople: '1',
    wilaya: '', location: '', image: '', featured: false,
  });
  const [savingService, setSavingService] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [wilayaSearch, setWilayaSearch] = useState('');
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const wilayaDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Messages State ───────────────────────────────────────────────────────
  const [selectedConversation, setSelectedConversation] = useState<BookingItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const providerId = user?.providerId;

  // ── Navigation Items ─────────────────────────────────────────────────────

  const navItems: { id: TabId; icon: React.ElementType; label: string; badge?: number }[] = [
    { id: 'analytics', icon: LayoutDashboard, label: locale === 'ar' ? 'الإحصائيات' : 'Analytics' },
    { id: 'services', icon: Package, label: locale === 'ar' ? 'الخدمات' : 'Services', badge: services.length },
    { id: 'addService', icon: Plus, label: locale === 'ar' ? 'إضافة خدمة' : 'Add Service' },
    { id: 'bookings', icon: CalendarCheck, label: locale === 'ar' ? 'الحجوزات' : 'Bookings', badge: bookings.filter(b => b.status === 'pending').length },
    { id: 'messages', icon: MessageSquare, label: locale === 'ar' ? 'الرسائل' : 'Messages' },
    { id: 'settings', icon: Settings, label: locale === 'ar' ? 'الإعدادات' : 'Settings' },
  ];

  // ── Wilaya outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wilayaDropdownRef.current && !wilayaDropdownRef.current.contains(e.target as Node)) {
        setShowWilayaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Data Fetching ────────────────────────────────────────────────────────

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

  // ── Message Auto-Polling (every 3s) ─────────────────────────────────────
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (selectedConversation) {
      pollingRef.current = setInterval(() => {
        fetchMessages(selectedConversation.id);
      }, 3000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [selectedConversation, fetchMessages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const gt = (ar: string, en: string) => locale === 'ar' ? ar : en;

  const statusLabel = (s: string) => {
    const m: Record<string, string> = {
      pending: locale === 'ar' ? 'معلّق' : 'Pending',
      confirmed: locale === 'ar' ? 'مؤكد' : 'Confirmed',
      completed: locale === 'ar' ? 'مكتمل' : 'Completed',
      cancelled: locale === 'ar' ? 'ملغي' : 'Cancelled',
    };
    return m[s] || s;
  };

  const filterLabel = (f: string) => {
    const m: Record<string, string> = {
      all: locale === 'ar' ? 'الكل' : 'All', pending: statusLabel('pending'),
      confirmed: statusLabel('confirmed'), completed: statusLabel('completed'), cancelled: statusLabel('cancelled'),
    };
    return m[f] || f;
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      completed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return m[s] || m.pending;
  };

  const filteredBookings = bookingFilter === 'all' ? bookings : bookings.filter(b => b.status === bookingFilter);
  const conversations = bookings.slice(0, 20);

  // ── Image Upload ─────────────────────────────────────────────────────────

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setServiceForm(prev => ({ ...prev, image: data.url }));
        setImagePreview(data.url);
        showToast(locale === 'ar' ? 'تم رفع الصورة' : 'Image uploaded', 'success');
      } else {
        showToast(locale === 'ar' ? 'فشل رفع الصورة' : 'Upload failed', 'error');
      }
    } catch {
      showToast(locale === 'ar' ? 'خطأ في رفع الصورة' : 'Upload error', 'error');
    }
    setUploadingImage(false);
  };

  // ── Service CRUD ─────────────────────────────────────────────────────────

  const resetForm = () => {
    setServiceForm({ titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
      categoryId: '', price: '', duration: '', maxPeople: '1', wilaya: '', location: '', image: '', featured: false });
    setEditingService(null);
    setWilayaSearch(''); setShowWilayaDropdown(false); setImagePreview(null);
  };

  const openAddServicePage = () => {
    resetForm();
    if (provider?.wilaya) setServiceForm(prev => ({ ...prev, wilaya: provider.wilaya! }));
    setActiveTab('addService');
  };

  const openEditService = (s: ServiceItem) => {
    setEditingService(s);
    setServiceForm({
      titleAr: s.titleAr, titleEn: s.titleEn, descriptionAr: s.descriptionAr, descriptionEn: s.descriptionEn,
      categoryId: s.categoryId, price: String(s.price), duration: s.duration,
      maxPeople: String(s.maxPeople), wilaya: s.wilaya || '', location: s.location,
      image: s.image || '', featured: s.featured,
    });
    setImagePreview(s.image || null);
    setWilayaSearch(''); setShowWilayaDropdown(false);
    setServiceDialogOpen(true);
  };

  const handleSaveService = async (fromPage = false) => {
    if (!providerId || !serviceForm.titleAr || !serviceForm.titleEn || !serviceForm.categoryId || !serviceForm.price || !serviceForm.duration || !serviceForm.wilaya) {
      showToast(locale === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields', 'error');
      return;
    }
    setSavingService(true);
    try {
      const body = {
        ...serviceForm, price: parseFloat(serviceForm.price),
        maxPeople: parseInt(serviceForm.maxPeople) || 1,
        location: serviceForm.location || getWilayaName(serviceForm.wilaya, locale),
      };
      if (editingService) {
        const res = await fetch(`/api/services/${editingService.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) { showToast(locale === 'ar' ? 'تم تحديث الخدمة' : 'Service updated', 'success'); fetchServices(); setServiceDialogOpen(false); resetForm(); }
        else showToast(locale === 'ar' ? 'فشل التحديث' : 'Update failed', 'error');
      } else {
        const res = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ providerId, ...body }) });
        if (res.ok) {
          showToast(locale === 'ar' ? 'تم نشر الخدمة بنجاح! 🎉' : 'Service published successfully! 🎉', 'success');
          fetchServices(); fetchDashboard();
          if (fromPage) { setActiveTab('services'); resetForm(); }
          else { setServiceDialogOpen(false); resetForm(); }
        } else showToast(locale === 'ar' ? 'فشل النشر' : 'Publish failed', 'error');
      }
    } catch { showToast(locale === 'ar' ? 'خطأ' : 'Error', 'error'); }
    setSavingService(false);
  };

  const handleDeleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast(locale === 'ar' ? 'تم حذف الخدمة' : 'Service deleted', 'success'); fetchServices(); fetchDashboard(); setDeleteServiceId(null); }
    } catch { showToast(locale === 'ar' ? 'خطأ' : 'Error', 'error'); }
  };

  const handleToggleFeatured = async (s: ServiceItem) => {
    try {
      const res = await fetch(`/api/services/${s.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured: !s.featured }) });
      if (res.ok) { showToast(!s.featured ? (locale === 'ar' ? 'تم تمييز الخدمة ⭐' : 'Service featured ⭐') : (locale === 'ar' ? 'تم إلغاء التمييز' : 'Unfeatured'), 'success'); fetchServices(); }
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

  // ═══════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════

  const renderWilayaField = (value: string, onChange: (v: string) => void) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-purple-400" />
        {locale === 'ar' ? 'الولاية' : 'Wilaya'} <span className="text-red-400">*</span>
      </Label>
      <div className="relative" ref={wilayaDropdownRef}>
        <button type="button" onClick={() => { setShowWilayaDropdown(!showWilayaDropdown); setWilayaSearch(''); }}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm border transition-all',
            'bg-white/5 border-purple-500/15 text-white hover:border-purple-500/30',
            !value && 'text-muted-foreground',
          )}>
          <span>{value ? `${getWilayaName(value, locale)} (${value})` : (locale === 'ar' ? 'اختر ولاية...' : 'Select wilaya...')}</span>
          <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', showWilayaDropdown && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {showWilayaDropdown && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute z-50 mt-1.5 w-full rounded-xl bg-[#0f0f1a] border border-purple-500/15 shadow-2xl shadow-black/40 overflow-hidden">
              <div className="p-2 border-b border-purple-500/10">
                <input autoFocus type="text" placeholder={locale === 'ar' ? 'ابحث...' : 'Search...'}
                  value={wilayaSearch} onChange={(e) => setWilayaSearch(e.target.value)}
                  className="w-full bg-white/5 border border-purple-500/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/30" />
              </div>
              <ScrollArea className="max-h-56">
                <div className="p-1">
                  {searchWilayas(wilayaSearch).map((w) => (
                    <button key={w.code} type="button"
                      onClick={() => { onChange(w.code); setShowWilayaDropdown(false); setWilayaSearch(''); }}
                      className={cn('w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                        value === w.code ? 'bg-purple-500/20 text-purple-300' : 'text-white/70 hover:bg-white/5 hover:text-white')}>
                      <span>{locale === 'ar' ? w.nameAr : w.nameEn}</span>
                      <span className="text-xs text-muted-foreground ms-2">{w.code}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // ── ADD SERVICE PAGE ────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderAddServicePage = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{locale === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service'}</h1>
            <p className="text-sm text-white/40">{locale === 'ar' ? 'أنشئ خدمة وارفع صورها ثم انشرها على المنصة' : 'Create a service, upload images, and publish it on the platform'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Card: Service Info */}
          <div className="rounded-2xl border border-purple-500/10 bg-[#0f0f1a]/80 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-purple-500/10 bg-purple-500/5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">{locale === 'ar' ? 'معلومات الخدمة' : 'Service Information'}</h3>
            </div>
            <div className="p-5 space-y-4">
              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-purple-300">
                    {locale === 'ar' ? 'اسم الخدمة (عربي)' : 'Service Name (Arabic)'} <span className="text-red-400">*</span>
                  </Label>
                  <Input value={serviceForm.titleAr} onChange={(e) => setServiceForm({ ...serviceForm, titleAr: e.target.value })}
                    placeholder={locale === 'ar' ? 'مثال: فحص طبي شامل' : 'e.g. Full Medical Checkup'} dir="rtl"
                    className="bg-white/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-purple-300">
                    {locale === 'ar' ? 'اسم الخدمة (إنجليزي)' : 'Service Name (English)'} <span className="text-red-400">*</span>
                  </Label>
                  <Input value={serviceForm.titleEn} onChange={(e) => setServiceForm({ ...serviceForm, titleEn: e.target.value })}
                    placeholder="e.g. Full Medical Checkup" dir="ltr"
                    className="bg-white/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                  <Textarea value={serviceForm.descriptionAr} onChange={(e) => setServiceForm({ ...serviceForm, descriptionAr: e.target.value })}
                    placeholder={locale === 'ar' ? 'وصف تفصيلي للخدمة...' : 'Detailed service description...'} dir="rtl" rows={4}
                    className="bg-white/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30 resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                  <Textarea value={serviceForm.descriptionEn} onChange={(e) => setServiceForm({ ...serviceForm, descriptionEn: e.target.value })}
                    placeholder="Detailed service description..." dir="ltr" rows={4}
                    className="bg-white/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30 resize-none" />
                </div>
              </div>

              {/* Category, Price, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'التصنيف' : 'Category'} <span className="text-red-400">*</span></Label>
                  <Select value={serviceForm.categoryId} onValueChange={(v) => setServiceForm({ ...serviceForm, categoryId: v })}>
                    <SelectTrigger className="bg-white/5 border-purple-500/15 text-white"><SelectValue placeholder={locale === 'ar' ? 'اختر...' : 'Select...'} /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id} className="text-white">{gt(c.nameAr, c.nameEn)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'السعر (د.ج)' : 'Price (DZD)'} <span className="text-red-400">*</span></Label>
                  <Input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    placeholder="0" className="bg-white/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'المدة' : 'Duration'} <span className="text-red-400">*</span></Label>
                  <Input value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    placeholder={locale === 'ar' ? 'ساعتان' : '2 hours'} className="bg-white/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Location */}
          <div className="rounded-2xl border border-purple-500/10 bg-[#0f0f1a]/80 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-purple-500/10 bg-purple-500/5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">{locale === 'ar' ? 'الموقع' : 'Location'}</h3>
            </div>
            <div className="p-5 space-y-4">
              {renderWilayaField(serviceForm.wilaya, (v) => setServiceForm({ ...serviceForm, wilaya: v }))}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'العنوان التفصيلي' : 'Detailed Address'}</Label>
                  <Input value={serviceForm.location} onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                    placeholder={locale === 'ar' ? 'مثال: شارع ديدوش مراد، حي وسط المدينة' : 'e.g. 123 Main Street'}
                    className="bg-white/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'الحد الأقصى للأشخاص' : 'Max People'}</Label>
                  <Input type="number" value={serviceForm.maxPeople} onChange={(e) => setServiceForm({ ...serviceForm, maxPeople: e.target.value })}
                    placeholder="1" className="bg-white/5 border-purple-500/15 text-white focus-visible:ring-purple-500/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Image + Publish */}
        <div className="space-y-5">
          {/* Card: Image Upload */}
          <div className="rounded-2xl border border-purple-500/10 bg-[#0f0f1a]/80 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-purple-500/10 bg-purple-500/5 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">{locale === 'ar' ? 'صورة الخدمة' : 'Service Image'}</h3>
            </div>
            <div className="p-5">
              {/* Image Preview */}
              <div className="aspect-video rounded-xl border-2 border-dashed border-purple-500/20 overflow-hidden bg-white/[0.02] mb-4 relative group">
                {imagePreview || serviceForm.image ? (
                  <img src={imagePreview || serviceForm.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-xs">{locale === 'ar' ? 'لا توجد صورة' : 'No image'}</p>
                  </div>
                )}
                <button
                  type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <Upload className="w-4 h-4" />
                    {locale === 'ar' ? 'تغيير الصورة' : 'Change Image'}
                  </div>
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

              {/* Upload Button */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-purple-500/15 bg-purple-500/5 text-sm text-purple-300 hover:bg-purple-500/10 transition-all disabled:opacity-50">
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingImage ? (locale === 'ar' ? 'جارٍ الرفع...' : 'Uploading...') : (locale === 'ar' ? 'رفع صورة' : 'Upload Image')}
              </motion.button>

              {/* Or URL */}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex-1 border-t border-purple-500/10" />
                <span>{locale === 'ar' ? 'أو رابط' : 'or URL'}</span>
                <span className="flex-1 border-t border-purple-500/10" />
              </div>
              <Input value={serviceForm.image} onChange={(e) => { setServiceForm({ ...serviceForm, image: e.target.value }); setImagePreview(e.target.value); }}
                placeholder="https://..." className="bg-white/5 border-purple-500/15 text-white text-sm focus-visible:ring-purple-500/30 mt-2" />
            </div>
          </div>

          {/* Card: Options + Publish */}
          <div className="rounded-2xl border border-purple-500/10 bg-[#0f0f1a]/80 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-purple-500/10 bg-purple-500/5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">{locale === 'ar' ? 'خيارات النشر' : 'Publish Options'}</h3>
            </div>
            <div className="p-5 space-y-4">
              {/* Featured Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-purple-500/10">
                <div>
                  <p className="text-sm font-medium text-white flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    {locale === 'ar' ? 'خدمة مميزة' : 'Featured'}
                  </p>
                  <p className="text-[11px] text-white/30 mt-0.5">{locale === 'ar' ? 'تظهر في المقدمة' : 'Shows prominently'}</p>
                </div>
                <button type="button" onClick={() => setServiceForm({ ...serviceForm, featured: !serviceForm.featured })}
                  className={cn('relative w-10 h-5 rounded-full transition-colors', serviceForm.featured ? 'bg-purple-600' : 'bg-white/10')}>
                  <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform', serviceForm.featured ? 'translate-x-5' : 'translate-x-0.5')} />
                </button>
              </div>

              {/* Publish Button */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleSaveService(true)} disabled={savingService}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                {savingService ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {savingService ? (locale === 'ar' ? 'جارٍ النشر...' : 'Publishing...') : (locale === 'ar' ? 'نشر الخدمة' : 'Publish Service')}
              </motion.button>

              {/* Cancel */}
              <button onClick={() => { setActiveTab('services'); resetForm(); }}
                className="w-full py-2.5 rounded-xl text-sm text-white/40 hover:text-white/60 transition-colors">
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // ── ANALYTICS TAB ──────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderAnalyticsTab = () => {
    if (loading || !stats) {
      return (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl bg-purple-500/5" />)}
          </div>
          <Skeleton className="h-72 rounded-xl bg-purple-500/5" />
        </div>
      );
    }

    const bookingStatusData = [
      { name: statusLabel('pending'), value: bookings.filter(b => b.status === 'pending').length },
      { name: statusLabel('confirmed'), value: bookings.filter(b => b.status === 'confirmed').length },
      { name: statusLabel('completed'), value: bookings.filter(b => b.status === 'completed').length },
      { name: statusLabel('cancelled'), value: bookings.filter(b => b.status === 'cancelled').length },
    ].filter(d => d.value > 0);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {locale === 'ar' ? 'مرحباً' : 'Welcome'}, <span className="text-gradient-purple">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-sm text-white/40 mt-1">{locale === 'ar' ? 'إليك نظرة عامة على نشاطك' : "Here's an overview of your activity"}</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openAddServicePage}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold shadow-lg shadow-purple-500/20">
            <Plus className="w-4 h-4" /> {locale === 'ar' ? 'خدمة جديدة' : 'New Service'}
          </motion.button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: locale === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings', value: stats.totalBookings, icon: CalendarCheck, gradient: 'from-cyan-500 to-cyan-700', shadow: 'shadow-cyan-500/10' },
            { label: locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue', value: `${stats.totalRevenue.toLocaleString()} ${t('dzd')}`, icon: DollarSign, gradient: 'from-amber-500 to-amber-700', shadow: 'shadow-amber-500/10', isGold: true },
            { label: locale === 'ar' ? 'الخدمات النشطة' : 'Active Services', value: stats.totalServices, icon: Package, gradient: 'from-emerald-500 to-emerald-700', shadow: 'shadow-emerald-500/10' },
            { label: locale === 'ar' ? 'متوسط التقييم' : 'Avg Rating', value: stats.avgRating.toFixed(1), icon: Star, gradient: 'from-purple-500 to-purple-700', shadow: 'shadow-purple-500/10', isGold: true },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }} className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-4 hover:border-purple-500/20 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-white/30 uppercase tracking-wider">{card.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', card.isGold && 'text-amber-400')}>{card.value}</p>
                </div>
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-lg', card.gradient, card.shadow)}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" /> {locale === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#6D28D9" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(139,92,246,0.2)', background: '#1a1a2e', fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Status Pie */}
          <div className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-purple-400" /> {locale === 'ar' ? 'حالات الحجوزات' : 'Booking Status'}
            </h3>
            {bookingStatusData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {bookingStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(139,92,246,0.2)', background: '#1a1a2e', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">{t('noData')}</div>
            )}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {bookingStatusData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-white/50">{d.name}</span>
                  <span className="font-semibold text-white ms-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Services */}
        {stats.popularServices.length > 0 && (
          <div className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> {locale === 'ar' ? 'الخدمات الأكثر طلباً' : 'Most Popular'}
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {stats.popularServices.map((s, i) => (
                <div key={s.id} className="flex-shrink-0 w-52 rounded-lg border border-purple-500/10 bg-white/[0.02] overflow-hidden hover:border-purple-500/20 transition-colors">
                  <div className="aspect-video relative">
                    {s.image ? <img src={s.image} alt="" className="w-full h-full object-cover" /> : (
                      <div className="w-full h-full bg-purple-500/5 flex items-center justify-center"><Package className="w-6 h-6 text-purple-500/20" /></div>
                    )}
                    <span className="absolute top-2 start-2 w-6 h-6 rounded-md bg-black/50 flex items-center justify-center text-[10px] font-bold text-white">{i + 1}</span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-white truncate">{gt(s.titleAr, s.titleEn)}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-amber-400 font-bold">{s.price} {t('dzd')}</span>
                      <span className="text-[10px] text-white/30">★ {s.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ── SERVICES TAB ───────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderServicesTab = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-400" />
          {locale === 'ar' ? 'خدماتي' : 'My Services'} <span className="text-sm font-normal text-white/30">({services.length})</span>
        </h1>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openAddServicePage}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold shadow-lg shadow-purple-500/20">
          <Plus className="w-4 h-4" /> {locale === 'ar' ? 'إضافة خدمة' : 'Add Service'}
        </motion.button>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-purple-500/15 bg-[#0f0f1a]/40">
          <Package className="w-12 h-12 text-purple-500/15 mb-3" />
          <h3 className="font-semibold text-white mb-1">{locale === 'ar' ? 'لا توجد خدمات بعد' : 'No services yet'}</h3>
          <p className="text-sm text-white/30 mb-4">{locale === 'ar' ? 'أضف خدمتك الأولى لتبدأ' : 'Add your first service to get started'}</p>
          <button onClick={openAddServicePage} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors">
            <Plus className="w-4 h-4" /> {locale === 'ar' ? 'إضافة خدمة' : 'Add Service'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map((svc, idx) => (
            <motion.div key={svc.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
              className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 overflow-hidden hover:border-purple-500/20 transition-all group">
              <div className="aspect-video relative overflow-hidden">
                {svc.image ? <img src={svc.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : (
                  <div className="w-full h-full bg-purple-500/5 flex items-center justify-center"><Package className="w-8 h-8 text-purple-500/15" /></div>
                )}
                {svc.featured && (
                  <span className="absolute top-2 end-2 px-2 py-0.5 rounded-md bg-amber-500/90 text-[10px] font-bold text-white flex items-center gap-1">
                    <Star className="w-3 h-3" /> {locale === 'ar' ? 'مميزة' : 'Featured'}
                  </span>
                )}
                <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#0f0f1a] to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-white truncate mb-1">{gt(svc.titleAr, svc.titleEn)}</h3>
                <p className="text-xs text-white/30 flex items-center gap-1 mb-3"><MapPin className="w-3 h-3" /> {svc.location}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-amber-400">{svc.price} <span className="text-xs text-amber-400/50">{t('dzd')}</span></span>
                  <span className="text-xs text-white/30">★ {svc.rating.toFixed(1)} ({svc.totalReviews})</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditService(svc)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-purple-500/15 text-xs text-purple-300 hover:bg-purple-500/10 transition-all">
                    <Pencil className="w-3 h-3" /> {locale === 'ar' ? 'تعديل' : 'Edit'}
                  </button>
                  <button onClick={() => handleToggleFeatured(svc)}
                    className={cn('px-3 py-2 rounded-lg border text-xs transition-all',
                      svc.featured ? 'border-amber-500/20 bg-amber-500/5 text-amber-400' : 'border-purple-500/15 text-white/30 hover:text-amber-400 hover:border-amber-500/20')}>
                    <Star className={cn('w-3 h-3', svc.featured && 'fill-current')} />
                  </button>
                  <button onClick={() => setDeleteServiceId(svc.id)}
                    className="px-3 py-2 rounded-lg border border-red-500/10 bg-red-500/5 text-xs text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={(open) => { setServiceDialogOpen(open); if (!open) resetForm(); }}>
        <DialogTrigger asChild><span /></DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-[#0f0f1a] border-purple-500/15">
          <div className="px-6 py-4 border-b border-purple-500/10 bg-purple-500/5">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Pencil className="w-4 h-4 text-purple-400" /> {locale === 'ar' ? 'تعديل الخدمة' : 'Edit Service'}
            </DialogTitle>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'الاسم (عربي)' : 'Name (AR)'}</Label>
                <Input value={serviceForm.titleAr} onChange={(e) => setServiceForm({ ...serviceForm, titleAr: e.target.value })} dir="rtl" className="bg-white/5 border-purple-500/15 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'الاسم (إنجليزي)' : 'Name (EN)'}</Label>
                <Input value={serviceForm.titleEn} onChange={(e) => setServiceForm({ ...serviceForm, titleEn: e.target.value })} dir="ltr" className="bg-white/5 border-purple-500/15 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'الوصف (عربي)' : 'Desc (AR)'}</Label>
                <Textarea value={serviceForm.descriptionAr} onChange={(e) => setServiceForm({ ...serviceForm, descriptionAr: e.target.value })} dir="rtl" rows={3} className="bg-white/5 border-purple-500/15 text-white resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'الوصف (إنجليزي)' : 'Desc (EN)'}</Label>
                <Textarea value={serviceForm.descriptionEn} onChange={(e) => setServiceForm({ ...serviceForm, descriptionEn: e.target.value })} dir="ltr" rows={3} className="bg-white/5 border-purple-500/15 text-white resize-none" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'التصنيف' : 'Category'}</Label>
                <Select value={serviceForm.categoryId} onValueChange={(v) => setServiceForm({ ...serviceForm, categoryId: v })}>
                  <SelectTrigger className="bg-white/5 border-purple-500/15 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id} className="text-white">{gt(c.nameAr, c.nameEn)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'السعر (د.ج)' : 'Price'}</Label>
                <Input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} className="bg-white/5 border-purple-500/15 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'المدة' : 'Duration'}</Label>
                <Input value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })} className="bg-white/5 border-purple-500/15 text-white" />
              </div>
            </div>
            {renderWilayaField(serviceForm.wilaya, (v) => setServiceForm({ ...serviceForm, wilaya: v }))}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'الموقع' : 'Location'}</Label>
                <Input value={serviceForm.location} onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })} className="bg-white/5 border-purple-500/15 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-purple-300">{locale === 'ar' ? 'الأشخاص' : 'People'}</Label>
                <Input type="number" value={serviceForm.maxPeople} onChange={(e) => setServiceForm({ ...serviceForm, maxPeople: e.target.value })} className="bg-white/5 border-purple-500/15 text-white" />
              </div>
            </div>
            {/* Image Upload + Preview */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> {locale === 'ar' ? 'صورة الخدمة' : 'Service Image'}
              </Label>
              <div className="flex gap-4">
                <div className="w-40 h-28 rounded-xl border-2 border-dashed border-purple-500/20 overflow-hidden bg-white/[0.02] relative group flex-shrink-0">
                  {imagePreview || serviceForm.image ? (
                    <img src={imagePreview || serviceForm.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-6 h-6 mb-1 opacity-30" />
                      <p className="text-[10px]">{locale === 'ar' ? 'لا توجد صورة' : 'No image'}</p>
                    </div>
                  )}
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-purple-500/15 bg-purple-500/5 text-xs text-purple-300 hover:bg-purple-500/10 transition-all disabled:opacity-50">
                    {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploadingImage ? (locale === 'ar' ? 'جارٍ الرفع...' : 'Uploading...') : (locale === 'ar' ? 'رفع صورة من الجهاز' : 'Upload from device')}
                  </button>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex-1 border-t border-purple-500/10" />
                    <span>{locale === 'ar' ? 'أو رابط' : 'or URL'}</span>
                    <span className="flex-1 border-t border-purple-500/10" />
                  </div>
                  <Input value={serviceForm.image} onChange={(e) => { setServiceForm({ ...serviceForm, image: e.target.value }); setImagePreview(e.target.value); }}
                    placeholder="https://..." className="bg-white/5 border-purple-500/15 text-white text-xs h-8" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setServiceDialogOpen(false); resetForm(); }} className="px-4 py-2 rounded-lg text-sm text-white/40 hover:text-white/60">{locale === 'ar' ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={() => handleSaveService(false)} disabled={savingService}
                className="px-5 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-1.5">
                {savingService && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {locale === 'ar' ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteServiceId} onOpenChange={() => setDeleteServiceId(null)}>
        <AlertDialogContent className="bg-[#0f0f1a] border-purple-500/15">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{locale === 'ar' ? 'حذف الخدمة؟' : 'Delete Service?'}</AlertDialogTitle>
            <AlertDialogDescription className="text-white/40">{locale === 'ar' ? 'لا يمكن التراجع عن هذا الإجراء' : 'This action cannot be undone'}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-purple-500/15 text-white hover:bg-white/10">{locale === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteServiceId && handleDeleteService(deleteServiceId)} className="bg-red-600 hover:bg-red-700 text-white">{locale === 'ar' ? 'حذف' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // ── BOOKINGS TAB ───────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderBookingsTab = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <h1 className="text-xl font-bold text-white flex items-center gap-2">
        <CalendarCheck className="w-5 h-5 text-purple-400" /> {locale === 'ar' ? 'الحجوزات' : 'Bookings'}
      </h1>
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setBookingFilter(f)}
            className={cn('px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
              bookingFilter === f ? 'bg-purple-600/20 border-purple-500/30 text-purple-300' : 'border-purple-500/10 text-white/40 hover:text-white/60 hover:border-purple-500/20')}>
            {filterLabel(f)}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-purple-500/10">
          <CalendarCheck className="w-10 h-10 text-purple-500/15 mb-2" />
          <p className="text-sm text-white/30">{locale === 'ar' ? 'لا توجد حجوزات' : 'No bookings'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b, idx) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
              className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-4 hover:border-purple-500/15 transition-colors">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-purple-500/5">
                  {b.service.image && <img src={b.service.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold text-white truncate">{gt(b.service.titleAr, b.service.titleEn)}</h3>
                    <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border flex-shrink-0', statusColor(b.status))}>
                      {statusLabel(b.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-white/30 mb-2.5">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {b.user.name}</span>
                    <span className="flex items-center gap-1"><CalendarCheck className="w-3 h-3" /> {new Date(b.bookingDate).toLocaleDateString()}</span>
                    <span>×{b.numberOfPeople}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-purple-500/10">
                    <span className="text-base font-bold text-amber-400">{b.totalPrice.toLocaleString()} <span className="text-xs text-amber-400/50">{t('dzd')}</span></span>
                    <div className="flex gap-1.5">
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => updateBooking(b.id, 'confirmed')} disabled={updatingBooking === b.id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {locale === 'ar' ? 'تأكيد' : 'Confirm'}
                          </button>
                          <button onClick={() => updateBooking(b.id, 'cancelled')} disabled={updatingBooking === b.id}
                            className="px-2.5 py-1 rounded-lg bg-red-500/5 border border-red-500/15 text-[11px] text-red-400 hover:bg-red-500/10 disabled:opacity-50">
                            <XCircle className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <button onClick={() => updateBooking(b.id, 'completed')} disabled={updatingBooking === b.id}
                          className="px-2.5 py-1 rounded-lg bg-purple-600/20 border border-purple-500/20 text-[11px] text-purple-300 disabled:opacity-50 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {locale === 'ar' ? 'إنهاء' : 'Complete'}
                        </button>
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

  // ═══════════════════════════════════════════════════════════════════════
  // ── MESSAGES TAB (Real-time) ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderMessagesTab = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 overflow-hidden flex" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Conversation List */}
      <div className={cn('w-64 border-e border-purple-500/10 flex flex-col flex-shrink-0', selectedConversation && 'hidden md:flex')}>
        <div className="px-4 py-3 border-b border-purple-500/10">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            {locale === 'ar' ? 'المحادثات' : 'Conversations'}
          </h3>
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <p className="p-4 text-center text-sm text-white/20">{locale === 'ar' ? 'لا توجد محادثات' : 'No conversations'}</p>
          ) : conversations.map(b => (
            <button key={b.id} onClick={() => handleSelectConversation(b)}
              className={cn('w-full px-4 py-3 text-start border-b border-purple-500/5 transition-colors',
                selectedConversation?.id === b.id ? 'bg-purple-500/10' : 'hover:bg-white/[0.02]')}>
              <p className="text-sm font-medium text-white truncate">{b.user.name}</p>
              <p className="text-[11px] text-white/30 truncate">{gt(b.service.titleAr, b.service.titleEn)}</p>
              <p className="text-[10px] text-white/15 mt-1">{new Date(b.createdAt).toLocaleDateString()}</p>
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="px-4 py-3 border-b border-purple-500/10 flex items-center gap-3">
              <button onClick={() => setSelectedConversation(null)} className="md:hidden text-white/30 hover:text-white">
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{selectedConversation.user.name}</p>
                <p className="text-[11px] text-white/30 truncate">{gt(selectedConversation.service.titleAr, selectedConversation.service.titleEn)}</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live</span>
            </div>
            <ScrollArea className="flex-1 p-4 space-y-2.5">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-8 h-8 text-purple-500/15 mb-2" />
                  <p className="text-sm text-white/25">{locale === 'ar' ? 'ابدأ المحادثة' : 'Start the conversation'}</p>
                </div>
              ) : messages.map(msg => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[70%] px-3.5 py-2 rounded-2xl text-sm',
                      isMine ? 'bg-purple-600/80 text-white rounded-br-md' : 'bg-white/[0.05] text-white/90 rounded-bl-md border border-purple-500/10')}>
                      {!isMine && <p className="text-[10px] text-purple-400 font-medium mb-0.5">{msg.sender.name}</p>}
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className={cn('text-[10px] mt-0.5', isMine ? 'text-purple-200/40' : 'text-white/20')}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <div className="p-3 border-t border-purple-500/10">
              <div className="flex gap-2">
                <Input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={locale === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
                  className="flex-1 bg-white/5 border-purple-500/10 text-white placeholder:text-white/20 focus-visible:ring-purple-500/30" />
                <button onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white disabled:opacity-40 hover:bg-purple-500 transition-colors">
                  {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center"><MessageSquare className="w-10 h-10 text-purple-500/10 mx-auto mb-2" /><p className="text-sm text-white/25">{locale === 'ar' ? 'اختر محادثة' : 'Select a conversation'}</p></div>
          </div>
        )}
      </div>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // ── SETTINGS TAB ──────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const renderSettingsTab = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <h1 className="text-xl font-bold text-white flex items-center gap-2">
        <Settings className="w-5 h-5 text-purple-400" /> {locale === 'ar' ? 'الإعدادات' : 'Settings'}
      </h1>
      {provider ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-5 flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 ring-4 ring-purple-500/20 mb-3">
              <AvatarImage src={provider.user.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-2xl font-bold">{provider.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-white">{provider.companyName}</h3>
            <p className="text-sm text-white/30 mt-0.5">{provider.user.email}</p>
            {provider.wilaya && <p className="text-xs text-purple-400 mt-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> {getWilayaName(provider.wilaya, locale)}</p>}
            <div className="flex items-center gap-1 mt-2 text-amber-400"><Star className="w-4 h-4 fill-current" /><span className="text-sm font-bold">{provider.rating.toFixed(1)}</span><span className="text-xs text-white/30 ms-1">({provider.totalReviews})</span></div>
            <Badge className={cn('mt-3 px-2.5 py-0.5 rounded-md text-[10px] font-bold border', provider.verified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400')}>
              {provider.verified ? (locale === 'ar' ? 'موثّق ✓' : 'Verified ✓') : (locale === 'ar' ? 'بانتظار' : 'Pending')}
            </Badge>
          </div>
          <div className="lg:col-span-2 rounded-xl border border-purple-500/10 bg-[#0f0f1a]/80 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-purple-400" /> {locale === 'ar' ? 'معلومات الحساب' : 'Account Info'}</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ l: locale === 'ar' ? 'الشركة' : 'Company', v: provider.companyName }, { l: locale === 'ar' ? 'الاسم' : 'Name', v: provider.user.name }, { l: locale === 'ar' ? 'البريد' : 'Email', v: provider.user.email }, { l: locale === 'ar' ? 'الهاتف' : 'Phone', v: provider.user.phone || '—' }, { l: locale === 'ar' ? 'الولاية' : 'Wilaya', v: provider.wilaya ? getWilayaName(provider.wilaya, locale) : '—' }].map((f, i) => (
                <div key={i} className="px-3 py-2.5 rounded-lg bg-white/[0.02] border border-purple-500/10">
                  <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">{f.l}</p>
                  <p className="text-sm font-medium text-white mt-0.5">{f.v}</p>
                </div>
              ))}
            </div>
            {provider.description && <div className="mt-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-purple-500/10"><p className="text-[10px] text-white/25 uppercase mb-1">{locale === 'ar' ? 'الوصف' : 'Description'}</p><p className="text-sm text-white/70">{provider.description}</p></div>}
            {provider.website && <div className="mt-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-purple-500/10"><p className="text-[10px] text-white/25 uppercase mb-1">{locale === 'ar' ? 'الموقع' : 'Website'}</p><a href={provider.website} target="_blank" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"><Globe className="w-3 h-3" /> {provider.website}</a></div>}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-purple-400 animate-spin" /></div>
      )}
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // ── MAIN RENDER ───────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#08080d]">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? SIDEBAR_WIDTH : 72 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 bottom-0 z-40 flex flex-col bg-gradient-to-b from-[#0d0d14] via-[#0f0f1a] to-[#0d0d14] border-s border-purple-500/10"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-purple-500/10">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <span className="text-lg font-black text-white">H</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{locale === 'ar' ? 'لوحة المزود' : 'Provider'}</p>
                  <p className="text-[10px] text-purple-400/60">Dashboard</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarOpen && (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center mx-auto">
              <span className="text-lg font-black text-white">H</span>
            </div>
          )}
        </div>

        {/* Provider Info */}
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 py-3 border-b border-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-xs font-bold">{user?.name?.charAt(0) || 'P'}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -end-0.5 bg-emerald-500 rounded-full p-[2px] border-2 border-[#0d0d14]"><ShieldCheck className="h-2.5 w-2.5 text-white" /></div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.providerName || user?.name}</p>
                <p className="text-[11px] text-white/40 truncate">{user?.email}</p>
              </div>
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
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={cn('w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 relative group',
                    sidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center',
                    isActive ? 'bg-purple-600/15 text-purple-300' : 'text-white/50 hover:text-white/80 hover:bg-white/5')}>
                  {isActive && <motion.div layoutId="sidebar-active" className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gradient-to-b from-purple-400 to-purple-600" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
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
            {sidebarOpen && <span>{locale === 'ar' ? 'العودة للموقع' : 'Back to Site'}</span>}
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
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
              <Menu className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold text-white hidden sm:block">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={openAddServicePage}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-500 transition-colors">
              <Plus className="w-3.5 h-3.5" /> {locale === 'ar' ? 'خدمة جديدة' : 'New'}
            </button>
            <Avatar className="h-8 w-8 ring-2 ring-purple-500/30">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-xs font-bold">{user?.name?.charAt(0) || 'P'}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderAnalyticsTab()}</motion.div>}
            {activeTab === 'services' && <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderServicesTab()}</motion.div>}
            {activeTab === 'addService' && <motion.div key="addService" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderAddServicePage()}</motion.div>}
            {activeTab === 'bookings' && <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderBookingsTab()}</motion.div>}
            {activeTab === 'messages' && <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderMessagesTab()}</motion.div>}
            {activeTab === 'settings' && <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderSettingsTab()}</motion.div>}
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}
