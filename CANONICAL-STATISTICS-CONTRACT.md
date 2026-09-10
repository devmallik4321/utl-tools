# UTL.tools — Canonical Statistics Contract

**Standard Version**: 1.0.0  
**Effective Date**: September 4, 2026  
**Status**: ACTIVE / CANONICAL GOVERNANCE  
**Authority**: Antigravity Platform Engineering & Governance Protocol  
**Repository**: `devmallik4321/utl-tools` (`UTILITY-OS`)

---

## 0. Preamble & Constitutional Invariants

This contract establishes the singular, binding operational and epistemic standard for all measurement, persistence, aggregation, reporting, and dashboard visualization across UTL.tools.

The governing principles are absolute and non-negotiable:

> **MEASURE WHAT ACTUALLY HAPPENED.**  
> **DERIVE ONLY FROM AUTHORITATIVE MEASUREMENTS.**  
> **NEVER SILENTLY RECONCILE CONFLICTING DATA.**  
> **NEVER TURN ABSENCE OF DATA INTO DATA.**  
> **NO_DATA ≠ ZERO.**  
> **NO_EXECUTION ≠ PASS.**  
> **DERIVED ≠ FACT.**  
> **SYNTHETIC ≠ EMPIRICAL.**

Any metric, aggregate, or visualization that violates the rules set forth in this contract is epistemically invalid and prohibited from production publication.

---

## 1. Supported Metrics Inventory

The UTL.tools statistics platform supports exclusively the following operational metrics:

| Metric ID | Metric Name | Category | Primary Unit | Epistemic Classification | Default Value When Absent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ga4_sessions` | GA4 Sessions | Web Traffic | sessions | `TRUTHFUL_EMPIRICAL` (Daily) / `DERIVED` (Aggregate) | `null` |
| `ga4_active_users` | GA4 Daily Active Users | Audience | user observations | `TRUTHFUL_EMPIRICAL` | `null` |
| `ga4_monthly_unique_users`| GA4 Monthly Unique Users| Audience | unique users | `VERIFIED` (Direct Query) | `null` |
| `ga4_screen_page_views` | GA4 Page Views | Engagement | views | `TRUTHFUL_EMPIRICAL` (Daily) / `DERIVED` (Aggregate) | `null` |
| `ga4_engaged_sessions` | GA4 Engaged Sessions | Engagement | sessions | `TRUTHFUL_EMPIRICAL` (Daily) / `DERIVED` (Aggregate) | `null` |
| `ga4_new_users` | GA4 New Users | Acquisition | users | `TRUTHFUL_EMPIRICAL` | `null` |
| `gsc_impressions` | Search Impressions | Search Visibility | impressions | `TRUTHFUL_EMPIRICAL` (Daily) / `DERIVED` (Aggregate) | `null` |
| `gsc_clicks` | Search Clicks | Search Visibility | clicks | `TRUTHFUL_EMPIRICAL` (Daily) / `DERIVED` (Aggregate) | `null` |
| `gsc_ctr` | Click-Through Rate | Search Visibility | percentage (`%`) | `DERIVED` (Impression-Weighted) | `null` |
| `gsc_average_position` | Average SERP Position | Search Visibility | position (1-based rank)| `DERIVED` (Impression-Weighted) | `null` |
| `utl_utility_views` | First-Party Utility Views| Product Telemetry | views | `TRUTHFUL_EMPIRICAL` | `null` |
| `utl_tool_executions` | First-Party Executions | Product Telemetry | executions | `TRUTHFUL_EMPIRICAL` | `null` |
| `widget_views` | Widget Embed Views | Product Telemetry | views | `TRUTHFUL_EMPIRICAL` | `null` |
| `internal_target_sessions`| Internal Sessions Target | Business Planning | sessions | `INTERNAL_BUSINESS_TARGET` | 1,000 |

No additional synthetic operational metrics may be created or persisted.

---

## 2. Authoritative Source Registry

Every metric has exactly one primary authoritative external or local provider:

1. **Google Analytics 4 Data API (v1beta)**:
   - **Provider ID**: `SRC-GA4-UTL`
   - **Property ID**: `551527574`
   - **Measurement ID**: `G-H2G4BK9Y36`
   - **Service Account Identity**: Authenticated via `GoogleAuthClient` using the canonical Google Cloud Service Account key file.
   - **Scope**: `https://www.googleapis.com/auth/analytics.readonly`

