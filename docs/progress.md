# FieldIQ — Project Progress

## The Goal

Build a **purpose-built relationship intelligence platform for the title insurance industry** — not a generic CRM, not a transaction tracker, but a tool designed around how title agents actually win business: through consistent, deliberate field activity.

The problem it solves: title agents do significant relationship-building work every day — lunches, pop-bys, CE classes, closing gifts, calls — and none of it gets captured anywhere. Managers can see what closed, not what earned it. By the time the pipeline dries up, it's already too late to act.

FieldIQ turns that invisible work into structured data that agents can act on and managers can trust.

---

## What the Final Product Looks Like

### For Agents (Sales Reps)
- **Mobile-first activity logging** — log a lunch, pop-by, or call in under 30 seconds from the field
- **Relationship scores** — every contact gets a live 0–100 score across Recency, Frequency, Diversity, and Engagement. Know exactly which relationships are healthy and which are quietly going cold
- **Follow-up queue** — every pending follow-up in one place, organized by urgency, connected to calendar
- **Contract pipeline** — track title orders from introduction through closing, linked to referring contacts
- **Personal performance** — activities, spend, streak, and trajectory vs. target at a glance
- **AI nudges** — proactive prompts: who to re-engage today, what's cooling off, what's at risk

### For Managers
- **Team leaderboard** — every agent ranked by activity, spend, score, and recency across MTD/QTD/YTD
- **Early warning system** — automated alerts when agents go quiet or fall below activity thresholds
- **Activity intelligence** — how the team actually spends their time and budget, broken down by type
- **Agent deep dive** — full picture per rep for data-driven 1:1 coaching
- **AI coaching prompts** — suggested talking points per rep, generated from their activity patterns

### For Executives
- Agency-wide spend, pipeline value, and relationship health at a glance
- Trend analysis and territory comparison
- BD ROI: connect field spend to closed transactions

### Platform
- **Web app** (Next.js) + **Mobile app** (React Native / Expo)
- **Multi-tenant SaaS** — one platform, isolated data per agency
- **Title software integration** — auto-import closed orders from Qualia and SoftPro
- **Sponsor analytics** — full attribution of partner co-spend to deal outcomes
- Distributed through WFG's existing agency network as a value-add tool

---

## Milestones

---

### Phase 1 — Interactive Prototype
**Status: COMPLETE** ✓ — *April 2026*

A fully functional, high-fidelity web prototype built in Next.js 14. No backend — all data is static JSON. Purpose: validate design, workflows, and product direction before engineering investment.

**What was built:**
- 14 screens across Agent and Manager views (Dashboard, Activities, Contracts, Contacts, Contact Detail, Follow-ups, Performance, Scores, Settings, Team, Agent Detail, Login, Coming Soon)
- 22 custom components (AppShell, KPICard, ScoreRing, LogActivityPanel, FilterBar, CommandPalette, etc.)
- 9 React Context providers for theme, role switching, and all slide-over panels
- Full dual-role system: Sales Rep (Sarah Chen) and Manager (Jane Doe) with seamless role switching
- Dark/light theme with complete CSS variable token system
- All 7 activity types with type-specific form fields in Log Activity panel
- Multi-contact and vendor (sponsor) support on activities and contracts
- Relationship score display with 4-factor breakdown (Recency, Frequency, Diversity, Engagement)
- Framer Motion page transitions and slide-over panel animations
- Recharts data visualization (spend trends, activity breakdown, team heatmap, leaderboard charts)
- Mobile-responsive layouts with bottom tab bar
- Global Command Palette (Cmd+K)
- Complete mock data layer (7 JSON files, March 2026 snapshot)
- Full documentation: README, authentication, activities, requirements, brand, database schema, product, PRD

---

### Phase 2 — Backend & Core Product
**Status: Not started**

Replace the static prototype with a real, working product. Real users, real data, real persistence.

