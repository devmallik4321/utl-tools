# Collection Reliability & Status Governance

---

## 1. Collection Run Status States
Every collection attempt must return one of the 8 canonical status codes:

1. **`SUCCESS`**: Data retrieved completely, schema validated, provenance verified.
2. **`PARTIAL`**: Data retrieved partially (e.g. rate-limit triggered midway or paginated subset).
3. **`RATE_LIMITED`**: Source API returned HTTP 429 or rate-limit header warning.
4. **`AUTH_FAILED`**: Invalid key, expired OAuth token, or HTTP 401/403 response.
5. **`SOURCE_CHANGED`**: HTML layout shift or API breaking schema change detected.
6. **`NO_DATA`**: Endpoint returned clean HTTP 200 with empty payload array/result.
7. **`TEMPORARY_FAILURE`**: Timeout, DNS lookup failure, or 5xx server error.
8. **`PERMANENT_FAILURE`**: HTTP 404 target removed or domain unregistered.

---

## 2. Failure Handling Rules

### Fundamental Reliability Directive:
> **Never interpret a collection failure as zero traffic, zero activity, or disappearance of an entity.**

### Protocol:
* When `AUTH_FAILED`, `RATE_LIMITED`, or `TEMPORARY_FAILURE` occurs:
  1. Retain previous valid observation in time-series history.
  2. Flag source health as `DEGRADED`.
  3. Log failure evidence snippet in `control/INTERNET-INTELLIGENCE-CONTROL-CENTER.xlsx` (`P-07 COLLECTION`).
  4. Do **NOT** set traffic, rankings, or volume metrics to `0`.

---

## 3. Schema Shift Detection
When collecting from unstructured HTML or unversioned APIs, the engine calculates a structural checksum:

```js
const currentSchemaHash = crypto.createHash('md5').update(Object.keys(payload).sort().join(',')).digest('hex');
if (previousSchemaHash && currentSchemaHash !== previousSchemaHash) {
  status = 'SOURCE_CHANGED';
  flagAlert('SCHEMA_SHIFT_DETECTED', sensorId);
}
```
