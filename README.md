# FieldIQ

AI-powered field sales intelligence platform for the title insurance industry. Built as a high-fidelity interactive prototype for investor and sales demos. Designed to feel production-ready.

---

## Overview

FieldIQ helps title insurance sales reps track relationship-building activities, manage contacts, monitor contract pipelines, and receive AI-driven nudges — all from a single dashboard. Managers get a team-wide view with leaderboards, heatmaps, and performance analytics.

---

## Tech Stack

| Layer | Library | Version |
|-------|---------|---------|
| Framework | Next.js (App Router) | 14.2 |
| Language | TypeScript | 5.8 |
| Styling | Tailwind CSS | 3.4 |
| UI Primitives | shadcn/ui + Radix UI | — |
| Animation | Framer Motion | 11 |
| Charts | Recharts | 2.15 |
| Icons | Lucide React | 0.543 |
| Font | Inter (next/font/google) | — |

---

## Screens

### Agent (Sales Rep) View

| Route | Screen | Description |
|-------|--------|-------------|
| `/login` | Login | Demo login with role selection |
| `/dashboard` | Agent Dashboard | KPIs, AI nudges, recent activity table, activity streak |
| `/activities` | Activities | Full activity log with type/status filters |
| `/contracts` | Contracts | Contract pipeline with status tracking |
| `/contacts` | Contacts | Contact roster with relationship scores and tags |
| `/contacts/[id]` | Contact Detail | Individual contact profile, score breakdown, activity history |
| `/follow-ups` | Follow-ups | Prioritized follow-up queue (Overdue / This Week / Upcoming) |
| `/performance` | My Performance | Spend trends, activity type breakdown, personal analytics |
| `/scores` | Relationship Scores | All contacts ranked by relationship health (0–100) |
| `/settings` | Settings | Profile, notification preferences, theme |

### Manager View

| Route | Screen | Description |
|-------|--------|-------------|
| `/manager` | Manager Dashboard | Team KPIs, leaderboard, activity heatmap, MTD/QTD/YTD toggle |
| `/team` | Team | Roster with employment status, invite and broadcast actions |
| `/agent/[id]` | Agent Detail | Per-agent performance deep dive |
| `/performance` | Team Performance | Team-level charts and rep comparison table |

### Shared

| Route | Screen | Description |
|-------|--------|-------------|
| `/coming-soon` | Coming Soon | Polished placeholder for out-of-scope screens |

---

## Project Structure

```
app/                        # Next.js App Router pages
├── layout.tsx              # Root layout — wraps all pages in <Providers>
├── template.tsx            # Page transition animation (Framer Motion)
├── page.tsx                # Redirects to /login
├── login/
├── dashboard/
├── activities/
├── contracts/
├── contacts/
│   └── [id]/
├── follow-ups/
├── performance/
├── scores/
├── settings/
├── team/
├── manager/
├── agent/[id]/
└── coming-soon/

components/
├── fieldiq/                # FieldIQ custom components (see below)
└── ui/                     # shadcn/ui primitives (badge, button, dialog, toast)

lib/
├── context/                # React Context providers
├── mock-data/              # JSON demo data (March 2026 snapshot)
└── utils.ts                # cn() utility (clsx + tailwind-merge)

docs/                       # Project documentation
public/                     # Static assets
```

### FieldIQ Components

