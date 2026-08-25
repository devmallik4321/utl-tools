# Confidence & Reliability Scoring Model

---

## 1. Qualitative Confidence Tiers
The Sensor Fabric assigns a qualitative confidence tier to all observations and fused intelligence outputs:

| Tier | Numerical Score Range | Criteria & Primary Data Sources |
| :--- | :--- | :--- |
| **`VERY_HIGH`** | `0.90 – 1.00` | Direct first-party authenticated API data (GA4, GSC, W3C Navigator APIs). Zero estimation. |
| **`HIGH`** | `0.75 – 0.89` | Official public APIs (GitHub REST API, OpenAlex API, Google Trends API) with clean schemas. |
| **`MEDIUM`** | `0.50 – 0.74` | Third-party public benchmarks, aggregated SERP scrapes, sampled analytics. |
| **`LOW`** | `0.25 – 0.49` | Inferred cross-domain correlations without multi-source verification. |
| **`VERY_LOW`** | `0.00 – 0.24` | Single-source unverified community rumors or stale telemetry (> 30 days old). |

---

## 2. Confidence Calculation Formula
For fused intelligence signals combining \(N\) independent sensors:

$$\text{Confidence}_{\text{fused}} = 1 - \prod_{i=1}^{N} (1 - S_i \cdot w_i)$$

Where:
* $S_i$ = Numerical confidence score of sensor $i$ ($0 \le S_i \le 1$).
* $w_i$ = Domain relevance weight of sensor $i$ ($0 < w_i \le 1$).

---

## 3. Decay Function
Freshness directly degrades confidence over time $t$:

$$S(t) = S_0 \cdot e^{-\lambda t}$$

Where $\lambda$ is the domain half-life parameter (e.g. $\lambda_{\text{SERP}} = 0.1 \text{ days}^{-1}$, $\lambda_{\text{WHOIS}} = 0.005 \text{ days}^{-1}$).
