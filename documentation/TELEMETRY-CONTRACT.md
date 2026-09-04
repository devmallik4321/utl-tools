# UTL.tools — Canonical First-Party Telemetry Contract & Governance

**Schema Version:** `1.0.0`  
**Effective Date:** 2026-09-04  
**Status:** ACTIVE / PRODUCTION  
**Epistemic Standard:** STRICT TRUTH-FIRST / ZERO SYNTHETIC INFERENCE  

---

## 1. Overview & Architectural Purpose

UTL.tools first-party telemetry provides empirical measurement of utility usage, interactive tool execution, and Windows widget card engagement.

Unlike traditional third-party tracking or legacy synthetic telemetry, UTL.tools telemetry operates under strict data minimization tenets:
1. **Zero User Payloads**: The telemetry pipeline never accepts, stores, transmits, or processes form inputs, user computations, personal data, or query strings.
2. **Client-Side Privacy**: Processing occurs client-side in the browser; telemetry emits only structural beacons (`utility_view`, `tool_execution`, `widget_view`).
3. **Daily Pseudonymization**: Daily salted session hashes prevent cross-day tracking or multi-day user profiling.
4. **Epistemic Tri-State Guarantee**:
   - `UNAVAILABLE` source $\rightarrow$ `value: null`
   - `AVAILABLE` source with zero observed events $\rightarrow$ `value: 0`
   - `AVAILABLE` source with $N$ observed events $\rightarrow$ `value: N`
   Under no circumstances is utility inventory count multiplied into operational usage.

---

## 2. Event Types & Taxonomy

Only three event types are permitted:

| Event Type | Trigger Point | Required Scope | Metadata Allowed |
| :--- | :--- | :--- | :--- |
| `utility_view` | User opens a utility landing page | `utility_id` | `category` |
| `tool_execution` | User clicks calculate, generate, format, or transform | `utility_id` | `interaction_type` |
| `widget_view` | User loads or views a Windows widget card | `widget_id` | `category` |

Any event outside this taxonomy is rejected with HTTP 400.

---

## 3. Canonical Schema (`v1.0.0`)

### Required Fields
- `event_id` (string): Unique UUID or timestamped identifier (`evt_<timestamp>_<random>`). Max length: 128 chars.
- `event_type` (string): Must be one of `utility_view`, `tool_execution`, `widget_view`.
- `timestamp` (string): Valid ISO 8601 string. Must be within $[-30\text{ days}, +60\text{ seconds}]$ of current server time.
- `source` (string): Subsystem origin (e.g., `web-shell`, `windows-widgets`). Max length: 64 chars.
- `schema_version` (string): Must be `"1.0.0"`.

### Conditional Scope Fields
- `utility_id` (string): Required for `utility_view` and `tool_execution`. Must match an active or aliased utility identifier.
- `widget_id` (string): Required for `widget_view`. Must match an active widget identifier.

### Optional Fields
- `session_id` (string): Client session token. Ingested tokens are immediately transformed into an irreversible daily salted hash (`sha256(day + ":" + sessionId + ":utl-salt").slice(0, 16)`).
- `metadata` (object): Key-value pairs. Depth $\le 2$, keys $\le 20$, values max 256 characters.

---

## 4. Forbidden Keys & Strict Privacy Policy

To guarantee privacy by construction, any telemetry payload containing any of the following keys (case-insensitive substring match) at either the root level or within metadata is immediately rejected with HTTP 400:

```text
password
passwd
token
auth
secret
query
input
email
name
ip
user_agent
credit_card
ssn
cookie
payload
```

---

## 5. Ingestion & Storage Rules

1. **Deduplication**: Ingested events are checked against stored events by `event_id`. Duplicates return HTTP 200 with `{ duplicate: true }` and are discarded from persistence.
2. **Replay Safety**: Replaying an identical batch of events does not inflate daily aggregation totals.
3. **Persistence Location**: `intelligence/telemetry/events.json`
4. **Retention Window**: 90 days rolling retention for raw event logs; aggregate daily time-series retained permanently in `daily_statistics.json`.

---

## 6. Daily Aggregation & Metrics Mapping

Daily aggregation is strictly deterministic:
$$\text{utility\_views} = \text{Count of utility\_view events for given date}$$
$$\text{tool\_executions} = \text{Count of tool\_execution events for given date}$$
$$\text{widget\_views} = \text{Count of widget\_view events for given date}$$

Operational metrics derived:
- `first_party_telemetry_events_total`: Total valid events in store (FACT)
- `empirical_utility_views`: Daily verified utility views (FACT if $>0$, VERIFIED if $0$)
- `empirical_tool_executions`: Daily verified tool executions (FACT if $>0$, VERIFIED if $0$)
- `empirical_widget_views`: Daily verified widget views (FACT if $>0$, VERIFIED if $0$)

---

## 7. Versioning & Migration Policy

- **Minor revisions** (backward-compatible metadata additions) preserve `1.0.0`.
- **Breaking changes** (schema structural adjustments, new required fields) increment to `2.0.0`.
- **Migration Rule**: Future versions must not retroactively reinterpret or re-aggregate historical `v1.0.0` events.
