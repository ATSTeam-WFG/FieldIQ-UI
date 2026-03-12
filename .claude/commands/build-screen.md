# /build-screen

Build a complete FieldIQ screen: reads Pencil design, reads PRD, builds page + components, verifies types.

## Usage
```
/build-screen [screen name]
```

Examples:
- `/build-screen Login`
- `/build-screen Agent Dashboard`
- `/build-screen Log Activity`
- `/build-screen Contact Profile`
- `/build-screen Manager Dashboard`

## Route mapping

| Screen Name | App Router path | Notes |
|-------------|----------------|-------|
| Login | `app/login/page.tsx` | No layout wrapper — full-page |
| Agent Dashboard | `app/dashboard/page.tsx` | Uses AppShell with Sidebar |
| Log Activity | `app/dashboard/page.tsx` (slide-over) | Sheet component triggered from dashboard |
| Contact Profile | `app/contacts/[id]/page.tsx` | Uses AppShell |
| Manager Dashboard | `app/manager/page.tsx` | Uses AppShell |

## Step-by-step execution

### Step 1 — Read the Pencil design
Run `/pencil-read [screen name]` first (internally):
1. Call `mcp__pencil__get_editor_state` — confirm active .pen file
2. Call `mcp__pencil__batch_get` with the screen name as pattern
3. Call `mcp__pencil__snapshot_layout` on found nodes
4. Call `mcp__pencil__get_screenshot` for visual reference
5. Note all components, colors, spacing, and text content from the design
**NEVER proceed to coding without completing this step.**

### Step 2 — Read the PRD section
Read `docs/fieldiq-prd.md` and find the section for the target screen. Extract:
- Screen purpose and key interactions
- Required data fields
- Component list
- Acceptance criteria

### Step 3 — Read CLAUDE.md
Read `/CLAUDE.md` (project root). The design token rules in the "Design Token Rules (NEVER VIOLATE THESE)" section apply to every line of code you write.

### Step 4 — Audit existing components
Read `components/fieldiq/` directory listing. For each component the screen needs:
- If it already exists → import and reuse it
- If it doesn't exist → create it with `/add-component` before building the page

Always read these base components regardless:
- `components/fieldiq/AppShell.tsx`
- `components/fieldiq/KPICard.tsx`
- `components/fieldiq/Sidebar.tsx`

### Step 5 — Read mock data
Check `lib/mock-data/` for relevant JSON files. Read the ones the screen will consume.

### Step 6 — Build

#### Page file rules:
- `'use client'` at top if page uses hooks, state, or event handlers
- Import from `@/components/fieldiq/`, `@/lib/mock-data/`, `@/lib/context/`
- For AppShell pages: wrap content in `<AppShell>` with `activeItem` prop set
- TypeScript — no `any`, no untyped props

#### Design token rules (NEVER violate):
- `#c4a574` gold ONLY for: KPI values, card top borders, active states, score rings, progress bar fills, "View all" links. Never as a large background fill.
- Cards use `.fieldiq-card` class — 2px gold top border + shadow. Never re-implement manually.
- Sidebar active: `.sidebar-item-active` class — left border only, no filled background.
- No `red` anywhere. Warnings = `#d97706` amber only.
- No gradients on content cards.
- Dark mode default. Every element uses `var(--*)` tokens so light mode works automatically.
- Font: Inter throughout. No decorative fonts.
- Border radius: `rounded-[8px]` everywhere.
- Spacing: 8px base unit (p-2=8px, p-4=16px, p-6=24px, gap-2, gap-4, gap-6).
- Shadows: `0 1px 3px rgba(0,0,0,0.06)` max. No heavy shadows.

#### Layout patterns by screen type:

**Login page (no AppShell):**
```tsx
<main className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
  <div className="fieldiq-card w-full max-w-sm p-8">
    {/* form content */}
  </div>
</main>
```

**Dashboard pages (with AppShell):**
```tsx
<AppShell activeItem="Dashboard">
  <div className="p-6 space-y-6">
    {/* page content */}
  </div>
</AppShell>
```

**Slide-over (Log Activity):**
- Use shadcn `Sheet` component from `@/components/ui/sheet`
- Trigger from a button on the dashboard page
- Sheet side="right", width ~480px
- Form fields use shadcn `Input`, `Select`, `Textarea` from `@/components/ui/`
- Submit → show `SuccessToast` from `components/fieldiq/SuccessToast.tsx`

### Step 7 — Type check
After writing all files, run:
```
npx tsc --noEmit
```
Fix any type errors before reporting done.

### Step 8 — Report
Output:
- Files created/modified (with paths)
- Components used (existing vs. new)
- Mock data wired up
- Any Pencil design details that shaped the layout
- Result of `tsc --noEmit`

## What NOT to do
- Never hardcode data — always import from `lib/mock-data/`
- Never use `localStorage` for theme/role — use React Context from `lib/context/`
- Never add auth guards — demo mode, auto-login only
- Never use colors not in the CLAUDE.md token list
- Never skip the Pencil read step
- Never use `any` in TypeScript
