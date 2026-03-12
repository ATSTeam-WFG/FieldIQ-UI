# FieldIQ — Prototype PRD
## Clickable Investor/Sales Demo
**Version 1.0 · March 2026**

---

## 1. Purpose & Goals

Build a high-fidelity, interactive web prototype of FieldIQ — an AI-powered field sales intelligence platform for the title insurance industry. This prototype is purpose-built for investor and sales demos. It must feel production-ready: pixel-perfect to the Pencil.dev designs, fully navigable, and interactive enough that a prospect can explore it without a guided walkthrough.

**Success criteria:**
- Any of the three roles (Agent, Manager, Executive) can be demoed end-to-end without breaking
- Forms accept input and respond with realistic mock feedback
- Light/dark mode toggle works on every screen
- No placeholder "lorem ipsum" content — all data is realistic and domain-specific
- Loads in under 2 seconds on a standard laptop over Wi-Fi
- Runs entirely in the browser — no login required for demo mode

---

## 2. Scope

### 2.1 Screens In Scope (5 of 8)

| # | Screen | Role | Priority |
|---|--------|------|----------|
| 1 | Login | All | P0 |
| 2 | Agent Dashboard | Title Agent | P0 |
| 3 | Log Activity (slide-over) | Title Agent | P0 |
| 4 | Contact Profile | Title Agent | P1 |
| 5 | Manager Dashboard | Sales Manager | P0 |

Screens 6 (Agent Detail), 7 (Executive Dashboard), and 8 (Settings) are out of scope for this prototype build. Stub navigation links for these screens should show a tasteful "Coming Soon" state rather than a broken route.

### 2.2 Out of Scope
- Real authentication or user accounts
- Backend API or database
- Data persistence between sessions
- Push notifications
- Mobile native app (React Native)
- White-label theming configurator
- File upload processing

---

## 3. User Roles & Demo Flow

The prototype supports three roles accessible via a role switcher in the top nav. Switching roles re-renders the shell and content for that role. No login required — demo mode auto-signs in.

### Role: Title Agent
**Demo persona:** Sarah Chen, Senior Title Agent, Buckhead Territory
- Lands on Agent Dashboard (Screen 2)
- Can open Log Activity slide-over (Screen 3) via "+ Log Activity" button
- Can navigate to a Contact Profile (Screen 4) by clicking any contact row
- KPI cards, activity table, and streak widget show mock data

### Role: Sales Manager
**Demo persona:** Jane Doe, Regional Sales Manager, Premier Title Agency
- Lands on Manager Dashboard (Screen 5)
- Leaderboard rows are clickable (stub to "Coming Soon" Agent Detail)
- Alert banner is dismissible
- Period selector (MTD / QTD / YTD) switches visible mock data sets

### Role: Executive *(stub)*
- Role badge switches to "EXECUTIVE"
- Redirects to "Coming Soon" screen with brief description of the Executive Dashboard

---

## 4. Interaction Requirements

### 4.1 Navigation
- Left sidebar navigation is functional across all in-scope screens
- Active sidebar item updates correctly per current screen
- Breadcrumb (where present) reflects current route
- Browser back button works correctly
- All "View all →" and "→" chevron links that point to out-of-scope screens show a polished "Coming Soon" modal rather than a 404

### 4.2 Role Switcher
- Role badge pill in top nav is clickable and opens a dropdown with 3 options: Agent, Manager, Executive
- Selecting a role navigates to that role's landing screen
- Role badge label and avatar update accordingly

### 4.3 Theme Toggle
- Light/dark mode toggle in top nav works on every screen
- Theme preference persists across navigation within the session (in-memory, not localStorage)
- Default: Dark mode

### 4.4 Log Activity (Screen 3)
- Opens as a slide-over panel on desktop (from the right, overlaying content)
- Opens as a bottom sheet on mobile
- Activity type selector (8 tiles) is interactive — selecting a tile highlights it with gold border
- Only one tile can be active at a time
- Form fields accept text input
- Follow-up date field opens a native date picker
- Time field accepts input
- Submit button ("Save Activity") triggers a success toast notification:
  "Activity logged successfully" — dismisses after 3 seconds
- Slide-over closes after successful submission
- Form resets after submission

### 4.5 Period Selector (Screen 5)
- MTD / QTD / YTD / Custom pill group is interactive
- Clicking each pill updates KPI card values and chart data to a different mock data set
- Custom opens a simple date range input (two date fields, inline)
- Active pill styling: correct per light/dark mode spec