| Component | Purpose |
|-----------|---------|
| `AppShell` | Main layout — sidebar, top nav, mobile tabs, slide-over panels |
| `TopNav` | Header with logo, search (Cmd+K), notifications, role switcher |
| `Sidebar` | Desktop navigation with role-aware links and active state |
| `RoleSwitcher` | Dropdown to switch between Agent and Manager views |
| `KPICard` | Single-metric card with gold top border, value, and delta |
| `AICard` | Dismissible AI insight card with sparkle icon and read-aloud |
| `StatusBadge` | Colored pill for activity/contract status |
| `ScoreRing` | SVG donut ring showing relationship score (0–100) |
| `FilterBar` | Search input + type dropdown + status pills |
| `LogActivityPanel` | Slide-over form for logging activities |
| `LogContractPanel` | Slide-over form for logging contracts |
| `AddContactPanel` | Slide-over form for adding contacts |
| `InviteAgentPanel` | Manager slide-over for inviting team members |
| `TeamBroadcastPanel` | Manager slide-over for sending team messages |
| `NotificationPanel` | Side panel for alerts and notifications |
| `CommandPalette` | Full-screen search interface triggered by Cmd+K |
| `SlideOverPanel` | Reusable Framer Motion wrapper for all slide-overs |
| `MobileMoreSheet` | Bottom sheet for extra nav items on mobile |
| `DatePickerInput` | Custom date picker input |
| `TimePickerInput` | Custom time picker input |
| `ComingSoon` | Placeholder screen for unbuilt features |
| `SuccessToast` | Toast notification for confirmed actions |

### Context Providers

| Context | What it controls |
|---------|-----------------|
| `RoleContext` | Active role (rep/manager), persona data, role switching |
| `ThemeContext` | Dark/light theme toggle |
| `ActivityLogContext` | Open/close Log Activity panel |
| `ContractContext` | Open/close Log Contract panel |
| `AddContactContext` | Open/close Add Contact panel |
| `InviteAgentContext` | Open/close Invite Agent panel (manager) |
| `TeamBroadcastContext` | Open/close Team Broadcast panel (manager) |
| `NotificationContext` | Open/close Notification panel |
| `SearchContext` | Open/close Command Palette |

### Mock Data Files

| File | Contains |
|------|----------|
| `agents.json` | Sales rep roster with KPIs and status |
| `agent-kpis.json` | Agent KPI metrics for the dashboard |
| `agent-details.json` | Detailed per-agent profile data |
| `contacts.json` | Contact profiles with scores, tags, and activity history |
| `activities.json` | Activity log entries (type, spend, contacts, status) |
| `contracts.json` | Contract records (file number, address, amount, status) |
| `team.json` | Team KPIs, leaderboard, heatmap, and alert data |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # Production build
npm run start   # Run production build locally
npm run lint    # ESLint
```

---

## Demo Mode

- **No real authentication.** The app auto-signs in as a demo user.
- **Default role:** Manager (Jane Doe) — gives access to both Agent and Manager views.
- **Role switching:** Always visible in the top nav. Switching to Agent shows Sarah Chen's view.
- **Theme toggle:** Dark mode default. Light mode available via the sun/moon button in TopNav.
- **All forms succeed.** Submitting any panel (Log Activity, Add Contact, etc.) shows a success toast and closes the panel. No data is persisted.
- **All data is static.** JSON mock files represent a March 2026 snapshot. Nothing changes between sessions.

**Demo credentials (login screen):** `demo@fieldiq.ai` / `demo1234`

---

## Design System

See [`docs/brand.md`](docs/brand.md) for full design token reference.

Key rules:
- **Gold (`#c4a574`)** is used only for KPI values, card top borders, active nav state, and score rings. Never as a large background fill.
- **Cards** have a 2px solid gold top border. The other three sides use `1px solid var(--border)`.
- **Dark mode is the default.** All color tokens are defined as CSS variables.
- **No red anywhere.** Warnings use amber (`#d97706`) only.

---

## Documentation

| File | Contents |
|------|----------|
| [`docs/fieldiq-prd.md`](docs/fieldiq-prd.md) | Original product requirements and build spec |
| [`docs/product.md`](docs/product.md) | Product strategy, personas, and feature roadmap |
| [`docs/brand.md`](docs/brand.md) | Design system, color tokens, typography |
| [`docs/activities.md`](docs/activities.md) | Activity logging specification |
| [`docs/authentication.md`](docs/authentication.md) | Demo auth flow and role system |
| [`docs/ai-features.md`](docs/ai-features.md) | Planned AI/ML feature specs (future phase) |
| [`docs/database.md`](docs/database.md) | Production database schema and ER diagram |
| [`docs/requirements.md`](docs/requirements.md) | Implemented feature inventory |
| [`docs/title-software-integration.md`](docs/title-software-integration.md) | Title software (Qualia/SoftPro) integration spec |
