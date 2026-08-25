# Opportunity Engine & Scoring Specification

---

## 1. Opportunity Score Equation
The **Opportunity Engine** evaluates candidate initiatives (such as expanding new utilities or entering new geographic/language markets) using a multi-factor scoring model:

$$\text{Opportunity Score} = \frac{(D \cdot 0.25 + G \cdot 0.20 + I \cdot 0.20 + CG \cdot 0.20 + GEO \cdot 0.15) \cdot C_{\text{confidence}}}{1 + (CX \cdot 0.50 + M \cdot 0.50)}$$

Where:
* $D$ = Market Search Demand ($0-100$)
* $G$ = Historical Growth Rate ($0-100$)
* $I$ = Search Intent Match ($0-100$)
* $CG$ = Competitor Gap / Vulnerability ($0-100$)
* $GEO$ = Geographic & Language Expansion Potential ($0-100$)
* $C_{\text{confidence}}$ = Data Confidence Multiplier ($0.0-1.0$)
* $CX$ = Implementation Complexity ($0-100$)
* $M$ = Ongoing Maintenance Burden ($0-100$)

---

## 2. Opportunity Queue Ranking
The engine automatically ranks candidates into 4 strategic priority tiers:

| Tier | Score Range | Action Directive |
| :--- | :--- | :--- |
| **P0 (Immediate)** | $\ge 80.0$ | Top priority for immediate implementation in next cycle. |
| **P1 (High)** | $65.0 – 79.9$ | High priority candidate; queue for Phase 2 implementation. |
| **P2 (Medium)** | $50.0 – 64.9$ | Medium priority; monitor search trends and competitor activity. |
| **P3 (Horizon)** | $< 50.0$ | Low priority or high infrastructure requirement (requires server/WASM). |

---

## 3. Human Approval Gate
Opportunity Engine outputs are placed into `control/INTERNET-INTELLIGENCE-CONTROL-CENTER.xlsx` under sheet `P-10 OPPORTUNITIES`.
No candidate is built automatically; the human operator must change `reviewer_status` to `APPROVED` before implementation begins.
