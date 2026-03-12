# /verify-design

Audit FieldIQ component files against design token and brand rules from CLAUDE.md and BRAND.md.
Reports violations with file:line references.

## Usage
```
/verify-design [file or component name]
/verify-design              # audits all of components/fieldiq/ and app/
```

Examples:
- `/verify-design KPICard`
- `/verify-design login/page.tsx`
- `/verify-design components/fieldiq/ScoreRing.tsx`
- `/verify-design` — audits entire `components/fieldiq/` and `app/` tree

## What this skill does

### Step 1 — Resolve target files
- If an argument is given, find the file:
  - Try `components/fieldiq/[arg].tsx`
  - Try `app/[arg]`
  - Try the path literally
- If no argument, list all `.tsx` files in `components/fieldiq/` and `app/` recursively

### Step 2 — Read each file
Read every resolved file in full.

### Step 3 — Run checks

For each file, check every line against these rules:

---

#### Rule 1: Gold must not be a large background
- Pattern: any `background`, `backgroundColor`, `bg-[#c4a574]`, `bg-gold` set to `#c4a574` or `var(--gold)`
- Exception: `.fieldiq-card` top border (lives in global CSS, not inline)
- Exception: score ring SVG stroke, progress bar fill (narrow elements, not area fills)
- Exception: primary button in dark mode (`bg-[#c4a574]` on a `<button>` is the dark mode primary spec)
- **Flag:** ⚠️ GOLD-BG — Gold used as large background fill

#### Rule 2: No gold on all 4 card borders
- Pattern: `border: ... #c4a574` or `border-color: #c4a574` applied to all sides (shorthand `border`, not `border-top`)
- Exception: `border-top` or `borderTop` gold is correct (`.fieldiq-card` pattern)
- **Flag:** ⚠️ GOLD-ALL-BORDERS — Gold on all 4 card borders (top only allowed)

#### Rule 3: No red anywhere
- Pattern: any value containing:
  - CSS named color: `red`
  - Hex prefixes in the Tailwind red range: `#ef4`, `#ef2`, `#f87`, `#dc2`, `#b91`, `#991`, `#7f1`
  - Tailwind classes: `text-red-`, `bg-red-`, `border-red-`, `ring-red-`
- **Flag:** ⚠️ RED-COLOR — Red color used (use amber #d97706 for warnings instead)

#### Rule 4: Sidebar active items must not have filled background
- Pattern: `.sidebar-item-active` or `isActive` branch with `backgroundColor` or `bg-` class set to anything other than `transparent`
- **Flag:** ⚠️ SIDEBAR-BG — Sidebar active item has background fill

#### Rule 5: Gradients only permitted on TopNav — not on content cards
- Permitted: `linear-gradient(135deg, #000000, #1a1a1a)` on TopNav / nav bar elements
- Violation: `linear-gradient`, `radial-gradient`, `bg-gradient-` on any `.fieldiq-card`, dashboard section, or content container
- **Flag:** ⚠️ CARD-GRADIENT — Gradient on content card or non-nav element

#### Rule 6: Hardcoded colors outside approved list
Any hex color not in this list should be flagged:

**Brand / gold:**
- `#c4a574`, `#a68751`, `#d4b584`

**Semantic:**
- `#16a34a` (success green)
- `#d97706` (warning amber — the ONLY non-gold accent allowed)

**Dark mode surfaces:**
- `#0f0f0f` (background), `#171717` (card), `#1a1a1a` (surface/elevated), `#27272a` (border)
- `#000000` (nav background)

**Light mode surfaces:**
- `#fafaf9` (background), `#ffffff` (card), `#f5f3ef` (surface), `#e4e4e7` (border), `#f4f4f5` (ghost hover)

**Typography:**
- `#000000`, `#3f3f46` (body), `#71717a` (muted light), `#1a1a1a` (headings light)
- `#ffffff`, `#d4d4d8` (body dark), `#a1a1aa` (muted dark), `#e5e5e5` (nav text dark)

**Chart palette (Recharts only — muted slate tones):**
- `#334155`, `#1e293b`, `#475569`, `#2563eb` (sparingly)

- **Flag:** ⚠️ UNKNOWN-COLOR — Unrecognized hex color

#### Rule 7: TypeScript `any` usage
- Pattern: `: any`, `as any`, `<any>`
- **Flag:** ⚠️ ANY-TYPE — TypeScript `any` used

#### Rule 8: Chart colors must use the approved slate palette
- Scan files that import from `recharts` or use `<BarChart>`, `<LineChart>`, `<PieChart>`, `<Area>`, `<Bar>`, `<Line>`, `<Cell>`
- Check `fill`, `stroke`, `color` props on chart primitives
- Approved chart colors: `#334155`, `#1e293b`, `#475569`, `#2563eb` (accent, sparingly), `#c4a574` (single highlight series only)
- Any bright or saturated color on a chart element → flag
- **Flag:** ⚠️ CHART-COLOR — Chart uses unapproved color (use muted slate tones)

#### Rule 9: Button variants must follow brand spec
- Scan `<button>` elements and shadcn `<Button>` components
- **Primary button (light mode):** background `#000000`, text `#fafaf9`
- **Primary button (dark mode):** background `#c4a574`, text `#000000`
- **Secondary button:** border `#c4a574`, text `#c4a574`, no background fill
- **Ghost button:** no border, hover background `#f4f4f5` (light) or `var(--surface)` (dark)
- Flag buttons with bright/saturated background colors or wrong text contrast
- **Flag:** ⚠️ BUTTON-SPEC — Button variant doesn't match brand spec

#### Rule 10: Typography must use token variables, not raw hex
- Heading-level text (`text-2xl` and above, or `font-bold`/`font-semibold` on headings): must use `var(--foreground)` or `style={{ color: 'var(--foreground)' }}`
- Body text: must use `var(--body)` or `var(--foreground)`
- Supporting / label text: must use `var(--muted)`
- Flag any heading or body text using a raw hex like `#000000`, `#ffffff`, `#1a1a1a` directly instead of a CSS variable
- Exception: inline styles that are intentionally hardcoded gold values (`#c4a574`) on KPI numbers
- **Flag:** ⚠️ RAW-COLOR-TEXT — Text color hardcoded as hex instead of CSS variable

#### Rule 11: Layout containers must have responsive breakpoints
- Scan grid and flex layout containers (`grid`, `flex`, `grid-cols-*`)
- Any `grid-cols-N` with N > 1 that has no `sm:` or `md:` responsive variant → flag
- Any fixed-width container (`w-[Npx]` with N > 400) with no responsive variant → flag
- **Flag:** ⚠️ NO-RESPONSIVE — Layout not responsive (missing sm:/md: breakpoint)

---

### Step 4 — Output report

```
## Design Verification Report

### Files checked: N
[list of files]

---

### Violations

| File | Line | Rule | Code |
|------|------|------|------|
| components/fieldiq/Foo.tsx | 42 | ⚠️ GOLD-BG | backgroundColor: '#c4a574' |
...

### Passing checks
[List each file with ✅ and which rules it passed]

---

### Summary
- Total files: N
- Total violations: N
- Files with violations: N
- Files clean: N
```

If there are zero violations across all rules:
```
✅ All N files pass all design token and brand rules. No violations found.
```

## After reporting
If violations are found, ask the user: "Would you like me to fix these violations now?"
If yes, fix each violation in place using the Edit tool, then re-run the checks to confirm clean.
