'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
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
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';

const navLinks = [
  { key: 'home' as const, page: 'home' as const },
  { key: 'services' as const, page: 'services' as const },
  { key: 'categories' as const, page: 'services' as const, filterCategories: true },
];

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
  } = useAppStore();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (page: string, filterCategories?: boolean) => {
    navigateTo(page as never);
    if (filterCategories) {
      setSelectedCategoryId(null);
    }
    setMobileOpen(false);
  };

  const handleLanguageToggle = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = () => {
    setUser(null);
    navigateTo('home');
  };

  const dashboardPage = user?.role === 'provider' ? 'provider-dashboard' : 'user-dashboard';

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo & Brand */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo('home')}
        >
          <img
            src="/images/logo.png"
            alt="Safara Travel"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-primary">
              Safara Travel
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              {isRTL ? 'سفارة ترافل' : 'Tourism Services'}
            </span>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <motion.button
              key={link.key}
              onClick={() => handleNavClick(link.page, link.filterCategories)}
              className="relative px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-lg hover:bg-primary/5 transition-colors"
              whileHover={{ y: -1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {t(link.key)}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full"
                initial={{ width: 0 }}
                whileHover={{ width: '60%' }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageToggle}
              className="gap-2 text-sm"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">
                {locale === 'ar' ? 'English 🇬🇧' : 'العربية 🇸🇦'}
              </span>
            </Button>
          </motion.div>

          {/* Auth Section - Desktop */}
          <div className="hidden md:block">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline max-w-[120px] truncate text-sm font-medium">
                      {user.name}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateTo('profile')} className="cursor-pointer gap-2">
                    <User className="h-4 w-4" />
                    {t('profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo(dashboardPage)} className="cursor-pointer gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {t('dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateTo('login')}
                  className="text-sm"
                >
                  {t('login')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigateTo('register')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                >
                  {t('register')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? 'right' : 'left'} className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <img
                    src="/images/logo.png"
                    alt="Safara Travel"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="text-primary font-bold">Safara Travel</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-1 mt-4 px-2">
                {/* Mobile Nav Links */}
                {navLinks.map((link) => (
                  <button
                    key={link.key}
                    onClick={() => handleNavClick(link.page, link.filterCategories)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-primary/5 transition-colors text-start"
                  >
                    {t(link.key)}
                  </button>
                ))}

                {/* Divider */}
                <div className="my-2 h-px bg-border" />

                {/* Auth Section */}
                {isAuthenticated && user ? (
                  <>
                    <button
                      onClick={() => {
                        navigateTo('profile');
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-primary/5 transition-colors text-start"
                    >
                      <User className="h-4 w-4" />
                      {t('profile')}
                    </button>
                    <button
                      onClick={() => {
                        navigateTo(dashboardPage);
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-primary/5 transition-colors text-start"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t('dashboard')}
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors text-start"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('logout')}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigateTo('login');
                        setMobileOpen(false);
                      }}
                      className="w-full"
                    >
                      {t('login')}
                    </Button>
                    <Button
                      onClick={() => {
                        navigateTo('register');
                        setMobileOpen(false);
                      }}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {t('register')}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