2. **Google Search Console Search Analytics API (v3)**:
   - **Provider ID**: `SRC-GSC-UTL`
   - **Site URL**: `sc-domain:utl.tools`
   - **Scope**: `https://www.googleapis.com/auth/webmasters.readonly`

3. **UTL First-Party Telemetry Ingestion Subsystem**:
   - **Provider ID**: `SRC-UTL-TELEMETRY`
   - **Endpoint**: `/api/telemetry` (POST, Schema Version 1.0.0)
   - **Storage Engine**: `PersistentTelemetryStore` (`intelligence/telemetry/persistent_events.json` when locally configured; Vercel Serverless ephemeral edge when unconfigured)

4. **Git Commit Ledger**:
   - **Provider ID**: `SRC-GIT-VCS`
   - **Source**: `documentation/GIT-CHANGELOG.json`

---

## 3. Raw API Semantics

1. **GA4 Data API Query Methodology**:
   - **Daily Time Series**: Query `runReport` with dimension `date` (`YYYYMMDD`), metrics `["activeUsers", "sessions", "screenPageViews", "engagedSessions", "newUsers"]`.
   - **Monthly Period Summary**: Query `runReport` with date range `["2026-09-01", "today"]` without dimensions to extract deduplicated `totalUsers`, `activeUsers`, `sessions`, and `screenPageViews`.
   - **Intra-Day Today**: Query `runReport` with date range `[{ startDate: "today", endDate: "today" }]`.

2. **GSC Search Analytics Query Methodology**:
   - **Daily Time Series**: Query `searchAnalytics/query` with dimensions `["date"]`, metrics `impressions`, `clicks`, `ctr`, `position`.
   - **Reporting Latency**: GSC introduces a deterministic 48–72 hour data processing lag. Days within the lag window return zero rows for that date. The platform MUST represent this state as `status: "PENDING_SEARCH_CONSOLE_LAG"` and `value: null`, never `0`.

---

## 4. Canonical Storage Representation

The repository enforces strict physical and epistemic data segregation:

1. **`intelligence/project/empirical_daily_statistics.json`**:
   - **Role**: Authoritative canonical daily empirical history.
   - **Criteria**: Contains only days from Production Day 1 (`2026-08-25`) onward where authoritative external or verified telemetry records exist.
   - **Schema**: Array of daily objects, each having `date`, `epistemic_classification: "TRUTHFUL_EMPIRICAL"`, `usable_for_empirical_analysis: true`, `ga4`, `gsc`, and `telemetry` objects.

2. **`intelligence/project/daily_statistics.json`**:
   - **Role**: Forensic audit store of morning scheduler execution records.
   - **Criteria**: Contains historical daily collection runs, including the 9 contaminated legacy records (`2026-08-26` through `2026-09-03`) marked `usable_for_empirical_analysis: false` and `epistemic_classification: "SYNTHETIC_CONTAMINATED"`.
   - **Rule**: Never deleted, never overwritten, permanently quarantined from empirical calculations.

3. **`intelligence/project/canonical_statistics.json`**:
   - **Role**: Authoritative reconciled statistics artifact generated by `scripts/reconcile_statistics.mjs`.
   - **Contains**: Canonical window calculations (`DAY_1_TO_TODAY`, `FIRST_7D`, `LAST_7D`, `LAST_30D`, `MTD`, `TODAY`), verified mathematical containment invariant proofs, and the complete Discrepancy Ledger.

---

## 5. Additivity Classification

