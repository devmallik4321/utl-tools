# Internet Sensor Fabric — Core Conceptual Architecture Model

---

## 1. Architectural Flow
The Sensor Fabric converts raw public Internet activity into structured decision intelligence through a ten-stage pipeline:

```
PUBLIC INTERNET
       │
       ▼
┌──────────────┐
│   DOMAINS    │  (16 Recognized Domains: Traffic, Search, Content, Tech, etc.)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│CONCENTRATION │  (High-density hubs: Search engines, GitHub, APIs, Forums)
│   POINTS     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   SENSORS    │  (Repeatable observation probes with cadence & rate limits)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ OBSERVATIONS │  (Raw facts/estimates tagged with provenance & confidence)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ TIME SERIES  │  (Immutable historical trend records)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ RELATIONSHIPS│  (Graph connections between entities, keywords, & domains)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│SENSOR FUSION │  (Cross-domain signal synthesis & correlation)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ INTELLIGENCE │  (Inferred market dynamics, demand shifts, & gaps)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│RECOMMENDATIONS│ (Ranked opportunity queue for human approval)
└──────────────┘
```

---

## 2. Domains
The fabric supports 16 canonical domains:
1. **Traffic Intelligence**: Visit volume, device mix, referral sources, engagement.
2. **Search Intelligence**: Search volume, query intent, SERP positions, CTR.
3. **Content Intelligence**: Page counts, topic coverage, publishing cadence, readability.
4. **Domain Intelligence**: DNS records, WHOIS metadata, SSL certificates, subdomains.
5. **People Intelligence**: Public author attribution, open-source maintainers, organization roles.
6. **Company Intelligence**: Corporate profiles, products, tech stack, funding signals.
7. **Research Intelligence**: Published preprints, citation indices, academic paper releases.
8. **Technology Intelligence**: Open-source repos, npm downloads, Web API adoption, frameworks.
9. **Product Intelligence**: Feature sets, pricing models, release cadences, user ratings.
10. **Social Intelligence**: Public discussions, mention volume, sentiment shifts.
11. **Community Intelligence**: Forum activity, Discord/Slack community size, Q&A density.
12. **Geographic Intelligence**: Country traffic distribution, regional language preference.
13. **Economic Intelligence**: Industry spend, CPC values, monetization models.
14. **Knowledge Intelligence**: Ontology coverage, Wikipedia references, documentation completeness.
15. **Authority Intelligence**: Domain authority, backlink quality, citation count.
16. **Trend Intelligence**: Velocity, acceleration, emerging search interest, seasonality.

---

## 3. Concentration Points
Concentration points are public Internet hubs where domain information is highly concentrated:
* **Analytics Providers**: GA4, Google Search Console.
* **Search Platforms**: Google Search, Bing, DuckDuckGo.
* **Code Repositories**: GitHub, GitLab, npm registry.
* **Scholarly Portals**: arXiv, Europe PMC, OpenAlex.
* **Community Platforms**: Reddit, Hacker News, Stack Overflow.
* **Web Aggregators**: SimilarWeb public benchmarks, WHOIS registries, DNS root servers.

---

## 4. Sensor Classes
Sensors belong to 16 functional classes:
* `presence`: Detects existence of page/tool/feature.
* `volume`: Measures magnitude (e.g. pageviews, search volume).
* `frequency`: Measures occurrence rates.
* `velocity`: Rate of change over time (\(\Delta v / \Delta t\)).
* `growth`: Percentage expansion over baseline.
* `attention`: User engagement metrics (duration, bounce rate).
* `intent`: Query classification (informational, transactional, diagnostic).
* `relationship`: Entity connection links (backlinks, dependencies).
* `authority`: Domain rating or citation count.
* `geographic`: Location/country breakdown.
* `temporal`: Time of day/day of week distribution.
* `change`: Schema or DOM structural shifts.
* `gap`: Missing features or unserved query intents.
* `anomaly`: Statistical outliers (\(> 2\sigma\)).
* `competition`: Competitor rank or market share.
* `silence/absence`: Absence of expected signals.