### 4.6 Alert Banner (Screen 5)
- "Dismiss" button on the below-threshold alert banner removes it from the DOM with a fade-out transition
- "Review now →" link stubs to Coming Soon

### 4.7 Contact Profile (Screen 4)
- Tabs (if present) are switchable
- Spend breakdown chart renders with correct proportions
- Relationship score ring animates in on page load (fill sweeps clockwise from 0 to score value over 600ms)

### 4.8 Leaderboard (Screen 5)
- Sort dropdown ("Activities ▾") is interactive — options: Activities, Spend, Score, Last Log
- Selecting a sort option reorders the rows with a subtle transition
- Row hover state shows "→" chevron
- Clicking a row navigates to Coming Soon (Agent Detail stub)

---

## 5. Technology Stack

### 5.1 Framework
**Next.js 14 (App Router)**
- File-based routing maps cleanly to the 5 screens
- Server components for static content, client components for interactive elements
- Easy to deploy to Vercel for shareable demo links

### 5.2 Styling
**Tailwind CSS v3 + shadcn/ui**
- Tailwind for all layout, spacing, and color tokens
- shadcn/ui for: Dialog (slide-over), Sheet (mobile bottom sheet), Toast, Dropdown, Popover (date picker), Badge (status pills)
- Custom Tailwind config extends the color palette with FieldIQ brand tokens

### 5.3 Typography
**Inter (Google Fonts)**
- Weights used: 400, 500, 600, 700
- Loaded via `next/font/google` for performance

### 5.4 Charts
**Recharts**
- Horizontal bar chart (Activity by Type — Screen 5)
- Spend breakdown chart (Screen 4)
- All charts use the defined slate/gold color palette
- No chart library defaults — all colors explicitly overridden

### 5.5 Icons
**Lucide React**
- Consistent with shadcn/ui's default icon set
- Used for: nav icons, activity type icons, upload, clock, chevrons, bell, theme toggle

### 5.6 Animation
**Framer Motion**
- Slide-over panel entrance/exit (Screen 3)
- Bottom sheet entrance/exit (mobile Screen 3)
- Score ring fill animation on mount (Screen 4)
- Alert banner fade-out on dismiss
- Toast notification entrance/exit

### 5.7 Mock Data
**Local JSON files (`/lib/mock-data/`)**
- `agents.json` — agent personas, KPIs, activity history
- `contacts.json` — contact profiles, relationship scores, last activity
- `activities.json` — activity log entries for timeline
- `team.json` — manager-level team data, leaderboard, alerts
- Period selector switches between `mtd.json`, `qtd.json`, `ytd.json` data sets
- No API calls — all data imported directly into components

### 5.8 State Management
**React Context + useState**
- `ThemeContext` — light/dark mode, persisted in memory for session
- `RoleContext` — current demo role (Agent / Manager / Executive)
- `ActivityLogContext` — slide-over open/close state, form state
- No Redux or Zustand needed at this prototype scale

### 5.9 Deployment
**Vercel**
- Single `vercel deploy` command from the repo root
- Shareable preview URL for each build (ideal for sending to investors)
- Custom domain optional: `demo.fieldiq.ai`

---

## 6. Design System Implementation

### 6.1 Color Tokens (tailwind.config.js)
```js
colors: {
  gold: {
    DEFAULT: '#c4a574',
    hover:   '#a68751',
    light:   '#d4b584',
  },
  brand: {
    'bg-light':    '#fafaf9',
    'card-light':  '#ffffff',
    'bg-dark':     '#0f0f0f',
    'card-dark':   '#171717',
    'surface-dark':'#1a1a1a',
    'border-light':'#e4e4e7',
    'border-dark': '#27272a',
  },
  status: {
    success: '#16a34a',
    warning: '#d97706',
  }
}
```

### 6.2 Reusable Components
All components live in `/components/ui/` (shadcn primitives) and `/components/fieldiq/` (custom):

| Component | Description |
|---|---|
| `AppShell` | Top nav + sidebar wrapper, role-aware |
| `TopNav` | Wordmark, role badge, theme toggle, avatar |
| `Sidebar` | Nav items, active state, agent card at bottom |
| `KPICard` | Gold top border, label/value/delta pattern |
| `StatusBadge` | On Track / Watch / Below Target pills |
| `ActivityTile` | Icon tile for Log Activity selector grid |
| `ActivityRow` | Timeline entry with icon dot + connector line |
| `ScoreRing` | Animated donut ring with center value |
| `HorizontalBar` | Single bar row for chart sections |
| `AlertBanner` | Dismissible gold-border alert |
| `PeriodSelector` | Connected pill group (MTD/QTD/YTD/Custom) |
| `RoleSwitcher` | Dropdown for role switching in nav |
| `ComingSoon` | Polished stub screen for out-of-scope routes |
| `SuccessToast` | Auto-dismiss activity logged confirmation |