| Metric | Additive Over Time? | Aggregation Method Across Days | Query Strategy |
| :--- | :--- | :--- | :--- |
| `sessions` | **YES** | Arithmetic Sum ($\sum$) | Can sum daily empirical records |
| `screen_page_views` | **YES** | Arithmetic Sum ($\sum$) | Can sum daily empirical records |
| `engaged_sessions` | **YES** | Arithmetic Sum ($\sum$) | Can sum daily empirical records |
| `search_impressions` | **YES** | Arithmetic Sum ($\sum$) (available days only) | Can sum daily empirical records |
| `search_clicks` | **YES** | Arithmetic Sum ($\sum$) (available days only) | Can sum daily empirical records |
| `active_users` | **NO** | **Do NOT Sum as Unique Users** | Summed value is labeled *Daily Active-User Observations (Summed)*; period unique users require direct API query |
| `average_position` | **NO** | **Impression-Weighted Average** | $\frac{\sum (\text{position}_i \times \text{impressions}_i)}{\sum \text{impressions}_i}$ |
| `ctr` | **NO** | **Impression-Weighted Ratio** | $\frac{\sum \text{clicks}_i}{\sum \text{impressions}_i} \times 100$ |

---

## 6. Aggregation Method & Singular Pipeline

All downstream consumers (API endpoints, Control Center workbook generator, command-line scripts) MUST derive aggregate metrics from a **single canonical aggregation engine** (`scripts/reconcile_statistics.mjs` and `intelligence/project/statisticsAggregator.mjs`).

No consumer may independently implement date filtering, ad-hoc summation, or custom average logic.

---

## 7. Timezone Standard

- **External APIs (GA4 / GSC)**: Operate on property timezone `UTC` (or property configuration).
- **Date Key Representation**: All date keys are ISO 8601 calendar dates in `YYYY-MM-DD` format corresponding strictly to the calendar day boundary in the authoritative source.
- **Timestamps**: All collection and extraction timestamps are recorded in full ISO 8601 UTC format with millisecond precision (`YYYY-MM-DDTHH:mm:ss.sssZ`).

---

## 8. Date-Window Semantics

1. **`DAY_1_TO_TODAY`**:
   - **Start Date**: `2026-08-25` (Production Day 1, established by commit `28360e6` and earliest GA4 traffic).
   - **End Date**: Current date (`2026-09-04`).
   - **Scope**: All observed empirical days since platform inception.

2. **`FIRST_7D` (Launch Week)**:
   - **Range**: `2026-08-25` through `2026-08-31` (exactly 7 empirical calendar days).

3. **`LAST_7D` (Rolling 7 Days)**:
   - **Range**: The 7 most recent consecutive calendar days (`2026-08-29` through `2026-09-04`).

4. **`LAST_30D` (Rolling 30 Days)**:
   - **Target Window**: 30 calendar days ending today.
   - **Current Status**: `PARTIAL_WINDOW` (11 observed empirical days recorded).
   - **Maturity Date**: A full 30-day empirical rolling window will be available on `2026-09-23`.

5. **`MTD` (Month-to-Date)**:
   - **Range**: First day of the current calendar month (`2026-09-01`) through the current day (`2026-09-04`).

6. **`TODAY`**:
   - **Range**: Current calendar date (`2026-09-04`).

---

## 9. Missing-Data Treatment

When an authoritative provider has not recorded data for a calendar day or window:
- The metric MUST remain `null`.
- The status MUST reflect the exact operational cause (e.g., `PENDING_SEARCH_CONSOLE_LAG`, `UNAVAILABLE`, `INSUFFICIENT_DATA`).
- Missing data MUST NEVER be converted to zero (`0`).
- Missing days in GSC search analytics MUST be explicitly identified in the reporting status.

---

## 10. Contaminated-Data Treatment

- The 9 legacy contaminated records (`2026-08-26` through `2026-09-03`) in `daily_statistics.json` contain synthetic telemetry multipliers (`* 18`, `* 12`, `* 14`) and unauthenticated fallback substitutions (120 users).
- These records MUST remain in `daily_statistics.json` for forensic auditability with `usable_for_empirical_analysis: false` and `epistemic_classification: "SYNTHETIC_CONTAMINATED"`.
- Under NO circumstance may any contaminated record enter any rolling window, MTD, or trend calculation.

---

## 11. NULL Semantics

