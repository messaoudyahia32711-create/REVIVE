# Task: Redesign Header.tsx and Footer.tsx — H Tourism Platform

## Summary
Completely redesigned both layout components with the BLACK + PURPLE + GOLD premium dark theme, using shadcn/ui primitives and framer-motion animations throughout.

## Files Modified

### 1. `/src/components/layout/Header.tsx` (Full Rewrite)
**Key Features:**
- **Sticky glass morphism header** with `glass` CSS class, transitions to `glass--scrolled` on scroll
- **Logo**: `/images/logo.png` (next/image) + "H" in `text-gradient-purple` bold text-2xl
- **Desktop Navigation**:
  - Home link with `NavLink` component (active bg, purple dot indicator via `layoutId`)
  - Services link → **Popover** component showing categories fetched from `/api/categories` in a 3-column grid (icon + name per category), with loading skeleton placeholders
  - Dashboard link → routes to user/provider dashboard based on role, or login if not authenticated
- **Glowing hover**: every link/button uses `glow-purple` class, purple dot indicator on active page via `motion.span layoutId`
- **Language toggle**: Globe icon pill button, `glow-purple` on hover, toggles AR ↔ EN
- **Auth (Authenticated)**: `Avatar` with purple ring glow (`ring-2 ring-purple-500/40`) + `DropdownMenu` with user info, Profile, Dashboard, Logout (destructive variant)
- **Auth (Not Authenticated)**: ghost `Button` Login + `btn-purple-gradient` Register
- **Mobile**: Full-screen `Sheet` with RTL-aware side, stagger animations via `variants` (`staggerContainer`/`staggerItem`), `Collapsible` for categories dropdown with `AnimatePresence`
- **framer-motion**: Spring animations on header mount, `whileHover`/`whileTap` on all interactive elements, `layoutId` for active indicators
- **RTL support**: Uses `isRTL` for alignment, Sheet side, Popover alignment

### 2. `/src/components/layout/Footer.tsx` (Full Rewrite)
**Key Features:**
- **Top**: 2px gradient line `bg-gradient-to-r from-transparent via-purple-500 to-transparent`
- **Background**: `bg-gradient-to-b from-[#0a0a0f] to-[#0d0520]` with ambient purple glow orbs
- **4-column grid** in glass card containers (`bg-white/5 border border-purple-500/10 rounded-2xl p-6`):
  - **Column 1**: "H" logo (`text-gradient-gold`) + tagline + social icons (Facebook, Twitter, Instagram, Youtube with `glow-purple` on hover)
  - **Column 2**: Quick links with animated underline indicators on hover
  - **Column 3**: Support links + contact info (MapPin, Phone, Mail with purple accent)
  - **Column 4**: Newsletter with `Input` component (purple focus via `purple-glow-focus`) + `Button` with `btn-purple-gradient btn-shimmer` send icon
- **Bottom**: "© 2025 H." copyright bar with Heart icon
- **Scroll-triggered animations**: `fadeInUp` variants with stagger delays via `whileInView`
- **RTL support**: Uses `isRTL` for margin logic on hover indicators

## Store Verification
The store at `/src/lib/store.ts` already contains all required exports:
- `navigateTo`, `t()`, `locale`, `isRTL`, `currentPage`
- `user`, `isAuthenticated`, `setUser`
- `setSelectedCategoryId`, `showToast`

## CSS Classes Used
All required CSS classes already exist in `globals.css`:
- `glass`, `glass--scrolled`, `glow-purple`, `glow-gold`
- `text-gradient-purple`, `text-gradient-gold`
- `btn-purple-gradient`, `btn-gold-gradient`, `btn-shimmer`
- `pulse-glow-purple`, `purple-glow-focus`

## Lint Result
✅ ESLint passed with zero errors.

## Pre-existing Issue
⚠️ `page.tsx` imports `AdminDashboard` from `@/components/views/AdminDashboard` which doesn't exist. This is a pre-existing issue unrelated to these changes.
