# UTL.tools — Production Monitoring Contract & Operating Standards

**Version**: `1.0.0`  
**Scope**: Platform Health, Telemetry Operations, Verification Rigor, and Data Quality  
**Status**: Canonical Production Standard  

---

## 1. Core Operating Philosophy

The UTL.tools monitoring contract codifies a truth-first operational model across all environments:

> **NO_DATA ≠ ZERO.**  
> **NO_EXECUTION ≠ PASS.**  
> **DERIVED ≠ FACT.**  
> **SYNTHETIC ≠ EMPIRICAL.**  
> **Every production claim must have authoritative evidence.**

No dashboard, health check, or reporting pipeline may alter the epistemic nature of an observation to make metrics appear healthier, more active, or complete.

---

## 2. Production Health States

The overall project health indicator represents the aggregate operational state of the UTL.tools platform, calculated deterministically by the Project Intelligence Engine.

| Health State | Definition & Conditions | System Action |
| :--- | :--- | :--- |
| **`HEALTHY`** | • Core web application is online and responsive.<br>• All automated test suites (Phases 1–5) are passing (100%).<br>• First-party telemetry endpoint is active and accepting events.<br>• No unhandled critical operational anomalies detected.<br>• Canonical Control Center is synchronized with authoritative sources. | Normal operations. Continuous measurement active. |
| **`ATTENTION_REQUIRED`** | • Core web application and verification suites are passing.<br>• Non-blocking operational opportunities or anomalies detected (e.g. search impression CTR optimization, high-demand utility candidates).<br>• Verified zero traffic during initial post-deployment observation window.<br>• Non-critical external provider unavailable (e.g. Search Console credentials missing). | Flag in Control Center `P-Dashboard`. Prioritize growth and optimization recommendations. |
| **`DEGRADED`** | • Web application is operational, but a critical integration is impaired.<br>• Telemetry storage I/O failures or event rejection rates exceed tolerance.<br>• Automated verification harness fails on one or more non-hardware utilities.<br>• External authenticated provider (GA4) token has expired. | Alert engineering team. Mark affected operational metrics as `DEGRADED`. Isolate healthy metrics. |
| **`UNAVAILABLE`** | • Core web application is unreachable (HTTP 5xx or connection refused).<br>• Project Intelligence engine cannot execute.<br>• Critical data corruption detected in canonical registry or control center. | Immediate outage response. Flag platform as `UNAVAILABLE`. Never substitute simulated metrics. |

---

## 3. Telemetry Source Health States

Telemetry source health describes the operational availability and ingestion integrity of the first-party telemetry subsystem.

| Telemetry State | Technical Criteria | Metric Value | Metric Status |
| :--- | :--- | :--- | :--- |
| **`ACTIVE`** | • Telemetry API route (`/api/telemetry`) is reachable and accepting requests.<br>• Schema validation (`v1.0.0`) is actively enforced.<br>• Event storage persistence is confirmed.<br>• Deduplication and replay safety are operating.<br>• **Applies whether observed event count is $0$ or $>0$**. | Observed count ($N \ge 0$) | `SUCCESS` |
| **`DEGRADED`** | • Ingestion route is accepting requests, but local/remote storage write fails.<br>• Memory buffer or temporary fallback storage in use.<br>• Aggregation pipeline encountering partial calculation failures. | `null` | `DEGRADED` |
| **`UNAVAILABLE`** | • Telemetry subsystem is explicitly unconfigured or disabled (`configured: false`).<br>• Ingestion endpoint returns HTTP 404 / 503 or is completely disconnected.<br>• No client events can be collected. | `null` | `UNAVAILABLE` |

### Deterministic Health Distinction
```text
Source UNAVAILABLE                --> value: null, status: "UNAVAILABLE"
Source ACTIVE + 0 events observed --> value: 0,    status: "SUCCESS"
Source ACTIVE + N events observed --> value: N,    status: "SUCCESS"
```

---

## 4. Test Verification Health States