- `null` represents **unknown**, **unobserved**, **pending collection**, or **unavailable** data.
- In JSON artifacts, `null` is serialized as literal `null`.
- In Excel Control Center sheets, `null` is displayed as text `"null"` or `"-"` with status `UNAVAILABLE` or `PENDING_SEARCH_CONSOLE_LAG`.
- Formulas, aggregators, and validators must treat `null` as a non-numeric sentinel that cannot be coerced to zero.

---

## 12. Zero Semantics

- Numeric zero (`0`) represents an **authoritative empirical observation that an event did NOT occur**.
- For example:
  - `gsc.clicks = 0`: Search Console observed impressions but zero search clicks.
  - `gsc.impressions = 0` on `2026-08-25`: Search Console observed the domain with zero impressions.
  - `telemetry.utility_views = 0`: Connected persistent telemetry store processed zero events for that day.
- Zero is NEVER used as a fallback for missing or uncollected data.

---

## 13. Derived-Metric Rules

- Any metric calculated by combining, summing, averaging, or projecting empirical measurements MUST be classified as `DERIVED`.
- Day-over-Day percentage changes:
  - Must only compare consecutive empirical records where both days are uncontaminated.
  - If previous day value was `0`, `null`, or undefined, `pct_change` MUST be `null` (never fabricate `0%` or `Infinity`).
  - Day 1 has no previous observation and must be classified as `state: "BASELINE"`.
- Projections and run-rate scenarios MUST be classified as `DERIVED_PROJECTION` / `TRAJECTORY_SCENARIO` and explicitly carry a disclaimer stating they are mathematical run-rate models, NOT empirical measurements and NOT forecasts.

---

## 14. Monthly Unique-User Rules

- Summing daily active users over a monthly window counts returning users multiple times and produces an inflated number.
- In all reports, APIs, and sheets:
  - The sum of daily users MUST be labeled: `Daily Active-User Observations (Summed)`.
  - The deduplicated unique users MUST be labeled: `Monthly Unique Users (GA4 Query)`.
  - Monthly Unique Users MUST originate from a direct monthly query to GA4 Data API without date dimensioning.

---

## 15. GSC Weighted-Position Rules

- Average SERP position cannot be calculated as an unweighted arithmetic mean of daily positions.
- When aggregating across multiple days, position MUST be weighted by impressions:
  $$\text{Weighted Position} = \frac{\sum_{i=1}^n (\text{position}_i \times \text{impressions}_i)}{\sum_{i=1}^n \text{impressions}_i}$$
- Days with zero impressions (`impressions = 0`) or `impressions = null` contribute zero weight to the average position calculation.

---

## 16. Provenance Requirements

Every reported number across the API, JSON artifacts, and Excel sheets MUST maintain traceable provenance:
1. Source identifier (`SRC-GA4-UTL`, `SRC-GSC-UTL`, `SRC-UTL-TELEMETRY`, `SRC-GIT-VCS`)
2. Exact date or date window
3. Epistemic classification (`FACT`, `TRUTHFUL_EMPIRICAL`, `VERIFIED`, `DERIVED`, `DERIVED_PROJECTION`, `SYNTHETIC_CONTAMINATED`)
4. Calculation method or query endpoint
5. Timestamp of collection/aggregation

---

## 17. Reconciliation Requirements

Whenever historical reporting inconsistencies or dual-source drift are identified:
1. Do NOT overwrite or silently reconcile conflicting data.
2. Formally investigate root cause across source API windows, date ranges, aggregation logic, and manual reporting artifacts.
3. Record both previous reported values and canonical recalculated values in the Discrepancy Ledger.
4. Provide mathematical containment invariant proofs verifying that overlapping windows obey subset/superset relationships.

---

## 18. Regression Requirements

To prevent data-integrity regressions:
- Every phase transition MUST maintain automated regression test suites executing with 100% pass rates.
- Test suites must verify mathematical containment invariants, absence of synthetic multipliers, preservation of null semantics, isolation of contaminated records, and parity between API read-models, JSON artifacts, and the Excel Control Center.
