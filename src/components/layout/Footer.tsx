'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Send,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';

const quickLinks = [
  { key: 'home' as const, page: 'home' as const },
  { key: 'services' as const, page: 'services' as const },
  { key: 'categories' as const, page: 'services' as const },
  { key: 'aboutUs' as const, page: 'home' as const },
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

export default function Footer() {
  const { t, navigateTo, showToast, isRTL, locale } = useAppStore();
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email || !email.includes('@')) {
      showToast(
        locale === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address',
        'error'
      );
      return;
    }
    showToast(
      locale === 'ar' ? 'تم الاشتراك في النشرة البريدية بنجاح!' : 'Successfully subscribed to newsletter!',
      'success'
    );
    setEmail('');
  };

  const handleQuickLink = (page: string) => {
    navigateTo(page as never);
  };

  return (
    <footer className="bg-emerald-dark text-white mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Logo & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Safara Travel"
                className="h-10 w-10 rounded-full object-cover border-2 border-white/20"
              />
              <div>
                <h3 className="text-lg font-bold text-white">Safara Travel</h3>
                <p className="text-xs text-emerald-200/70">
                  {isRTL ? 'سفارة ترافل' : 'Tourism Services'}
                </p>
              </div>
            </div>
            <p className="text-sm text-emerald-100/70 leading-relaxed">
              {isRTL
                ? 'اكتشف أجمل الوجهات السياحية مع سفارة ترافل. نقدم لكم أفضل الخدمات السياحية بأسعار مناسبة مع مزودين موثوقين.'
                : 'Discover the most beautiful tourist destinations with Safara Travel. We offer the best tourism services at competitive prices with trusted providers.'}
            </p>

            {/* Social Media */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="h-4 w-4 text-white" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-200/80 mb-4">
              {t('categories')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <button
                    onClick={() => handleQuickLink(link.page)}
                    className="text-sm text-emerald-100/70 hover:text-white transition-colors hover:translate-x-1 transform duration-200"
                  >
                    {t(link.key)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-200/80 mb-4">
              {isRTL ? 'الدعم' : 'Support'}
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.key}>
                  <button
                    onClick={() => handleQuickLink('home')}
                    className="text-sm text-emerald-100/70 hover:text-white transition-colors hover:translate-x-1 transform duration-200"
                  >
                    {t(link.key)}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleQuickLink('home')}
                  className="text-sm text-emerald-100/70 hover:text-white transition-colors hover:translate-x-1 transform duration-200"
                >
                  {t('becomeProvider')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-200/80 mb-4">
              {t('newsletter')}
            </h4>
            <p className="text-sm text-emerald-100/70 mb-4 leading-relaxed">
              {isRTL
                ? 'اشترك في نشرتنا البريدية لتصلك أحدث العروض والأخبار السياحية.'
                : 'Subscribe to our newsletter for the latest offers and tourism news.'}
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-emerald-300/40" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('subscribeEmail')}
                  className="ps-9 bg-white/10 border-white/20 text-white placeholder:text-emerald-200/40 focus:border-white/40 focus:ring-white/20 h-10 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSubscribe}
                  size="icon"
                  className="bg-gold hover:bg-gold-dark text-white h-10 w-10 shrink-0"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">{t('subscribe')}</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-emerald-200/50">
              © {new Date().getFullYear()} Safara Travel. {t('copyright')}
            </p>
            <p className="text-xs text-emerald-200/50">
              {isRTL
                ? 'صُمم بكل حب لاستكشاف العالم'
                : 'Designed with love for exploring the world'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
