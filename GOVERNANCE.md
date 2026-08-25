# UTL.tools Governance & Contribution Standards

## 1. Core Principles

The integrity, speed, and longevity of UTL.tools are protected by strict architectural governance:

1. **Client-First Principle**: Every utility MUST operate 100% on the client side whenever technically feasible. Server roundtrips are only permitted when querying public DNS/Network protocol data that browser sandboxes cannot directly execute.
2. **Zero-Tracking / Privacy Guarantee**: User data inputted into tools (passwords, invoices, JSON payloads, tokens, financial details) MUST NEVER be logged, transmitted to third parties, or saved to a remote server without explicit user consent.
3. **No Visual Clutter**: Utilities must adhere to clean, minimalist UI design without intrusive banners, popups, aggressive modal locks, or unneeded visual animations.
4. **Resilience & Evergreen Operation**: Avoid volatile external npm dependencies. Code should rely on standard Web APIs (`Crypto`, `Canvas`, `Intl`, `URL`, `btoa/atob`, `Date`, `Math`, `SpeechSynthesis`, `Clipboard`) so utilities remain functional for years without updates.

---

## 2. Tool Acceptance Criteria

Before any utility is merged into the registry, it must fulfill the **UTL Standard Checklist**:

| Requirement | Description | Mandatory |
| :--- | :--- | :---: |
| **Instant Interactivity** | Works immediately upon page load (< 100ms TTI) | ✅ Yes |
| **Complete Functionality** | No mock or partial dummy logic; fully functional end-to-end | ✅ Yes |
| **Copy & Reset Actions** | Instant copy to clipboard with feedback + 1-click reset | ✅ Yes |
| **Input Validation** | Helpful error messages for malformed input without crashing | ✅ Yes |
| **Educational Content** | Includes "What is this?", "How it works", "Why use it" sections | ✅ Yes |
| **FAQ & Schema** | Minimum 3 FAQs with valid schema.org JSON-LD | ✅ Yes |
| **Responsive Design** | 100% functional on mobile, tablet, and desktop viewports | ✅ Yes |
| **Light & Dark Theme** | Proper contrast ratios in both light mode and dark mode | ✅ Yes |

---

## 3. Canonical Control Center & Operational Protocols

As of Version 1.1, the canonical operational control artifact is:
**`control/UTL-CONTROL-CENTER.xlsx`**

### Mandatory Operational Protocols:
1. **Canonical Source of Truth**: The XLSX workbook is the primary operational state. CSV files are preserved as historical import/export artifacts but are not competing sources of truth.
2. **Never Overwrite Human Comments**: Human reviewer comments, notes, decisions, and acceptance determinations must NEVER be overwritten or cleared by automated agents.
3. **Bounded Execution**: Agents must filter and select only the relevant records requested (e.g. `priority=P0 AND status=FAIL`) rather than blindly processing the entire workbook.
4. **Safe Write & Backup Protocol**:
   - Create a timestamped backup in `control/backups/` prior to any mutation.
   - Validate the resulting OpenXML package, sheets, and hyperlinks after writing.
   - In case of validation failure, restore the last known-good backup.
5. **Self-Maintaining Index**: Every worksheet must be registered in `P-00 INDEX` with valid bidirectional navigation links. No orphan sheets are permitted.
