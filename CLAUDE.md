# CLAUDE.md — FieldMT Prototype

## What This Project Is
FieldMT is the field management tool for a title rep's book of business —
logging field activity, scoring relationships, and connecting effort to
revenue. Must feel production-ready.

## Brand Language (do not violate)
- **"Management" never appears without its object.** Write "manage your book",
  "book management". Never bare "management", and never "management tool"
  without "for your book of business". MT means managing your *book of
  business*, not managing people — the product has a `manager` role, so the
  misread is one word away.
- **Core noun is "book of business."** Native industry language; replaced the
  vaguer "relationships / contacts / people".
- **Not a CRM, and never compared to one.** Position by gap, not by enemy.
- **Never write the product name next to "empty"** — spoken aloud, FieldMT is
  one phoneme from "field empty". Use "nothing logged yet" in empty states.
- Brand strings live in `lib/brand.ts`. Never hardcode the product name.

## Tech Stack
- Next.js 14 App Router
- TypeScript
- Tailwind CSS v3
- shadcn/ui
- Framer Motion
- Recharts
- Lucide React
- Inter font via next/font/google

## Design Source
Designs live in Pencil.dev. Use the Pencil MCP tool to read each screen's
design before building it. Always read the design first — do not guess layout.

## Design Token Rules (NEVER VIOLATE THESE)
- Gold (#c4a574) is used ONLY for: KPI values, card top borders (top edge
  only), active states, score rings, progress bar fills, "View all" links.
  Never as a large background fill.
- Card border: 2px solid #c4a574 on TOP edge only. Other 3 sides:
  1px solid var(--border). Never gold on all 4 sides.
- Sidebar active item: border-left 2px solid #c4a574, transparent background,
  font-weight 600. Never a filled gold background.
- Dark mode default. Light mode available via toggle.
- No red anywhere in the UI. Warnings use #d97706 amber only.
- No gradients on content cards. Subtle shadows only.

## Color Tokens
### Light Mode
- --background: #fafaf9
- --card: #ffffff
- --surface: #f5f3ef
- --border: #e4e4e7
- --foreground: #000000
- --body: #3f3f46
- --muted: #71717a

### Dark Mode
- --background: #0f0f0f
- --card: #171717
- --surface: #1a1a1a
- --border: #27272a
- --foreground: #ffffff
- --body: #d4d4d8
- --muted: #a1a1aa

### Brand
- --gold: #c4a574
- --gold-hover: #a68751
- --gold-light: #d4b584
- --success: #16a34a
- --warning: #d97706

## Typography
- Font: Inter throughout. No decorative fonts.
- Base unit: 8px spacing system
- Border radius: 8px throughout
- Shadows: 0 1px 3px rgba(0,0,0,0.06) only

## Project Structure
See PRD for full structure. Key paths:
- /app — Next.js App Router pages
- /components/app — custom product components
- /components/ui — shadcn primitives
- /lib/mock-data — JSON mock data files
- /lib/context — React Context providers

## Demo Mode Rules
- No real auth. Auto-login as demo user.
- Theme persists in React Context (not localStorage).
- Role switcher always visible and functional.
- All form submissions succeed and show a toast.
- Out-of-scope screens show a Coming Soon page.

## Role Personas
- Sales Rep (Field Agent): Sarah Chen, Field Agent, Buckhead Territory
- Sales Manager (Title Owner): Jane Doe, Sales Manager, Premier Title Agency