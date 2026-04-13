---
Task ID: 4
Agent: admin-dashboard-rewrite
Task: Completely rewrite AdminDashboard to match ProviderDashboard sidebar layout pattern

Work Log:
- Read ProviderDashboard.tsx lines 1150-1339 to understand sidebar + layout pattern (fixed sidebar with gradient bg, mobile hamburger sheet, content area with margin)
- Read existing AdminDashboard.tsx (1115 lines) to understand current state
- Completely rewrote AdminDashboard.tsx with the following changes:

### Layout Changes:
- Replaced old flex-based sidebar layout with ProviderDashboard's fixed 280px sidebar pattern
- Sidebar: `fixed top-0 right-0 bottom-0` with `bg-gradient-to-b from-[#0f0f1a] to-[#0a0a0f]` and glass border
- Desktop: collapsible sidebar (280px expanded, 72px collapsed) with spring animation
- Mobile: Sheet hamburger menu via SheetContent
- Top bar: sticky with backdrop-blur, hamburger toggle, active tab label, admin avatar
- Main content: `marginRight` animated with spring transition matching sidebar width
- RTL support via isRTL (Sheet side)

### Tab Changes:
- Removed 'services' tab
- Added 'complaints' tab with:
  - Filter tabs: all, open, in_progress, resolved, closed
  - Complaint cards with user avatar, name, subject, content preview, status badge, date
  - Inline reply textarea with Send/Cancel buttons
  - Resolve button for open/in_progress complaints
  - Admin reply display (purple-tinted box)
  - ComplaintStatusBadge component (open=amber, in_progress=blue, resolved=emerald, closed=gray)

### Type Updates:
- AdminUser: added `active: boolean` field
- AdminProvider.user: added `active: boolean` field
- AdminData: added `openComplaints`, `inactiveUsers`, `unverifiedProviders`
- Added Complaint interface with full user info
- TabId: removed 'services', added 'complaints'

### API Integration:
- toggleUserActive: now calls PATCH /api/admin with { action: 'toggleUserActive', userId, active } (REAL API)
- Complaints: fetches from GET /api/complaints
- handleReplyComplaint: PATCH /api/complaints/[id] with { adminReply, status: 'in_progress' }
- handleResolveComplaint: PATCH /api/complaints/[id] with { status: 'resolved' }

### Nav Items:
- Overview (الإحصائيات) - LayoutDashboard icon
- Users (المستخدمون) - Users icon
- Providers (المزودون) - Building2 icon
- Bookings (الحجوزات) - CalendarCheck icon + pendingBookings badge
- Complaints (الشكاوى) - MessageSquareWarning icon + openComplaints badge
- Settings (الإعدادات) - Settings icon

### Style:
- Dark theme: bg-[#08080d], cards bg-[#0f0f1a]/80, border-purple-500/10
- Status colors: pending=amber, confirmed=emerald, completed=purple, cancelled=red
- Complaint status colors: open=amber, in_progress=blue, resolved=emerald, closed=gray
- AnimatedCounter for stat numbers
- Badge counts on nav items
- All tables with hover effects and max-h-96 overflow-y-auto
- Gold gradient text for revenue values
- Purple gradient sidebar with active indicator

### Lint Results:
- Zero errors, zero warnings
- Dev server compiling and serving pages correctly

Stage Summary:
- Complete AdminDashboard rewrite matching ProviderDashboard sidebar pattern
- 6 tabs: overview, users, providers, bookings, complaints, settings
- Real API integration for user activate/deactivate
- Full complaints management with reply and resolve functionality
- Mobile responsive with Sheet hamburger menu
- RTL support throughout
- Zero lint errors
