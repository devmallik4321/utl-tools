# Windows Widget Discovery Layer V1 — Architectural Specification

---

## 1. Executive Summary
The **Windows Widget Discovery Layer V1** expands UTL.tools into a three-pillar platform:
`UTILITY DISCOVERY + UTILITY EXECUTION + WIDGET DISCOVERY`

Its primary purpose is **traffic creation, search discovery, and internal link graph expansion**, offering a complete search destination for Windows desktop tools without introducing paywalls, compulsory accounts, or advertising bloat.

---

## 2. Technical Classification Model (`platformType`)
To maintain technical accuracy, every discovery is explicitly categorized into one of 8 platform types:
1. **`WINDOWS_WIDGET`**: Native Windows 11 Widgets Board (Win + W) widgets.
2. **`EDGE_SIDEBAR`**: Persistent sidebars in Microsoft Edge (e.g. Copilot).
3. **`PWA`**: Progressive Web Applications installable to the Windows desktop.
4. **`DESKTOP_WIDGET`**: Pinned wallpaper overlays or Rainmeter skins.
5. **`TRAY_UTILITY`**: System tray tools (e.g. TrafficMonitor, HWiNFO tray gauges).
6. **`DESKTOP_APPLICATION`**: Full offline desktop applications (e.g. DevToys).
7. **`WEB_UTILITY`**: Standalone browser utilities (e.g. UTL.tools).
8. **`OTHER`**: Miscellaneous Windows desktop tools.

---

## 3. Data Schema & Registries
* **Widget Registry**: [`registry/widgets.json`](file:///C:/Users/mallik/Documents/AAEP/03-Projects/UTILITY-OS/registry/widgets.json)
* **Widget Categories**: [`registry/widgetCategories.json`](file:///C:/Users/mallik/Documents/AAEP/03-Projects/UTILITY-OS/registry/widgetCategories.json)

---

## 4. Routing & SEO Hierarchy
* **Main Discovery Hub**: `/widgets`
* **Extensible Category SEO Pages**: `/widgets/[category]` (e.g. `/widgets/clock`, `/widgets/system-monitoring`, `/widgets/network`, `/widgets/developer`)
* **Individual Widget Detail Pages**: `/widgets/item/[slug]` (e.g. `/widgets/item/windows-clock-focus-widget`, `/widgets/item/traffic-monitor-tray`, `/widgets/item/devtoys-windows`)

---

## 5. Intent Discovery & Search
Users discover tools through goal-oriented intents ("What are you trying to do?") such as:
* *I want a clock*
* *I want to monitor my PC*
* *I want to monitor my internet*
* *I want developer tools*
* *I want AI tools*

---

## 6. Bi-Directional Utility ↔ Widget Link Graph
* **Utility Detail Pages (`/tools/[slug]`)**: Include a contextual callout box near the bottom linking to relevant desktop widget discoveries (e.g. Talking Alarm Clock ➔ Clock Widgets; Ping Test ➔ Network Speed Meters).
* **Widget Detail Pages (`/widgets/item/[slug]`)**: Include a contextual callout box linking to zero-install UTL web utilities.

---

## 7. Analytics Events (Zero Payload Leakage)
* `widget_view`: Tracked on widget detail page load (`widget_slug`, `category`).
* `widget_category_view`: Tracked on category page load (`category_slug`).
* `widget_search`: Tracked on search modal queries (`query_length`, `results_count`).
* `widget_external_click`: Tracked on official source link clicks.
* `widget_related_utility_click`: Tracked when navigating from widget to web utility.

---

## 8. Control Center Integration
Tracked in canonical [`control/UTL-CONTROL-CENTER.xlsx`](file:///C:/Users/mallik/Documents/AAEP/03-Projects/UTILITY-OS/control/UTL-CONTROL-CENTER.xlsx) under new worksheets:
* `P-WIDGETS` (Master Widget Registry Ledger)
* `P-WIDGET-CATEGORIES` (Category Taxonomy Ledger)
Both registered in `P-00 INDEX` with complete navigation links and zero orphan worksheets.
