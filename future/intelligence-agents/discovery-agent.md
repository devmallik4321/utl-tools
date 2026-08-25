# Future Agent Spec: Utility Discovery Agent

## 1. Purpose & Objectives
The **Utility Discovery Agent** is an autonomous intelligence pipeline designed to detect emerging online utility opportunities from search patterns, community discussions, and developer forums before they become saturated.

---

## 2. Monitored Data Streams
1. **Search Intent & Volume**:
   - Google Trends spikes for "online converter", "generator", "checker", "formatter".
   - Search autocomplete suggestions for "free online [x]".
2. **Developer & Creator Communities**:
   - Reddit (`r/webdev`, `r/productivity`, `r/SideProject`, `r/Frontend`).
   - Hacker News "Ask HN" threads complaining about clunky existing tools.
   - Stack Overflow recurrent questions requiring simple conversions.
3. **Competitor & Market Analysis**:
   - Outdated utility sites burdened with excessive ads, subscriptions, or paywalls.

---

## 3. Output Schema & Artifact
The agent periodically produces structured discovery tickets matching the `registry/utilities.json` format, complete with:
- Suggested tool slug & name
- Estimated search volume & competition difficulty
- Proposed input/output requirements
- Core algorithm / client-side Web API feasibility assessment
