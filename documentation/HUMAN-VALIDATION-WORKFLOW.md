# UTL.tools — Human Validation Workflow & Protocol

**Version:** 1.0.0  
**Effective Date:** 2026-09-04  
**Target Utilities:** 3 Production Utilities with External Network Probe Dependencies  

---

## 1. Principles & Purpose

In automated headless testing environments (Playwright Chromium in sandboxed local execution), utilities that rely on live third-party internet endpoints or raw socket connections cannot be deterministically verified without either:
1. live unfirewalled outbound network access to external servers; or
2. mocking/stubbing network requests, which compromises testing of the genuine third-party endpoint.

Under UTL.tools truth-first governance, these utilities are **never** marked as automated `PASS` without verified execution, nor are they marked `FAIL` when their local mounting is successful. Instead, they are explicitly classified as:

```text
REQUIRES_HUMAN_VALIDATION
```

---

## 2. Human Validation Registry

| Test ID | Utility ID | Utility Slug | Primary External Dependency | Automated Harness Status |
| :--- | :--- | :--- | :--- | :--- |
| `TC-0008` | `my-ip` | `my-ip` | Third-party public IP echo API (`api.ipify.org` / `icanhazip.com`) | `REQUIRES_HUMAN_VALIDATION` |
| `TC-0011` | `ping-test` | `ping-test` | Live HTTP/ICMP latency probes to Cloudflare, Google DNS, Wikipedia CDN | `REQUIRES_HUMAN_VALIDATION` |
| `TC-0012` | `dns-lookup` | `dns-lookup` | Public DNS-over-HTTPS (DoH) resolver (`dns.google`, `1.1.1.1`) | `REQUIRES_HUMAN_VALIDATION` |

---

## 3. Protocol for Each Utility

### 3.1 `TC-0008`: My IP Address Lookup (`my-ip`)
- **Reason Automation Cannot Complete Truth**: Sandboxed headless Chromium may run on localhost, behind corporate proxies, or without public IPv4/IPv6 routable egress.
- **Required Human Action**:
  1. Open `https://utl.tools/tools/my-ip` (or `http://localhost:3000/tools/my-ip`) in a live desktop browser.
  2. Verify that the IP lookup button automatically executes or clicks "Refresh IP".
- **Expected Observation**:
  - Displays valid IPv4 or IPv6 address.
  - Displays ISP / Country information if resolved.
  - No CORS or uncaught fetch errors in browser console.
- **Evidence Requirement**: Screenshot or network HAR log showing HTTP 200 response from IP echo endpoint.
- **Validator Identity**: Designated Human QA Engineer / Operator.
- **Resulting Transition**: `REQUIRES_HUMAN_VALIDATION` $\rightarrow$ `PASS` (or `FAIL` if echo endpoint is down).

---

### 3.2 `TC-0011`: Ping & Latency Test (`ping-test`)
- **Reason Automation Cannot Complete Truth**: Web browsers cannot emit raw ICMP echo packets due to OS security sandboxing. The tool uses `fetch` with `no-cors` against global CDN endpoints (`https://1.1.1.1/cdn-cgi/trace`, `https://dns.google`, etc.). Automated headless runners with mocked or firewalled networks will observe false latency spikes or timeout failures.
- **Required Human Action**:
  1. Open `https://utl.tools/tools/ping-test` in a desktop browser with live internet access.
  2. Click "Start Ping Test".
  3. Observe latency sequence across multiple packets (8 pings).
- **Expected Observation**:
  - Displays real-time round-trip latency in milliseconds (e.g., 15–80ms).
  - Shows minimum, maximum, and jitter calculation.
  - Packet loss percentage calculated accurately.
- **Evidence Requirement**: Screenshot of completed 8-ping latency chart with jitter statistics.
- **Validator Identity**: Designated Human QA Engineer / Operator.
- **Resulting Transition**: `REQUIRES_HUMAN_VALIDATION` $\rightarrow$ `PASS` (or `FAIL` if endpoints fail).

---

### 3.3 `TC-0012`: DNS Lookup (`dns-lookup`)
- **Reason Automation Cannot Complete Truth**: Queries DNS-over-HTTPS (DoH) JSON endpoints (`https://dns.google/resolve?name=...&type=A`). If offline or blocked by corporate DNS policies, resolution fails.
- **Required Human Action**:
  1. Open `https://utl.tools/tools/dns-lookup` in a desktop browser.
  2. Enter `example.com` or `utl.tools` and select Record Type `A` or `AAAA`.
  3. Click "Resolve DNS".
- **Expected Observation**:
  - Resolves correct A record IP addresses.
  - TTL and Answer section rendered cleanly.
- **Evidence Requirement**: Screenshot of resolved DNS record table.
- **Validator Identity**: Designated Human QA Engineer / Operator.
- **Resulting Transition**: `REQUIRES_HUMAN_VALIDATION` $\rightarrow$ `PASS` (or `FAIL` if resolver errors).

---

## 4. Evidence Persistence Schema for Human Validation

When human validation is completed, the record in `intelligence/verification/evidence/TC-xxxx.json` is updated with:
```json
{
  "test_id": "TC-0008",
  "utility_id": "my-ip",
  "slug": "my-ip",
  "status": "PASS",
  "validation_type": "HUMAN_VALIDATION",
  "validator": "John Doe (Operator)",
  "validation_timestamp": "2026-09-04T12:00:00.000Z",
  "evidence_artifact": "documentation/evidence/TC-0008-screenshot.png",
  "notes": "Human validated: Live IPv4 and ISP resolved without console errors."
}
```
Until such evidence is physically provided, the status strictly remains `REQUIRES_HUMAN_VALIDATION`.