### 6.3 Card Border Rule
Enforced via a shared `card` class utility:
```css
.fieldiq-card {
  border-top: 2px solid #c4a574;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  border-left: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
```

### 6.4 Sidebar Active State Rule
```css
.sidebar-item-active {
  border-left: 2px solid #c4a574;
  background: transparent;
  font-weight: 600;
}
```

---

## 7. Project Structure

```
fieldiq-prototype/
├── app/
│   ├── layout.tsx              # Root layout, ThemeProvider, RoleProvider
│   ├── page.tsx                # Redirects to /login
│   ├── login/page.tsx          # Screen 1
│   ├── dashboard/page.tsx      # Screen 2 (Agent)
│   ├── manager/page.tsx        # Screen 5 (Manager)
│   ├── contacts/[id]/page.tsx  # Screen 4 (Contact Profile)
│   └── coming-soon/page.tsx    # Stub for out-of-scope screens
├── components/
│   ├── ui/                     # shadcn primitives
│   └── fieldiq/                # Custom FieldIQ components
├── lib/
│   ├── mock-data/
│   │   ├── agents.json
│   │   ├── contacts.json
│   │   ├── activities.json
│   │   ├── team.json
│   │   ├── mtd.json
│   │   ├── qtd.json
│   │   └── ytd.json
│   └── context/
│       ├── ThemeContext.tsx
│       ├── RoleContext.tsx
│       └── ActivityLogContext.tsx
├── public/
│   └── fonts/                  # Inter (via next/font)
├── styles/
│   └── globals.css             # CSS variables, base resets
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## 8. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| < 768px (mobile) | Sidebar hidden, bottom tab bar shown, Log Activity as bottom sheet, 2×2 KPI grid |
| 768px–1024px (tablet) | Sidebar collapsed to icon-only (48px), content area adjusts |
| ≥ 1280px (desktop) | Full sidebar (220px), slide-over panel, full table columns |

---

## 9. Demo Mode Behavior

When opened in a browser, the prototype auto-enters demo mode:
- No login required — "Continue as Demo" pre-fills credentials and signs in
- A subtle "Demo Mode" banner at the very top (4px gold stripe or small pill) signals to the viewer this is a prototype
- Role switcher is always visible and always functional
- All destructive actions (delete, archive) show a confirmation then do nothing
- Form submissions always succeed — no validation errors shown in demo mode

---

## 10. Build Phases

### Phase A — Foundation (Week 1)
- Next.js project scaffold with Tailwind + shadcn/ui
- Design token configuration (colors, typography, spacing)
- `AppShell`, `TopNav`, `Sidebar` components
- `ThemeContext` (light/dark toggle)
- `RoleContext` (role switcher)
- Screen 1: Login page, static

### Phase B — Agent Screens (Week 2)
- Screen 2: Agent Dashboard (mock data, KPI cards, activity table, streak widget)
- Screen 3: Log Activity slide-over (form, tile selector, success toast)
- Screen 4: Contact Profile (score ring animation, timeline, spend chart)

### Phase C — Manager Screen (Week 3)
- Screen 5: Manager Dashboard (leaderboard with sort, period selector, alert banner, heatmap, bar chart)
- Coming Soon stub screen
- Role switching end-to-end

### Phase D — Polish & Deploy (Week 4)
- Responsive mobile layout across all screens
- Framer Motion animations (slide-over, score ring, toast, dismiss)
- Cross-browser QA (Chrome, Safari, Edge)
- Vercel deployment + shareable demo URL
- Demo mode banner + auto-login flow

---

## 11. Success Metrics for Demo

| Metric | Target |
|---|---|
| Time-to-first-impression | < 5 seconds from URL open to meaningful content |
| Role switch time | < 1 second |
| Theme toggle | Instant (no flash) |
| Form submission feedback | Toast within 300ms of click |
| Mobile usability | All 5 screens usable on iPhone 14 screen size |
| Zero broken routes | All nav links resolve (in-scope or Coming Soon) |
