'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Facebook, Twitter, Instagram, Youtube, Send, Mail,
  Heart, MapPin, Phone, Globe
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

/* ── Social links ─────────────────────────────────────────────────────────── */
const socialLinks = [
  { icon: <Facebook className="w-4 h-4" />, href: '#', label: 'Facebook' },
  { icon: <Twitter className="w-4 h-4" />, href: '#', label: 'Twitter' },
  { icon: <Instagram className="w-4 h-4" />, href: '#', label: 'Instagram' },
  { icon: <Youtube className="w-4 h-4" />, href: '#', label: 'Youtube' },
];

/* ── Quick links ──────────────────────────────────────────────────────────── */
const quickLinks = [
  { key: 'home' as const, page: 'home' as const },
  { key: 'services' as const, page: 'services' as const },
  { key: 'dashboard' as const, page: 'user-dashboard' as const },
  { key: 'becomeProvider' as const, page: 'register' as const },
];

/* ── Support links ────────────────────────────────────────────────────────── */
const supportLinks = [
  { key: 'aboutUs' as const },
  { key: 'contactUs' as const },
  { key: 'faq' as const },
  { key: 'termsPrivacy' as const },
];

/* ── Animation variants ───────────────────────────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Footer() {
  const { t, navigateTo, showToast, isRTL } = useAppStore();
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (email.trim()) {
      showToast('Subscribed successfully!', 'success');
      setEmail('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubscribe();
  };

  return (
    <footer className="relative mt-auto">
      {/* ── Top Gradient Line ──────────────────────────────────────────── */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

      {/* ── Main Footer Content ───────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0f] to-[#0d0520]">
        {/* Ambient glow orbs */}
        <div className="absolute top-0 start-1/4 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 end-1/4 w-[400px] h-[400px] bg-purple-600/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* ── Column 1: Brand ────────────────────────────────────── */}
            <motion.div
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              className="rounded-2xl bg-white/5 border border-purple-500/10 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/logo.png" alt="REVIVE" className="w-10 h-10 rounded-lg" />
                <span className="text-2xl font-black tracking-tight text-gradient-gold">
                  REVIVE
                </span>
                <span className="w-2 h-2 rounded-full bg-purple-500 pulse-glow-purple" />
              </div>
              <p className="text-sm text-gray-400/80 leading-relaxed mb-6">
                {t('heroSubtitle').slice(0, 90)}...
              </p>
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-lg border border-purple-500/15 bg-white/5 flex items-center justify-center text-gray-400 hover:text-purple-300 glow-purple transition-all duration-300"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* ── Column 2: Quick Links ──────────────────────────────── */}
            <motion.div
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              className="rounded-2xl bg-white/5 border border-purple-500/10 p-6"
            >
              <h3 className="text-sm font-bold text-gradient-purple uppercase tracking-wider mb-5">
                {t('categories')}
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.key}>
                    <button
                      onClick={() => navigateTo(link.page)}
                      className="text-sm text-gray-400/80 hover:text-purple-300 transition-all duration-300 relative group inline-flex items-center gap-2"
                    >
                      <span className="absolute start-0 top-1/2 -translate-y-1/2 w-0 h-px bg-purple-500 group-hover:w-3 transition-all duration-300" />
                      <span
                        className={`transition-all duration-300 ${
                          isRTL ? 'me-3 group-hover:me-4' : 'ms-3 group-hover:ms-4'
                        }`}
                      >
                        {t(link.key)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* ── Column 3: Support ──────────────────────────────────── */}
            <motion.div
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              className="rounded-2xl bg-white/5 border border-purple-500/10 p-6"
            >
              <h3 className="text-sm font-bold text-gradient-purple uppercase tracking-wider mb-5">
                {t('contactUs')}
              </h3>
              <ul className="space-y-3.5">
                {supportLinks.map((link) => (
                  <li key={link.key}>
                    <span className="text-sm text-gray-400/80 hover:text-purple-300 transition-colors duration-300 cursor-pointer">
                      {t(link.key)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-gray-400/70">
                  <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>{isRTL ? 'الجزائر العاصمة، الجزائر' : 'Algiers, Algeria'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-400/70">
                  <Phone className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span dir="ltr">+213 555 000 000</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-400/70">
                  <Mail className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>contact@revive.dz</span>
                </div>
              </div>
            </motion.div>

            {/* ── Column 4: Newsletter ───────────────────────────────── */}
            <motion.div
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              className="rounded-2xl bg-white/5 border border-purple-500/10 p-6"
            >
              <h3 className="text-sm font-bold text-gradient-gold uppercase tracking-wider mb-3">
                {t('newsletter')}
              </h3>
              <p className="text-xs text-gray-400/70 mb-5 leading-relaxed">
                {isRTL ? 'احصل على آخر العروض الطبية والتحديثات مباشرة في بريدك' : 'Get the latest medical deals & health updates delivered to your inbox.'}
              </p>
              <div className="purple-glow-focus rounded-xl">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder={t('subscribeEmail')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 h-10 bg-purple-500/5 border-purple-500/15 rounded-xl text-xs text-foreground placeholder:text-gray-500 focus-visible:border-purple-500/40 focus-visible:ring-purple-500/20 transition-all duration-300"
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="icon"
                      onClick={handleSubscribe}
                      className="btn-purple-gradient btn-shimmer rounded-xl h-10 w-10 shrink-0 border-0"
                      aria-label={t('subscribe')}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Decorative tagline */}
              <div className="mt-5 pt-4 border-t border-purple-500/10">
                <div className="flex items-center gap-2 text-[11px] text-gray-500/60">
                  <Globe className="w-3 h-3 text-purple-500/40" />
                  <span>Available in Arabic &amp; English</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Bottom Copyright Bar ───────────────────────────────────────── */}
      <div className="border-t border-purple-500/10 bg-[#0d0520]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <p className="text-xs text-purple-400/40">
              &copy; {new Date().getFullYear()} REVIVE. {t('copyright')}
            </p>
            <p className="text-xs text-purple-400/25 flex items-center gap-1">
              {isRTL ? 'صُمم بكل' : 'Crafted with'} <Heart className="w-3 h-3 text-purple-500/60" /> {isRTL ? '❤️ في الجزائر' : '❤️ in Algeria'}
            </p>
          </div>
          
          <div className="pt-4 border-t border-purple-500/5 text-center space-y-2">
            <p className="text-sm font-bold text-gradient-gold tracking-wide italic">
              {isRTL 
                ? 'المنصة من تطوير يحي مسعود - طالب دكتوراه في العلوم الاقتصادية بجامعة الجزائر 3' 
                : 'Developed by Yahia Messaoud - PhD Student in Economics at the University of Algiers 3'}
            </p>
            <p className="text-[10px] text-amber-500/50 uppercase tracking-[0.2em] font-medium">
              {isRTL 
                ? 'المنصة مخصصة لأغراض البحث العلمي فقط' 
                : 'FOR SCIENTIFIC RESEARCH PURPOSES ONLY'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
