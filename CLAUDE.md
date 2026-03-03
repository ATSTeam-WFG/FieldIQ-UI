# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (Vite)
npm run dev

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

> Note: `package.json` also contains `react-scripts` commands (`start`, `build`, `test`, `eject`) but the project uses Vite — use the Vite-based commands above.

## Architecture

This is a single-page React app with **no routing library and no backend**. All state is held in memory (no persistence between page refreshes).

### Single-component design

The entire application lives in `src/App.jsx` as one large component (`SalesTrackerApp`). All "screens" are inner function components defined inside `SalesTrackerApp`, giving them closure access to shared state and setters. Navigation is handled by a `currentView` string and a `renderCurrentView()` switch statement at the bottom of the file.

### Views (screens)

| `currentView` value | Component | Description |
|---|---|---|
| `login` | `LoginScreen` | Role selection (Rep or Manager) |
| `rep-dashboard` | `RepDashboard` | Rep's home with stats and recent activity |
| `add-agent` | `AddAgentScreen` | Form to add a new agent/prospect |
| `add-meeting` | `AddMeetingScreen` | Form to log a meeting with speech-to-text for notes |
| `all-meetings` | `AllMeetingsScreen` | Filterable list of all meetings |
| `all-reps` | `AllRepsScreen` | Manager view of all sales reps |
| `pipeline` | `PipelineBoard` | Kanban-style pipeline board |
| `manager-dashboard` | `ManagerDashboard` | Manager home with team analytics |

### Shared state (in `SalesTrackerApp`)

- `currentView` / `userRole` / `currentUser` — navigation and auth context
- `agents` — array of agent/prospect records with pipeline stage and deal value
- `meetings` — array of logged meetings linked to agents by `agentId`
- `notifications`, `searchTerm`, `filterType` — UI state

### Pipeline stages

Defined in `pipelineStages` array: `prospect` → `contact-made` → `meeting-held` → `proposal-sent` → `negotiation` → `closed-won` / `closed-lost`.

### Styling

`src/index.css` is a hand-rolled Tailwind-compatible utility class library (not actual Tailwind). All utility classes (spacing, colors, flex, grid, responsive breakpoints) are manually defined there. Tailwind is listed as a dev dependency but the CSS file is self-contained — do not rely on Tailwind's JIT compiler generating classes at runtime.

### Speech-to-text

`useSpeechToText` is a custom hook defined inside `SalesTrackerApp` (not a separate file). It wraps the browser's `webkitSpeechRecognition` / `SpeechRecognition` API. It is used in `AddMeetingScreen` for voice-input of meeting notes.

### Icons

All icons come from `lucide-react`, imported at the top of `App.jsx`.
