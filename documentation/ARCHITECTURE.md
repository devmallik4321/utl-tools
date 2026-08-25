# UTL.tools Platform Architecture

## 1. High-Level Architectural Model

```text
+-------------------------------------------------------------------------+
|                               UTL.tools                                 |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                       Platform Web Shell (Next.js)                      |
|  - App Router                                                           |
|  - Layout, Theme (Light/Dark), Navigation, Breadcrumbs                  |
|  - Global Fuzzy Search Engine (Client Index)                           |
|  - Category Taxonomies & Dynamic SEO Metadata Generators                |
|  - Schema.org Structured Data Injectors                                |
|  - "My UTL" Local Persistence Layer                                     |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                  Universal Utility Registry (/registry)                 |
|  - utilities.json (Single source of truth for tool metadata & SEO)      |
|  - categories.json (Taxonomies, icons, accents)                         |
|  - roles.json (Personas, productivity packs)                            |
+-------------------------------------------------------------------------+
                                     |
         +---------------------------+---------------------------+
         |                                                       |
         v                                                       v
+--------------------------------+      +--------------------------------+
|        Static Utilities        |      |       Advanced Utilities       |
|  - 100% Client-side JS / Wasm  |      |  - DNS-over-HTTPS queries      |
|  - Zero backend dependency     |      |  - Interactive builders        |
|  - Web Crypto / Canvas / Intl  |      |  - Print engines / PDF exports |
+--------------------------------+      +--------------------------------+
```

---

## 2. Decoupling & Growth Strategy

### The Registry Pattern
All routing, search indexing, related tool mapping, category filtering, and metadata rendering are generated dynamically from `/registry/utilities.json`.

Adding a new tool never requires modifying central layout code. Developers simply:
1. Add the tool component to `/utilities/[category]/[slug].tsx`.
2. Register the entry in `/registry/utilities.json`.
3. The platform shell automatically generates the static route `/tools/[slug]`, updates search indexes, injects schema.org tags, and links related utilities.

---

## 3. Storage & Persistence Philosophy

- **Phase 1 & 2**: Zero-backend architecture. Local state and user bookmarks ("Saved Tools") use browser `localStorage`.
- **Phase 3 ("My UTL")**: Optional opt-in sync layer using decentralized passkeys or lightweight serverless key-value stores without compromising the instant anonymous usability of the tools.
