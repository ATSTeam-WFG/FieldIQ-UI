# Title Closing Software Integration — Research & Planning

> **Status:** Brainstorm / Strategic Research
> **Prepared:** March 2026
> **Scope:** Integration of FieldIQ with Qualia, SoftPro, RamQuest, and AccuTitle

---

## 1. Why This Matters for FieldIQ

Title agents live between two worlds: a **sales CRM** (tracking activities, contacts, follow-ups) and a **closing platform** (where the actual deal data lives). The gap between these two systems is where friction accumulates:

- A rep closes 8 deals in March but must manually enter each one in the CRM
- Follow-up reminders can't fire automatically when a closing is confirmed
- Manager dashboards show activity volume but not deal outcomes
- Score rings and performance KPIs rely on manually entered data that goes stale

Bridging FieldIQ to title closing software would make deal data automatic, accurate, and real-time — transforming the app from a manual logging tool into a live intelligence layer.

---

## 2. Platform Landscape (March 2026)

| Platform | Market Position | API Maturity | CRM-Readiness |
|----------|----------------|-------------|---------------|
| **Qualia** | Dominant, cloud-native leader | ★★★★★ GraphQL + REST | Best in class |
| **SoftPro** | Established enterprise player | ★★★☆☆ SDK + MISMO XML | Medium effort |
| **RamQuest** | ⚠️ Acquired by Qualia (Jan 2025) | ★★☆☆☆ Partner network only | Deprecated |
| **AccuTitle** | Niche, underwriter-focused | ★☆☆☆☆ No public API docs | High effort / low ROI |

### Critical Market Note: Qualia Acquires RamQuest (January 2025)
Qualia acquired RamQuest and the E-Closing platform from Old Republic International in January 2025. RamQuest CCE is supported for 3 years post-acquisition; RamQuest One for 1 year. Both will be sunset. **Any RamQuest integration investment should be deprioritized** — Qualia is the correct long-term target for that customer base.

---

## 3. What Data We Can Get From Each Platform

### 3.1 Qualia (GraphQL + REST API)

The richest source. Qualia exposes a comprehensive developer API with:

**Transaction / Deal Data**
- Order ID, order type, property address
- Opening date, closing date, funding date
- Transaction amounts (purchase price, loan amount, title fees)
- Current file status (open, in-process, closed, cancelled, exception)
- Closing type (purchase, refi, commercial, 1031 exchange)

**Parties & Contacts**
- Buyers and sellers (name, email, phone)
- Referring real estate agents and brokerages
- Loan officers and lending institutions
- Title agents and processors assigned to file
- Closing attorneys

**Activity & Notes**
- Internal task completion status
- Exception/issue flags and resolution
- Message thread (internal)
- Document upload timestamps

**Financial**
- Revenue breakdown (lender's title, owner's title, closing fees)
- Escrow amounts
- Disbursements

**Reference:** `https://qualia-apis.readme.io/` | Partner API: `https://www.qualia.com/partner-api/`

---

### 3.2 SoftPro (SDK + MISMO XML)

SoftPro's integration model centers on the **SoftPro 360** vendor portal, which enables bidirectional data exchange with approved partners. A formal SDK is also available for custom integrations.

**What's Available**
- Full order/file data (bidirectional if approved vendor)
- File status and workflow stage
- MISMO XML export: full closing data in industry-standard schema (order details, parties, amounts, compliance data)
- Document repository (upload/download into closing file)
- eClosing data: MISMO XML import for electronic closing documents with eSignatures and RON support

**Integration Path for FieldIQ**
1. Apply to become a SoftPro 360 integrated vendor
2. Receive MISMO XML exports via scheduled file exchange (SFTP or API)
3. Parse MISMO XML in FieldIQ ETL pipeline for nightly data sync

**Reference:** `https://www.softprocorp.com/real-estate-software-solutions/softpro-360-data-integration/`

---

### 3.3 RamQuest (Closing Market network — Deprecated)

RamQuest operated a "Closing Market" partner network (A-to-A interface) rather than a traditional API. Since the Qualia acquisition, this is effectively on a deprecation path.

**Current status:** RamQuest CCE: 3-year support window. RamQuest One: 1-year support window.

**Recommendation:** Do not invest integration effort here. RamQuest customers will migrate to Qualia. Build the Qualia integration and it will capture this market automatically.

---

### 3.4 AccuTitle (Underwriter-focused, limited API)

