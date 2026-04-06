# FieldIQ

AI-powered field sales intelligence platform for the title insurance industry. Built as a high-fidelity interactive prototype for investor and sales demos.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **UI Primitives:** shadcn/ui + Radix UI
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React
- **Font:** Inter (Google Fonts)

## Project Structure

```
app/                  # Next.js App Router pages
├── dashboard/        # Agent dashboard
├── manager/          # Manager dashboard
├── contacts/         # Contacts list + detail ([id])
├── activities/       # Activity log
├── contracts/        # Contracts
├── follow-ups/       # Follow-up queue
├── performance/      # Performance analytics
├── scores/           # Relationship scores
├── settings/         # User settings
├── team/             # Team roster (manager)
├── agent/[id]/       # Agent detail (manager)
├── login/            # Login screen
└── coming-soon/      # Placeholder for unbuilt screens

components/
├── ui/               # shadcn/ui primitives
└── fieldiq/          # FieldIQ-specific components

lib/
├── context/          # React Context providers
├── hooks/            # Custom React hooks
├── mock-data/        # JSON mock data (demo mode)
└── utils.ts          # Shared utilities
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo credentials:** `demo@fieldiq.ai` / `demo1234`

## Demo Mode

- No real authentication — auto-login as demo user
- Role switcher always visible (Agent / Manager)
- All form submissions succeed and show a toast
- Data is hardcoded JSON mock data (March 2026 snapshot)
