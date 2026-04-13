'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, Mail, Lock, Eye, EyeOff, Phone,
  ArrowRight, Crown, Sparkles, MapPin, ChevronDown
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { WILAYAS } from '@/lib/wilayas';

/* ═══════════════════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════════════════ */

const cardVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0, scale: 0.92, y: -20,
    transition: { duration: 0.3 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.15 + i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

const providerFieldsVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1, height: 'auto',
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0, height: 0,
    transition: { duration: 0.3 },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AuthPage() {
  const { t, currentPage, navigateTo, setUser, showToast, locale, isRTL } = useAppStore();
  const isLogin = currentPage === 'login';

  /* ── Form state ───────────────────────────────────────────────────────── */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'provider'>('user');
  const [companyName, setCompanyName] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);
  const [wilayaSearch, setWilayaSearch] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  /* ── Reset form when switching modes ──────────────────────────────────── */
  useEffect(() => {
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPhone('');
    setRole('user');
    setCompanyName('');
    setCompanyDesc('');
    setCompanyLocation('');
    setWilaya('');
    setShowPassword(false);
  }, [currentPage]);

  /* ── Validation ───────────────────────────────────────────────────────── */
  const validate = (): boolean => {
    setError('');

    if (isLogin) {
      if (!email || !password) {
        setError(locale === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError(locale === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email address');
        return false;
      }
    } else {
      if (!name || !email || !password) {
        setError(locale === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError(locale === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email address');
        return false;
      }
      if (password.length < 6) {
        setError(locale === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
        return false;
      }
      if (password !== confirmPassword) {
        setError(locale === 'ar' ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
        return false;
      }
      if (role === 'provider' && !companyName) {
        setError(locale === 'ar' ? 'يرجى إدخال اسم الشركة' : 'Please enter company name');
        return false;
      }
    }
    return true;
  };

  /* ── Submit handler ───────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setShakeKey((k) => k + 1);
      return;
    }

    setLoading(true);
    try {
      const body = isLogin
        ? { action: 'login', email, password }
        : {
            action: 'register',
            email,
            password,
            name,
            phone,
            role,
            companyName: role === 'provider' ? companyName : undefined,
            description: role === 'provider' ? companyDesc : undefined,
            location: role === 'provider' ? companyLocation : undefined,
            wilaya: wilaya || undefined,
          };

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        const userData = data.user;
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          avatar: userData.avatar || undefined,
          phone: userData.phone || undefined,
          locale: locale,
          providerId: userData.providerId || undefined,
          providerName: userData.providerId ? userData.companyName : undefined,
          wilaya: userData.wilaya || undefined,
          createdAt: userData.createdAt || undefined,
        });
        showToast(
          isLogin
            ? (locale === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful!')
            : (locale === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!'),
          'success'
        );
        navigateTo(userData.role === 'admin' ? 'admin-dashboard' : userData.role === 'provider' ? 'provider-dashboard' : 'user-dashboard');
      } else {
        setError(data.error || t('error'));
        setShakeKey((k) => k + 1);
      }
    } catch {
      setError(t('error'));
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  /* ── Forgot password toast ────────────────────────────────────────────── */
  const handleForgotPassword = () => {
    showToast(locale === 'ar' ? 'قريباً!' : 'Coming soon!', 'info');
  };

  /* ── Input class helper ───────────────────────────────────────────────── */
  const inputClass =
    'w-full bg-purple-500/5 border border-purple-500/15 rounded-xl pe-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300';
  const inputClassWithIcon = inputClass + ' ps-10';
  const inputClassWithIconEnd = inputClass + ' ps-10 pe-10';

  /* ═══════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-16">
      {/* ═══ Background: 3 Floating Purple Orbs ═══ */}
      <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-orbit-1 pointer-events-none" />
      <div className="absolute bottom-1/3 end-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] animate-orbit-2 pointer-events-none" />
      <div className="absolute top-1/2 end-1/3 w-72 h-72 bg-purple-600/10 rounded-full blur-[80px] animate-orbit-3 pointer-events-none" />

      {/* Subtle gold accent */}
      <div className="absolute bottom-1/4 start-1/3 w-64 h-64 bg-gold/5 rounded-full blur-[100px] animate-float-2 pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login-card' : 'register-card'}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 w-full max-w-md"
        >
          {/* ═══ Logo ═══ */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center mb-8"
          >
            <button onClick={() => navigateTo('home')} className="inline-flex items-center gap-2 group">
              <img src="/images/logo.png" alt="REVIVE" className="w-14 h-14 rounded-xl" />
            </button>
            <h1 className="text-2xl font-black text-gradient-purple mt-4">
              {isLogin ? t('loginTitle') : t('registerTitle')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin
                ? (locale === 'ar' ? 'مرحباً بعودتك، سجل دخولك للمتابعة' : 'Welcome back, sign in to continue')
                : (locale === 'ar' ? 'أنشئ حسابك الجديد وانضم إلينا' : 'Create your new account and join us')}
            </p>
          </motion.div>

          {/* ═══ Glass Card ═══ */}
          <div key={shakeKey} className={shakeKey > 0 ? 'animate-shake' : ''}>
            <motion.div
              layout
              className={`glass rounded-3xl p-8 border border-purple-500/15 relative overflow-hidden`}
            >
              {/* 2px purple gradient top border */}
              <div className="absolute top-0 start-8 end-8 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full" />

              {/* card-ornament subtle effect via pseudo-element approximation */}
              <div className="absolute bottom-0 start-8 end-8 h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent rounded-full" />

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">

                {/* ════════ LOGIN MODE ════════ */}
                {isLogin && (
                  <>
                    {/* Email */}
                    <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                      <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{t('email')}</label>
                      <div className="relative purple-glow-focus rounded-xl">
                        <Mail className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('email')}
                          className={inputClassWithIcon}
                          autoComplete="email"
                        />
                      </div>
                    </motion.div>

                    {/* Password */}
                    <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                      <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{t('password')}</label>
                      <div className="relative purple-glow-focus rounded-xl">
                        <Lock className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t('password')}
                          className={inputClassWithIconEnd}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-purple-400 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}

                {/* ════════ REGISTER MODE ════════ */}
                {!isLogin && (
                  <>
                    {/* Name */}
                    <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                      <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                        {t('name')} <span className="text-purple-400">*</span>
                      </label>
                      <div className="relative purple-glow-focus rounded-xl">
                        <User className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t('name')}
                          className={inputClassWithIcon}
                          autoComplete="name"
                        />
                      </div>
                    </motion.div>

                    {/* Email */}
                    <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                      <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                        {t('email')} <span className="text-purple-400">*</span>
                      </label>
                      <div className="relative purple-glow-focus rounded-xl">
                        <Mail className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('email')}
                          className={inputClassWithIcon}
                          autoComplete="email"
                        />
                      </div>
                    </motion.div>

                    {/* Phone (optional) */}
                    <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                      <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                        {t('phone')}{' '}
                        <span className="text-[10px] text-muted-foreground/60">
                          ({locale === 'ar' ? 'اختياري' : 'optional'})
                        </span>
                      </label>
                      <div className="relative purple-glow-focus rounded-xl">
                        <Phone className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={t('phone')}
                          className={inputClassWithIcon}
                          autoComplete="tel"
                        />
                      </div>
                    </motion.div>

                    {/* Wilaya Dropdown */}
                    <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
                      <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                        {t('wilaya')}{' '}
                        <span className="text-[10px] text-muted-foreground/60">
                          ({locale === 'ar' ? 'اختياري' : 'optional'})
                        </span>
                      </label>
                      <div className="relative">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setShowWilayaDropdown(!showWilayaDropdown)}
                          className="w-full bg-purple-500/5 border border-purple-500/15 rounded-xl pe-4 py-3 text-sm text-foreground focus:outline-none focus:border-purple-500/50 transition-all duration-300 ps-10 text-start flex items-center justify-between"
                        >
                          <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <span className={wilaya ? 'text-foreground' : 'text-muted-foreground'}>
                            {wilaya
                              ? (locale === 'ar'
                                ? WILAYAS.find(w => w.code === wilaya)?.nameAr
                                : WILAYAS.find(w => w.code === wilaya)?.nameEn)
                              : (locale === 'ar' ? 'اختر ولايتك' : 'Select your wilaya')}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${showWilayaDropdown ? 'rotate-180' : ''}`} />
                        </motion.button>
                        <AnimatePresence>
                          {showWilayaDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-2 w-full glass rounded-xl border border-purple-500/20 shadow-2xl z-30 overflow-hidden`}
                            >
                              <div className="p-2">
                                <input
                                  type="text"
                                  value={wilayaSearch}
                                  onChange={(e) => setWilayaSearch(e.target.value)}
                                  placeholder={locale === 'ar' ? 'ابحث عن ولاية...' : 'Search wilaya...'}
                                  className="w-full bg-purple-500/5 border border-purple-500/10 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/30 mb-1"
                                />
                              </div>
                              <div className="max-h-48 overflow-y-auto scrollbar-none">
                                {WILAYAS.filter(w =>
                                  !wilayaSearch ||
                                  w.nameAr.includes(wilayaSearch) ||
                                  w.nameEn.toLowerCase().includes(wilayaSearch.toLowerCase()) ||
                                  w.code.includes(wilayaSearch)
                                ).map(w => (
                                  <button
                                    key={w.code}
                                    type="button"
                                    onClick={() => { setWilaya(w.code); setShowWilayaDropdown(false); setWilayaSearch(''); }}
                                    className={`w-full text-start px-4 py-2 text-xs transition-all flex items-center gap-2 ${
                                      wilaya === w.code
                                        ? 'bg-purple-500/15 text-purple-300 font-semibold'
                                        : 'text-muted-foreground hover:text-purple-300 hover:bg-purple-500/5'
                                    }`}
                                  >
                                    <span className="text-[10px] text-muted-foreground w-6">{w.code}</span>
                                    <span>{locale === 'ar' ? w.nameAr : w.nameEn}</span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    {/* Password */}
                    <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
                      <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                        {t('password')} <span className="text-purple-400">*</span>
                      </label>
                      <div className="relative purple-glow-focus rounded-xl">
                        <Lock className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t('password')}
                          className={inputClassWithIconEnd}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-purple-400 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Confirm Password */}
                    <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
                      <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                        {t('confirmPassword')} <span className="text-purple-400">*</span>
                      </label>
                      <div className="relative purple-glow-focus rounded-xl">
                        <Lock className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={t('confirmPassword')}
                          className={inputClassWithIcon}
                          autoComplete="new-password"
                        />
                      </div>
                    </motion.div>

                    {/* ── Role Selector ─────────────────────────────────── */}
                    <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
                      <label className="text-xs text-muted-foreground mb-2 block font-medium">{t('role')}</label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* User card */}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setRole('user')}
                          className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                            role === 'user'
                              ? 'border-purple-500/50 bg-purple-500/10 glow-purple'
                              : 'border-purple-500/10 bg-purple-500/[0.02] hover:border-purple-500/30'
                          }`}
                        >
                          <User className={`w-7 h-7 mx-auto mb-2 transition-colors ${
                            role === 'user' ? 'text-purple-400' : 'text-muted-foreground'
                          }`} />
                          <span className={`text-xs font-bold transition-colors ${
                            role === 'user' ? 'text-purple-300' : 'text-muted-foreground'
                          }`}>{t('userRole')}</span>
                        </motion.button>

                        {/* Provider card */}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setRole('provider')}
                          className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                            role === 'provider'
                              ? 'border-gold/50 bg-gold/10 glow-gold'
                              : 'border-purple-500/10 bg-purple-500/[0.02] hover:border-purple-500/30'
                          }`}
                        >
                          <Briefcase className={`w-7 h-7 mx-auto mb-2 transition-colors ${
                            role === 'provider' ? 'text-gold' : 'text-muted-foreground'
                          }`} />
                          <span className={`text-xs font-bold transition-colors ${
                            role === 'provider' ? 'text-gold' : 'text-muted-foreground'
                          }`}>{t('providerRole')}</span>
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* ── Provider Fields (AnimatePresence slide down) ── */}
                    <AnimatePresence>
                      {role === 'provider' && (
                        <motion.div
                          variants={providerFieldsVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="space-y-4 overflow-hidden"
                        >
                          {/* Company Name */}
                          <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                              {locale === 'ar' ? 'اسم الشركة' : 'Company Name'} <span className="text-purple-400">*</span>
                            </label>
                            <div className="relative purple-glow-focus rounded-xl">
                              <Briefcase className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                              <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder={locale === 'ar' ? 'أدخل اسم الشركة' : 'Enter company name'}
                                className={inputClassWithIcon}
                              />
                            </div>
                          </div>

                          {/* Description textarea */}
                          <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                              {t('serviceDescription')}
                            </label>
                            <textarea
                              value={companyDesc}
                              onChange={(e) => setCompanyDesc(e.target.value)}
                              placeholder={locale === 'ar' ? 'وصف مختصر عن شركتك وخدماتك...' : 'Brief description of your company and services...'}
                              rows={3}
                              className="w-full bg-purple-500/5 border border-purple-500/15 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all resize-none"
                            />
                          </div>

                          {/* Location */}
                          <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                              {t('serviceLocation')}
                            </label>
                            <div className="relative purple-glow-focus rounded-xl">
                              <MapPin className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                              <input
                                type="text"
                                value={companyLocation}
                                onChange={(e) => setCompanyLocation(e.target.value)}
                                placeholder={locale === 'ar' ? 'موقع الشركة' : 'Company location'}
                                className={inputClassWithIcon}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* ═══ Error Message ═══ */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key={error}
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ═══ Submit Button ═══ */}
                <motion.div custom={10} variants={fieldVariants} initial="hidden" animate="visible">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full btn-purple-gradient btn-shimmer py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 relative overflow-hidden"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {isLogin ? t('loginBtn') : t('registerBtn')}
                        <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              {/* ═══ Switch Auth Mode ═══ */}
              <div className="mt-6 text-center relative z-10">
                <p className="text-xs text-muted-foreground">
                  {isLogin ? t('noAccount') : t('hasAccount')}{' '}
                  <button
                    onClick={() => { navigateTo(isLogin ? 'register' : 'login'); setError(''); }}
                    className="text-purple-400 hover:text-purple-300 font-bold transition-colors"
                  >
                    {isLogin
                      ? (locale === 'ar' ? 'انضم إلى REVIVE' : 'Join REVIVE')
                      : t('loginBtn')}
                  </button>
                </p>
              </div>

              {/* Forgot password (login only) */}
              {isLogin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3 text-center relative z-10"
                >
                  <button
                    onClick={handleForgotPassword}
                    className="text-xs text-purple-400/60 hover:text-purple-400 transition-colors"
                  >
                    {t('forgotPassword')}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