AccuTitle (brands: Landtech, TitleFusion, TrackerPro, Closers' Choice) focuses heavily on underwriter partnerships (First American, Westcor, Stewart Title). No public API documentation exists.

**What integration would look like:** Custom negotiation with AccuTitle's partnership team. No self-serve path.

**Recommendation:** Lowest priority. AccuTitle holds a small niche market share, lacks developer infrastructure, and would require a dedicated partnership arrangement. Defer unless a high-value enterprise customer specifically requires it.

---

## 4. What FieldIQ Should Pull In

Once integrated, the following data would power the existing FieldIQ features automatically:

| FieldIQ Feature | Data Needed | Source |
|----------------|-------------|--------|
| Score ring (closed deals) | Closed order count + amounts | Qualia / SoftPro |
| Performance KPIs | Transaction volume, avg deal value | Qualia / SoftPro |
| Follow-up triggers | File status changes, closing confirmed | Qualia webhook |
| Contact intelligence | Referring agents, LOs per deal | Qualia / SoftPro |
| Manager dashboard | Team transaction volume, outcomes | Qualia / SoftPro |
| Activity log enrichment | Auto-attach closed deal to contact | Qualia webhook |
| Referral source tracking | Agent/LO who referred each file | Qualia contact data |

---

## 5. Integration Complexity Matrix

| Level | Method | Setup Time | Maintenance | Real-Time | Best For |
|-------|--------|-----------|-------------|-----------|---------|
| 1 | Webhook listener | 1–2 weeks | Low | ✅ Yes | Deal status events |
| 2 | REST API pull | 4–8 weeks | Medium | ✅ Yes | Order queries, contact sync |
| 3 | MISMO XML batch | 6–10 weeks | Medium | ❌ Batch | Closing archive, compliance |
| 4 | Bidirectional sync | 8–16 weeks | High | ✅ Yes | Enterprise, full data parity |

### Recommended Path: Level 1 + Level 2 (Qualia first)

**Phase 1 — Qualia Webhooks (Weeks 1–4)**
- Register webhook URL in Qualia developer portal
- Listen for events: `order.opened`, `order.closed`, `order.cancelled`, `order.exception`
- On `order.closed`: auto-log completed deal to FieldIQ contact, trigger follow-up task
- On `order.opened`: create pipeline entry linked to referring agent contact

**Phase 2 — Qualia REST/GraphQL Queries (Weeks 5–12)**
- Query order details, parties, amounts on-demand
- Sync contacts: referring agents, LOs — match to FieldIQ contact records
- Enrich score ring and KPI tiles with real closed-deal data
- Pull last 90 days of transactions for historical seeding

**Phase 3 — SoftPro MISMO XML Import (Weeks 13–20, if needed)**
- Enroll as SoftPro 360 vendor
- Schedule nightly SFTP pull of MISMO XML batch exports
- Build ETL parser to map MISMO fields → FieldIQ data model
- Surface SoftPro-sourced deals alongside Qualia deals

---

## 6. MISMO Standard — Brief Explanation

**MISMO** (Mortgage Industry Standards Maintenance Organization) is an XML schema maintained by the Mortgage Bankers Association. It defines a standard format for exchanging data across the entire real estate finance lifecycle — from loan origination to title closing to investor reporting.

In title software, MISMO is used to:
- Export closing data in a machine-readable, compliance-aligned format
- Populate Closing Disclosure (CD) forms automatically
- Support RESPA data requirements
- Enable data exchange between lenders, title companies, and closing agents

For FieldIQ, MISMO XML is the format SoftPro would deliver data in. Parsing it requires understanding the MISMO v3.0 schema — a one-time investment that can then be used for any MISMO-compliant system.

---

## 7. Authentication & Security Notes

| Platform | Auth Method | Security Certs |
|----------|-------------|----------------|
| Qualia | HTTP Basic Auth + API key (OAuth planned) | SOC 2, ISO 27001, ALTA Best Practices Pillar 3 |
| SoftPro | Vendor approval + SDK credential | Vendor-level agreements |
| RamQuest | Partner network enrollment | Closing Market agreement |
| AccuTitle | Custom negotiation | Unknown |

All integrations involving real estate transaction data require careful attention to:
- GLBA (Gramm-Leach-Bliley Act) — protects NPI in financial services
- State-level privacy laws
- ALTA Best Practices (title-industry security standards)
- Minimum data principle — only pull what FieldIQ actually displays or acts on

---

## 8. Existing CRM Integrations (Industry Context)

Several title-specific CRM products already have native integrations with these platforms:

- **Title 360 CRM** — native integration with Qualia and Resware
- **TitleTap CRM** — automated workflows connected to title platforms
- **TitleFusion** — AccuTitle's own embedded CRM elements

These are purpose-built but narrow. FieldIQ's opportunity is a more modern, AI-enriched layer that goes beyond order tracking into relationship intelligence (score rings, activity coaching, manager analytics).

---

## 9. Priority Recommendations

1. **Start with Qualia** — best API, growing market share (now includes RamQuest customer base), clear developer path
2. **SoftPro second** — adds ~30% more market coverage via MISMO XML batch
3. **Skip RamQuest** — deprecated; Qualia integration captures those customers as they migrate
4. **Defer AccuTitle** — lowest ROI; only pursue if an enterprise customer explicitly requires it

### Estimated Total Effort
| Scope | Effort | Coverage |
|-------|--------|---------|
| Qualia webhooks only | 1–2 weeks | ~40% of market |
| Qualia webhooks + REST | 6–10 weeks | ~40–50% of market |
| + SoftPro MISMO XML | +6–10 weeks | ~70–80% of market |
| + AccuTitle | +8–12 weeks (custom) | ~75–85% of market |

---

## 10. Open Questions Before Building

1. **Data privacy:** What NPI is acceptable to store in FieldIQ vs. reference-only? (Borrower names? Transaction amounts?)
2. **Sync direction:** Is FieldIQ read-only from closing software, or should it write back (e.g., log a sales activity into Qualia notes)?
3. **Contact matching:** How do we match a Qualia referring agent to an existing FieldIQ contact? (email match? phone? manual link?)
4. **Multi-system agents:** Many title offices use both Qualia and SoftPro. How do we deduplicate deals across systems?
5. **Qualia partner enrollment:** Is FieldIQ pursuing a formal Qualia marketplace partnership, or using the standard developer API?

---

*Research sources: Qualia API docs, SoftPro 360 integration page, RamQuest Closing Market docs, AccuTitle partner pages, ALTA announcements, HousingWire coverage of Qualia/RamQuest acquisition, MISMO MBA standards.*
