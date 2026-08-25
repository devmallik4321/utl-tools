# UTL.tools — Project Intelligence V1 Integration Specification

---

## 1. Executive Summary & Purpose
**PROJECT INTELLIGENCE V1** integrates the canonical reusable capability `RO-PROJECT-INTELLIGENCE-001` (located at `C:\Users\mallik\Documents\AAEP\reusable objects\PROJECT-INTELLIGENCE`) into **UTL.tools** as its first active project consumer.

Its objective is to answer:
> *"What is happening with UTL.tools, what changed, what opportunities exist, and what should we consider doing next?"*

---

## 2. Architectural Pipeline & Safety Invariants

```
PUBLIC INTERNET / EXTERNAL DEMAND
              │
  [Internet Intelligence Adapter]
              │
              ▼
   [UTL.tools SENSORS & ADAPTERS]
  ├── Google Analytics 4 (G-H2G4BK9Y36)
  ├── Google Search Console (https://utl.tools)
  ├── Application Telemetry (47 Tools + 12 Widgets)
  └── Canonical Control Center State
              │
              ▼
    1. LOAD UTL PROJECT CONTRACT
              │
              ▼
    2. INGEST & NORMALIZE OBSERVATIONS  (Epistemic Fact vs Estimate tagging)
              │
              ▼
    3. DETECT TRENDS & ANOMALIES        (Increasing / Accelerating / Drops)
              │
              ▼
    4. EVALUATE OPPORTUNITY RULES       (Multi-factor Scoring P0 - P3)
              │
              ▼
    5. GENERATE RECOMMENDATIONS         (approval_required = true)
              │
              ▼
    6. HUMAN OPERATOR GOVERNANCE        (APPROVE / REJECT / PARK)
              │
              ▼
    7. BOUNDED EXECUTION HANDOFF        (Antigravity CLI Sprint Task)
              │
              ▼
    8. VALIDATION & LEARNING LEDGER     (Before vs After Reconciliation)
```

### Critical V1 Safety Rule: Read-Only Advisory Intelligence
* Project Intelligence V1 is strictly **read-only**.
* The system analyzes observations, detects opportunities, scores priorities, and writes structured records to `UTL-CONTROL-CENTER.xlsx`.
* **Zero autonomous code modifications, zero automatic deployments, zero unapproved changes.**
* All execution handoffs require explicit human operator approval (`approval_required = true`).

---

## 3. Configured Provider Adapters

| Provider ID | Source Type | Status | Epistemic Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `SRC-UTL-TELEMETRY` | `REGISTRY_INSPECTION` | `SUCCESS` | `FACT` | Tracks 47 active production utilities and 12 Windows widgets with verified structure. |
| `SRC-GA4-UTL` | `GA4_REPORTING_ADAPTER` | `AUTH_REQUIRED` | `ESTIMATE` | Client-side tracking active (`G-H2G4BK9Y36`). Server-to-server Data API requires service credentials. |
| `SRC-GSC-UTL` | `GSC_SEARCH_ANALYTICS` | `AUTH_REQUIRED` | `ESTIMATE` | Property verified (`https://utl.tools`). Search Analytics API requires service credentials. |
| `SRC-INTERNET-INTEL-FABRIC` | `SENSOR_FABRIC` | `AVAILABLE` | `ESTIMATE` | Ingests upstream external demand indices from `intelligence/observations/store.json`. |

---

## 4. Control Center Integration (`UTL-CONTROL-CENTER.xlsx`)

The canonical Control Center workbook (`control/UTL-CONTROL-CENTER.xlsx`) now maintains 21 fully verified worksheets:
* **`P-Dashboard`**: Houses high-level Project Intelligence health status, GA4/GSC authentication states, and open opportunities count.
* **`C-GrowthObservations`**: Houses multi-source historical observations with epistemic tags (`FACT`, `ESTIMATE`), previous values, and change percentage.
* **`C-GrowthOpportunities`**: Houses prioritized opportunities (P0–P3) with evidence IDs, human status dropdowns (`OPEN`, `REVIEW`, `APPROVED`, `REJECTED`, `PARTIAL`, `PARKED`, `DONE`), and human comment fields.

---

## 5. Execution Commands

### Run Project Intelligence & Sync Control Center
```bash
node scripts/run_project_intelligence.mjs
```

### Validate Control Center Invariants (100% Pass)
```bash
node scripts/validate_control_center.mjs
```

### Run Automated Unit Test Suite
```bash
node --test tests/utl_project_intelligence.test.mjs
```
