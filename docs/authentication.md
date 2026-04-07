# Authentication

FieldIQ is a demo prototype. There is no real authentication backend — no JWT, no sessions, no OAuth. The login screen exists to frame the demo experience. All access control is handled client-side via React Context.

---

## Demo Login Flow

1. User lands on `/login`.
2. Entering any credentials (or clicking the "Sign in as Demo User" shortcut) navigates to `/manager`.
3. The app is pre-signed in as **Jane Doe** (Regional Sales Manager) by default.
4. Role can be switched at any time without re-authenticating.

**Demo credentials shown on login screen:** `demo@fieldiq.ai` / `demo1234`

No validation is enforced. Any input triggers a successful login.

---

## Role System

Roles are managed by `RoleContext` (`lib/context/RoleContext.tsx`). There are two active roles:

| Role | Persona | Title | Territory |
|------|---------|-------|-----------|
| `rep` | Sarah Chen (SC) | Senior Sales Rep | Buckhead |
| `manager` | Jane Doe (JD) | Regional Sales Manager | — |

A third role (`executive`) is defined but renders a Coming Soon page — it is a stub for a future phase.

### How it works

```ts
const { role, persona, setRole, userType, canSwitch } = useRole()
```

| Value | Description |
|-------|-------------|
| `role` | The currently active view: `'rep'` or `'manager'` |
| `persona` | Name, initials, title, and territory for the active role |
| `setRole(role)` | Switch the active view |
| `userType` | The underlying logged-in user type — hardcoded to `'manager'` in demo mode |
| `canSwitch` | `true` when `userType === 'manager'`; always `true` in demo |

The **userType** never changes at runtime. It represents who is "logged in." Because the demo user is always a manager, role switching is always available — a manager can view their own rep-level dashboard.

### Role-based routing

| Active role | Default landing | Sidebar nav |
|-------------|----------------|-------------|
| `rep` | `/dashboard` | Dashboard, Activities, Contracts, Contacts, Follow-ups, Performance, Scores |
| `manager` | `/manager` | Dashboard, Team, Performance, (rep nav items also accessible) |

The app does not use Next.js middleware for route protection. All routing is client-side — components check `useRole()` and redirect or render conditionally.

---

## State Persistence

| State | Persistence |
|-------|------------|
| Active role | React state — resets on page refresh |
| Theme (dark/light) | React state — resets on page refresh |
| Form inputs | React state — discarded on panel close |
| Activity/contract data | None — static JSON mock files, never mutated |

Nothing is written to `localStorage`, `sessionStorage`, or cookies in the current prototype.

---

## Production Notes

For a production build, authentication would be replaced with:
- A real auth provider (e.g., Supabase Auth, Auth.js, Clerk)
- Server-side session validation via Next.js middleware
- Role stored in the user's database record, not client context
- Protected routes enforced at the edge (middleware.ts)

The `RoleContext` shape is designed to map cleanly to a future `useSession()` hook — `userType` would come from the JWT claim and `role` would be the currently active view context.

See [`docs/database.md`](database.md) for the `USER`, `AGENT_PROFILE`, and `MANAGER_PROFILE` schema.
