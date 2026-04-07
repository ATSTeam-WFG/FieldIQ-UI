# Activities

Activities are the core unit of relationship-building work in FieldIQ. A sales rep logs an activity each time they engage with a contact — whether that's a lunch, a drop-by visit, a CE class, or a quick call. Activities feed the relationship scoring engine, performance analytics, and follow-up queue.

---

## Activity Types

FieldIQ supports 7 activity types, each with a distinct icon in the UI:

| Type | Icon | Description |
|------|------|-------------|
| **Lunch** | Utensils | Meal with one or more contacts. Tracks spend and optional vendor sponsorship. |
| **Pop-by** | Hand (wave) | Unscheduled drop-in visit to a contact's office. Low-cost, high-frequency touchpoint. |
| **CE Class** | Graduation cap | Continuing Education class hosted or sponsored for real estate agents. Tracks attendees and venue. |
| **Coffee** | Coffee cup | Casual coffee meeting. Tracks spend, contacts, and follow-up. |
| **Closing Gift** | Gift | Gift given to a contact on closing a deal. Tracks spend and occasion. |
| **Call** | Phone | Phone call, video call, or in-person meeting. Tracks call type and outcome. |
| **Other** | Plus | Custom activity type for anything not covered above. |

---

## Vendor Involvement

Any activity can have one or more **vendors** involved. A vendor is a company (e.g., a title company, lender, or service provider) that fully or partially sponsors the activity cost. When a vendor is attached:

- The activity is marked as sponsored
- The vendor name appears in the activity table
- Spend may be split between the rep and the vendor (tracked in notes; no automatic split calculation in prototype)

Vendors are selected from the same contact list, filtered to type `vendor`.

---

## Logging an Activity

Activities are logged via the **Log Activity** slide-over panel (`components/fieldiq/LogActivityPanel.tsx`), accessible from:
- The "Log Activity" button in the dashboard and activities page
- The Command Palette (Cmd+K)

### Form Fields

**Step 1 — Activity type** (required)  
Select one of the 7 type tiles. The remaining form fields adapt based on the selected type.

**Step 2 — Contacts** (required)  
Multi-select. One or more contacts from the contact roster.

**Step 3 — Vendor** (optional)  
Single or multi-select. Vendor contacts who co-sponsored the activity.

**Step 4 — Date and Time**  
Date picker and time picker. Defaults to today.

**Step 5 — Duration** (Lunch, Coffee, CE Class, Pop-by)  
Dropdown: 30m, 1h, 1h 30m, 2h, 2h 30m, 3h, Other.

**Step 6 — Spend** (optional)  
Dollar amount. Represents the rep's portion of the cost.

**Step 7 — Notes** (optional)  
Free-text field for context, discussion points, outcomes.

**Step 8 — Follow-up** (optional toggle)  
If enabled, captures a follow-up note and date. Creates an item in the Follow-ups queue.

### Type-specific Fields

| Type | Extra fields |
|------|-------------|
| Lunch, Coffee | Duration dropdown, occasion (Regular Visit / Birthday / Holiday / New Listing / Other) |
| Pop-by | Duration dropdown |
| CE Class | Duration dropdown, venue/location |
| Closing Gift | Occasion dropdown |
| Call | Call type (Phone / Video / In-Person), outcome notes |
| Other | Free-form label |

---

## Activity Status Lifecycle

```
logged  →  follow-up  →  complete
```

| Status | Meaning |
|--------|---------|
| `logged` | Activity was recorded, no follow-up action needed |
| `follow-up` | A follow-up action was captured when logging; appears in the Follow-ups queue |
| `complete` | Follow-up was marked done |

Status is shown as a color-coded badge (`StatusBadge` component) throughout the UI.

---

## Follow-ups Queue

The Follow-ups page (`/follow-ups`) surfaces all activities with a `follow-up` status, grouped by urgency:

| Group | Definition |
|-------|-----------|
| **Overdue** | Follow-up date has passed |
| **This Week** | Follow-up date falls within the current calendar week |
| **Upcoming** | Follow-up date is beyond this week |

Each follow-up item shows:
- Activity type icon
- Activity label (e.g., "Q2 Pipeline Lunch")
- Contact name and company
- Follow-up note
- Actions: Add to Calendar (Google / Outlook), Mark Complete, Cancel

---

## Mock Data Shape

Activities are stored in `lib/mock-data/activities.json`. Each entry has the following shape:

```json
{
  "id": "act-001",
  "agentName": "Sarah Chen",
  "agentInitials": "SC",
  "type": "Lunch",
  "contactName": "Marcus Webb",
  "contactCompany": "Peachtree Realty Group",
  "contacts": [
    { "id": "contact-001", "name": "Marcus Webb", "initials": "MW", "company": "Peachtree Realty Group" }
  ],
  "vendors": [],
  "sponsored": false,
  "date": "2026-03-11",
  "time": "12:30 PM",
  "notes": "Discussed Q2 pipeline...",
  "spend": 142,
  "followUp": "Send CE class invite by Friday",
  "status": "follow-up",
  "label": "Q2 Pipeline Lunch"
}
```

For the production database schema, see [`docs/database.md`](database.md) — specifically the `ACTIVITY` and `FOLLOW_UP` entities.

---

## Impact on Relationship Score

Each logged activity contributes to the contact's relationship score across four factors:

| Factor | What it measures |
|--------|-----------------|
| **Recency** | How recently the contact was engaged |
| **Frequency** | How often the contact is engaged over time |
| **Diversity** | Variety of activity types used with this contact |
| **Engagement** | Depth of interactions (spend, follow-ups, notes) |

Scores are calculated per-contact and displayed as a 0–100 ring on the Scores page and in contact detail views. In the current prototype, scores are pre-computed in `lib/mock-data/contacts.json`.
