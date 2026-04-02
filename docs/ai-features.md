# FieldIQ — AI Features

FieldIQ's AI layer is designed around a single principle: **reduce friction, not add features.** Every AI capability described here removes a step the user currently has to do manually. None of them require the user to learn a new concept or navigate a new screen. They appear where the user already is and do what the user was already going to do — faster.

---

## Agent-Facing AI Features

### 1. Voice Activity Logging
*Highest priority. The single highest-leverage feature in the product.*

One tap on the mic. The agent speaks naturally:

> "Had lunch with Michelle Tran at Chops, spent about $80, she mentioned she has three closings coming up next month."

The AI does the rest. It extracts the activity type (Lunch), the contact name (Michelle Tran), the spend ($80), and pulls Michelle from the agent's existing contact list automatically. The spoken context is drafted into the notes field. The agent sees a pre-filled form — they confirm and save.

The whole interaction takes 15 seconds instead of 3 minutes.

**Why this matters:** If logging takes 15 seconds, agents actually do it. If data gets logged consistently, the relationship scores are accurate, the follow-up queue is real, and everything else in the product works. Voice logging is the unlock for the entire system.

**Why it feels simple:** It looks like a mic button. Nothing else changes. No new screen, no new concept.

---

### 2. Smart Follow-Up Suggestions

After an activity is logged, the AI reads the notes and surfaces a single suggestion:

> "Michelle mentioned 3 upcoming closings — suggest following up in 2 weeks. Want to schedule that?"

One tap to confirm. The follow-up is created automatically with a pre-written note. The agent never has to think about it.

**Why it feels simple:** It appears as a single suggestion card after saving an activity. One tap yes, one tap dismiss. No configuration, no settings.

---

### 3. Daily Priority Nudge

Every morning, a push notification:

> "Good morning, Sarah. You haven't touched David Okafor in 18 days — his score is dropping. A quick pop-by today would help. Want to log it now?"

The AI ranks contacts by who is most at risk of score decay and surfaces the single most important one. Not a list of five contacts the agent has to prioritize themselves — one person, one clear action.

**Why it feels simple:** It's a notification. No new screen. Tapping it opens the log form pre-filled with that contact.

---

### 4. Performance Summary
*The "Summarizing Agent" — plain English instead of charts.*

Instead of a dashboard full of numbers the agent has to interpret, a paragraph they can actually read:

> "This month you've logged 21 activities — your best March yet, up 8% from last year. You're on track to hit your Q2 target. Your strongest relationship is Michelle Tran (score 91). The contact that needs the most attention is James Ellison — you haven't touched him in 23 days."

Available as a card on the dashboard. Tappable to expand. Readable aloud for agents who check in while driving.

**Why it feels simple:** It replaces chart-reading with reading. Agents who don't parse dashboards understand sentences. The insight is the same — the barrier to getting it is gone.

---

### 5. Contact Intelligence Card

On any contact profile, a short AI-written paragraph:

> "Michelle Tran has been one of your most engaged contacts this quarter. She responds best to lunches and CE classes. Based on her closing activity, she likely has 2–3 referrals available in the next 30 days. Your relationship score has increased 12 points since January."

This tells the agent what to do next with that contact — not just what happened in the past. It turns a record into a recommendation.

**Why it feels simple:** It's one paragraph. It replaces the score breakdown section that non-technical users ignore anyway. No new UI surface needed.

---

### 6. Auto-Categorization of Activity Type

When an agent is logging via voice or typing notes, the AI suggests the activity type before they have to pick it. If they said "lunch," the Lunch tile is pre-selected. If they said "dropped by their office," Pop-by is pre-selected.

Eliminates the cognitive step of choosing from eight tile options when the answer is usually obvious from context.

---

## Manager-Facing AI Features

### 7. Team Narrative Summary

The same principle as the agent performance summary, applied to the team:

> "Your team had a strong week. Total activities are up 12% from last month. Jane Carter continues to lead with 21 activities. Your main concern is Kevin Ross — 9 days without a log and his relationship scores are dropping. Amy Torres is showing early warning signs too. I'd suggest a quick check-in with both this week."

Replaces the need to read a leaderboard and draw your own conclusions. Delivered as a card on the Manager Dashboard, refreshed weekly.

**Why it feels simple:** Managers who don't have time to read reports will read three sentences. The analysis is already done — they just have to act on it.

---

### 8. Coaching Prompt Generator

When a manager opens an agent's detail view, the AI generates 2–3 specific coaching questions based on that agent's data:

> Suggested talking points for your 1:1 with Kevin Ross:
> - He's logged 4 activities this week vs. his target of 7 — what's getting in the way?
> - His last 3 activities were all calls — no in-person visits in 11 days. Worth discussing.
> - His relationship score with Keller Williams Buckhead dropped 8 points this month.

The manager walks into the 1:1 prepared without having to analyze anything themselves.

**Why it feels simple:** It's a collapsed card labeled "Coaching prep for Kevin Ross →". One tap to expand. Managers can ignore it entirely if they want — it never gets in the way.

---

### 9. Nudge Message Writer

When a manager sends a nudge to an underperforming agent, the AI drafts the message:

> "Hey Kevin — noticed you haven't logged any activity this week. I know it's been busy. Even a quick pop-by or call counts. Your Q2 target is within reach. Let me know if you need anything."

Manager can send as-is, edit, or discard. Removes the awkward blank message field and the friction of figuring out how to say something difficult.

**Why it feels simple:** The nudge button already exists. This just fills the message automatically.

---

### 10. Goal Recommendation Engine

When a manager is setting activity targets or budgets for agents, the AI suggests based on historical data:

> "Based on Jane Carter's last 3 months, a target of 22 activities/month is achievable and challenging. Her current budget utilization is 67% — she could absorb a $200 increase without overspending."

The manager makes a better decision faster, without pulling up spreadsheets or relying on gut feel.

---

## Design Principles for All AI Features

**Surface, don't interrupt.** AI suggestions appear as cards, nudges, or pre-filled fields — never as modals or blocking dialogs. The user is always in control.

**One action per suggestion.** Every AI output asks for a single yes/no response or one tap. No multi-step AI flows, no configuration panels, no settings to tune.

**Invisible when not needed.** If there's nothing to suggest, nothing appears. The AI is quiet until it has something worth saying.

**Plain language always.** No AI jargon, no score explanations, no model confidence indicators. Every AI-generated string reads like it was written by a thoughtful colleague.
