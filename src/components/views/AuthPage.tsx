'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Briefcase,
  MapPin,
  Building,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAppStore, type Page } from '@/lib/store';

/* ══════════════════════════════════════════════════════════════════════
   CONFETTI PARTICLES – success burst
   ══════════════════════════════════════════════════════════════════════ */
function ConfettiParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        x: Math.random() * 300 - 150,
        y: Math.random() * 200 - 100,
        color: ['#D4A853', '#F0D78C', '#B8860B', '#0D9488', '#99F6E4', '#f59e0b'][
          Math.floor(Math.random() * 6)
        ],
        size: Math.random() * 6 + 4,
        delay: Math.random() * 0.4,
        duration: Math.random() * 1 + 1,
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '40%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: [0, 1.2, 0.5],
            x: p.x,
            y: p.y + 60,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ANIMATED BACKGROUND – large "H" watermark + floating orbs
   ══════════════════════════════════════════════════════════════════════ */
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Large "H" watermark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-black text-[28rem] leading-none select-none"
          style={{
            background: 'linear-gradient(135deg, rgba(212,168,83,0.06) 0%, rgba(240,215,140,0.03) 50%, rgba(184,134,11,0.06) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          H
        </span>
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-[10%] left-[15%] w-[420px] h-[420px] rounded-full bg-gradient-to-br from-gold/[0.12] to-gold-light/[0.04] blur-[100px] animate-orbit-1" />
      <div className="absolute top-[55%] right-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-emerald-tourism/[0.10] to-emerald-light/[0.03] blur-[100px] animate-orbit-2" />
      <div className="absolute bottom-[5%] left-[40%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-gold-dark/[0.08] to-amber-400/[0.04] blur-[80px] animate-orbit-3" />
      <div className="absolute top-[30%] right-[30%] w-[250px] h-[250px] rounded-full bg-gradient-to-br from-gold-light/[0.06] to-transparent blur-[90px] animate-orbit-4" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,168,83,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,83,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PASSWORD INPUT – eye toggle
   ══════════════════════════════════════════════════════════════════════ */
function PasswordInput({
  value,
  onChange,
  placeholder,
  label,
  icon: Icon = Lock,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  icon?: React.ElementType;
  error?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground/70 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-gold" />
        {label}
      </Label>
      <div className="relative group">
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pe-10 h-11 bg-white/[0.04] border-white/10 backdrop-blur-sm focus:border-gold/40 focus:ring-gold/20 transition-all duration-200 placeholder:text-foreground/25"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-gold transition-colors duration-200"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 ps-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FORM FIELD – glass style input
   ══════════════════════════════════════════════════════════════════════ */
function GlassInput({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground/70 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-gold" />
        {label}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 bg-white/[0.04] border-white/10 backdrop-blur-sm focus:border-gold/40 focus:ring-gold/20 transition-all duration-200 placeholder:text-foreground/25"
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 ps-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STAGGER VARIANTS
   ══════════════════════════════════════════════════════════════════════ */
const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  },
};

/* ══════════════════════════════════════════════════════════════════════
   LOGIN VIEW
   ══════════════════════════════════════════════════════════════════════ */
function LoginForm({ onSwitch }: { onSwitch: (p: Page) => void }) {
  const { navigateTo, showToast, setUser, t, isRTL, locale } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [success, setSuccess] = useState(false);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 700);
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!email.trim()) {
      showToast(locale === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Email is required', 'error');
      triggerShake();
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast(locale === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email format', 'error');
      triggerShake();
      return false;
    }
    if (!password.trim()) {
      showToast(t('password') + (locale === 'ar' ? ' مطلوب' : ' is required'), 'error');
      triggerShake();
      return false;
    }
    return true;
  }, [email, password, locale, showToast, t, triggerShake]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      setLoading(true);
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email: email.trim(), password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        setSuccess(true);
        setTimeout(() => {
          setUser(data.user);
          showToast(t('success'), 'success');
          navigateTo('home');
        }, 1200);
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : String(err), 'error');
        triggerShake();
      } finally {
        setLoading(false);
      }
    },
    [email, password, validateForm, setUser, showToast, t, navigateTo, triggerShake]
  );

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRTL ? -40 : 40 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
    >
      <AnimatePresence>
        {success && <ConfettiParticles />}
      </AnimatePresence>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="flex justify-center mb-6"
      >
        <div className="relative animate-float">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden animate-pulse-gold">
            <img
              src="/images/h-logo.png"
              alt="H"
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Sparkles className="h-3 w-3 text-gold" />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h1 className="text-3xl font-bold text-shimmer-gold mb-2">
          {locale === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back'}
        </h1>
        <p className="text-sm text-foreground/50">
          {locale === 'ar' ? 'سجّل دخولك لمتابعة رحلتك' : 'Sign in to continue your journey'}
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        onSubmit={handleSubmit}
        className={`space-y-5 ${shaking ? 'animate-shake' : ''}`}
      >
        <motion.div variants={staggerItem}>
          <GlassInput
            label={t('email')}
            icon={Mail}
            value={email}
            onChange={setEmail}
            placeholder="example@email.com"
            type="email"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            label={t('password')}
          />
        </motion.div>

        {/* Forgot password */}
        <motion.div variants={staggerItem} className="flex justify-end">
          <button
            type="button"
            onClick={() => showToast(locale === 'ar' ? 'قريباً' : 'Coming soon', 'info')}
            className="text-xs text-gold/70 hover:text-gold transition-colors duration-200"
          >
            {t('forgotPassword')}
          </button>
        </motion.div>

        {/* Sign In Button */}
        <motion.div variants={staggerItem}>
          <Button
            type="submit"
            disabled={loading || success}
            className="relative w-full h-12 rounded-xl font-semibold text-base overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            style={{
              background: success
                ? 'linear-gradient(135deg, #059669, #0D9488)'
                : 'linear-gradient(135deg, #D4A853, #B8860B, #f59e0b)',
              backgroundSize: '200% auto',
            }}
          >
            {loading && (
              <span className="animate-shimmer-btn absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
            {success ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
              </motion.span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {t('loginBtn')}
                {!loading && <Arrow className="h-4 w-4 rtl:rotate-180" />}
              </span>
            )}
          </Button>
        </motion.div>

        {/* Divider */}
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-3">
            <Separator className="flex-1 bg-white/10" />
            <span className="text-xs text-foreground/30 uppercase tracking-wider">
              {locale === 'ar' ? 'أو تابع بـ' : 'or continue with'}
            </span>
            <Separator className="flex-1 bg-white/10" />
          </div>
        </motion.div>

        {/* Register link */}
        <motion.div variants={staggerItem} className="text-center">
          <p className="text-sm text-foreground/45">
            {t('noAccount')}{' '}
            <button
              type="button"
              onClick={() => onSwitch('register')}
              className="text-gold hover:text-gold-light font-semibold transition-colors duration-200"
            >
              {locale === 'ar' ? 'انضم إلى H' : 'Join H'}
            </button>
          </p>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ROLE CARD – Traveler / Provider selector
   ══════════════════════════════════════════════════════════════════════ */
function RoleCard({
  selected,
  onClick,
  icon: Icon,
  title,
  subtitle,
  delay,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  delay: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`relative flex-1 rounded-xl p-4 sm:p-5 text-center cursor-pointer border-2 transition-all duration-300 overflow-hidden group ${
        selected
          ? 'border-gold bg-gradient-to-b from-gold/10 to-gold/[0.03] shadow-lg shadow-gold/10'
          : 'border-white/10 bg-white/[0.02] hover:border-gold/30 hover:bg-white/[0.04]'
      }`}
    >
      {/* Selected checkmark */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute top-2.5 end-2.5 w-5 h-5 rounded-full bg-gold flex items-center justify-center"
          >
            <Check className="h-3 w-3 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gold shimmer on hover/selected */}
      {selected && (
        <motion.div
          layoutId="role-glow"
          className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent"
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        />
      )}

      <div className="relative z-10">
        <motion.div
          animate={{ rotate: selected ? 360 : 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
            selected
              ? 'bg-gold/20 shadow-md shadow-gold/20'
              : 'bg-white/[0.06] group-hover:bg-gold/10'
          }`}
        >
          <Icon className={`h-6 w-6 transition-colors duration-300 ${selected ? 'text-gold' : 'text-foreground/40 group-hover:text-gold/70'}`} />
        </motion.div>
        <p className={`text-sm font-semibold mb-0.5 transition-colors duration-300 ${selected ? 'text-gold' : 'text-foreground/70'}`}>
          {title}
        </p>
        <p className="text-xs text-foreground/35">{subtitle}</p>
      </div>
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   REGISTER VIEW
   ══════════════════════════════════════════════════════════════════════ */
function RegisterForm({ onSwitch }: { onSwitch: (p: Page) => void }) {
  const { navigateTo, showToast, setUser, t, isRTL, locale } = useAppStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'provider'>('user');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 700);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = locale === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    }
    if (!email.trim()) {
      newErrors.email = locale === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = locale === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email format';
    }
    if (!password.trim()) {
      newErrors.password = locale === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required';
    } else if (password.length < 6) {
      newErrors.password =
        locale === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword =
        locale === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
    }
    if (role === 'provider' && !companyName.trim()) {
      newErrors.companyName = locale === 'ar' ? 'اسم الشركة مطلوب' : 'Company name is required';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      triggerShake();
      return false;
    }
    return true;
  }, [name, email, password, confirmPassword, role, companyName, locale, triggerShake]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      setLoading(true);
      try {
        const body: Record<string, string> = {
          action: 'register',
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        };
        if (phone.trim()) body.phone = phone.trim();
        if (role === 'provider') {
          body.companyName = companyName.trim();
          body.description = description.trim();
          body.location = location.trim();
        }

        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        setSuccess(true);
        setTimeout(() => {
          setUser(data.user);
          showToast(t('success'), 'success');
          navigateTo('home');
        }, 1200);
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : String(err), 'error');
        triggerShake();
      } finally {
        setLoading(false);
      }
    },
    [name, email, phone, password, role, companyName, description, location, validateForm, setUser, showToast, t, navigateTo, triggerShake]
  );

  // Clear individual field errors on change
  const clearError = useCallback(
    (field: string) => {
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  return (
    <motion.div
      key="register"
      initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRTL ? 40 : -40 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
    >
      <AnimatePresence>{success && <ConfettiParticles />}</AnimatePresence>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: 10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="flex justify-center mb-6"
      >
        <div className="relative animate-float">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden animate-pulse-gold">
            <img
              src="/images/h-logo.png"
              alt="H"
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Sparkles className="h-3 w-3 text-gold" />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h1 className="text-3xl font-bold text-shimmer-gold mb-2">
          {locale === 'ar' ? 'انضم إلى H' : 'Join H'}
        </h1>
        <p className="text-sm text-foreground/50">
          {locale === 'ar'
            ? 'أنشئ حسابك وابدأ رحلتك الاستكشافية'
            : 'Create your account and start your journey'}
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        onSubmit={handleSubmit}
        className={`space-y-4 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar ${shaking ? 'animate-shake' : ''}`}
      >
        {/* Name */}
        <motion.div variants={staggerItem}>
          <GlassInput
            label={t('name')}
            icon={User}
            value={name}
            onChange={(v) => { setName(v); clearError('name'); }}
            placeholder={t('name')}
            error={errors.name}
          />
        </motion.div>

        {/* Email */}
        <motion.div variants={staggerItem}>
          <GlassInput
            label={t('email')}
            icon={Mail}
            value={email}
            onChange={(v) => { setEmail(v); clearError('email'); }}
            placeholder="example@email.com"
            type="email"
            error={errors.email}
          />
        </motion.div>

        {/* Phone (optional) */}
        <motion.div variants={staggerItem}>
          <GlassInput
            label={`${t('phone')} (${locale === 'ar' ? 'اختياري' : 'optional'})`}
            icon={Phone}
            value={phone}
            onChange={setPhone}
            placeholder="+966 5XX XXX XXXX"
            type="tel"
          />
        </motion.div>

        {/* Password */}
        <motion.div variants={staggerItem}>
          <PasswordInput
            value={password}
            onChange={(v) => { setPassword(v); clearError('password'); }}
            placeholder="••••••••"
            label={t('password')}
            error={errors.password}
          />
        </motion.div>

        {/* Confirm Password */}
        <motion.div variants={staggerItem}>
          <PasswordInput
            value={confirmPassword}
            onChange={(v) => { setConfirmPassword(v); clearError('confirmPassword'); }}
            placeholder="••••••••"
            label={t('confirmPassword')}
            error={errors.confirmPassword}
          />
        </motion.div>

        {/* Role Selector */}
        <motion.div variants={staggerItem} className="space-y-2 pt-1">
          <Label className="text-sm font-medium text-foreground/70 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            {t('role')}
          </Label>
          <div className="flex gap-3">
            <RoleCard
              selected={role === 'user'}
              onClick={() => setRole('user')}
              icon={User}
              title={t('userRole')}
              subtitle={locale === 'ar' ? 'استكشف التجارب' : 'Explore experiences'}
              delay={0}
            />
            <RoleCard
              selected={role === 'provider'}
              onClick={() => setRole('provider')}
              icon={Briefcase}
              title={t('providerRole')}
              subtitle={locale === 'ar' ? 'شارك خدماتك' : 'Share your services'}
              delay={0.07}
            />
          </div>
        </motion.div>

        {/* Provider fields – animated slide-down */}
        <AnimatePresence>
          {role === 'provider' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-1">
                <Separator className="bg-white/10" />

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-semibold text-gold/70 uppercase tracking-wider flex items-center gap-2"
                >
                  <Building className="h-3.5 w-3.5" />
                  {locale === 'ar' ? 'تفاصيل مزود الخدمة' : 'Provider Details'}
                </motion.p>

                {/* Company Name */}
                <GlassInput
                  label={locale === 'ar' ? 'اسم الشركة' : 'Company Name'}
                  icon={Building}
                  value={companyName}
                  onChange={(v) => { setCompanyName(v); clearError('companyName'); }}
                  placeholder={locale === 'ar' ? 'اسم شركتك' : 'Your company name'}
                  error={errors.companyName}
                />

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-gold" />
                    {t('serviceDescription')}
                  </Label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('serviceDescription')}
                    rows={3}
                    className="flex w-full rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-4 py-3 text-sm ring-offset-background placeholder:text-foreground/25 focus-visible:outline-none focus-visible:border-gold/40 focus-visible:ring-1 focus-visible:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200"
                  />
                </div>

                {/* Location */}
                <GlassInput
                  label={t('location')}
                  icon={MapPin}
                  value={location}
                  onChange={setLocation}
                  placeholder={t('location')}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Account Button */}
        <motion.div variants={staggerItem} className="pt-2">
          <Button
            type="submit"
            disabled={loading || success}
            className="relative w-full h-12 rounded-xl font-semibold text-base overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            style={{
              background: success
                ? 'linear-gradient(135deg, #059669, #0D9488)'
                : 'linear-gradient(135deg, #D4A853, #B8860B, #f59e0b)',
              backgroundSize: '200% auto',
            }}
          >
            {loading && (
              <span className="animate-shimmer-btn absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
            {success ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
              </motion.span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {t('registerBtn')}
                {!loading && (
                  isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />
                )}
              </span>
            )}
          </Button>
        </motion.div>

        {/* Login link */}
        <motion.div variants={staggerItem} className="text-center pb-1">
          <p className="text-sm text-foreground/45">
            {t('hasAccount')}{' '}
            <button
              type="button"
              onClick={() => onSwitch('login')}
              className="text-gold hover:text-gold-light font-semibold transition-colors duration-200"
            >
              {t('login')}
            </button>
          </p>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN AUTH PAGE
   ══════════════════════════════════════════════════════════════════════ */
export default function AuthPage() {
  const { currentPage, navigateTo, t, isRTL } = useAppStore();

  const isLogin = currentPage === 'login';

  const handleSwitch = useCallback((page: Page) => {
    navigateTo(page);
  }, [navigateTo]);

  const Chevron = isRTL ? ArrowRight : ArrowLeft;

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated background */}
      <AnimatedBackground />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(212,168,83,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(13,148,136,0.04) 0%, transparent 50%)',
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.7,
          ease: [0.23, 1, 0.32, 1],
        }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Glass card with gold top border */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow:
              '0 0 0 1px rgba(212,168,83,0.05), 0 20px 60px -12px rgba(0,0,0,0.15), 0 0 40px rgba(212,168,83,0.06)',
          }}
        >
          {/* Gold gradient top border */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent, #D4A853, #F0D78C, #D4A853, transparent)',
            }}
          />

          {/* Card content */}
          <div className="px-6 sm:px-8 pt-8 pb-8">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <LoginForm onSwitch={handleSwitch} />
              ) : (
                <RegisterForm onSwitch={handleSwitch} />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Back to home link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-1.5 text-sm text-foreground/35 hover:text-foreground/60 transition-colors duration-200 group"
          >
            <Chevron className="h-4 w-4 group-hover:translate-x-[-3px] transition-transform rtl:rotate-180 rtl:group-hover:translate-x-[3px]" />
            {t('back')}
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
