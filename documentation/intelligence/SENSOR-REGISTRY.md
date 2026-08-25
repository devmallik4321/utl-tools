# Sensor Registry Specification & Cadence Governance

---

## 1. Sensor Record Schema
Every sensor in the Sensor Fabric must be registered in [`intelligence/registry/sensors.json`](file:///C:/Users/mallik/Documents/AAEP/03-Projects/UTILITY-OS/intelligence/registry/sensors.json) with the following attributes:

```json
{
  "sensor_id": "SNR-TRAF-001",
  "domain": "traffic",
  "sensor_type": "volume",
  "concentration_point": "GA4 Reporting API",
  "metric": "daily_active_users",
  "source": "Google Analytics 4 (G-H2G4BK9Y36)",
  "collection_method": "API_CLIENT_REST",
  "cadence": "DAILY",
  "enabled": true,
  "cost": "FREE_TIER",
  "rate_limit": "100_REQ_PER_MIN",
  "freshness_expectation": "24H",
  "confidence": "VERY_HIGH",
  "last_run": "2026-08-25T12:00:00Z",
  "last_success": "2026-08-25T12:00:00Z",
  "failure_count": 0,
  "status": "ACTIVE",
  "notes": "Direct client-side GA4 telemetry for UTL.tools"
}
```

---

## 2. Cadence Governance Matrix

| Source / Sensor Type | Default Cadence | Rationale | Volatility Level |
| :--- | :--- | :--- | :--- |
| **UTL GA4 Traffic** | `DAILY` | Daily aggregate traffic rollup | Medium |
| **UTL Search Console** | `DAILY` | Search Console data updates on 24-48h delay | Medium |
| **Public Traffic Estimators** | `WEEKLY` | Third-party traffic estimates update weekly/monthly | Low |
| **Priority SERP Positions** | `DAILY` | Search rankings shift daily | High |
| **Search Trends (Google Trends)** | `DAILY` | Daily search volume indexes | High |
| **Competitor Page Changes** | `DAILY` | Detect feature or layout updates | Low |
| **Social / Community Discussion**| `6H - 24H` | Public discussion threads evolve rapidly | High |
| **Backlink / Authority Signals** | `WEEKLY` | Backlink index crawls update weekly | Low |
| **Company & Domain Metadata** | `WEEKLY` | Registration/DNS changes occur infrequently | Low |
| **Scholarly & Research Publications**| `DAILY` | Preprints published daily | Medium |
| **GitHub & Technology Signals** | `DAILY` | Repo releases and star velocities | Medium |
| **Cross-Domain Sensor Fusion** | `WEEKLY` | Multi-signal correlation requires time-series depth | Low |

---

## 3. Dynamic Cadence Adjustments
Sensor cadence is automatically adjusted based on:
1. **Source Rate Limits**: High-cost APIs throttle down to `WEEKLY` if quota is approaching.
2. **Signal Volatility**: Rapidly moving signals automatically increase frequency to `6H`.
3. **Failure Thresholds**: After 3 consecutive failures (`PERMANENT_FAILURE`), sensor backs off to `WEEKLY` check to prevent resource exhaustion.
