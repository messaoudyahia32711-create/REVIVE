# Task 11-9 - AuthPage and UserDashboard

## Files Created

### `/home/z/my-project/src/components/views/AuthPage.tsx`
- `'use client'` component with login/register forms
- Two modes toggled by `currentPage` from store (`login` vs `register`)
- Centered card layout with glass morphism background (`glass` CSS class)
- Decorative floating shapes with `animate-float` and `animate-float-delayed`
- Gold gradient title via `text-gradient-gold`
- Animated card entrance with framer-motion
- 3D tilt effect using `card-3d` / `card-3d-inner` CSS classes
- RTL support throughout (directional chevrons, layout)

**Login Form:**
- Email input with Mail icon
- Password input with Lock icon + show/hide toggle
- "Login" button (gradient, full width)
- "Forgot Password?" link → shows toast "Coming soon"
- "Don't have an account? Register" link → `navigateTo('register')`
- POST `/api/auth` with `action='login'`
- On success: `setUser()`, `navigateTo('home')`, toast

**Register Form:**
- Name, Email, Phone (optional), Password, Confirm Password inputs
- Role selector: RadioGroup with User/Provider options
- Provider fields (animated reveal): Company Name, Description, Location
- "Register" button (gradient, full width)
- "Already have an account? Login" link → `navigateTo('login')`
- Validation: required fields, password match, provider company name
- POST `/api/auth` with `action='register'`

### `/home/z/my-project/src/components/views/UserDashboard.tsx`
- `'use client'` component for user booking management
- **Sidebar** (collapsible on mobile via overlay + slide):
  - User avatar + name + email
  - Nav items: My Bookings (active), Profile, Settings (with icons)
  - Back button
- **Stats Cards** (3 cards):
  - Total Bookings count
  - Total Spent (SAR)
  - Upcoming bookings count
- **My Bookings Tab**:
  - Fetches from `/api/bookings?userId=...`
  - Status filter tabs: All, Pending, Confirmed, Completed, Cancelled
  - Booking cards with: thumbnail, service name (locale-aware), date, people, price, status badge (color coded)
  - Cancel button for pending bookings (PATCH `/api/bookings/[id]`)
  - Contact Provider button → opens MessageDialog
  - Empty state component
- **Message Dialog**:
  - Dialog component for messaging provider
  - Fetches messages from `/api/messages?bookingId=...`
  - Scrollable message list
  - Different styling for sent vs received (based on `user.id === message.senderId`)
  - Message input + send button (supports Enter key)
  - Auto-scroll to bottom on new message
  - POST `/api/messages`

## Lint Status
- No lint errors from AuthPage.tsx or UserDashboard.tsx
- Pre-existing errors in ProviderDashboard.tsx (not from this task)
