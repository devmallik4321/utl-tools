# UTL.tools Market Intelligence Framework

> **Lightweight competitive and search intent discovery engine.**

---

## 1. Objectives

The UTL Market Intelligence foundation serves to:
1. Systematically observe competitor utility portfolios (cyberchef, 10015.io, rapidtables, omnicalculator, tinywow, devutils).
2. Record high-intent evergreen search queries where users experience high friction (ad-cluttered pages, paywalls, slow servers, forced signups).
3. Directly inform the P0/P1 candidate backlog in `C-Candidates` of the Control Center.

---

## 2. Competitor Intelligence Schema

Recorded in `control/UTL-CONTROL-CENTER.xlsx` (`C-Competitors` sheet):

| Field | Description | Example |
| :--- | :--- | :--- |
| **competitor** | Organization or Brand Name | CyberChef |
| **website** | Domain URL | `https://gchq.github.io/CyberChef/` |
| **category** | Primary Utility Classification | Developer / Cryptography |
| **utility_count** | Observable live tools count | 300+ Recipes |
| **utility_examples** | Representative tools | Hex dump, Base64, AES, Hashing |
| **source_url** | Direct observation link | `https://gchq.github.io/CyberChef/` |
| **date_observed** | Timestamp of audit | 2026-08-25 |
| **traffic_estimate** | Public traffic metric | ~1.5M Monthly Visits |
| **traffic_source** | Primary traffic channel | Direct / Developer Community |
| **confidence** | Evaluation confidence | HIGH |
| **notes** | Architectural / UX observations | Powerful node graph but steep learning curve for non-technical users |
| **opportunity** | UTL Strategic Opportunity | Build single-click, standalone landing destinations for individual recipes |
| **last_checked** | Checkpoint date | 2026-08-25 |

---

## 3. Search Intelligence Schema

Recorded in `control/UTL-CONTROL-CENTER.xlsx` (`C-SearchIntel` sheet):

| Field | Description | Example |
| :--- | :--- | :--- |
| **query** | Target search phrase | "diff checker online" |
| **country** | Geographic target market | Global (US/UK/EU/IN) |
| **language** | Target language | en |
| **date** | Observation date | 2026-08-25 |
| **serp_observations** | Top SERP characteristics | Competitors filled with invasive display banners and cookie popups |
| **major_ranking_domains**| Current top ranking sites | diffchecker.com, text-compare.com |
| **competitor_presence** | Competitor density | HIGH |
| **utl_position** | UTL rank when observable | Unranked (Pre-Launch) |
| **opportunity** | Search capture strategy | 100% client-side privacy + zero ads + sub-50ms instant execution |
| **trend** | Search volume trajectory | Evergreen / Stable High |
| **source** | Data source | Google Keyword Planner / Public SERP |
| **confidence** | Confidence tier | HIGH |
