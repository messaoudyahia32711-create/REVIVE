'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomePage from '@/components/views/HomePage';
import ServicesPage from '@/components/views/ServicesPage';
import ServiceDetailPage from '@/components/views/ServiceDetailPage';
import AuthPage from '@/components/views/AuthPage';
import UserDashboard from '@/components/views/UserDashboard';
import ProviderDashboard from '@/components/views/ProviderDashboard';
import AdminDashboard from '@/components/views/AdminDashboard';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export default function Home() {
  const { currentPage, locale, setLocale, toastMessage, toastType, isRTL, hideToast } = useAppStore();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [locale, isRTL]);

  const showFooter = !['user-dashboard', 'provider-dashboard', 'admin-dashboard'].includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'services': return <ServicesPage />;
      case 'service-detail': case 'booking': return <ServiceDetailPage />;
      case 'login': case 'register': return <AuthPage />;
      case 'user-dashboard': case 'profile': return <UserDashboard />;
      case 'provider-dashboard': return <ProviderDashboard />;
      case 'admin-dashboard': return <AdminDashboard />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={currentPage} variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      {showFooter && <Footer />}

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 z-[100] max-w-md w-[calc(100%-2rem)]"
            onClick={hideToast}
          >
            <div className={`rounded-xl px-5 py-3.5 shadow-2xl border cursor-pointer flex items-center gap-3 backdrop-blur-xl ${
              toastType === 'success' ? 'bg-purple-600/90 text-white border-purple-400' 
              : toastType === 'error' ? 'bg-red-600/90 text-white border-red-400'
              : 'bg-purple-500/90 text-white border-purple-300'
            }`}>
              <span className="text-lg">{toastType === 'success' ? '✅' : toastType === 'error' ? '❌' : 'ℹ️'}</span>
              <span className="font-medium text-sm">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
