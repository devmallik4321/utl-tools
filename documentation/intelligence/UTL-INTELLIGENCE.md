# UTL.tools First Monitored Application Implementation

---

## 1. Application Overview
UTL.tools (`https://utl.tools`) is the **first client application** monitored by the Internet Sensor Fabric V1.

The sensor network collects both **First-Party Actual Data** and **Public Market Data** to produce utility-specific intelligence.

---

## 2. Sensor Configuration for UTL.tools

### A. First-Party Actual Sensors:
1. **UTL GA4 Traffic Sensor (`SNR-UTL-GA4-001`)**:
   * Measures: Daily Active Users, Pageviews, Utility Views, Utility Interactions, Search Modal Usage.
   * Cadence: `DAILY`
   * Confidence: `VERY_HIGH` (100% measured facts)
2. **UTL Google Search Console Sensor (`SNR-UTL-GSC-002`)**:
   * Measures: Impressions, Clicks, Average CTR, Average Position, Indexing Status across 47 production utilities.
   * Cadence: `DAILY`
   * Confidence: `VERY_HIGH`

### B. Public Market & Competitor Sensors:
1. **Public Competitor Benchmark Sensor (`SNR-COMP-TRAF-001`)**:
   * Targets: `mylocation.org`, `plaintoolbox.com`, `top10k.com`, `cyberchef.io`, `10015.io`, `omnicalculator.com`, `rapidtables.com`, `tinywow.com`.
   * Measures: Estimated monthly visits, desktop/mobile ratio, top traffic countries, feature updates.
   * Cadence: `WEEKLY`
   * Confidence: `MEDIUM` (Third-party modeled estimates)
2. **Search Intent & SERP Sensor (`SNR-SERP-INTEL-001`)**:
   * Targets: Top 50 evergreen utility queries ("diff checker online", "json formatter validator", "talking alarm clock", etc.).
   * Measures: SERP feature density, competitor ad presence, search volume trends.
   * Cadence: `DAILY`
   * Confidence: `HIGH`

---

## 3. UTL Utility Opportunity Matrix Example
Using the Sensor Fabric, every utility is evaluated for growth opportunities:

```
UTILITY: Compound Interest Calculator
----------------------------------------
Demand: HIGH (85/100)
Growth: INCREASING (+15% YoY)
Competition: MEDIUM (Legacy ad-heavy sites)
UTL Position: Rank #14 (Page 2)
Opportunity: HIGH (Score: 82.5)
Confidence: HIGH (0.88)
Recommended Action: Add formula breakdown card & printable amortization table schedule
```
