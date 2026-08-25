# Adding New Utilities to UTL.tools

This guide explains how to add new utilities to UTL.tools in 3 simple steps.

---

## Step 1: Define the Utility in `registry/utilities.json`

Add a JSON object adhering to the schema:

```json
{
  "id": "sample-tool-slug",
  "name": "Human Friendly Tool Name",
  "slug": "sample-tool-slug",
  "description": "One sentence explaining exactly what the tool does.",
  "category": "developer",
  "type": "Static Utility",
  "technology": "HTML/CSS/JS",
  "keywords": ["keyword 1", "keyword 2"],
  "targetUsers": ["Developers", "Engineers"],
  "badge": "New",
  "related": ["other-tool-slug-1", "other-tool-slug-2"],
  "seo": {
    "title": "Full SEO Title Tag — High Intent Search Keywords",
    "metaDescription": "Concise 150-160 character meta description.",
    "whatIsThis": "Clear 2-3 sentence overview explaining what the tool is.",
    "howItWorks": "Numbered step-by-step instructions on using the tool.",
    "whyUseIt": "Benefits: why use this tool over alternatives (privacy, speed, accuracy).",
    "faqs": [
      {
        "question": "Frequently asked question 1?",
        "answer": "Clear, concise answer."
      }
    ]
  },
  "futureImprovements": ["Future feature idea 1", "Future feature idea 2"]
}
```

---

## Step 2: Implement the Interactive React Component

Create your tool component in `apps/web-shell/src/components/tools/[slug].tsx` (or inside `/utilities/[category]/[slug].tsx`).

Ensure the component:
1. Is client-rendered (`"use client"`).
2. Has responsive controls for mobile and desktop.
3. Includes an output section with a 1-click Copy button.
4. Includes a Reset / Clear button.
5. Provides validation feedback if inputs are invalid.

---

## Step 3: Register Component in the Web Shell Tool Dispatcher

Export your component from `apps/web-shell/src/components/tools/registry-components.tsx`.

The platform will automatically:
- Render the tool on `/tools/[slug]`
- Index it for instant keyboard search (`/` and `Ctrl+K`)
- Generate SEO headers, OpenGraph tags, and Schema.org `SoftwareApplication` + `FAQPage` metadata
- Add it to the corresponding category page
- Link it in related tool carousels
