'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Building2,
  MapPin,
  FileText,
  Globe,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useAppStore, type Page } from '@/lib/store';

// ── Decorative floating shapes ──────────────────────────────────────────────
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-gold/20 to-gold-light/10 animate-float" />
      <div className="absolute top-1/4 -left-10 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-tourism/15 to-emerald-light/10 animate-float-delayed" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-gold-dark/10 to-gold/5 animate-float rounded-lg rotate-45" />
      <div className="absolute top-1/2 left-1/3 w-16 h-40 bg-gradient-to-b from-emerald-tourism/10 to-transparent animate-float-delayed rounded-xl" />
      <div className="absolute bottom-10 left-10 grid grid-cols-3 gap-3 opacity-20">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-gold" />
        ))}
      </div>
    </div>
  );
}

// ── Form field wrapper ──────────────────────────────────────────────────────
function FormField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
        <Icon className="h-4 w-4 text-gold" />
        {label}
      </Label>
      {children}
    </div>
  );
}

// ── Password input with toggle ──────────────────────────────────────────────
function PasswordInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <FormField label={label} icon={Lock}>
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pe-10"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </FormField>
  );
}

// ── Login form ──────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }: { onSwitch: (p: Page) => void }) {
  const { navigateTo, showToast, setUser, t, isRTL } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast(t('email') + ' / ' + t('password') + ' required', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
      showToast(t('success'), 'success');
      navigateTo('home');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      key="login"
      initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRTL ? -30 : 30 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <FormField label={t('email')} icon={Mail}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
        />
      </FormField>

      <PasswordInput
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        label={t('password')}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => showToast(t('forgotPassword') + ' – Coming soon', 'info')}
          className="text-sm text-emerald-tourism hover:text-emerald-dark transition-colors"
        >
          {t('forgotPassword')}
        </button>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-emerald-tourism to-emerald-dark hover:from-emerald-dark hover:to-emerald-tourism text-white font-semibold h-11 text-base transition-all duration-300 shadow-lg hover:shadow-xl"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin me-2" /> : null}
        {t('loginBtn')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <button
          type="button"
          onClick={() => onSwitch('register')}
          className="text-emerald-tourism hover:text-emerald-dark font-semibold transition-colors"
        >
          {t('register')}
        </button>
      </p>
    </motion.form>
  );
}

// ── Register form ───────────────────────────────────────────────────────────
function RegisterForm({ onSwitch }: { onSwitch: (p: Page) => void }) {
  const { navigateTo, showToast, setUser, t, isRTL } = useAppStore();

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast(t('name') + ' / ' + t('email') + ' / ' + t('password') + ' required', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast(t('confirmPassword') + ' mismatch', 'error');
      return;
    }
    if (role === 'provider' && !companyName.trim()) {
      showToast('Company name required for providers', 'error');
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
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
      setUser(data.user);
      showToast(t('success'), 'success');
      navigateTo('home');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      key="register"
      initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRTL ? 30 : -30 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <FormField label={t('name')} icon={User}>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('name')}
        />
      </FormField>

      <FormField label={t('email')} icon={Mail}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
        />
      </FormField>

      <FormField label={t('phone')} icon={Phone}>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+966 5XX XXX XXXX"
        />
      </FormField>

      <PasswordInput
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        label={t('password')}
      />

      <PasswordInput
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="••••••••"
        label={t('confirmPassword')}
      />

      {/* Role selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
          <Globe className="h-4 w-4 text-gold" />
          {t('role')}
        </Label>
        <RadioGroup
          value={role}
          onValueChange={(v) => setRole(v as 'user' | 'provider')}
          className="flex gap-3"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <label
            htmlFor="role-user"
            className={`flex items-center gap-2 flex-1 rounded-lg border-2 px-4 py-3 cursor-pointer transition-all duration-200 ${
              role === 'user'
                ? 'border-emerald-tourism bg-emerald-tourism/5 shadow-sm'
                : 'border-muted hover:border-emerald-tourism/40'
            }`}
          >
            <RadioGroupItem value="user" id="role-user" />
            <User className="h-4 w-4 text-emerald-tourism" />
            <span className="text-sm font-medium">{t('userRole')}</span>
          </label>
          <label
            htmlFor="role-provider"
            className={`flex items-center gap-2 flex-1 rounded-lg border-2 px-4 py-3 cursor-pointer transition-all duration-200 ${
              role === 'provider'
                ? 'border-gold bg-gold/5 shadow-sm'
                : 'border-muted hover:border-gold/40'
            }`}
          >
            <RadioGroupItem value="provider" id="role-provider" />
            <Building2 className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium">{t('providerRole')}</span>
          </label>
        </RadioGroup>
      </div>

      {/* Provider fields (animated) */}
      <AnimatePresence>
        {role === 'provider' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2 pb-1">
              <Separator />
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gold" />
                {t('providerRole')} Details
              </p>

              <FormField label="Company Name" icon={Building2}>
                <Input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                />
              </FormField>

              <FormField label={t('serviceDescription')} icon={FileText}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('serviceDescription')}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </FormField>

              <FormField label={t('location')} icon={MapPin}>
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('location')}
                />
              </FormField>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-emerald-tourism to-emerald-dark hover:from-emerald-dark hover:to-emerald-tourism text-white font-semibold h-11 text-base transition-all duration-300 shadow-lg hover:shadow-xl"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin me-2" /> : null}
        {t('registerBtn')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <button
          type="button"
          onClick={() => onSwitch('login')}
          className="text-emerald-tourism hover:text-emerald-dark font-semibold transition-colors"
        >
          {t('login')}
        </button>
      </p>
    </motion.form>
  );
}

// ── Main AuthPage component ─────────────────────────────────────────────────
export default function AuthPage() {
  const { currentPage, navigateTo, t, isRTL } = useAppStore();

  const isLogin = currentPage === 'login';

  const handleSwitch = (page: Page) => {
    navigateTo(page);
  };

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Decorative background shapes */}
      <FloatingShapes />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(13,148,136,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(212,168,83,0.06) 0%, transparent 60%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* 3D Card */}
        <div className="card-3d">
          <div className="card-3d-inner">
            <Card className="glass shadow-2xl border-0 overflow-hidden">
              <CardHeader className="space-y-3 text-center pb-4 pt-8 px-8">
                {/* Logo / branding */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-tourism to-emerald-dark flex items-center justify-center shadow-lg"
                >
                  <Globe className="h-8 w-8 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-gradient-gold"
                >
                  {isLogin ? t('loginTitle') : t('registerTitle')}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-sm"
                >
                  {isLogin
                    ? 'Sign in to access your bookings and experiences'
                    : 'Join us and discover amazing tourism services'}
                </motion.p>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <LoginForm onSwitch={handleSwitch} />
                  ) : (
                    <RegisterForm onSwitch={handleSwitch} />
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back to home link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <Chevron className="h-4 w-4 group-hover:translate-x-[-3px] transition-transform rtl:rotate-180 rtl:group-hover:translate-x-[3px]" />
            {t('back')}
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