**What needs to be built:**
- [ ] Authentication — Supabase Auth (JWT + SSO), real login/session/role management
- [ ] PostgreSQL database — provision and migrate from `docs/database.md` schema; Row-Level Security for multi-tenancy
- [ ] FastAPI backend — tenant-aware API, RBAC, activity/contact/contract CRUD
- [ ] Replace all JSON mock data with live API calls
- [ ] File uploads — receipt photos and PDFs to S3/R2
- [ ] Background jobs — Celery + Redis for notifications and scoring
- [ ] Email notifications — follow-up reminders, activity digests
- [ ] Qualia/SoftPro CSV import for agent onboarding
- [ ] Closed beta with 3–5 WFG-affiliated agencies

**Milestone complete when:** A real user can sign in, log an activity, and see it persisted on next login.

---

### Phase 3 — Intelligence Layer
**Status: Not started**

Turn raw activity data into actionable insights. This is where FieldIQ starts to differentiate from a basic tracker.

**What needs to be built:**
- [ ] Relationship scoring engine — rule-based computation of 0–100 score per contact (Recency, Frequency, Diversity, Engagement) with automatic decay
- [ ] Score-based alerts — "You haven't contacted [X] in 45 days" notifications
- [ ] Activity-to-production linkage — connect logged contacts to closed orders via Qualia/SoftPro integration
- [ ] Cost & time ROI analytics — cost-per-contact, cost-per-type, spend efficiency scoring
- [ ] Export-ready performance reports
- [ ] Sponsor analytics — full attribution of co-funded activities to deal outcomes

**Milestone complete when:** Agents receive automated relationship health alerts and can see which contacts correlate with closed deals.

---

### Phase 4 — AI Layer
**Status: Not started**

Make the product proactively intelligent. Shift from reactive logging to predictive guidance.

**What needs to be built:**
- [ ] Voice activity logging — tap and speak; GPT-4o parses speech into a structured activity record
- [ ] Daily priority nudge — AI-generated briefing: who to contact today, what's at risk, what to do
- [ ] AI performance summary — plain-English monthly recap replacing charts for agents who prefer narrative
- [ ] Coaching prompt generator — manager tool: AI drafts 1:1 talking points per rep from their activity data
- [ ] Predictive contact churn — ML model flags contacts likely to go dormant before they do
- [ ] Smart follow-up suggestions — AI recommends follow-up timing and type based on relationship history

**Milestone complete when:** Agents receive a daily AI-generated action briefing with at least one specific, accurate recommendation.

---

### Phase 5 — Scale & GTM
**Status: Not started**

Grow beyond the initial WFG pilot to the broader title market.

**What needs to be built:**
- [ ] React Native mobile app (Expo) — offline-capable field logging
- [ ] White-label offering — configurable branding for title underwriters beyond WFG
- [ ] Integrations marketplace — Salesforce, HubSpot, Google Workspace connectors
- [ ] Territory & market intelligence — map view with activity heat overlay by zip code
- [ ] Industry benchmarks — anonymized aggregate data: how your team compares to the market
- [ ] SOC 2 Type II compliance audit readiness
- [ ] Self-serve onboarding and subscription billing (Stripe)
- [ ] Referral program — agencies refer other agencies → subscription credit

**Milestone complete when:** Platform is live in production with paying customers outside the initial WFG pilot.

---

## Tech Stack

| Layer | Prototype (Now) | Production (Target) |
|-------|----------------|---------------------|
| Web | Next.js 14 + TypeScript | Next.js (same) |
| Mobile | — | React Native (Expo) |
| Styling | Tailwind CSS v3 + shadcn/ui | Same |
| State | React Context API | React Query + Context |
| Auth | None (demo) | Supabase Auth (JWT + SSO) |
| API | None | FastAPI (Python) |
| Database | Static JSON | PostgreSQL (Supabase/RDS) + RLS |
| Cache | None | Redis |
| Jobs | None | Celery + Redis |
| Storage | None | AWS S3 / Cloudflare R2 |
| AI | Hardcoded strings | OpenAI GPT-4o |
| ML | None | scikit-learn |
| Infra | Localhost | Docker + ECS Fargate |

---

*Last updated: April 2026*
