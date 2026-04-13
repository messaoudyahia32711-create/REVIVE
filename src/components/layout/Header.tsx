'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion';
import {
  Globe,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Sparkles,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppStore, type Page } from '@/lib/store';

/* ------------------------------------------------------------------ */
/*  Navigation config                                                  */
/* ------------------------------------------------------------------ */
const navLinks: { key: string; page: Page }[] = [
  { key: 'home', page: 'home' },
  { key: 'services', page: 'services' },
];

/* ------------------------------------------------------------------ */
/*  Framer-motion variants                                             */
/* ------------------------------------------------------------------ */
const logoVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.1 },
  },
};

const navContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.25 },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const rightSectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.35 },
  },
};

const rightItemVariants = {
  hidden: { opacity: 0, x: 12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
};

/* Mobile overlay variants */
const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { duration: 0.25 } },
};

const mobileMenuVariants = {
  closed: {
    clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)',
    transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.5 },
  },
  open: {
    clipPath: 'circle(150% at calc(100% - 2.5rem) 2.5rem)',
    transition: { type: 'spring', stiffness: 100, damping: 20, duration: 0.6 },
  },
};

const mobileLinkVariants = {
  closed: { opacity: 0, x: -30 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 22, delay: 0.15 + i * 0.07 },
  }),
};

