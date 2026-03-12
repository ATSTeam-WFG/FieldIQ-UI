# /pencil-read

Read and summarize a FieldIQ screen design from Pencil.dev.

## Usage
```
/pencil-read [screen name]
```

Examples:
- `/pencil-read Login`
- `/pencil-read Agent Dashboard`
- `/pencil-read Manager Dashboard`

## What this skill does

1. Call `mcp__pencil__get_editor_state` to confirm the active .pen file and current selection.

2. Call `mcp__pencil__batch_get` with the screen name as a pattern to find matching nodes in the design. Try multiple pattern variations if needed (e.g., "Login", "login", "Login Screen").

3. Call `mcp__pencil__snapshot_layout` on the found nodes to get computed layout rectangles (position, size, nesting).

4. Call `mcp__pencil__get_screenshot` to capture a visual of the design.

5. Output a structured summary with these sections:
   - **Screen:** Name and overall dimensions
   - **Layout hierarchy:** Nested component tree (indented list)
   - **Components found:** List each UI component type (card, button, input, etc.)
   - **Spacing & sizing:** Key measurements from the layout snapshot
   - **Text content:** All visible text strings in the design
   - **Colors used:** Every color value found — then cross-reference against CLAUDE.md tokens and flag any that don't match

## Color cross-reference rules (from CLAUDE.md)

When listing colors found in the design, check each against these rules and flag violations:

**Allowed gold uses:** KPI values, card top borders, active states, score rings, progress bar fills, "View all" links.
**Violation:** `#c4a574` or `var(--gold)` used as a large background fill → flag as ⚠️ VIOLATION

**No red anywhere:** Any color starting with `#ef`, `#f87`, `#dc`, or containing "red" → flag as ⚠️ VIOLATION
**Warnings use amber only:** `#d97706`

**Expected dark mode tokens:**
- Background: `#0f0f0f`
- Card: `#171717`
- Surface: `#1a1a1a`
- Border: `#27272a`
- Foreground: `#ffffff`
- Body: `#d4d4d8`
- Muted: `#a1a1aa`
- Gold: `#c4a574`

If a color in the design doesn't map to a known token, flag it as ⚠️ UNKNOWN TOKEN.

## Output format

```
## Pencil Design: [Screen Name]

### Layout Hierarchy
[indented tree]

### Components
[bullet list]

### Key Measurements
[table or list]

### Text Content
[all visible text strings]

### Colors
| Color | Where Used | Token? | Issues |
|-------|-----------|--------|--------|
...
```