Verification states classify the empirical readiness and correctness of the 420 catalog utilities. A test status may only be derived from real execution evidence.

| Status | Definition & Invariants | Permissible Transition |
| :--- | :--- | :--- |
| **`PASS`** | • Utility component was executed in a headless/live DOM runtime (Playwright).<br>• Rendered interactive form controls ($\ge 3$ for standard utilities).<br>• Simulated user inputs and verified non-empty compute output in DOM.<br>• Evidence recorded in `test_execution_evidence.json` and `run_history.json`. | Must stay `PASS` unless regression detected in subsequent run. |
| **`FAIL`** | • Utility was executed by the harness and threw an unhandled error, failed an assertion, or produced malformed DOM output. | Transitions to `PASS` only upon bug fix and re-execution by harness. |
| **`REQUIRES_HUMAN_VALIDATION`** | • Utility depends on external network connectivity, hardware sensors, or public third-party echo services (`my-ip`, `ping-test`, `dns-lookup`).<br>• Automated mocks cannot establish complete ground truth without leaking network traffic.<br>• Local mounting and UI rendering are verified, but functional verification requires human sign-off. | Transitions to `PASS` **only** upon human operator executing the protocol in `HUMAN-VALIDATION-WORKFLOW.md` and producing signed evidence. |
| **`BLOCKED`** | • Harness could not execute the test due to an environmental failure (e.g. browser crash, missing dependencies, port conflict). | Transitions to `PASS` or `FAIL` once execution barrier is resolved. |
| **`UNTESTED`** | • Specification defined in catalog or workbook, but no execution attempt has been made. | Default state prior to harness execution. Never conflated with `PASS`. |

---

## 5. Data Quality & Historical Classifications

All metrics persisted in historical stores, daily tables, and Excel dashboards carry an explicit epistemic classification to prevent confusion between empirical facts, derived numbers, and contaminated legacy data.

| Data Quality Tag | Epistemic Classification | Definition | Usable for Empirical Analysis? |
| :--- | :--- | :--- | :--- |
| **`LIVE`** | `TRUTHFUL_EMPIRICAL` or `FACT` | Measured directly from live, authenticated real-time operational sources (GA4 API, internal telemetry store). | **Yes** |
| **`PARTIAL_LIVE`** | `TRUTHFUL_EMPIRICAL` (mixed) | Subset of operational sources are live and authenticated; unavailable sources record `null` without fabricating data. | **Yes** (for live metrics) |
| **`VERIFIED`** | `VERIFIED` | Structural and inventory metrics independently derived from repository filesystem, registries, and AST inspection (e.g. 420 utilities, 420 components, 426 mappings). | **Yes** |
| **`DERIVED`** | `DERIVED` | Calculated mathematical ratios (e.g. $Executions / Views \times 100$) derived strictly from verified underlying inputs. | **Yes** |
| **`UNAVAILABLE`** | `UNAVAILABLE` | Metric could not be collected due to disconnected provider, missing credentials, or unconfigured endpoint. Emits `value: null`. | **No** (omitted from sums/averages) |
| **`CONTAMINATED`** | `SYNTHETIC_CONTAMINATED` | Historical legacy data (2026-08-26 through 2026-09-03) generated by unauthenticated fallback multipliers or synthetic loops. Segregated permanently. | **NO (STRICTLY FORBIDDEN)** |

---

## 6. Audit & Traceability Mandate

For every metric published on the platform or recorded in the Control Center, the system must maintain an unbroken chain of custody answering:

1. **What was measured?** (Metric ID, unit, dimensions).
2. **Where did it come from?** (Source ID, file path, endpoint, provider).
3. **When was it measured?** (ISO 8601 timestamp).
4. **How was it measured?** (Collection method, calculation logic).
5. **What is its epistemic status?** (`FACT`, `VERIFIED`, `DERIVED`, `UNAVAILABLE`, `SYNTHETIC_CONTAMINATED`).
6. **Where is the raw evidence?** (File path or artifact reference).