/* Underline hover */
const underlineHover = {
  rest: { width: 0 },
  hover: { width: '70%', transition: { type: 'spring', stiffness: 400, damping: 28 } },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Header() {
  const {
    t,
    navigateTo,
    setLocale,
    locale,
    isRTL,
    user,
    isAuthenticated,
    setUser,
    setSelectedCategoryId,
    currentPage,
  } = useAppStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 12);
  });

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  /* ---------- handlers ---------- */
  const handleNavClick = useCallback(
    (page: Page) => {
      navigateTo(page);
      setSelectedCategoryId(null);
      setMobileOpen(false);
    },
    [navigateTo, setSelectedCategoryId],
  );

  const handleLanguageToggle = useCallback(() => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  }, [locale, setLocale]);

  const handleLogout = useCallback(() => {
    setUser(null);
    navigateTo('home');
    setMobileOpen(false);
  }, [setUser, navigateTo]);

  const dashboardPage: Page = user?.role === 'provider' ? 'provider-dashboard' : 'user-dashboard';

  /* ---------- render ---------- */
  return (
    <>
      <motion.header
        className={`fixed top-0 inset-x-0 z-50 transition-shadow duration-500 ${
          scrolled ? 'shadow-lg shadow-black/5' : ''
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26, delay: 0.05 }}
      >
        {/* ---- Glass bar ---- */}
        <div
          className={`glass transition-all duration-500 ${
            scrolled ? 'glass--scrolled' : ''
          }`}
        >
          <div className="container mx-auto flex h-18 items-center justify-between px-4 md:px-8">
            {/* ====== Logo ====== */}
            <motion.div
              variants={logoVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-3 cursor-pointer select-none group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigateTo('home')}
            >
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 opacity-0 group-hover:opacity-60 blur transition-opacity duration-500" />
                <img
                  src="/images/logo.png"
                  alt="H"
                  className="relative h-10 w-10 rounded-full object-cover ring-1 ring-white/40"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight text-gradient-gold leading-none">
                  H
                </span>
                <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase leading-none mt-0.5">
                  {t('home')}
                </span>
              </div>
            </motion.div>

            {/* ====== Desktop Navigation ====== */}
            <motion.nav
              variants={navContainerVariants}
              initial="hidden"
              animate="visible"
              className="hidden md:flex items-center gap-1"
            >
              {navLinks.map((link) => {
                const isActive = currentPage === link.page;
                return (
                  <motion.button
                    key={link.key}
                    variants={navItemVariants}
                    onClick={() => handleNavClick(link.page)}
                    onMouseEnter={() => setHoveredLink(link.key)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`relative px-5 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${
                      isActive
                        ? 'text-teal-700 dark:text-teal-300'
                        : 'text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    {/* Active background pill */}
                    <motion.span
                      className="absolute inset-0 rounded-full bg-teal-500/8 dark:bg-teal-400/10"
                      layoutId="activeNav"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      style={{
                        opacity: isActive ? 1 : 0,
                        scale: isActive ? 1 : 0.85,
                      }}
                    />
                    <span className="relative z-10">{t(link.key as keyof typeof t extends (k: infer K) => string ? K : never)}</span>

                    {/* Underline animation on hover */}
                    <motion.span
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                      variants={underlineHover}
                      animate={
                        hoveredLink === link.key ? 'hover' : 'rest'
                      }
                    />
                  </motion.button>
                );
              })}
            </motion.nav>

            {/* ====== Right section ====== */}
            <motion.div
              variants={rightSectionVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-2.5"
            >
              {/* --- Language Toggle (Pill) --- */}
              <motion.div variants={rightItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={handleLanguageToggle}
                  className={`relative flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-full border border-border/60 bg-background/40 hover:bg-accent/60 transition-colors duration-300 overflow-hidden`}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={locale}
                      initial={{ opacity: 0, y: 8, rotateX: -40 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      exit={{ opacity: 0, y: -8, rotateX: 40 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                    >
                      <Globe className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{locale === 'ar' ? 'العربية' : 'English'}</span>
                      <span>{locale === 'ar' ? '🇸🇦' : '🇬🇧'}</span>
                    </motion.span>
                  </AnimatePresence>
                </button>
              </motion.div>

              {/* --- Auth Section (Desktop) --- */}
              <motion.div variants={rightItemVariants} className="hidden md:block">
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative gap-2.5 px-2 py-1.5 rounded-full hover:bg-accent/50 transition-colors"
                      >
                        {/* Glowing avatar ring */}
                        <div className="relative">
                          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-teal-400 via-emerald-400 to-teal-500 opacity-70 blur-[2px]" />
                          <Avatar className="relative h-8 w-8 ring-2 ring-white dark:ring-gray-900">
                            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-xs font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <span className="hidden lg:inline max-w-[100px] truncate text-sm font-medium text-foreground/80">
                          {user.name}
                        </span>
                        <motion.div
                          animate={{ rotate: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </motion.div>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align={isRTL ? 'start' : 'end'}
                      sideOffset={12}
                      className="w-60 rounded-xl border border-border/40 bg-background/80 backdrop-blur-2xl p-1.5 shadow-xl shadow-black/5"
                    >
                      <DropdownMenuLabel className="px-2.5 py-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 ring-2 ring-teal-500/30">
                            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-xs font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold leading-tight">{user.name}</p>
                            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border/40" />
                      <DropdownMenuItem
                        onClick={() => navigateTo('profile')}
                        className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors focus:bg-accent/50"
                      >
                        <User className="h-4 w-4 text-foreground/50" />
                        <span className="text-sm">{t('profile')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigateTo(dashboardPage)}
                        className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors focus:bg-accent/50"
                      >
                        <LayoutDashboard className="h-4 w-4 text-foreground/50" />
                        <span className="text-sm">{t('dashboard')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/40" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors text-red-500 focus:bg-red-500/10 focus:text-red-500"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm">{t('logout')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Ghost Login */}
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateTo('login')}
                        className="h-9 px-5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50 rounded-full transition-colors"
                      >
                        {t('login')}
                      </Button>
                    </motion.div>

                    {/* Gradient Join */}
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        size="sm"
                        onClick={() => navigateTo('register')}
                        className="relative h-9 px-6 text-sm font-semibold rounded-full overflow-hidden bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300"
                      >
                        <span className="relative z-10 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          {t('register')}
                        </span>
                        {/* Shimmer overlay */}
                        <motion.span
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ repeat: Infinity, duration: 3, ease: 'linear', repeatDelay: 2 }}
                        />
                      </Button>
                    </motion.div>
                  </div>
                )}
              </motion.div>

              {/* --- Mobile Hamburger --- */}
              <motion.div variants={rightItemVariants} className="md:hidden">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent/50 transition-colors"
                  aria-label="Open menu"
                >
                  <motion.div
                    className="flex flex-col gap-1.5"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.span
                      className="block h-0.5 w-5 bg-foreground/70 rounded-full"
                      animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 4 : 0 }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.span
                      className="block h-0.5 w-5 bg-foreground/70 rounded-full"
                      animate={{ opacity: mobileOpen ? 0 : 1 }}
                      transition={{ duration: 0.1 }}
                    />
                    <motion.span
                      className="block h-0.5 w-5 bg-foreground/70 rounded-full"
                      animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -4 : 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* ---- Gradient bottom border ---- */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
        </div>
      </motion.header>

      {/* ====== Mobile Full-screen Overlay ====== */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[60] md:hidden" initial="closed" animate="open" exit="closed">
            {/* Backdrop */}
            <motion.div
              variants={overlayVariants}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              variants={mobileMenuVariants}
              className="relative flex flex-col h-full bg-background/95 backdrop-blur-2xl"
              style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            >
              {/* Mobile top bar */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <div className="flex items-center gap-3" onClick={() => { navigateTo('home'); setMobileOpen(false); }}>
                  <img src="/images/logo.png" alt="H" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/30" />
                  <span className="text-2xl font-extrabold text-gradient-gold">H</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent/50 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Gradient border */}
              <div className="h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

              {/* Nav links */}
              <nav className="flex flex-col gap-1 px-4 mt-8">
                {navLinks.map((link, i) => {
                  const isActive = currentPage === link.page;
                  return (
                    <motion.button
                      key={link.key}
                      custom={i}
                      variants={mobileLinkVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      onClick={() => handleNavClick(link.page)}
                      className={`relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors ${
                        isActive
                          ? 'text-teal-700 dark:text-teal-300 bg-teal-500/10'
                          : 'text-foreground/70 hover:text-foreground hover:bg-accent/40'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="mobileActiveNav"
                          className="absolute inset-0 rounded-xl bg-teal-500/8 dark:bg-teal-400/10"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{t(link.key as keyof typeof t extends (k: infer K) => string ? K : never)}</span>
                      {isActive && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-teal-500"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Divider */}
              <div className="mx-6 my-4 h-px bg-border/60" />

              {/* Auth section */}
              <div className="px-4">
                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-1">
                    {[
                      { icon: <User className="h-4 w-4" />, label: t('profile'), action: () => { navigateTo('profile'); setMobileOpen(false); } },
                      { icon: <LayoutDashboard className="h-4 w-4" />, label: t('dashboard'), action: () => { navigateTo(dashboardPage); setMobileOpen(false); } },
                    ].map((item, i) => (
                      <motion.button
                        key={item.label}
                        custom={i + navLinks.length}
                        variants={mobileLinkVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        onClick={item.action}
                        className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-accent/40 transition-colors"
                      >
                        {item.icon}
                        {item.label}
                      </motion.button>
                    ))}
                    <motion.button
                      custom={navLinks.length + 2}
                      variants={mobileLinkVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      onClick={handleLogout}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('logout')}
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <motion.button
                      custom={navLinks.length}
                      variants={mobileLinkVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      onClick={() => { navigateTo('login'); setMobileOpen(false); }}
                      className="w-full flex items-center justify-center rounded-xl border border-border/60 py-3.5 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      {t('login')}
                    </motion.button>
                    <motion.button
                      custom={navLinks.length + 1}
                      variants={mobileLinkVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      onClick={() => { navigateTo('register'); setMobileOpen(false); }}
                      className="relative w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-500/20 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        {t('register')}
                      </span>
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear', repeatDelay: 2 }}
                      />
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Language toggle (mobile) */}
              <div className="mt-auto px-6 pb-8">
                <div className="h-px bg-border/40 mb-6" />
                <motion.button
                  custom={navLinks.length + 3}
                  variants={mobileLinkVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  onClick={handleLanguageToggle}
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-border/60 py-3 text-sm font-medium text-foreground/70 hover:bg-accent/50 transition-colors"
                >
                  <Globe className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
                  <span>{locale === 'ar' ? '🇬🇧' : '🇸🇦'}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
