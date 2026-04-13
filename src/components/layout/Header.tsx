'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Menu, User, LogOut, LayoutDashboard,
  ChevronDown, ChevronUp,
  Facebook, Twitter, Instagram, Youtube, Send,
  Mail, Heart,
  HeartPulse, Smile, Activity, Sparkles, Eye, Leaf, Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore, type Page } from '@/lib/store';
import Image from 'next/image';

/* ── Dynamic Icon Map ──────────────────────────────────────────────────────── */
const iconMap: Record<string, React.ReactNode> = {
  Stethoscope: <Stethoscope className="w-5 h-5" />,
  Smile: <Smile className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Eye: <Eye className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
  HeartPulse: <HeartPulse className="w-5 h-5" />,
  medical: <Stethoscope className="w-5 h-5" />,
  dental: <Smile className="w-5 h-5" />,
  physio: <Activity className="w-5 h-5" />,
  skin: <Sparkles className="w-5 h-5" />,
  eye: <Eye className="w-5 h-5" />,
  alt: <Leaf className="w-5 h-5" />,
  heart: <HeartPulse className="w-5 h-5" />,
  bone: <Stethoscope className="w-5 h-5" />,
  nutrition: <HeartPulse className="w-5 h-5" />,
};

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  image?: string;
  serviceCount: number;
}

/* ── Stagger animation variant for mobile nav ─────────────────────────────── */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};
const staggerItem = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

