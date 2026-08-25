# UTL.tools Design System

## 1. Aesthetic Philosophy: "Google Simplicity + Modern Utility"

UTL.tools avoids frivolous animations, unnecessary glassmorphism, heavy gradients, or futuristic hype. The platform exudes:
- **Instant Clarity**: The interface communicates what it does within 100 milliseconds.
- **Utilitarian Elegance**: Clean borders, high-contrast typography, crisp inputs, tactile action buttons.
- **Light Theme by Default**: High-readability daylight workspace with seamless dark theme parity.

---

## 2. Layout Structure

### Global Shell
1. **Top Navigation Bar**:
   - Platform brand mark: `UTL.tools`
   - Quick Search Trigger (`Ctrl+K` or `/`)
   - Category Dropdown / Quick Links
   - "Saved Tools" Drawer Trigger (previews "My UTL")
   - Light / Dark Mode Toggle
2. **Main Canvas**:
   - Max width: `1280px` centered (`max-w-7xl`).
   - Breadcrumb navigation (`Home > Category > Tool Name`).
   - Clean spacing with responsive margins (`px-4 sm:px-6 lg:px-8`).
3. **Footer**:
   - Category grid, platform charter, privacy commitment (100% client-side guarantee), roadmap links, and copyright.

---

## 3. Standard Utility Page Layout

Every utility page follows an identical, predictable 8-part anatomy:

```text
┌────────────────────────────────────────────────────────┐
│ Breadcrumbs: Home / Category / Tool Name               │
│ Tool Title + Badge + Subtitle Description              │
│ Action Toolbar: [★ Save to My UTL] [↗ Share] [↺ Reset]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [ INTERACTIVE TOOL INTERFACE / CONTROLS ]             │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [ RESULTS / OUTPUT / EXPORT ACTIONS (Copy / Download) ]│
│                                                        │
├────────────────────────────────────────────────────────┤
│ 📖 Explanation Section:                                │
│   • What is this?                                      │
│   • How does it work?                                  │
│   • Why use it?                                        │
├────────────────────────────────────────────────────────┤
│ ❓ Frequently Asked Questions (Accordion + JSON-LD)    │
├────────────────────────────────────────────────────────┤
│ 🔗 Related Utilities (4-Card Grid)                     │
└────────────────────────────────────────────────────────┘
```

---

## 4. UI Component Guidelines

- **Buttons**:
  - `Primary`: Solid dark slate (`bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900`) for primary action (Generate, Calculate, Convert).
  - `Secondary`: Outlined neutral border (`border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800`).
  - `Success/Copied`: Emerald green accent with check icon feedback.
- **Form Inputs & Textareas**:
  - Crisp 1px border (`border-slate-300 dark:border-slate-750`), focus ring (`focus:ring-2 focus:ring-blue-500`), monospace font for code/data inputs.
- **Copy Actions**:
  - Always provide instant visual feedback ("Copied!" tooltip / button state change for 2000ms).
