'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Send,
  Mail,
  Heart,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';

/* ─── data ─── */
const quickLinks = [
  { key: 'home' as const, page: 'home' as const },
  { key: 'services' as const, page: 'services' as const },
];

const supportLinks = [
  { key: 'faq' as const },
  { key: 'contactUs' as const },
  { key: 'termsPrivacy' as const },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

/* ─── animation helpers ─── */
const columnVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const bottomVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.6, duration: 0.5, ease: 'easeOut' },
  },
};

/* ─── dot-pattern SVG (reusable) ─── */
function DotPattern() {
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none opacity-[0.04]"
      aria-hidden="true"
    >
      <defs>
        <pattern id="footer-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#footer-dots)" />
    </svg>
  );
}

/* ─── glass card wrapper ─── */
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`
        relative rounded-2xl border border-white/[0.07]
        bg-white/[0.04] backdrop-blur-md
        shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]
        p-5
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function Footer() {
  const { t, navigateTo, showToast, isRTL } = useAppStore();
  const [email, setEmail] = useState('');
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: '-60px' });

  const handleSubscribe = () => {
    if (!email || !email.includes('@')) {
      showToast(
        isRTL ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address',
        'error'
      );
      return;
    }
    showToast(
      isRTL ? 'تم الاشتراك في النشرة البريدية بنجاح!' : 'Successfully subscribed to newsletter!',
      'success'
    );
    setEmail('');
  };

  const handleQuickLink = (page: string) => {
    navigateTo(page as never);
  };

  return (
    <footer
      ref={footerRef}
      className="relative mt-auto overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #022c22 0%, #011a13 40%, #050807 100%)',
      }}
    >
      {/* gradient + dot overlay */}
      <DotPattern />

      {/* ── top golden accent line ── */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      {/* ── main content ── */}
      <div className="container relative mx-auto px-4 md:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* ──── Column 1: Logo & Social ──── */}
          <motion.div
            custom={0}
            variants={columnVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <GlassCard className="space-y-5">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
                  <img
                    src="/images/logo.png"
                    alt="H"
                    className="absolute inset-0 h-full w-full rounded-xl object-cover opacity-30 mix-blend-overlay"
                  />
                  <span className="relative text-2xl font-extrabold text-white drop-shadow-md">
                    H
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white">H</h3>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-amber-400/70 font-medium">
                    {isRTL ? 'تجربة سياحية فاخرة' : 'Premium Tourism'}
                  </p>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-sm leading-relaxed text-emerald-100/60">
                {isRTL
                  ? 'اكتشف أجمل الوجهات السياحية مع H. نقدم لكم أفضل الخدمات السياحية بأسعار مناسبة مع مزودين موثوقين.'
                  : 'Discover breathtaking destinations with H. Premium tourism services at competitive prices with trusted providers.'}
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-1">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-colors duration-300 hover:border-amber-400/40 hover:bg-amber-400/10"
                    whileHover={{ scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    {/* hover glow ring */}
                    <span className="absolute inset-0 rounded-full bg-amber-400/0 blur-md transition-all duration-300 group-hover:bg-amber-400/20" />
                    <social.icon className="relative h-[18px] w-[18px] text-white/70 transition-colors duration-300 group-hover:text-amber-400" />
                  </motion.a>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* ──── Column 2: Quick Links ──── */}
          <motion.div
            custom={1}
            variants={columnVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <GlassCard className="h-full">
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-400/80">
                {t('categories')}
              </h4>
              <ul className="space-y-1">
                {quickLinks.map((link) => (
                  <li key={link.key}>
                    <motion.button
                      onClick={() => handleQuickLink(link.page)}
                      className="group flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-sm text-emerald-100/65 transition-colors duration-200 hover:bg-white/[0.04] hover:text-amber-300"
                      whileHover={{ x: isRTL ? -4 : 4 }}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 rtl:rotate-90" />
                      <span>{t(link.key)}</span>
                    </motion.button>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>

          {/* ──── Column 3: Support ──── */}
          <motion.div
            custom={2}
            variants={columnVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <GlassCard className="h-full">
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-400/80">
                {isRTL ? 'الدعم' : 'Support'}
              </h4>
              <ul className="space-y-1">
                {supportLinks.map((link) => (
                  <li key={link.key}>
                    <motion.button
                      onClick={() => handleQuickLink('home')}
                      className="group flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-sm text-emerald-100/65 transition-colors duration-200 hover:bg-white/[0.04] hover:text-amber-300"
                      whileHover={{ x: isRTL ? -4 : 4 }}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 rtl:rotate-90" />
                      <span>{t(link.key)}</span>
                    </motion.button>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>

          {/* ──── Column 4: Newsletter ──── */}
          <motion.div
            custom={3}
            variants={columnVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <GlassCard className="h-full space-y-4">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-400/80">
                {t('newsletter')}
              </h4>
              <p className="text-sm leading-relaxed text-emerald-100/55">
                {isRTL
                  ? 'اشترك في نشرتنا البريدية لتصلك أحدث العروض والأخبار السياحية.'
                  : 'Subscribe to our newsletter for the latest offers and tourism news.'}
              </p>

              {/* email input + send */}
              <div className="flex gap-2 pt-1">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-amber-400/30" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('subscribeEmail')}
                    className="h-11 rounded-xl border-white/[0.08] bg-white/[0.05] ps-9 text-sm text-white placeholder:text-emerald-200/30 backdrop-blur-sm transition-colors focus:border-amber-400/40 focus:ring-amber-400/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                  />
                </div>
                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                  <Button
                    onClick={handleSubscribe}
                    size="icon"
                    className="h-11 w-11 shrink-0 rounded-xl shadow-lg shadow-amber-500/25 transition-shadow duration-300 hover:shadow-amber-500/40"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    }}
                  >
                    <Send className="h-4 w-4 text-white" />
                    <span className="sr-only">{t('subscribe')}</span>
                  </Button>
                </motion.div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* ── bottom bar ── */}
      <div className="relative border-t border-white/[0.06]">
        <motion.div
          variants={bottomVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-5 sm:flex-row md:px-6"
        >
          <p className="text-xs text-emerald-200/40">
            © {new Date().getFullYear()} H. {t('copyright')}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-emerald-200/40">
            {isRTL ? 'صُمم' : 'Designed with'}
            <Heart className="h-3 w-3 fill-red-400/60 text-red-400/60" />
            {isRTL ? 'بكل حب لاستكشاف العالم' : 'for explorers'}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