/* ── Purple dot indicator for active link ─────────────────────────────────── */
function ActiveDot({ active }: { active: boolean }) {
  return (
    <motion.span
      layoutId="header-active-dot"
      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]"
      initial={false}
      animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Header() {
  const {
    t, locale, setLocale, isRTL,
    currentPage, navigateTo,
    user, isAuthenticated, setUser,
    setSelectedCategoryId,
  } = useAppStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ── Fetch categories ─────────────────────────────────────────────────── */
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  /* ── Scroll listener ──────────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  const toggleLang = useCallback(() => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  }, [locale, setLocale]);

  const handleCategoryClick = useCallback(
    (catId: string) => {
      setSelectedCategoryId(catId);
      navigateTo('services');
      setMobileOpen(false);
    },
    [setSelectedCategoryId, navigateTo]
  );

  const getDashboardPage = useCallback((): Page => {
    if (user?.role === 'admin') return 'admin-dashboard';
    if (user?.role === 'provider') return 'provider-dashboard';
    return 'user-dashboard';
  }, [user?.role]);

  const getCatName = useCallback(
    (cat: Category) => (locale === 'ar' ? cat.nameAr : cat.nameEn),
    [locale]
  );

  const getCatIcon = useCallback((iconStr: string) => {
    return iconMap[iconStr] || <Stethoscope className="w-5 h-5" />;
  }, []);

  const isActive = useCallback(
    (page: Page) => currentPage === page,
    [currentPage]
  );

  /* ── Close mobile on page change ──────────────────────────────────────── */
  useEffect(() => {
    setMobileOpen(false);
  }, [currentPage]);

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Main Header Bar ──────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass--scrolled py-2' : 'glass py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* ── Logo ──────────────────────────────────────────────────── */}
          <motion.button
            onClick={() => navigateTo('home')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 group"
            aria-label="REVIVE - Home"
          >
            <Image
              src="/images/logo.png"
              alt="REVIVE Logo"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="text-xl font-black tracking-tight text-gradient-gold">
              REVIVE
            </span>
          </motion.button>

          {/* ── Desktop Navigation ────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Home */}
            <NavLink
              label={t('home')}
              active={isActive('home')}
              onClick={() => navigateTo('home')}
            />

            {/* Services — Popover with categories grid */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-1.5 glow-purple text-gray-400 hover:text-purple-300">
                  <span>{t('services')}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <ActiveDot active={isActive('services')} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={12}
                align={isRTL ? 'end' : 'start'}
                className={`w-[420px] p-0 glass rounded-2xl border border-purple-500/20 shadow-2xl shadow-purple-500/5 glow-purple overflow-hidden`}
              >
                <div className="p-4">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-3">
                    {t('categories')}
                  </p>
                  {loading ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="h-16 rounded-xl bg-purple-500/5 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : categories.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {categories.map((cat, idx) => (
                        <motion.button
                          key={cat.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          onClick={() => handleCategoryClick(cat.id)}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl border border-transparent hover:border-purple-500/25 hover:bg-purple-500/8 transition-all duration-300 group/cat"
                        >
                          <span className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover/cat:text-purple-300 group-hover/cat:bg-purple-500/20 transition-all duration-300 shadow-sm">
                            {getCatIcon(cat.icon)}
                          </span>
                          <span className="text-[11px] text-gray-400 group-hover/cat:text-purple-300 font-medium transition-colors text-center leading-tight">
                            {getCatName(cat)}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      {t('noData')}
                    </p>
                  )}
                </div>
                <div className="border-t border-purple-500/10 px-4 py-2.5">
                  <button
                    onClick={() => navigateTo('services')}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    {t('allServices')}
                    <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Dashboard */}
            <NavLink
              label={t('dashboard')}
              active={isActive('user-dashboard') || isActive('provider-dashboard') || isActive('admin-dashboard')}
              onClick={() => {
                if (isAuthenticated) navigateTo(getDashboardPage());
                else navigateTo('login');
              }}
            />
          </nav>

          {/* ── Right Section ─────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-xs font-medium text-purple-300 flex items-center gap-1.5 glow-purple hover:border-purple-500/40 transition-all duration-300"
              aria-label={t('language')}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{locale === 'en' ? 'عربي' : 'EN'}</span>
            </motion.button>

            {/* ── Auth: Authenticated ──────────────────────────────────── */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative focus:outline-none"
                    aria-label="User menu"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-purple-500/40 hover:ring-purple-500/80 transition-all duration-300 shadow-[0_0_16px_rgba(139,92,246,0.25)]">
                      {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 p-0.5">
                        <Image src="/images/logo.png" alt="REVIVE" width={28} height={28} className="rounded object-cover" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0a0a0f]" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  sideOffset={12}
                  align={isRTL ? 'start' : 'end'}
                  className="w-56 glass rounded-xl border border-purple-500/20 shadow-2xl shadow-purple-500/5 glow-purple"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1 px-2 py-1.5">
                      <p className="text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-purple-500/10" />
                  <DropdownMenuItem
                    onClick={() => navigateTo('profile')}
                    className="text-gray-400 hover:text-purple-300 hover:bg-purple-500/5 cursor-pointer rounded-lg"
                  >
                    <User className="w-4 h-4" />
                    {t('profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigateTo(getDashboardPage())}
                    className="text-gray-400 hover:text-purple-300 hover:bg-purple-500/5 cursor-pointer rounded-lg"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t('dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-purple-500/10" />
                  <DropdownMenuItem
                    onClick={() => { setUser(null); navigateTo('home'); }}
                    variant="destructive"
                    className="cursor-pointer rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* ── Auth: Not Authenticated ─────────────────────────────── */
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigateTo('login')}
                  className="text-gray-400 hover:text-purple-300 hover:bg-purple-500/5 glow-purple rounded-xl"
                >
                  {t('login')}
                </Button>
                <Button
                  onClick={() => navigateTo('register')}
                  className="btn-purple-gradient btn-shimmer rounded-xl text-sm font-semibold border-0"
                >
                  {t('register')}
                </Button>
              </div>
            )}

            {/* ── Mobile Menu Toggle ──────────────────────────────────── */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl border border-purple-500/20 bg-purple-500/5 flex items-center justify-center text-purple-400 glow-purple"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile Full-Screen Sheet ──────────────────────────────────────── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side={isRTL ? 'right' : 'left'}
          className="w-full sm:max-w-md p-0 bg-[#0a0a0f]/98 backdrop-blur-2xl border-purple-500/15"
        >
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-purple-500/10">
              <button
                onClick={() => { navigateTo('home'); setMobileOpen(false); }}
                className="flex items-center gap-2"
              >
                <Image
                  src="/images/logo.png"
                  alt="REVIVE Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-black tracking-tight text-gradient-gold">
                  REVIVE
                </span>
              </button>
              <SheetClose asChild>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-400 hover:text-purple-300 transition-colors"
                  aria-label="Close menu"
                >
                  <Menu className="w-5 h-5" />
                </motion.button>
              </SheetClose>
            </div>

            {/* Mobile Nav */}
            <SheetHeader>
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            </SheetHeader>

            <motion.nav
              className="flex-1 overflow-y-auto px-4 py-6"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <div className="flex flex-col gap-2">
                {/* Home */}
                <motion.button
                  variants={staggerItem}
                  onClick={() => navigateTo('home')}
                  className={`text-start p-4 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center gap-3 ${
                    isActive('home')
                      ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300'
                      : 'text-gray-400 hover:text-purple-300 hover:bg-purple-500/5 border border-transparent'
                  }`}
                >
                  <Stethoscope className="w-5 h-5" />
                  <span>{t('home')}</span>
                  {isActive('home') && (
                    <motion.span
                      layoutId="mobile-active"
                      className="ms-auto w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                    />
                  )}
                </motion.button>

                {/* Services — Collapsible */}
                <motion.div variants={staggerItem}>
                  <Collapsible open={mobileCatOpen} onOpenChange={setMobileCatOpen}>
                    <CollapsibleTrigger asChild>
                      <button
                        className={`w-full text-start p-4 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center gap-3 ${
                          isActive('services')
                            ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300'
                            : 'text-gray-400 hover:text-purple-300 hover:bg-purple-500/5 border border-transparent'
                        }`}
                      >
                        <HeartPulse className="w-5 h-5" />
                        <span>{t('services')}</span>
                        <motion.span
                          animate={{ rotate: mobileCatOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="ms-auto"
                        >
                          {mobileCatOpen ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </motion.span>
                      </button>
                    </CollapsibleTrigger>
                    <AnimatePresence>
                      {mobileCatOpen && (
                        <CollapsibleContent forceMount>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-2 px-4 py-3">
                              {categories.map((cat, idx) => (
                                <motion.button
                                  key={cat.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: idx * 0.05 }}
                                  onClick={() => handleCategoryClick(cat.id)}
                                  className="flex items-center gap-2.5 p-3 rounded-xl border border-purple-500/10 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300"
                                >
                                  <span className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                                    {getCatIcon(cat.icon)}
                                  </span>
                                  <span className="text-xs text-gray-400 font-medium leading-tight">
                                    {getCatName(cat)}
                                  </span>
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        </CollapsibleContent>
                      )}
                    </AnimatePresence>
                  </Collapsible>
                </motion.div>

                {/* Dashboard */}
                <motion.button
                  variants={staggerItem}
                  onClick={() => {
                    if (isAuthenticated) navigateTo(getDashboardPage());
                    else navigateTo('login');
                  }}
                  className={`text-start p-4 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center gap-3 ${
                    isActive('user-dashboard') || isActive('provider-dashboard')
                      ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300'
                      : 'text-gray-400 hover:text-purple-300 hover:bg-purple-500/5 border border-transparent'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>{t('dashboard')}</span>
                </motion.button>
              </div>
            </motion.nav>

            {/* Mobile Footer */}
            <div className="px-4 py-5 border-t border-purple-500/10 space-y-3">
              {/* Language */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={toggleLang}
                className="w-full p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 text-sm font-medium text-purple-300 flex items-center justify-center gap-2 glow-purple"
              >
                <Globe className="w-4 h-4" />
                {locale === 'en' ? 'العربية' : 'English'}
              </motion.button>

              {/* Auth Buttons */}
              {isAuthenticated && user ? (
                <div className="flex gap-2">
                  <Button
                    onClick={() => { navigateTo(getDashboardPage()); setMobileOpen(false); }}
                    className="flex-1 btn-purple-gradient btn-shimmer rounded-xl text-sm font-semibold border-0"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t('dashboard')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setUser(null); setMobileOpen(false); navigateTo('home'); }}
                    className="flex-1 rounded-xl border-red-500/20 bg-red-500/5 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => { navigateTo('login'); setMobileOpen(false); }}
                    className="flex-1 rounded-xl text-gray-400 hover:text-purple-300 hover:bg-purple-500/5 text-sm font-medium"
                  >
                    {t('login')}
                  </Button>
                  <Button
                    onClick={() => { navigateTo('register'); setMobileOpen(false); }}
                    className="flex-1 btn-purple-gradient btn-shimmer rounded-xl text-sm font-semibold border-0"
                  >
                    {t('register')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ── Helper: NavLink with active dot ─────────────────────────────────────── */
function NavLink({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center glow-purple ${
        active ? 'text-purple-300' : 'text-gray-400 hover:text-purple-300'
      }`}
    >
      {active && (
        <motion.span
          layoutId="nav-active-bg"
          className="absolute inset-0 rounded-xl bg-purple-500/10 border border-purple-500/20"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{label}</span>
      <ActiveDot active={active} />
    </motion.button>
  );
}
