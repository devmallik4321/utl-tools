# UTL.tools — The Digital Toolbox

> **Free, fast, evergreen online utilities that solve everyday problems.**

UTL.tools is a high-performance utility platform designed with Google-like simplicity, instant client-side execution, and zero unnecessary bloat.

---

## 🛠️ Repository Architecture

```text
UTL-TOOLS/
├── README.md                 # System overview and quickstart
├── PROJECT-CHARTER.md        # Core vision, philosophy, and constraints
├── ROADMAP.md                # 3-Phase evolution plan
├── GOVERNANCE.md             # Standards, privacy rules, acceptance checklist
│
├── control/                  # Canonical Project Control Center
│   ├── UTL-CONTROL-CENTER.xlsx # Master operational control workbook (15 sheets)
│   └── backups/              # Timestamped workbook state backups
│
├── apps/
│   └── web-shell/            # High-performance Next.js application & routing shell
│
├── registry/
│   ├── utilities.json        # Central metadata registry for all tools
│   ├── categories.json       # Category taxonomies and iconography
│   └── roles.json            # Persona definitions for future productivity packs
│
├── design-system/
│   ├── tokens.json           # Color palette, spacing, typography tokens
│   └── DESIGN-SYSTEM.md      # UI design guidelines and component standards
│
├── documentation/
│   ├── ARCHITECTURE.md       # Technical architecture & decoupling model
│   ├── ADDING-UTILITIES.md   # Step-by-step guide for contributing new tools
│   ├── SEO-PLAYBOOK.md       # SEO, Schema.org, and content strategy
│   ├── PERFORMANCE-GUIDELINES.md # Speed budgets and client-side best practices
│   ├── UTILITY-QUALITY-STANDARD.md # 8-stage search destination standard
│   ├── CANDIDATE-UTILITIES.md# 40-utility prioritized expansion pipeline
│   ├── UTILITY-REVIEW-MATRIX.csv # Historical review matrix import
│   └── UTILITY-CHANGELOG.csv # Historical changelog import
│
└── future/
    ├── intelligence-agents/  # Specifications for automated discovery & optimization agents
    │   ├── discovery-agent.md
    │   ├── improvement-agent.md
    │   └── traffic-intelligence-agent.md
    └── productivity-platform/# Architecture for Phase 3 "My UTL" workspace & packs
        ├── my-utl-specification.md
        └── packs-and-collections.md
```

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+ (Recommended: Node 20+ / 24+)
- npm 9+

### Installation & Development
```bash
# Navigate to the web-shell application
cd apps/web-shell

# Install dependencies
npm install

# Start the local development server
npm run dev

# Build for production (SSG static export)
npm run build
```

---

## 📊 Control Center

The canonical project control artifact is located at:
**`control/UTL-CONTROL-CENTER.xlsx`**

It provides unified operational tracking, work queues, executable test cases, SEO registries, research findings, and session logs across Human Operators, Antigravity CLI, and Subagents.
