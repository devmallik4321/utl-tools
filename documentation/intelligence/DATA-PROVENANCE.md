# Data Provenance & Epistemic Taxonomy

---

## 1. Epistemic Classification Framework
To prevent misleading assumptions, every data point emitted by the Sensor Fabric is strictly classified into one of four epistemic tiers:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FACT                                                     │
│ Directly measured, verified, W3C/API observation.           │
│ Example: GA4 measured 1,250 pageviews on 2026-08-25.       │
├─────────────────────────────────────────────────────────────┤
│ 2. ESTIMATE                                                 │
│ Third-party modeled, sampled, or algorithmic projection.    │
│ Example: SimilarWeb estimates top10k.com has 450K visits.  │
├─────────────────────────────────────────────────────────────┤
│ 3. INFERENCE                                                │
│ Cross-domain sensor fusion output or calculated correlation.│
│ Example: Search interest + GitHub stars indicate high demand│
├─────────────────────────────────────────────────────────────┤
│ 4. RECOMMENDATION                                           │
│ Human-actionable proposal derived from intelligence models. │
│ Example: Build 'JSON to TypeScript Interface' candidate tool│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Provenance Metadata Contract
Every observation record must contain the full provenance block:

```json
{
  "observation_id": "OBS-20260825-001",
  "sensor_id": "SNR-TRAF-001",
  "epistemic_type": "FACT",
  "metric_name": "daily_pageviews",
  "metric_value": 1250,
  "unit": "count",
  "source": "GA4 API",
  "source_url": "https://analytics.google.com",
  "collection_method": "API_CLIENT_REST",
  "collected_at": "2026-08-25T12:00:00Z",
  "source_timestamp": "2026-08-25T00:00:00Z",
  "freshness_seconds": 43200,
  "confidence": "VERY_HIGH",
  "confidence_score": 0.98,
  "collection_status": "SUCCESS",
  "methodology_notes": "Direct client-side GA4 rollup"
}
```

---

## 3. Epistemic Rules
1. **Never Present an Estimate as a Fact**: Modeled traffic from third-party tools must be flagged as `ESTIMATE`.
2. **Provenance Retention**: Observations without `source_url` or `collection_method` are flagged as `UNVERIFIED` and excluded from high-confidence opportunity scoring.
3. **Immutability**: Raw observations are appended to the time-series store and never mutated.
