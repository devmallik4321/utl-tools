# UTL.tools Platform Roadmap

This document outlines the evolutionary roadmap for UTL.tools. The architecture is intentionally decoupled so that current implementations seamlessly support future capabilities without requiring structural rewrites.

---

## Phase 1: High-Performance Utility Library (Foundation Release)

### Milestones & Deliverables
- [x] **Universal Utility Registry (`registry/utilities.json`)**:
  - Centralized schema containing name, slug, description, category, type, tech, keywords, target roles, SEO metadata, FAQs, related tools, and future improvement notes.
- [x] **Web Shell Platform (Next.js App Router)**:
  - Fast, responsive platform shell with Light/Dark mode support.
  - Global fuzzy search modal with keyboard shortcuts (`/`, `Ctrl+K`).
  - Category index pages with filtered discovery.
  - Standardized Utility Page Layout (Tool interface, Result/Output area, "What is this?", "How it works", "Why use it", FAQs, Share dialog, Bookmark toggle).
- [x] **Initial Utility Batch (38 Evergreen Utilities)**:
  - **Fun**: Random Number Generator, Spin Wheel, Coin Flip, Dice Roller, Random Picker, Password Generator, Username Generator.
  - **Network**: My IP, Browser Info, Screen Resolution, Ping Test, DNS Lookup, User Agent Checker.
  - **Developer**: JSON Formatter, JSON Validator, Base64 Encoder, Base64 Decoder, UUID Generator, Timestamp Converter, URL Encoder, URL Decoder.
  - **Business**: QR Code Generator, Email Signature Generator, Business Name Generator, Invoice Generator.
  - **Finance**: Percentage Calculator, Compound Interest Calculator, Loan Calculator, Discount Calculator.
  - **Health**: BMI Calculator, Age Calculator, Water Intake Calculator.
  - **Education, Creative & AI Foundation**: Word Counter, GPA Calculator, Color Converter, Aspect Ratio Calculator, AI Token Counter, AI Prompt Enhancer.
- [x] **Local Storage Bookmarking ("My Saved Tools")**:
  - Client-side persistence allowing users to bookmark tools immediately without requiring an account.

---

## Phase 1.1: Utility Value & Search Intent Expansion (Current Release)

### Milestones & Deliverables
- [x] **Independent Search Destination Standard**:
  - Every utility page functions as a complete, standalone problem-solving resource.
- [x] **Utility Value Model Architecture**:
  - Integration of **User Problem Context**, **Search Intent Coverage**, **Result Interpretation**, **Practical Guidance**, **Calculation Limitations**, and **Trust Standards** across all 38 production utilities.
- [x] **Interactive Tool Interpretation Upgrades**:
  - Live activity suitability scorecard in Ping Test (Gaming, Zoom, 4K Streaming).
  - Explicit privacy boundary disclosure in My IP (What an IP reveals vs never reveals).
  - Mathematical entropy & brute-force crack time estimator in Password Generator.
  - Amortization ratio & 15 vs 30 year mortgage scenario analysis in Loan Calculator.
  - Clinical screening transparency & WHO spectrum in BMI Calculator.
  - Print sizing & 10:1 scan distance ratio guidelines in QR Code Generator.
- [x] **Utility Quality Standard & Discovery Pipeline**:
  - Documented `UTILITY-QUALITY-STANDARD.md`.
  - Prioritized 40-utility candidate pipeline (`CANDIDATE-UTILITIES.md`) classified across P0, P1, P2, and P3.

---

## Phase 2: Growth, Discovery & Batch Scaling

### Milestones & Deliverables
- **Implement P0 Candidates (12 High-Impact Utilities)**:
  - Diff Checker, Markdown to HTML, CSV to JSON, Regex Tester, HTML Entity Converter, SVG to PNG, Lorem Ipsum, Unit Converter, Case Converter, Hash Generator (SHA-256), Countdown Stopwatch, Subnet CIDR Calculator.
- **Utility Recommendation Engine**:
  - Contextual recommendation ribbons ("Users who used JSON Formatter also used JWT Decoder and Base64 Decoder").
- **Utility Submission & Contributor Pipeline**:
  - Standardized JSON manifest schema & contribution CLI for external developers to submit zero-dependency static tools.
- **Automated Performance & Broken Link Audits**:
  - CI/CD workflow checking all static utilities against Lighthouse performance budgets (< 50ms TBT, 100 SEO).
- **Weekly Utility Digest / Newsletter**:
  - Curated tools of the week for developers, founders, and students.

---

## Phase 3: Personal Utility Productivity Platform ("My UTL")

### Future Architecture Vision
- **User Accounts & Cloud Sync**:
  - Lightweight passwordless auth (Passkeys / Magic links) with zero friction.
- **Productivity Packs**:
  - Pre-configured utility bundles curated for specific professions:
    - *Developer Pack*: JSON Formatter, JWT Decoder, Regex Tester, Base64 Tool, Timestamp Converter.
    - *Business Pack*: Invoice Generator, QR Generator, Email Signature, Margin Calculator.
    - *Student Pack*: GPA Calculator, Word Counter, Citation Builder, Fraction Calculator.
    - *Creator Pack*: Aspect Ratio Calculator, Color Palette Generator, Video Bitrate Estimator.
- **Custom Tool Workspaces**:
  - Users can pin up to 8 tools onto a single split-screen dashboard canvas.
- **Custom Presets & Chained Pipelines**:
  - Ability to save input presets (e.g. standard invoice business details, signature templates) and pipe outputs between tools (e.g. Generate JSON -> Encode Base64 -> Create QR Code).
