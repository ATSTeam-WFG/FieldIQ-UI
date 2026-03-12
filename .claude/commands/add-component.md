# /add-component

Create a new FieldIQ component in `components/fieldiq/`.

## Usage
```
/add-component [ComponentName]
```

Examples:
- `/add-component ScoreRing`
- `/add-component ActivityTile`
- `/add-component HorizontalBar`
- `/add-component AlertBanner`
- `/add-component PeriodSelector`

## What this skill does

1. **Read CLAUDE.md** at the project root to load design token rules. Never skip this — token rules are strict.

2. **Read 2–3 existing fieldiq components** as patterns. Always read these before writing:
   - `components/fieldiq/KPICard.tsx` — card + gold value pattern
   - `components/fieldiq/Sidebar.tsx` — active state + CSS var pattern
   - `components/fieldiq/StatusBadge.tsx` — small utility component pattern

3. **Check Pencil for the component design.** Call `mcp__pencil__batch_get` with the component name as a pattern. If a matching node is found, read it with `mcp__pencil__snapshot_layout` and `mcp__pencil__get_screenshot` before writing any code. If no node is found, proceed with token rules only — never guess from memory.

4. **Create the component file** at `components/fieldiq/[ComponentName].tsx` following these rules:

   **File structure:**
   ```tsx
   'use client'  // only if the component uses hooks or state

   interface [ComponentName]Props {
     // all props typed — no `any`
   }

   export function [ComponentName]({ ... }: [ComponentName]Props) {
     return (
       // JSX here
     )
   }
   ```

   **Design token rules (NEVER violate):**
   - Use `var(--*)` CSS variables for all theme colors: `var(--card)`, `var(--border)`, `var(--foreground)`, `var(--muted)`, `var(--surface)`, `var(--background)`
   - Gold `#c4a574` is allowed ONLY for: KPI values, card top borders (top edge only), active states, score rings, progress bar fills, "View all" links. Never as a large background.
   - Cards MUST use the `.fieldiq-card` CSS class (adds the 2px gold top border + shadow). Do not re-implement card borders manually.
   - Sidebar active items MUST use `.sidebar-item-active` class. Never a filled gold background.
   - No `red` anywhere. Warnings = `#d97706` amber only.
   - No gradients on content cards. Use `0 1px 3px rgba(0,0,0,0.06)` shadow max.
   - Border radius: `8px` throughout. Use `rounded-[8px]` in Tailwind.
   - Spacing: 8px base unit. Use Tailwind multiples of 2 (p-2, p-4, p-6, gap-2, etc.).

5. **Run type check** after writing:
   ```
   npx tsc --noEmit
   ```
   If errors appear, fix them before reporting done.

6. **Report** the component name, file path, props interface, and any Pencil design details found.

## Common component patterns

**ScoreRing** — circular progress ring around a number score
- Use SVG with `stroke-dasharray` / `stroke-dashoffset`
- Ring stroke color: `#c4a574`
- Background ring: `var(--border)`
- Center text: score number in `#c4a574`, label below in `var(--muted)`

**ActivityTile** — card showing a single logged activity
- Use `.fieldiq-card` class
- Left accent: colored dot or icon using `var(--muted)` or activity-type color
- Title in `var(--foreground)`, meta in `var(--muted)`
- No red. Use amber `#d97706` for alerts.

**HorizontalBar** — labeled progress bar
- Track: `var(--border)` background, `h-2`, `rounded-full`
- Fill: `#c4a574`, `rounded-full`, width as % of value/max
- Label left, value right, both in `var(--muted)` or `var(--body)`

**AlertBanner** — dismissible info/warning banner
- Background: `var(--surface)`, border: `1px solid var(--border)`
- Warning icon: amber `#d97706`. No red.
- Text: `var(--body)`. Close button: `var(--muted)`.

**PeriodSelector** — tab/toggle for time period (This Week / This Month / YTD)
- Active tab: bottom border `2px solid #c4a574`, text `var(--foreground)`
- Inactive: text `var(--muted)`, no border
- Never fill active tab with gold background
