# Implemented Features

This document is a feature inventory of what is currently built in the FieldIQ prototype. It reflects the actual implementation, which expanded beyond the original 5-screen PRD scope.

For the original spec, see [`docs/fieldiq-prd.md`](fieldiq-prd.md). For the product strategy and roadmap, see [`docs/product.md`](product.md).

---

## Agent (Sales Rep) Screens

### Login — `/login`
- Demo credentials pre-filled: `demo@fieldiq.ai` / `demo1234`
- Any input triggers a successful sign-in
- Navigates to `/manager` (default demo user is a manager)
- No real authentication

### Agent Dashboard — `/dashboard`
- Six KPI cards: Activities This Week, Total Spend MTD, Contacts Engaged, Follow-ups Pending, Closed This Month, Pipeline Value
- AI nudge card — dismissible, shows one contextual recommendation
- AI performance summary card — plain-English monthly recap
- Recent Activity table — last 5 entries with type, contact, date, spend, status
- Activity Streak card — day-by-day activity pills, streak length, cost and type stats
- Log Activity button opens `LogActivityPanel`

### Activities — `/activities`
- Filter bar: text search, type dropdown (7 types), status pills (Follow-up / Complete / Logged)
- Summary strip: total activities count, total spend, follow-ups pending
- Desktop table: type icon, contact, date, cost, status badge, sponsored vendor
- Mobile: card layout per activity
- Log Activity button opens `LogActivityPanel`

### Contracts — `/contracts`
- Filter bar: search by contact, address, or file number; status pills (Opened / Closed / Cancelled)
- Desktop table: file number, address, contact, amount, type (Regular / Refinance / Commercial), status, closing date
- Mobile: card layout per contract
- Log Contract button opens `LogContractPanel`

### Contacts — `/contacts`
- Three tabs: All, Agents (real estate agents), Vendors — with per-tab counts
- Desktop sortable table: name, company, type, relationship score, last activity date, tags
- Mobile: card row layout
- Add Contact button opens `AddContactPanel`

### Contact Detail — `/contacts/[id]`
- Individual contact profile page
- Score breakdown: Recency, Frequency, Diversity, Engagement
- Activity history for this contact

### Follow-ups — `/follow-ups`
- Three grouped sections: Overdue, This Week, Upcoming (with counts)
- Each item shows: activity type icon, activity label, contact name, company, follow-up note
- Actions per item: Add to Calendar (Google Calendar / Outlook options), Mark Complete, Cancel
- KPI strip at top with counts for each group

### My Performance — `/performance`
- AI performance summary card
- KPI row: activities this month, total spend, contacts engaged, longest streak
- Spend & Activity Trend chart — 6-month combo bar + line (Recharts)
- Activity Type Breakdown — horizontal bars showing count and spend per type
- Quick Stats sidebar

### Relationship Scores — `/scores`
- Summary strip: average score, top score, total contacts tracked, score legend
- Sortable table: rank, contact name, score ring (SVG donut), breakdown bars (4 factors), last contact date, trend indicator
- Score factors: Recency, Frequency, Diversity, Engagement

### Settings — `/settings`
- Profile section: name, role title, company, territory
- Notifications: email digest, push notifications, follow-up reminders, team alerts
- Preferences: default period (MTD/QTD/YTD), theme toggle, language
- Quick Settings: activity target per week, territory config (disabled in demo)
- Notification Rules section visible to managers only

---

## Manager Screens

### Manager Dashboard — `/manager`
- Team Summary AI card — dismissible narrative about team performance
- Period selector: MTD / QTD / YTD (controls all KPIs and charts below)
- Four KPI cards: Total Team Activities, Total Team Spend, Active Reps, Avg Activities/Rep
- Team Leaderboard: ranked table with rep name, activities, spend, last log, status badge, alert banners
- Activity by Type chart — horizontal grouped bars (Recharts)
- Rep Activity Heatmap — 2×4 grid of agents, 4 weekly columns with heat intensity

### Team — `/team`
- Agent roster cards: name, initials, employment status (active / on-leave / inactive), activity count, relationship score
- Invite Agent button opens `InviteAgentPanel`
- Broadcast button opens `TeamBroadcastPanel`

### Agent Detail — `/agent/[id]`
- Per-agent performance deep dive (accessible from leaderboard or team roster)

### Team Performance — `/performance` (manager role)
- KPI row: total activities, total spend, average score, most active rep
- Team Activities by Week bar chart
- Activity Type Breakdown
- Rep Performance comparison table: rank, name, activities, score

---

## Shared / Global Features

### App Shell
- Desktop: fixed sidebar (240px) + main content area
- Mobile: bottom tab bar with 5 primary nav items + More sheet
- Page transition animations (Framer Motion via `app/template.tsx`)

### Top Navigation
- FieldIQ wordmark/logo
- Global search button — opens `CommandPalette` (also triggered by Cmd+K)
- Notifications bell — opens `NotificationPanel`
- Theme toggle (dark ↔ light)
- Role switcher — always visible; shows active persona name and initials

### Command Palette — Cmd+K
- Full-screen overlay search
- Searches contacts, activities, and navigation links

### Slide-over Panels

| Panel | Trigger | Fields |
|-------|---------|--------|
| Log Activity | "Log Activity" button / Cmd+K | Type tiles, multi-contact select, vendor select, date, time, duration, spend, notes, follow-up toggle |
| Log Contract | "Log Contract" button | File number, address, contact, amount, type, status, closing date |
| Add Contact | "Add Contact" button | Name, company, role type, phone, email, tags |
| Invite Agent | "Invite" button (manager) | Name, email, territory, role |
| Team Broadcast | "Broadcast" button (manager) | Recipients, message, send time |
| Notifications | Bell icon | Alert list |

All panels slide in from the right with a Framer Motion animation. All form submissions show a success toast and close the panel.

### Coming Soon — `/coming-soon`
Polished placeholder screen shown for any nav item that links to an unbuilt feature.

---

## Data Model (Mock)

All data is static JSON. No backend, no persistence. See [`docs/database.md`](database.md) for the planned production schema.

| File | Contents |
|------|----------|
| `lib/mock-data/agents.json` | Rep roster with status and KPIs |
| `lib/mock-data/agent-kpis.json` | Dashboard KPI values for the active rep |
| `lib/mock-data/agent-details.json` | Extended profile data per agent |
| `lib/mock-data/contacts.json` | Contact profiles, scores, tags, last activity |
| `lib/mock-data/activities.json` | Activity entries with contacts, vendors, spend, status |
| `lib/mock-data/contracts.json` | Contract records with file number, address, amounts |
| `lib/mock-data/team.json` | Team KPIs, leaderboard, heatmap, manager alerts |

---

## Out of Scope (Not Built)

- Real authentication and user sessions
- Backend API, database writes, or data persistence
- Voice activity logging (AI feature — future phase)
- AI nudge generation (currently hardcoded strings in mock data)
- Executive dashboard (`/executive` — persona stub only)
- CSV import from Qualia / SoftPro
- Push notifications
- Receipt image upload
- White-label theming

See [`docs/ai-features.md`](ai-features.md) for the full AI feature roadmap (future phase).

---

## Known Limitations

- Data resets on every page refresh — no persistence layer
- Role switch resets to manager on refresh
- Period selector (MTD/QTD/YTD) on manager dashboard switches labels but uses the same underlying mock data
- Contact detail and agent detail pages use partial mock data
- Settings page does not persist any changes
