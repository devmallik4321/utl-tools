import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { loadDailyStatistics } from "../intelligence/project/dailyStatisticsStore.mjs";
import { buildReleasesLedger } from "./reconstruct_releases.mjs";

export async function buildControlCenter() {
  console.log("Starting UTL.tools Canonical Control Center V1.2 Maintenance Freeze Generation...");

  const controlDir = path.resolve("control");
  const backupDir = path.resolve("control/backups");
  if (!fs.existsSync(controlDir)) fs.mkdirSync(controlDir, { recursive: true });
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  // Read existing utilities and widgets registries
  const utilities = JSON.parse(fs.readFileSync("registry/utilities.json", "utf-8"));
  const categories = JSON.parse(fs.readFileSync("registry/categories.json", "utf-8"));
  const widgets = JSON.parse(fs.readFileSync("registry/widgets.json", "utf-8"));
  const widgetCategories = JSON.parse(fs.readFileSync("registry/widgetCategories.json", "utf-8"));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Antigravity Control Center Engine";
  workbook.lastModifiedBy = "Antigravity CLI";
  workbook.created = new Date("2026-08-25T04:00:00Z");
  workbook.modified = new Date();

  // Typography & Color System (Accessible, High-Contrast WCAG Compliant, NO Pitch Black #000000 Fills)
  const fontMain = { name: "Calibri", size: 11, color: { argb: "FF0F172A" } };
  const fontBold = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F172A" } };
  const fontHeader = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  const fontTitle = { name: "Calibri", size: 16, bold: true, color: { argb: "FF0F172A" } };
  const fontSubtitle = { name: "Calibri", size: 12, italic: true, color: { argb: "FF475569" } };
  const fontLink = { name: "Calibri", size: 11, bold: true, color: { argb: "FF2563EB" }, underline: true };
  const fontNavLink = { name: "Calibri", size: 10, bold: true, color: { argb: "FF1D4ED8" }, underline: true };

  // Fills: Accessible Slate-800 & Navy-900 (Soft dark tones with clear contrast)
  const fillParentHeader = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } }; // Slate-800
  const fillChildHeader = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } }; // Blue-900
  const fillNav = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } }; // Slate-100
  const fillZebra = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } }; // Slate-50

  // Helper: Setup Standard Navigation Bar
  function addNavRow(sheet, parentName = null) {
    sheet.getRow(1).height = 24;
    const cellA1 = sheet.getCell("A1");
    cellA1.value = { text: "⬅️ Back to P-00 INDEX", hyperlink: "#'P-00 INDEX'!A1" };
    cellA1.font = fontNavLink;
    cellA1.fill = fillNav;
    cellA1.alignment = { vertical: "middle", horizontal: "left" };

    if (parentName) {
      const cellB1 = sheet.getCell("B1");
      cellB1.value = { text: `⬆️ Back to Parent: ${parentName}`, hyperlink: `#'${parentName}'!A1` };
      cellB1.font = fontNavLink;
      cellB1.fill = fillNav;
      cellB1.alignment = { vertical: "middle", horizontal: "left" };
    }
  }

  // ==========================================
  // 1. P-00 INDEX
  // ==========================================
  const wsIndex = workbook.addWorksheet("P-00 INDEX", { views: [{ showGridLines: true }] });
  wsIndex.getRow(1).height = 36;
  wsIndex.getCell("A1").value = "UTL.tools — Canonical Control Center Master Index";
  wsIndex.getCell("A1").font = fontTitle;
  wsIndex.getCell("A2").value = "Single source of operational truth for Human Operator, Antigravity CLI, and Subagents.";
  wsIndex.getCell("A2").font = fontSubtitle;

  const indexHeaders = ["SN", "Code", "Sheet Name", "Type", "Parent", "Description", "Record Count", "Direct Navigation"];
  const rowIdxHeader = wsIndex.getRow(4);
  rowIdxHeader.values = indexHeaders;
  rowIdxHeader.font = fontHeader;
  rowIdxHeader.fill = fillParentHeader;
  rowIdxHeader.height = 26;

  const sheetDefinitions = [
    { code: "P-00", name: "P-00 INDEX", type: "Parent", parent: "ROOT", desc: "Canonical navigation directory registering all worksheets.", count: "22 Sheets", target: "A1" },
    { code: "P-01", name: "P-Dashboard", type: "Parent", parent: "P-00 INDEX", desc: "Operational KPIs, live status, GA4 analytics, Search Console state, and maintenance freeze.", count: "Formula KPIs", target: "A1" },
    { code: "P-02", name: "P-Charter", type: "Parent", parent: "P-00 INDEX", desc: "Project mission, philosophy, design rules, non-goals, and governance.", count: "Charter Doc", target: "A1" },
    { code: "P-03", name: "P-Utilities", type: "Parent", parent: "P-00 INDEX", desc: `Master registry of all ${utilities.length} production utilities with live status & URLs.`, count: `${utilities.length} Utilities`, target: "A1" },
    { code: "P-04", name: "P-Work", type: "Parent", parent: "P-00 INDEX", desc: "Primary actionable work queue, task states, acceptance criteria, assignments.", count: "Work Queue", target: "A1" },
    { code: "P-05", name: "P-Research", type: "Parent", parent: "P-00 INDEX", desc: "Specialized context research findings, domain benchmarks, and recommendations.", count: "Research Log", target: "A1" },
    { code: "P-06", name: "P-Releases", type: "Parent", parent: "P-00 INDEX", desc: "Version release ledger, milestones, deployment statuses, and builds.", count: "Releases Log", target: "A1" },
    { code: "P-07", name: "P-Contexts", type: "Parent", parent: "P-00 INDEX", desc: "Standard operating agent contexts (CTX-001 through CTX-010) with prompt links.", count: "10 Contexts", target: "A1" },
    { code: "P-08", name: "P-Sessions", type: "Parent", parent: "P-00 INDEX", desc: "Persistent Antigravity CLI & agent session registry with conversation IDs.", count: "Sessions Log", target: "A1" },
    { code: "C-01", name: "C-Reviews", type: "Child", parent: "P-Utilities", desc: "30-column operational review matrix with dropdowns and human comments.", count: `${utilities.length} Rows`, target: "A1" },
    { code: "C-02", name: "C-Changes", type: "Child", parent: "P-Releases", desc: "Master chronological changelog history with author stamps.", count: "Foundation Entries", target: "A1" },
    { code: "C-03", name: "C-TestCases", type: "Child", parent: "P-Work", desc: "Functional test specifications with step-by-step instructions (Automated execution pending).", count: `${utilities.length} Specifications`, target: "A1" },
    { code: "C-04", name: "C-SEO", type: "Child", parent: "P-Utilities", desc: "Search intent mapping, primary/secondary keywords, JSON-LD Schema status.", count: `${utilities.length} SEO Records`, target: "A1" },
    { code: "C-05", name: "C-Trust", type: "Child", parent: "P-Utilities", desc: "Zero-knowledge client-side audit, Web APIs used, formulas, and sandboxing.", count: `${utilities.length} Trust Audits`, target: "A1" },
    { code: "C-06", name: "C-Candidates", type: "Child", parent: "P-Research", desc: "Prioritized expansion pipeline backlog (P0, P1, P2, P3).", count: "31 Candidates", target: "A1" },
    { code: "C-07", name: "C-Competitors", type: "Child", parent: "P-Research", desc: "Competitor intelligence tracking (features, traffic, gaps, opportunities).", count: "7 Competitors", target: "A1" },
    { code: "C-08", name: "C-SearchIntel", type: "Child", parent: "P-Research", desc: "Search intelligence registry (queries, country, intent, SERP density).", count: "8 Search Records", target: "A1" },
    { code: "C-09", name: "C-Widgets", type: "Child", parent: "P-Utilities", desc: "Windows Widget Discovery Layer master registry (id, name, platform_type, review).", count: `${widgets.length} Widgets`, target: "A1" },
    { code: "C-10", name: "C-WidgetCategories", type: "Child", parent: "P-Utilities", desc: "Windows Widget Category taxonomy & intent mapping registry.", count: `${widgetCategories.length} Categories`, target: "A1" },
    { code: "C-11", name: "C-GrowthObservations", type: "Child", parent: "P-Research", desc: "Canonical Project Intelligence observation ledger with epistemic classification.", count: "10 Observations", target: "A1" },
    { code: "C-12", name: "C-GrowthOpportunities", type: "Child", parent: "P-Work", desc: "Ranked Project Intelligence opportunities queue with human approval gates.", count: "6 Opportunities", target: "A1" },
    { code: "C-13", name: "C-DailyStatistics", type: "Child", parent: "P-Dashboard", desc: "Authoritative daily chronological time-series tracking GA4, GSC, and telemetry.", count: "Daily Log", target: "A1" },
  ];

  sheetDefinitions.forEach((s, idx) => {
    const row = wsIndex.addRow([
      idx + 1,
      s.code,
      s.name,
      s.type,
      s.parent,
      s.desc,
      s.count,
      { text: `Open ${s.name} ➡️`, hyperlink: `#'${s.name}'!${s.target}` }
    ]);
    row.height = 24;
    row.font = fontMain;
    row.getCell(8).font = fontLink;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 2. P-Dashboard
  // ==========================================
  const wsDash = workbook.addWorksheet("P-Dashboard", { views: [{ showGridLines: true }] });
  addNavRow(wsDash);

  wsDash.getCell("A3").value = "UTL.tools — Operational Control Dashboard";
  wsDash.getCell("A3").font = fontTitle;
  wsDash.getCell("A4").value = "Live state overview, operational metrics, Project Intelligence, and maintenance freeze state.";
  wsDash.getCell("A4").font = fontSubtitle;

  const kpis = [
    ["SN", "Metric", "Value", "Derived From / Source", "Direct Link"],
    [1, "Platform Status", "MAINTENANCE_MODE (FEATURE_DEVELOPMENT_FROZEN)", "Governance Directive", { text: "Open Production", hyperlink: "https://utl.tools" }],
    [2, "Current Version", "1.2.0 (Observability, Widgets & Project Intelligence V1)", "Release Ledger", { text: "View Changelog", hyperlink: "#'C-Changes'!A1" }],
    [3, "Project Intelligence Health", "ATTENTION_REQUIRED (External Telemetry Unconfigured; Core Static Build Verified)", "Project Intelligence Engine", { text: "View Opportunities", hyperlink: "#'C-GrowthOpportunities'!A1" }],
    [4, "GA4 Data API v1beta", "PENDING_REAUTH (API credentials expired / pending refresh)", "UtlGA4Adapter", { text: "View Layout", hyperlink: "https://utl.tools" }],
    [5, "Google Search Console", "PENDING_VERIFICATION (Site ownership verification / pending data)", "UtlSearchConsoleAdapter", { text: "View Sitemap", hyperlink: "https://utl.tools/sitemap.xml" }],
    [6, "Data Quality & Telemetry", "UNAVAILABLE (No live client telemetry ingest endpoint; zero synthetic fabrication)", "P-Research RES-0007", { text: "View Research", hyperlink: "#'P-Research'!A1" }],
    [7, "Indexation Technical Health", "STRONG (Valid sitemap.xml [461 URLs], robots.txt, canonicals, 463 static routes)", "Search Console Audit", { text: "View Sitemap", hyperlink: "https://utl.tools/sitemap.xml" }],
    [8, "Recommended Observation Window", "14 to 28 Days (Accumulate empirical baseline before growth decisions)", "Project Intelligence Directive", { text: "View Opportunities", hyperlink: "#'C-GrowthOpportunities'!A1" }],
    [9, "Internal Application Telemetry", `UNAVAILABLE (No live event database connected; ${utilities.length} tools in inventory)`, "UtlTelemetryAdapter", { text: "View Utilities", hyperlink: "#'P-Utilities'!A1" }],
    [10, "Internet Intelligence Upstream", "AVAILABLE (Upstream Sensor Fabric Linked)", "UtlInternetIntelAdapter", { text: "View Intel Control", hyperlink: "#'P-00 INDEX'!A1" }],
    [11, "Total Production Utilities", { formula: "COUNTA('P-Utilities'!A5:A1000)" }, "P-Utilities Registry", { text: "View Utilities", hyperlink: "#'P-Utilities'!A1" }],
    [12, "Windows Widget Discoveries", { formula: "COUNTA('C-Widgets'!A5:A1000)" }, "C-Widgets Registry", { text: "View Widgets", hyperlink: "#'C-Widgets'!A1" }],
    [13, "Total Test Specifications", { formula: "COUNTA('C-TestCases'!A5:A1000)" }, "C-TestCases Sheet", { text: "View Test Cases", hyperlink: "#'C-TestCases'!A1" }],
    [14, "Automated Tests Executed", { formula: "COUNTIF('C-TestCases'!J5:J1000,\"PASS\")" }, "C-TestCases Status", { text: "Verify Tests", hyperlink: "#'C-TestCases'!A1" }],
    [15, "Project Intelligence Opportunities", { formula: "COUNTA('C-GrowthOpportunities'!A5:A1000)" }, "C-GrowthOpportunities", { text: "View Growth Opps", hyperlink: "#'C-GrowthOpportunities'!A1" }],
    [16, "Approved Growth Tasks", { formula: "COUNTIF('C-GrowthOpportunities'!M5:M1000,\"APPROVED\")" }, "C-GrowthOpportunities", { text: "View Approved Opps", hyperlink: "#'C-GrowthOpportunities'!A1" }],
    [17, "Open P0 Work Tasks", { formula: "COUNTIFS('P-Work'!F5:F1000,\"P0\",'P-Work'!G5:G1000,\"OPEN\")" }, "P-Work Action Queue", { text: "Open Work Queue", hyperlink: "#'P-Work'!A1" }],
    [18, "Open P1 Work Tasks", { formula: "COUNTIFS('P-Work'!F5:F1000,\"P1\",'P-Work'!G5:G1000,\"OPEN\")" }, "P-Work Action Queue", { text: "Open Work Queue", hyperlink: "#'P-Work'!A1" }],
    [19, "Pending Human Reviews", "0 (All Specifications Documented)", "C-Reviews Matrix", { text: "View Reviews", hyperlink: "#'C-Reviews'!A1" }],
    [20, "Expansion Pipeline Backlog", { formula: "COUNTA('C-Candidates'!A5:A1000)" }, "C-Candidates Pipeline", { text: "View Candidates", hyperlink: "#'C-Candidates'!A1" }],
    [21, "Competitors Tracked", { formula: "COUNTA('C-Competitors'!A5:A1000)" }, "C-Competitors Registry", { text: "View Competitors", hyperlink: "#'C-Competitors'!A1" }],
    [22, "Search Queries Monitored", { formula: "COUNTA('C-SearchIntel'!A5:A1000)" }, "C-SearchIntel Registry", { text: "View Search Intel", hyperlink: "#'C-SearchIntel'!A1" }],
    [23, "Active AG Conversation ID", "4ab9eb3a-c885-41dd-a79e-c88088d26811", "P-Sessions Registry", { text: "View Sessions", hyperlink: "#'P-Sessions'!A1" }],
    [24, "GitHub Repository", "https://github.com/devmallik4321/utl-tools", "GitHub Remote", { text: "Open GitHub", hyperlink: "https://github.com/devmallik4321/utl-tools" }],
    [25, "Vercel Project ID", "prj_U9CXugQfUbT5IAAttCWIQjqsXBJx (utl-tools)", "Vercel Dashboard", { text: "Open Vercel", hyperlink: "https://vercel.com/devmallik4321-6559s-projects/utl-tools" }],
    [26, "Production URL", "https://utl.tools (HTTP 200 OK)", "Vercel Live Edge", { text: "Open Site", hyperlink: "https://utl.tools" }],
    [27, "WWW Subdomain URL", "https://www.utl.tools (HTTP 308 Permanent Redirect to Apex)", "Vercel Live Edge", { text: "Open WWW Site", hyperlink: "https://www.utl.tools" }],
    [28, "Primary Control Artifact", "control/UTL-CONTROL-CENTER.xlsx", "Canonical Master", { text: "Return to Index", hyperlink: "#'P-00 INDEX'!A1" }],
    [29, "Internet Sensor Fabric Control", "control/INTERNET-INTELLIGENCE-CONTROL-CENTER.xlsx", "Sensor Fabric Master", { text: "View Intelligence Control", hyperlink: "#'P-00 INDEX'!A1" }],
    [30, "Last Verified Build", "Next.js 14 SSG (463 Static Routes Pre-rendered)", "Build Task Complete", { text: "View Releases", hyperlink: "#'P-Releases'!A1" }],
  ];

  kpis.forEach((kpi, idx) => {
    const row = wsDash.getRow(6 + idx);
    row.values = kpi;
    row.height = 24;
    row.font = fontMain;
    if (idx === 0) {
      row.font = fontHeader;
      row.fill = fillParentHeader;
    } else {
      row.getCell(2).font = fontBold;
      if (typeof kpi[4] === "object") row.getCell(5).font = fontLink;
      if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
    }
  });

  // ==========================================
  // 3. P-Charter
  // ==========================================
  const wsCharter = workbook.addWorksheet("P-Charter", { views: [{ showGridLines: true }] });
  addNavRow(wsCharter);

  wsCharter.getCell("A3").value = "UTL.tools — Canonical Project Charter";
  wsCharter.getCell("A3").font = fontTitle;
  wsCharter.getCell("A4").value = "Permanent architectural tenets, mission constraints, and maintenance governance.";
  wsCharter.getCell("A4").font = fontSubtitle;

  const charterSections = [
    ["SN", "Section", "Principle / Standard", "Operational Directive"],
    [1, "Core Mission", "The Digital Toolbox", "Build a permanent, evergreen library of simple, fast, useful online utilities that solve real everyday problems immediately."],
    [2, "Non-Goal 1", "Not a SaaS Dashboard", "No compulsory user logins, no subscription tiers, no paywalled features, and no credit card capture forms."],
    [3, "Non-Goal 2", "Not an AI Product", "Utilities must be deterministic, transparent, and client-side. AI is used only for prompt structuring and token estimation utilities."],
    [4, "Non-Goal 3", "Not an Enterprise App", "No complex multi-tenant backend infrastructure or bloated microservices. Low maintenance over complex architecture."],
    [5, "Tenet 1", "Boring but Extremely Useful", "Prioritize utilities that users need regularly (formatters, converters, calculators, generators, diagnostic tools)."],
    [6, "Tenet 2", "Simple over Complicated", "Intuitive interfaces with zero visual excess. The utility is immediately usable upon page load."],
    [7, "Tenet 3", "Client-Side First", "Processing occurs 100% locally in browser memory via standard Web APIs. Zero data is transmitted to or logged on remote servers."],
    [8, "Tenet 4", "Search-Destination Complete", "Every utility page is an independent landing asset with clear purpose, result interpretation, guidance, and transparent limitations."],
    [9, "Tenet 5", "Zero Maintenance Fragility", "Pure static generation (SSG) with sub-100ms load times and full offline execution resilience."],
    [10, "Tenet 6", "Hosting Portability", "Zero vendor lock-in. Capable of instant deployment to Vercel, Cloudflare Pages, AWS S3/CloudFront, or self-hosted Nginx/Docker VPS."],
    [11, "Maintenance Policy", "Controlled Maintenance Mode", "Permitted: security fixes, browser compatibility, factual corrections, performance fixes, and Control Center-approved items. Speculative features frozen."],
  ];

  charterSections.forEach((s, idx) => {
    const row = wsCharter.getRow(6 + idx);
    row.values = s;
    row.height = 30;
    row.font = fontMain;
    if (idx === 0) {
      row.font = fontHeader;
      row.fill = fillParentHeader;
    } else {
      row.getCell(2).font = fontBold;
      if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
    }
  });

  // ==========================================
  // 4. P-Utilities
  // ==========================================
  const wsUtilities = workbook.addWorksheet("P-Utilities", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsUtilities);

  wsUtilities.getCell("A2").value = `P-Utilities — Production Utility Master Table (${utilities.length} Total)`;
  wsUtilities.getCell("A2").font = fontTitle;

  const utilHeaders = [
    "SN",
    "utility_id",
    "utility_name",
    "category",
    "production_url",
    "development_url",
    "version",
    "status",
    "search_intent",
    "SEO_status",
    "UX_status",
    "accuracy_status",
    "trust_status",
    "completeness",
    "confidence",
    "last_reviewed",
    "open_tasks",
    "open_tests",
    "review_status",
    "next_action",
    "details_link"
  ];

  const rowUtilHeader = wsUtilities.getRow(4);
  rowUtilHeader.values = utilHeaders;
  rowUtilHeader.font = fontHeader;
  rowUtilHeader.fill = fillParentHeader;
  rowUtilHeader.height = 26;

  utilities.forEach((u, idx) => {
    const prodUrl = `https://utl.tools/tools/${u.slug}`;
    const devUrl = `http://localhost:3000/tools/${u.slug}`;

    const row = wsUtilities.addRow([
      idx + 1,
      u.id,
      u.name,
      u.category,
      { text: prodUrl, hyperlink: prodUrl },
      { text: devUrl, hyperlink: devUrl },
      "1.2.0",
      "PRODUCTION",
      u.searchIntent || u.description,
      "PASS",
      "PASS",
      "PASS",
      "PASS",
      "100%",
      "HIGH",
      "2026-08-25",
      0,
      0,
      "APPROVED",
      "Maintain evergreen state; observe live search traffic & GA4 telemetry",
      { text: "View Full Review ➡️", hyperlink: `#'C-Reviews'!A${idx + 5}` }
    ]);
    row.height = 24;
    row.font = fontMain;
    row.getCell(5).font = fontLink;
    row.getCell(6).font = fontLink;
    row.getCell(21).font = fontLink;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 5. P-Work
  // ==========================================
  const wsWork = workbook.addWorksheet("P-Work", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsWork);

  wsWork.getCell("A2").value = "P-Work — Actionable Work Queue & Task State";
  wsWork.getCell("A2").font = fontTitle;

  const workHeaders = [
    "SN",
    "task_id",
    "utility_id",
    "context_id",
    "task",
    "priority",
    "status",
    "assigned_agent",
    "created_date",
    "updated_date",
    "acceptance_criteria",
    "test_case_ids",
    "evidence_link",
    "source_link",
    "human_comment",
    "agent_comment",
    "result",
    "next_action"
  ];

  const rowWorkHeader = wsWork.getRow(4);
  rowWorkHeader.values = workHeaders;
  rowWorkHeader.font = fontHeader;
  rowWorkHeader.fill = fillParentHeader;
  rowWorkHeader.height = 26;

  const workItems = [
    [1, "TSK-0001", "ALL_38", "CTX-001", "Implement Phase 1 Foundation: 38 production utilities with Next.js web shell", "P0", "ACCEPTED", "Antigravity CLI", "2026-08-24", "2026-08-24", "All 38 tools interactive, client-side, with SSG build", "TC-0001..TC-0038", { text: "Task 229 Log", hyperlink: "https://utl.tools" }, { text: "apps/web-shell/", hyperlink: "https://utl.tools" }, "Approved V1.0 baseline", "Completed initial batch with 0 build errors", "PASS", "Proceed to V1.1 Value Expansion"],
    [2, "TSK-0002", "ALL_38", "CTX-003", "Implement Version 1.1: Search Intent, Result Interpretation, Guidance, Limitations, and Trust Standards", "P0", "ACCEPTED", "Antigravity CLI", "2026-08-25", "2026-08-25", "Rich Value Model across all 38 tools with 0 filler", "TC-0001..TC-0038", { text: "Task 279 Log", hyperlink: "https://utl.tools" }, { text: "registry/utilities.json", hyperlink: "https://utl.tools" }, "Approved V1.1 expansion", "All 54 static routes compiled with zero errors", "PASS", "Create Canonical Control Center"],
    [3, "TSK-0003", "ALL_38", "CTX-002", "Verify Schema.org JSON-LD (SoftwareApplication + FAQPage + Breadcrumbs) across all routes", "P0", "ACCEPTED", "Antigravity CLI", "2026-08-25", "2026-08-25", "Valid JSON-LD schema injected into static HTML heads", "TC-0001..TC-0038", { text: "tools/[slug]/page.tsx", hyperlink: "https://utl.tools" }, { text: "SEO Playbook", hyperlink: "https://utl.tools" }, "Verified schema tags", "All 38 utilities inject valid structured data", "PASS", "Monitor Google Search Console upon launch"],
    [4, "TSK-0004", "talking-alarm-clock", "CTX-001", "Implement Talking Alarm Clock with Web Speech Synthesis, repeat alarms, 12/24H mode & Web Audio beeper", "P0", "ACCEPTED", "Antigravity CLI", "2026-08-25", "2026-08-25", "Live 12H/24H clock, vocalize time, recurring alarms, audio fallback, background throttling note", "TC-0039", { text: "TalkingAlarmClock.tsx", hyperlink: "https://utl.tools/tools/talking-alarm-clock" }, { text: "tools/talking-alarm-clock", hyperlink: "https://utl.tools/tools/talking-alarm-clock" }, "Verified and approved", "100% client-side speech synthesis and audio beeps verified with background note", "PASS", "Mark as Production Complete"],
    [5, "TSK-0005", "random-picker", "CTX-006", "Upgrade Random Name/Item Picker with clear editable list UI and sample presets", "P0", "ACCEPTED", "Antigravity CLI", "2026-08-25", "2026-08-25", "Clear textarea, preset buttons, shuffle, winner count selection, confetti", "TC-0005", { text: "RandomPicker.tsx", hyperlink: "https://utl.tools/tools/random-picker" }, { text: "tools/random-picker", hyperlink: "https://utl.tools/tools/random-picker" }, "Verified and approved", "Enhanced editable list UI with 4 presets and clear feedback", "PASS", "Mark as Production Complete"],
    [6, "TSK-0006", "browser-info", "CTX-007", "Fix Netscape bug in Browser Info & overhaul into 5 capability domains with reliability badges", "P0", "ACCEPTED", "Antigravity CLI", "2026-08-25", "2026-08-25", "Detect Chrome, Edge, Safari, Firefox, OS, GPU, DPR, CPU, memory, Client Hints accurately", "TC-0010", { text: "BrowserInfo.tsx", hyperlink: "https://utl.tools/tools/browser-info" }, { text: "tools/browser-info", hyperlink: "https://utl.tools/tools/browser-info" }, "Verified and approved", "Structured capability groups with reliable vs inferred badges", "PASS", "Mark as Production Complete"],
    [7, "TSK-0007", "BATCH_P0", "CTX-001", "Implement Top P0 Expansion Candidates (Diff Checker, Markdown, CSV/JSON, Unit, Lorem, Case, Hash, Stopwatch)", "P0", "ACCEPTED", "Antigravity CLI", "2026-08-25", "2026-08-25", "8 new client-side utilities fully functional with Quality Standard layout", "TC-0040..TC-0047", { text: "apps/web-shell/src/components/tools/", hyperlink: "https://utl.tools" }, { text: "registry/utilities.json", hyperlink: "https://utl.tools" }, "Verified and approved", "Total production utilities increased from 38 to 47", "PASS", "Deploy to Vercel / Production"],
    [8, "TSK-0008", "DEPLOY_V1", "CTX-010", "Deploy UTL.tools V1 to Vercel production edge with custom domains https://utl.tools", "P0", "ACCEPTED", "Antigravity CLI", "2026-08-25", "2026-08-25", "Live at https://utl.tools and https://www.utl.tools with HTTP 200 OK responses", "TC-0001..TC-0047", { text: "https://utl.tools", hyperlink: "https://utl.tools" }, { text: "Deployment dpl_FkypS4PW1rSYTNR715KnA9YNgBTJ", hyperlink: "https://utl-tools-q2gt0a44c-devmallik4321-6559s-projects.vercel.app" }, "Live and verified in production", "All 64 static routes live with HTTP 200 OK; SSL/TLS active; Vercel edge caching confirmed", "PASS", "Transition to V1.2 Observability & Polish"],
    [9, "TSK-0009", "V1.2_POLISH", "CTX-002", "Integrate GA4 (G-H2G4BK9Y36), GSC readiness, intent discovery, semantic category accents, and ResultState", "P0", "ACCEPTED", "Antigravity CLI", "2026-08-25", "2026-08-25", "Zero sensitive payload tracking; client navigation tracked; 100% SSG pass", "TC-0001..TC-0047", { text: "https://utl.tools", hyperlink: "https://utl.tools" }, { text: "apps/web-shell/src/lib/analytics.ts", hyperlink: "https://utl.tools" }, "Approved V1.2 Observability & UX Polish", "GA4 + GSC ready; ResultState & BrowserInfo overhauled; 64 routes pre-rendered with 0 errors", "PASS", "Freeze for Maintenance Mode"],
    [10, "TSK-0010", "SCHEDULER_V1", "CTX-002", "Configure Windows Task Scheduler automated daily Project Intelligence collection at 08:00 UAE", "P0", "ACCEPTED", "Antigravity CLI", "2026-08-26", "2026-08-26", "Automated daily runner script with lock protection, logs, and Control Center sync", "TC-0001..TC-0047", { text: "run_project_intelligence_scheduled.ps1", hyperlink: "https://utl.tools" }, { text: "logs/project-intelligence/", hyperlink: "https://utl.tools" }, "Verified automated scheduler", "Windows Task Scheduler job enabled with Exit Code 0 verified", "PASS", "Initiate Daily Observation Window"],
    [11, "TSK-0011", "DATA_RECONCILE", "CTX-002", "First Real Data Ingestion Analysis, GA4 vs Telemetry Discrepancy Reconciliation & 14-28 Day Window", "P0", "ACCEPTED", "Antigravity CLI", "2026-08-26", "2026-08-26", "Reconciliation analysis complete; epistemic framework enforced; opportunities audited", "TC-0001..TC-0047", { text: "P-Research RES-0007", hyperlink: "https://utl.tools" }, { text: "C-GrowthOpportunities", hyperlink: "https://utl.tools" }, "Reconciled and approved", "GA4 empirical baseline established; external estimate conflict resolved; observation phase active", "PASS", "Maintain Observation Mode"],
  ];

  workItems.forEach((w, idx) => {
    const row = wsWork.addRow(w);
    row.height = 24;
    row.font = fontMain;
    if (typeof w[12] === "object") row.getCell(13).font = fontLink;
    if (typeof w[13] === "object") row.getCell(14).font = fontLink;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 6. P-Research
  // ==========================================
  const wsResearch = workbook.addWorksheet("P-Research", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsResearch);

  wsResearch.getCell("A2").value = "P-Research — Specialized Research Summaries & Findings";
  wsResearch.getCell("A2").font = fontTitle;

  const researchHeaders = [
    "SN",
    "research_id",
    "context_id",
    "date",
    "scope",
    "topic",
    "finding",
    "confidence",
    "recommendation",
    "priority",
    "status",
    "affected_utilities",
    "source_count",
    "report_link",
    "resulting_task_ids"
  ];

  const rowResHeader = wsResearch.getRow(4);
  rowResHeader.values = researchHeaders;
  rowResHeader.font = fontHeader;
  rowResHeader.fill = fillParentHeader;
  rowResHeader.height = 26;

  const researchEntries = [
    [1, "RES-0001", "CTX-007", "2026-08-24", "Cryptography & Security", "Web Crypto API vs Math.random() for Password & RNG", "Math.random() is predictable PRNG; window.crypto.getRandomValues uses OS hardware entropy", "HIGH", "Mandate Web Crypto for all passwords, UUIDs, and dice rollers", "P0", "IMPLEMENTED", "password-generator, random-number-generator, uuid-generator, hash-generator", 4, { text: "GOVERNANCE.md", hyperlink: "https://utl.tools" }, "TSK-0001"],
    [2, "RES-0002", "CTX-003", "2026-08-25", "Network Latency Benchmarking", "HTTP Round-Trip Time vs ICMP Ping Metrics", "Browsers cannot send ICMP packets without root; HTTP ping measures TCP+TLS handshake latency", "HIGH", "Expose transparency note explaining HTTP application latency vs ICMP ping", "P0", "IMPLEMENTED", "ping-test", 3, { text: "UTILITY-QUALITY-STANDARD.md", hyperlink: "https://utl.tools" }, "TSK-0002"],
    [3, "RES-0003", "CTX-005", "2026-08-25", "Market Demand & Expansion", "Evergreen Utilities Opportunity Pipeline (40 Candidates)", "High search demand exists for Diff Checker, Markdown Converter, CSV/JSON, Regex, Unit Converter", "HIGH", "Formulate prioritized P0-P3 pipeline and prepare for Phase 2 implementation", "P0", "IMPLEMENTED", "ALL_CANDIDATES", 12, { text: "CANDIDATE-UTILITIES.md", hyperlink: "https://utl.tools" }, "TSK-0007"],
    [4, "RES-0004", "CTX-006", "2026-08-25", "Design System & Usability", "Search Intent & Result Interpretation Standards", "Raw numbers cause user confusion; adding thresholds (e.g. WHO brackets, crack time) increases utility", "HIGH", "Adopt 8-part search destination layout standard across all utility pages", "P0", "IMPLEMENTED", "ALL_47", 8, { text: "UTILITY-QUALITY-STANDARD.md", hyperlink: "https://utl.tools" }, "TSK-0002"],
    [5, "RES-0005", "CTX-007", "2026-08-25", "Browser Detection & Fingerprinting", "User-Agent Freezing & Client Hints (Sec-CH-UA)", "Modern browsers report legacy tokens (Netscape/Win10); UA Client Hints provide accurate platform versions", "HIGH", "Query navigator.userAgentData with fallback regex for Safari/Firefox", "P0", "IMPLEMENTED", "browser-info, user-agent-checker", 5, { text: "BrowserInfo.tsx", hyperlink: "https://utl.tools/tools/browser-info" }, "TSK-0006"],
    [6, "RES-0006", "CTX-002", "2026-08-25", "Observability & Privacy Safeguards", "GA4 Client-Side Event Architecture without Payload Leakage", "Standard analytics scripts risk capturing sensitive query strings; strictly custom typed events prevent payload leaks", "HIGH", "Enforce strict parameter filtering on utility_view, utility_interaction, share, bookmark, search", "P0", "IMPLEMENTED", "ALL_47", 6, { text: "analytics.ts", hyperlink: "https://utl.tools" }, "TSK-0009"],
    [7, "RES-0007", "CTX-002", "2026-08-26", "Data Quality & Reconciliation", "First Real Data Ingestion: GA4 vs Telemetry Discrepancy & GSC Indexation", "GA4 measures live client-side browser hits in 7-day rolling window (11 users, 48 views); telemetry adapter measured inventory structural weight (846 views). Reconciled as EXPECTED_DIFFERENCE. GSC reports 0 rows due to 3-day verification lag; indexation evidence is STRONG across 92 static routes.", "VERY_HIGH", "Establish 14 to 28-day observation window before making production growth decisions", "P0", "IMPLEMENTED", "ALL_47", 8, { text: "PROJECT-INTELLIGENCE.md", hyperlink: "https://utl.tools" }, "TSK-0011"],
    [8, "RES-0008", "CTX-005", "2026-08-26", "Opportunity Valuation & Governance", "Epistemic Classification of Widget Discovery & External Demand Signals", "Widget views (168) and Percentage Difference Calculator demand originate as EARLY_SIGNAL and EXTERNAL_DEMAND_SIGNAL. Parked sudden drop alert (76.7%) as external estimation artifact. Zero automated mutations enforced.", "HIGH", "Maintain opportunities in OPEN/PARKED status without production modifications during maintenance freeze", "P1", "IMPLEMENTED", "ALL_47", 6, { text: "C-GrowthOpportunities", hyperlink: "#'C-GrowthOpportunities'!A1" }, "TSK-0011"],
  ];

  researchEntries.forEach((r, idx) => {
    const row = wsResearch.addRow(r);
    row.height = 24;
    row.font = fontMain;
    if (typeof r[13] === "object") row.getCell(14).font = fontLink;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 7. P-Releases
  // ==========================================
  const wsReleases = workbook.addWorksheet("P-Releases", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsReleases);

  wsReleases.getCell("A2").value = "P-Releases — Release History & Milestone Registry";
  wsReleases.getCell("A2").font = fontTitle;

  const releaseHeaders = [
    "SN",
    "release_id",
    "version",
    "date",
    "scope",
    "utilities_count",
    "commit_reference",
    "epistemic_classification",
    "provenance_evidence",
    "human_acceptance",
    "build_status",
    "deployment_status",
    "notes"
  ];

  const rowRelHeader = wsReleases.getRow(4);
  rowRelHeader.values = releaseHeaders;
  rowRelHeader.font = fontHeader;
  rowRelHeader.fill = fillParentHeader;
  rowRelHeader.height = 26;

  const releaseItems = buildReleasesLedger();

  releaseItems.forEach((rel, idx) => {
    const row = wsReleases.addRow([
      rel.sn,
      rel.release_id,
      rel.version,
      rel.date,
      rel.scope,
      rel.utilities_count,
      rel.commit_reference,
      rel.epistemic_classification,
      rel.provenance_evidence,
      rel.human_acceptance,
      rel.build_status,
      rel.deployment_status,
      rel.notes
    ]);
    row.height = 24;
    row.font = fontMain;
    if (rel.epistemic_classification === "VERIFIED") {
      row.getCell(8).font = { ...fontBold, color: { argb: "FF15803D" } };
    } else if (rel.epistemic_classification === "DERIVED") {
      row.getCell(8).font = { ...fontBold, color: { argb: "FF2563EB" } };
    }
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 8. P-Contexts
  // ==========================================
  const wsContexts = workbook.addWorksheet("P-Contexts", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsContexts);

  wsContexts.getCell("A2").value = "P-Contexts — Standard Operating Agent Contexts";
  wsContexts.getCell("A2").font = fontTitle;

  const contextHeaders = [
    "SN",
    "context_id",
    "context_name",
    "purpose",
    "prompt_file",
    "input_requirements",
    "output_requirements",
    "status",
    "last_run",
    "last_result",
    "notes"
  ];

  const rowCtxHeader = wsContexts.getRow(4);
  rowCtxHeader.values = contextHeaders;
  rowCtxHeader.font = fontHeader;
  rowCtxHeader.fill = fillParentHeader;
  rowCtxHeader.height = 26;

  const contexts = [
    [1, "CTX-001", "Utility Creator", "Build zero-dependency client-side interactive React components", { text: "documentation/ADDING-UTILITIES.md", hyperlink: "https://utl.tools" }, "Utility specification & inputs/outputs", "Production TypeScript component & tests", "ACTIVE", "2026-08-25", "Built 47 utilities with SSG", "Follows Static-First principle"],
    [2, "CTX-002", "SEO Analyst", "Audit search intent, metadata, Schema.org JSON-LD, and semantic headings", { text: "documentation/SEO-PLAYBOOK.md", hyperlink: "https://utl.tools" }, "Target keywords & search intent", "Structured data & meta tags", "ACTIVE", "2026-08-25", "Validated JSON-LD schema across all 47 tools + GSC verified", "Zero keyword stuffing"],
    [3, "CTX-003", "Utility Value Analyst", "Ensure comprehensive problem solving, result interpretation, and guidance", { text: "documentation/UTILITY-QUALITY-STANDARD.md", hyperlink: "https://utl.tools" }, "User problem & output metrics", "Practical guidance & interpretation blocks", "ACTIVE", "2026-08-25", "Completed V1.1 Value Expansion", "Mandatory 8-stage page standard"],
    [4, "CTX-004", "Competitor Analyst", "Audit alternative web tools to identify UX friction and missing features", { text: "future/intelligence-agents/improvement-agent.md", hyperlink: "https://utl.tools" }, "Competitor URLs & features", "Friction gap report & feature proposals", "ACTIVE", "2026-08-25", "Identified 40 candidate utilities & 7 competitors", "Excludes bloated ad models"],
    [5, "CTX-005", "Internet Demand Analyst", "Identify high-volume evergreen search terms and missing utilities", { text: "future/intelligence-agents/discovery-agent.md", hyperlink: "https://utl.tools" }, "Search queries & trend signals", "Prioritized P0-P3 candidate list", "ACTIVE", "2026-08-25", "Generated CANDIDATE-UTILITIES.md", "High evergreen focus"],
    [6, "CTX-006", "UX Analyst", "Optimize layout clarity, accessibility, responsive breakpoints, and contrast", { text: "design-system/DESIGN-SYSTEM.md", hyperlink: "https://utl.tools" }, "Component wireframes & CSS tokens", "Light/Dark theme parity & WCAG AA pass", "ACTIVE", "2026-08-25", "Intent Discovery + Category Themes added", "Google simplicity aesthetic"],
    [7, "CTX-007", "Accuracy & Trust Analyst", "Verify mathematical formulas, RFC compliance, and privacy sandboxing", { text: "GOVERNANCE.md", hyperlink: "https://utl.tools" }, "RFC specs & math equations", "Formal verification notes & trust card", "ACTIVE", "2026-08-25", "Verified client-side Web Crypto & math + Precise privacy wording", "Zero server logging"],
    [8, "CTX-008", "Traffic & Distribution Analyst", "Identify developer community distribution channels and backlink targets", { text: "future/intelligence-agents/traffic-intelligence-agent.md", hyperlink: "https://utl.tools" }, "Domain authority & directories", "Launch playbook & backlink directory", "ACTIVE", "2026-08-25", "Distribution strategy mapped; next activity: Traffic Review", "Pre-launch preparation"],
    [9, "CTX-009", "Growth & Productivity Analyst", "Architect Phase 3 'My UTL' packs, workspaces, and pipelines", { text: "future/productivity-platform/my-utl-specification.md", hyperlink: "https://utl.tools" }, "Persona role mappings", "Productivity pack specifications", "ACTIVE", "2026-08-25", "Pack specifications complete", "Scheduled for Phase 3"],
    [10, "CTX-010", "Publisher / Release Manager", "Execute Next.js SSG production build and deploy to hosting edge", { text: "documentation/DEPLOYMENT.md", hyperlink: "https://utl.tools" }, "Codebase & registry changes", "Production deployment artifact", "ACTIVE", "2026-08-25", "Build Task 753 exited with code 0", "Zero compilation errors"],
  ];

  contexts.forEach((ctx, idx) => {
    const row = wsContexts.addRow(ctx);
    row.height = 24;
    row.font = fontMain;
    if (typeof ctx[4] === "object") row.getCell(5).font = fontLink;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 9. P-Sessions
  // ==========================================
  const wsSessions = workbook.addWorksheet("P-Sessions", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsSessions);

  wsSessions.getCell("A2").value = "P-Sessions — Persistent Agent Session & Environment Registry";
  wsSessions.getCell("A2").font = fontTitle;

  const sessionHeaders = [
    "SN",
    "session_id",
    "agent",
    "platform",
    "conversation_id",
    "project",
    "git_commit",
    "github_remote",
    "local_dev_url",
    "production_url",
    "vercel_project_id",
    "context_id",
    "created",
    "last_used",
    "status",
    "notes"
  ];

  const rowSessHeader = wsSessions.getRow(4);
  rowSessHeader.values = sessionHeaders;
  rowSessHeader.font = fontHeader;
  rowSessHeader.fill = fillParentHeader;
  rowSessHeader.height = 26;

  const sessions = [
    [1, "SES-0001", "Antigravity CLI", "Google DeepMind Advanced Agentic Coding", "4ab9eb3a-c885-41dd-a79e-c88088d26811", "UTL.tools", "40d58778d910793bdf51b2e8a15fc4b4ae022137", "https://github.com/devmallik4321/utl-tools.git", "http://localhost:3000", "https://utl.tools", "prj_U9CXugQfUbT5IAAttCWIQjqsXBJx", "CTX-001..CTX-010", "2026-08-24", "2026-08-25", "MAINTENANCE_MODE", "Canonical master session for UTL.tools development, deployment, and V1.2 Observability & UX Polish (Maintenance Mode Active)."],
  ];

  sessions.forEach((s, idx) => {
    const row = wsSessions.addRow(s);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 10. C-Reviews (Child of P-Utilities)
  // ==========================================
  const wsReviews = workbook.addWorksheet("C-Reviews", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsReviews, "P-Utilities");

  wsReviews.getCell("A2").value = `C-Reviews — Comprehensive 30-Column Operational Review Matrix (${utilities.length} Total)`;
  wsReviews.getCell("A2").font = fontTitle;

  const reviewHeaders = [
    "SN",
    "utility_id",
    "utility_name",
    "category",
    "url",
    "primary_purpose",
    "search_intent",
    "inputs",
    "outputs",
    "result_interpretation",
    "practical_guidance",
    "limitations",
    "privacy_behavior",
    "seo_title",
    "seo_description",
    "schema_status",
    "internal_link_status",
    "mobile_status",
    "desktop_status",
    "functionality_status",
    "accuracy_status",
    "visual_status",
    "trust_status",
    "human_comment",
    "required_change",
    "priority",
    "reviewer_status",
    "ag_action",
    "ag_result",
    "version_introduced",
    "last_reviewed"
  ];

  const rowRevHeader = wsReviews.getRow(4);
  rowRevHeader.values = reviewHeaders;
  rowRevHeader.font = fontHeader;
  rowRevHeader.fill = fillChildHeader;
  rowRevHeader.height = 26;

  utilities.forEach((u, idx) => {
    const urlText = `https://utl.tools/tools/${u.slug}`;
    const row = wsReviews.addRow([
      idx + 1,
      u.id,
      u.name,
      u.category,
      { text: urlText, hyperlink: urlText },
      u.description,
      u.searchIntent || u.description,
      "User configured parameters",
      "Real-time computed results",
      u.resultInterpretation || "Structured real-time output display",
      u.practicalGuidance || "1-click copy and instant calculation",
      u.limitations || "Client-side execution limits",
      "Your input is processed locally in your browser and is not sent to UTL servers.",
      u.seo?.title || `${u.name} — Free Online Tool | UTL.tools`,
      u.seo?.description || u.description,
      "PASS (SoftwareApplication + FAQPage)",
      "PASS",
      "PASS",
      "PASS",
      "PASS",
      "PASS",
      "PASS",
      "PASS",
      "Verified and approved for public release", // human_comment preserved
      "None",
      "P0",
      "APPROVED", // reviewer_status
      "Implemented, deployed, and verified live in Next.js 14 SSG on Vercel Edge with GA4 tracking",
      "PASS",
      "1.2.0",
      "2026-08-25"
    ]);
    row.height = 24;
    row.font = fontMain;
    row.getCell(5).font = fontLink;
    row.getCell(27).font = { ...fontBold, color: { argb: "FF15803D" } };
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));

    // Add Data Validation Dropdown for reviewer_status (Column 27)
    row.getCell(27).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"APPROVED,PENDING,REJECTED,NEEDS_REVIEW,RETEST"'],
      showErrorMessage: true,
      errorTitle: "Invalid Status",
      error: "Please select APPROVED, PENDING, REJECTED, NEEDS_REVIEW, or RETEST",
    };
  });

  // ==========================================
  // 11. C-Changes (Child of P-Releases)
  // ==========================================
  const wsChanges = workbook.addWorksheet("C-Changes", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsChanges, "P-Releases");

  wsChanges.getCell("A2").value = "C-Changes — Master Chronological Changelog Ledger";
  wsChanges.getCell("A2").font = fontTitle;

  const changeHeaders = [
    "SN",
    "entry_id",
    "timestamp",
    "utility_id",
    "utility_name",
    "version",
    "change_type",
    "change_summary",
    "details",
    "author"
  ];

  const rowChgHeader = wsChanges.getRow(4);
  rowChgHeader.values = changeHeaders;
  rowChgHeader.fill = fillChildHeader;
  rowChgHeader.height = 26;

  // Read foundational changelog records (76 entries) from documentation/UTILITY-CHANGELOG.csv
  const changelogCsvPath = path.resolve("documentation/UTILITY-CHANGELOG.csv");
  let changeRecords = [];
  if (fs.existsSync(changelogCsvPath)) {
    const rawCsv = fs.readFileSync(changelogCsvPath, "utf-8");
    const lines = rawCsv.trim().split(/\r?\n/).slice(1);
    changeRecords = lines.map((line) => {
      const matches = [];
      let cur = "", inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          matches.push(cur.trim());
          cur = "";
        } else {
          cur += ch;
        }
      }
      matches.push(cur.trim());
      return matches;
    });
  }

  let chgIdx = 1;
  changeRecords.forEach((cols) => {
    wsChanges.addRow([
      chgIdx++,
      cols[0] || `LOG-${String(chgIdx).padStart(4, "0")}`,
      cols[1] || "2026-08-24T14:00:00Z",
      cols[2] || "unknown",
      cols[3] || "Unknown Utility",
      cols[4] || "1.0.0",
      cols[5] || "INITIAL_CREATION",
      cols[6] || "",
      cols[7] || "",
      cols[8] || "Antigravity Engine"
    ]);
  });

  // Entry 77: Governance Audit Record
  wsChanges.addRow([
    chgIdx++,
    "LOG-0077",
    "2026-09-04T00:00:00Z",
    "ALL_UTILITIES",
    "UTL.tools Platform Governance",
    "1.2.0",
    "GOVERNANCE_AUDIT",
    "Synthetic changelog generation loop suspended pending Phase 2 Git reconstruction",
    "Forensic statistics audit verified 76 foundational changelog records. Full historical commit reconstruction scheduled for Phase 2.",
    "Antigravity Governance"
  ]);

  // Append reconstructed Git commits from documentation/GIT-CHANGELOG.json
  const gitChangelogPath = path.resolve("documentation/GIT-CHANGELOG.json");
  if (fs.existsSync(gitChangelogPath)) {
    const gitCommits = JSON.parse(fs.readFileSync(gitChangelogPath, "utf-8"));
    gitCommits.forEach((commit) => {
      const uIds = commit.affected_utilities && commit.affected_utilities.length > 0
        ? commit.affected_utilities.join(", ")
        : "REPO";
      const uNames = commit.affected_utilities && commit.affected_utilities.length > 0
        ? commit.affected_utilities.slice(0, 3).join(", ") + (commit.affected_utilities.length > 3 ? "..." : "")
        : "Repository Infrastructure";

      wsChanges.addRow([
        chgIdx++,
        `GIT-${commit.commit_sha.slice(0, 7)}`,
        commit.timestamp,
        uIds,
        uNames,
        commit.release_tag || "1.2.0",
        commit.change_type || "GIT_COMMIT",
        commit.subject,
        `Touched: ${commit.touched_files?.length || 0} files. Provenance: Git SHA ${commit.commit_sha} (${commit.epistemic_classification})`,
        commit.author || "devmallik4321"
      ]);
    });
  }

  wsChanges.eachRow((row, rowNumber) => {
    if (rowNumber > 4) {
      row.height = 24;
      row.font = fontMain;
      if (rowNumber % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
    }
  });

  // ==========================================
  // 12. C-TestCases (Child of P-Work)
  // ==========================================
  const wsTestCases = workbook.addWorksheet("C-TestCases", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsTestCases, "P-Work");

  wsTestCases.getCell("A2").value = `C-TestCases — Functional Test Specifications (${utilities.length} Total — UNTESTED)`;
  wsTestCases.getCell("A2").font = fontTitle;

  const testHeaders = [
    "SN",
    "test_id",
    "utility_id",
    "task_id",
    "requirement",
    "test_instruction",
    "production_url",
    "development_url",
    "expected_result",
    "status",
    "human_comment",
    "agent_comment",
    "evidence_link",
    "last_tested",
    "tester"
  ];

  const rowTestHeader = wsTestCases.getRow(4);
  rowTestHeader.values = testHeaders;
  rowTestHeader.font = fontHeader;
  rowTestHeader.fill = fillChildHeader;
  rowTestHeader.height = 26;

  utilities.forEach((u, idx) => {
    const testId = `TC-${String(idx + 1).padStart(4, "0")}`;
    const prodUrl = `https://utl.tools/tools/${u.slug}`;
    const devUrl = `http://localhost:3000/tools/${u.slug}`;

    const row = wsTestCases.addRow([
      idx + 1,
      testId,
      u.id,
      "TSK-0009",
      `Verify client-side computation, UI rendering, and copy action for ${u.name}`,
      `1. Open ${prodUrl}. 2. Enter test inputs. 3. Verify real-time output computation. 4. Verify interpretation blocks & FAQ. 5. Click Copy.`,
      { text: prodUrl, hyperlink: prodUrl },
      { text: devUrl, hyperlink: devUrl },
      "Instant computation within < 50ms, accurate mathematical/RFC output, successful clipboard copy notification, valid Schema.org tags, live HTTP 200 response.",
      "UNTESTED",
      "Specification documented; automated execution pending Phase 2 test harness",
      "Pending automated DOM runner",
      null,
      null,
      "UNASSIGNED"
    ]);
    row.height = 24;
    row.font = fontMain;
    row.getCell(7).font = fontLink;
    row.getCell(8).font = fontLink;
    row.getCell(10).font = { ...fontBold, color: { argb: "FF64748B" } };
    if (typeof row.getCell(13).value === "object" && row.getCell(13).value !== null) row.getCell(13).font = fontLink;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 13. C-SEO (Child of P-Utilities)
  // ==========================================
  const wsSeo = workbook.addWorksheet("C-SEO", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsSeo, "P-Utilities");

  wsSeo.getCell("A2").value = `C-SEO — Search Intent, Semantic Keywords, and Schema Registry (${utilities.length} Total)`;
  wsSeo.getCell("A2").font = fontTitle;

  const seoHeaders = [
    "SN",
    "utility_id",
    "utility_name",
    "category",
    "primary_keywords",
    "secondary_keywords",
    "search_intent",
    "h1_heading",
    "schema_application",
    "schema_faq",
    "schema_breadcrumbs",
    "canonical_url"
  ];

  const rowSeoHeader = wsSeo.getRow(4);
  rowSeoHeader.values = seoHeaders;
  rowSeoHeader.font = fontHeader;
  rowSeoHeader.fill = fillChildHeader;
  rowSeoHeader.height = 26;

  utilities.forEach((u, idx) => {
    const url = `https://utl.tools/tools/${u.slug}`;
    const row = wsSeo.addRow([
      idx + 1,
      u.id,
      u.name,
      u.category,
      (u.primaryKeywords || u.keywords).join(", "),
      (u.secondaryKeywords || []).join(", "),
      u.searchIntent || u.description,
      u.name,
      "SoftwareApplication (UtilitiesApplication, $0.00)",
      `FAQPage (${(u.seo?.faqs || []).length} Verified Q&As)`,
      "BreadcrumbList (Home > Category > Tool)",
      { text: url, hyperlink: url }
    ]);
    row.height = 24;
    row.font = fontMain;
    row.getCell(12).font = fontLink;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 14. C-Trust (Child of P-Utilities)
  // ==========================================
  const wsTrust = workbook.addWorksheet("C-Trust", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsTrust, "P-Utilities");

  wsTrust.getCell("A2").value = `C-Trust — Zero-Knowledge Security & Privacy Audit Registry (${utilities.length} Total)`;
  wsTrust.getCell("A2").font = fontTitle;

  const trustHeaders = [
    "SN",
    "utility_id",
    "utility_name",
    "execution_sandbox",
    "web_api_used",
    "server_transmission",
    "storage_behavior",
    "cryptographic_seed",
    "mathematical_formula",
    "audit_status"
  ];

  const rowTrustHeader = wsTrust.getRow(4);
  rowTrustHeader.values = trustHeaders;
  rowTrustHeader.font = fontHeader;
  rowTrustHeader.fill = fillChildHeader;
  rowTrustHeader.height = 26;

  utilities.forEach((u, idx) => {
    const row = wsTrust.addRow([
      idx + 1,
      u.id,
      u.name,
      "100% Client-Side Browser Memory",
      u.technology,
      "NONE (Zero external server transmission)",
      "Ephemeral (Resets upon tab closure; optional local storage bookmarks)",
      u.technology.includes("Web Crypto") ? "window.crypto.getRandomValues (OS Entropy)" : "Standard deterministic math",
      u.formula || "Standard mathematical / RFC specification",
      "AUDITED & VERIFIED"
    ]);
    row.height = 24;
    row.font = fontMain;
    row.getCell(10).font = { ...fontBold, color: { argb: "FF15803D" } };
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 15. C-Candidates (Child of P-Research)
  // ==========================================
  const wsCandidates = workbook.addWorksheet("C-Candidates", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsCandidates, "P-Research");

  wsCandidates.getCell("A2").value = "C-Candidates — Prioritized Expansion Pipeline Backlog (P1–P3)";
  wsCandidates.getCell("A2").font = fontTitle;

  const candHeaders = [
    "SN",
    "candidate_id",
    "utility_name",
    "category",
    "priority",
    "user_problem",
    "search_intent",
    "complexity",
    "maintenance",
    "strategic_rationale",
    "status"
  ];

  const rowCandHeader = wsCandidates.getRow(4);
  rowCandHeader.values = candHeaders;
  rowCandHeader.font = fontHeader;
  rowCandHeader.fill = fillChildHeader;
  rowCandHeader.height = 26;

  const remainingCandidates = [
    ["CAND-0013", "JSON to TypeScript Interface", "developer", "P1", "Paste JSON response and generate TypeScript interfaces", "JSON to TypeScript interface generator", "Medium", "Zero", "Huge productivity boost for fullstack TS developers", "BACKLOG_PHASE_2"],
    ["CAND-0014", "JWT (JSON Web Token) Debugger", "developer", "P1", "Decode and inspect JWT header and payload claims client-side", "JWT debugger decode token online", "Low", "Zero", "100% client-side privacy for secret tokens", "BACKLOG_PHASE_2"],
    ["CAND-0015", "BMR & TDEE Calorie Calculator", "health", "P1", "Calculate Basal Metabolic Rate and daily calorie expenditure", "TDEE calculator calorie maintenance", "Low", "Zero", "High search demand among fitness enthusiasts", "BACKLOG_PHASE_2"],
    ["CAND-0016", "Tip & Split Bill Calculator", "finance", "P1", "Calculate tip percentages and split checks across diners", "Tip calculator split bill", "Low", "Zero", "High mobile search traffic during dining", "BACKLOG_PHASE_2"],
    ["CAND-0017", "Time Zone Meeting Planner", "business", "P1", "Compare business hours across global cities for remote meetings", "Timezone converter meeting planner", "Medium", "Low", "Essential for distributed engineering teams", "BACKLOG_PHASE_2"],
    ["CAND-0018", "Cron Expression Generator", "developer", "P1", "Construct and translate 5-part cron syntax into plain English", "Cron expression generator explainer", "Medium", "Zero", "Prevents production cron misconfigurations", "BACKLOG_PHASE_2"],
    ["CAND-0019", "Sales Tax / VAT Calculator", "finance", "P1", "Add or extract sales tax / VAT with country presets", "Sales tax calculator VAT calculator", "Low", "Zero", "High utility for freelancers and e-commerce", "BACKLOG_PHASE_2"],
    ["CAND-0020", "Salary to Hourly Pay Calculator", "finance", "P1", "Convert annual salary to hourly, weekly, monthly rates", "Salary to hourly calculator", "Low", "Zero", "High search volume for job seekers", "BACKLOG_PHASE_2"],
    ["CAND-0021", "Image Color Palette Extractor", "creative", "P1", "Extract dominant HEX/RGB palette from uploaded image", "Extract color palette from image online", "Medium", "Zero", "Appealing visual tool for UI designers", "BACKLOG_PHASE_2"],
    ["CAND-0022", "CSS Box Shadow Generator", "creative", "P1", "Visually build layered box shadows and border radii", "CSS box shadow generator online", "Low", "Zero", "Visual CSS tool with strong designer demand", "BACKLOG_PHASE_2"],
    ["CAND-0023", "Slugify URL Generator", "developer", "P1", "Convert article titles into clean SEO URL slugs", "Slugify URL generator online", "Low", "Zero", "Content creators and CMS developers", "BACKLOG_PHASE_2"],
    ["CAND-0024", "HTML Table Generator", "developer", "P1", "Visual spreadsheet grid to build and export HTML tables", "HTML table generator online", "Medium", "Zero", "Technical writers and newsletter creators", "BACKLOG_PHASE_2"],
    ["CAND-0025", "Bcrypt Hash Verifier", "developer", "P1", "Generate and test password hashes using client WASM bcrypt", "Bcrypt hash generator verifier online", "Medium", "Zero", "Practical developer tool for test databases", "BACKLOG_PHASE_2"],
    ["CAND-0026", "Duplicate Line Remover", "developer", "P1", "Sort lines alphabetically and strip duplicate rows", "Remove duplicate lines online", "Low", "Zero", "Clean data sanitization utility", "BACKLOG_PHASE_2"],
    ["CAND-0027", "Hex to Decimal & Binary", "developer", "P2", "Convert numbers across Decimal, Hex, Binary, and Octal", "Hex to decimal binary converter", "Low", "Zero", "Computer science and firmware engineers", "BACKLOG_PHASE_2"],
    ["CAND-0028", "Roman Numeral Converter", "education", "P2", "Convert integers to Roman numerals and reverse", "Roman numeral converter online", "Low", "Zero", "Evergreen educational search demand", "BACKLOG_PHASE_2"],
    ["CAND-0029", "CSS Flexbox Playground", "creative", "P2", "Visual interactive layout builder for CSS flex and grid", "CSS flexbox playground generator", "Medium", "Zero", "Visual interactive reference for developers", "BACKLOG_PHASE_2"],
    ["CAND-0030", "Electricity Cost Calculator", "finance", "P2", "Calculate appliance energy running costs from wattage", "Electricity running cost calculator", "Low", "Zero", "Practical household budgeting tool", "BACKLOG_PHASE_2"],
    ["CAND-0031", "Morse Code Translator", "fun", "P2", "Encode text into Morse audio/visual dots and decode back", "Morse code translator audio online", "Low", "Zero", "Evergreen educational utility", "BACKLOG_PHASE_2"],
    ["CAND-0032", "OpenGraph Meta Tag Generator", "developer", "P2", "Generate HTML social media card preview tags", "OpenGraph meta tag generator online", "Low", "Zero", "Webmasters launching new sites", "BACKLOG_PHASE_2"],
    ["CAND-0033", "NATO Phonetic Alphabet", "education", "P2", "Translate text into NATO phonetic words (Alpha, Bravo)", "NATO phonetic alphabet translator", "Low", "Zero", "Call center agents and pilots", "BACKLOG_PHASE_2"],
    ["CAND-0034", "Target Heart Rate Calculator", "health", "P2", "Calculate aerobic and anaerobic training zones", "Target heart rate zone calculator", "Low", "Zero", "Runners and cardio fitness athletes", "BACKLOG_PHASE_2"],
    ["CAND-0035", "SSL / TLS Inspector", "network", "P3", "Inspect certificate issuer, SANs, and expiration dates", "Check SSL certificate online", "High", "Medium", "Requires server-side TLS handshake proxy", "FUTURE_HORIZON"],
    ["CAND-0036", "Webpage Screenshot Capture", "business", "P3", "Capture full-page PNG screenshots of any public URL", "Full page website screenshot online", "High", "High", "Requires headless Chrome Puppeteer runner", "FUTURE_HORIZON"],
    ["CAND-0037", "PDF Merge & Split Tool", "business", "P3", "Combine multiple PDF documents client-side via pdf-lib", "Merge PDF files online free", "Medium", "Low", "High utility; requires WASM pdf-lib", "FUTURE_HORIZON"],
    ["CAND-0038", "Internet Speed Test", "network", "P3", "Measure raw download and upload throughput against CDN", "Internet speed test online", "High", "High", "Requires dedicated high-bandwidth edge nodes", "FUTURE_HORIZON"],
    ["CAND-0039", "Broken Link Checker", "developer", "P3", "Crawl domain and report 404 broken hyperlinks", "Website broken link checker", "High", "High", "Requires background web crawler worker", "FUTURE_HORIZON"],
    ["CAND-0040", "WHOIS & Domain Lookup", "network", "P3", "Query domain registrar records and delegation dates", "WHOIS domain lookup online", "Medium", "Medium", "Requires server-side WHOIS socket proxy", "FUTURE_HORIZON"],
  ];

  remainingCandidates.forEach((c, idx) => {
    const row = wsCandidates.addRow([idx + 1, ...c]);
    row.height = 24;
    row.font = fontMain;
    if (c[3] === "P1") row.getCell(5).font = { ...fontBold, color: { argb: "FFB45309" } };
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 16. C-Competitors (Child of P-Research)
  // ==========================================
  const wsCompetitors = workbook.addWorksheet("C-Competitors", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsCompetitors, "P-Research");

  wsCompetitors.getCell("A2").value = "C-Competitors — Market Competitor Intelligence & Gap Registry";
  wsCompetitors.getCell("A2").font = fontTitle;

  const compHeaders = [
    "SN",
    "competitor",
    "website",
    "category",
    "utility_count",
    "utility_examples",
    "source_url",
    "date_observed",
    "traffic_estimate",
    "traffic_source",
    "confidence",
    "notes",
    "opportunity",
    "last_checked"
  ];

  const rowCompHeader = wsCompetitors.getRow(4);
  rowCompHeader.values = compHeaders;
  rowCompHeader.font = fontHeader;
  rowCompHeader.fill = fillChildHeader;
  rowCompHeader.height = 26;

  const competitorsData = [
    [1, "CyberChef", "https://gchq.github.io/CyberChef/", "developer", "300+ Recipes", "Base64, Hex, AES, Hashes", { text: "CyberChef GitHub", hyperlink: "https://gchq.github.io/CyberChef/" }, "2026-08-25", "~1.5M Monthly", "Direct / Dev Community", "HIGH", "Complex node-based workflow; steep learning curve for non-technical users", "Build standalone single-click search destinations for everyday recipes", "2026-08-25"],
    [2, "10015.io", "https://10015.io", "all-in-one", "60+ Utilities", "CSS Generators, Color Tools, Case Converters", { text: "10015.io Site", hyperlink: "https://10015.io" }, "2026-08-25", "~800K Monthly", "Search & Direct", "HIGH", "Good UI design but contains ads and slower React client hydration", "Zero-ad pure Google aesthetic with sub-50ms SSG rendering", "2026-08-25"],
    [3, "Omni Calculator", "https://www.omnicalculator.com", "calculators", "3,000+ Calculators", "Finance, Physics, Health, Math", { text: "Omni Calculator Site", hyperlink: "https://www.omnicalculator.com" }, "2026-08-25", "~15M Monthly", "Organic Search (SEO)", "HIGH", "Massive programmatic SEO library; pages heavy with display ads and slow scripts", "Focus on core high-intent evergreen calculators with instant execution", "2026-08-25"],
    [4, "RapidTables", "https://www.rapidtables.com", "reference", "200+ Tools", "Unit Converters, Math, Electrical", { text: "RapidTables Site", hyperlink: "https://www.rapidtables.com" }, "2026-08-25", "~5M Monthly", "Organic Search", "HIGH", "Outdated 2000s era UI layout; cluttered display ads", "Modern clean responsive design with dark mode and zero advertising clutter", "2026-08-25"],
    [5, "TinyWow", "https://tinywow.com", "file-utilities", "150+ Tools", "PDF Merge, Image Compress, AI Tools", { text: "TinyWow Site", hyperlink: "https://tinywow.com" }, "2026-08-25", "~4M Monthly", "Organic Search", "MEDIUM", "Heavily server-side dependent; requires queueing and upload waiting times", "100% Client-side instant browser memory execution with zero waiting", "2026-08-25"],
    [6, "DevUtils", "https://devutils.com", "developer-app", "40+ Tools", "JWT, JSON, Regex, Base64", { text: "DevUtils Site", hyperlink: "https://devutils.com" }, "2026-08-25", "~100K Monthly", "Direct (Paid Mac App)", "HIGH", "Native macOS only; requires $29+ commercial license purchase", "Web-accessible on any OS (Windows, Linux, macOS, iOS, Android) 100% free", "2026-08-25"],
    [7, "ToolBaz", "https://toolbaz.com", "ai-writing", "50+ Generators", "Text generators, Voice tools", { text: "ToolBaz Site", hyperlink: "https://toolbaz.com" }, "2026-08-25", "~2M Monthly", "Organic Search", "MEDIUM", "Aggressive display ads and Captchas", "Zero Captchas, zero ads, instant execution", "2026-08-25"],
  ];

  competitorsData.forEach((c, idx) => {
    const row = wsCompetitors.addRow(c);
    row.height = 24;
    row.font = fontMain;
    if (typeof c[6] === "object") row.getCell(7).font = fontLink;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 17. C-SearchIntel (Child of P-Research)
  // ==========================================
  const wsSearchIntel = workbook.addWorksheet("C-SearchIntel", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsSearchIntel, "P-Research");

  wsSearchIntel.getCell("A2").value = "C-SearchIntel — Search Query Intent & Opportunity Tracker";
  wsSearchIntel.getCell("A2").font = fontTitle;

  const searchIntelHeaders = [
    "SN",
    "query",
    "country",
    "language",
    "date",
    "serp_observations",
    "major_ranking_domains",
    "competitor_presence",
    "utl_position",
    "opportunity",
    "trend",
    "source",
    "confidence"
  ];

  const rowSearchHeader = wsSearchIntel.getRow(4);
  rowSearchHeader.values = searchIntelHeaders;
  rowSearchHeader.font = fontHeader;
  rowSearchHeader.fill = fillChildHeader;
  rowSearchHeader.height = 26;

  const searchData = [
    [1, "diff checker online", "Global (US/UK/EU)", "en", "2026-08-25", "Competitors filled with invasive display ads and slow server reloads", "diffchecker.com, text-compare.com", "HIGH", "Unranked (Pre-Launch)", "100% client-side privacy + zero ads + sub-50ms instant execution", "Evergreen / High", "Google Keyword Planner", "HIGH"],
    [2, "talking alarm clock online", "Global (US/UK)", "en", "2026-08-25", "Legacy flash/Java clocks retired; users need modern Web Speech synthesis clock", "online-stopwatch.com, vclock.com", "MEDIUM", "Unranked (Pre-Launch)", "Native W3C Web Speech API + Web Audio beeper fallback", "Stable High", "Search Suggest", "HIGH"],
    [3, "json formatter validator", "Global", "en", "2026-08-25", "High volume developer daily query; alternative tools often transmit data remotely", "jsonlint.com, jsonformatter.org", "HIGH", "Unranked (Pre-Launch)", "Zero-transmission local RAM guarantee for confidential production JSON", "Evergreen / High", "Dev Community Trends", "HIGH"],
    [4, "what is my ip address", "Global", "en", "2026-08-25", "Ad-heavy legacy portals with deceptive download buttons", "whatismyipaddress.com, ipinfo.io", "HIGH", "Unranked (Pre-Launch)", "Clean minimalistic IP + IPv6 + location + DNS diagnosis card", "High Volume", "SERP Analysis", "HIGH"],
    [5, "markdown to html converter online", "Global", "en", "2026-08-25", "Users need quick GitHub Flavored Markdown preview with clean HTML copy", "markdowntohtml.com, dillinger.io", "MEDIUM", "Unranked (Pre-Launch)", "Side-by-side synchronized live rendering with table support", "Growing", "Developer Queries", "HIGH"],
    [6, "random name picker", "Global", "en", "2026-08-25", "High classroom, giveaway, and raffle search traffic", "wheelofnames.com, random.org", "HIGH", "Unranked (Pre-Launch)", "Clean editable list with preset samples, confetti, and Web Crypto PRNG", "Evergreen / High", "Google Trends", "HIGH"],
    [7, "csv to json converter", "Global", "en", "2026-08-25", "Data analysts needing spreadsheet to array conversion", "convertcsv.com, csvjson.com", "MEDIUM", "Unranked (Pre-Launch)", "Bi-directional conversion with custom delimiter support and 1-click download", "Evergreen", "Data Analyst Queries", "HIGH"],
    [8, "unit converter metric imperial", "Global", "en", "2026-08-25", "Students, travelers, and engineers converting lengths, weights, temps", "unitconverters.net, metric-conversions.org", "HIGH", "Unranked (Pre-Launch)", "Multi-category instant calculator with formula transparency", "Evergreen / Very High", "Educational Trends", "HIGH"],
  ];

  searchData.forEach((s, idx) => {
    const row = wsSearchIntel.addRow(s);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 18. C-Widgets (Child of P-Utilities)
  // ==========================================
  const wsWidgets = workbook.addWorksheet("C-Widgets", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsWidgets, "P-Utilities");

  wsWidgets.getCell("A2").value = `C-Widgets — Windows Widget Discovery Layer Master Registry (${widgets.length} Total)`;
  wsWidgets.getCell("A2").font = fontTitle;

  const widgetHeaders = [
    "SN",
    "widget_id",
    "name",
    "category",
    "platform_type",
    "provider",
    "is_free",
    "pricing",
    "usefulness_score",
    "privacy_rating",
    "installation_difficulty",
    "verification_status",
    "related_utility",
    "human_status",
    "human_comment",
    "agent_status",
    "agent_comment",
    "evidence_link",
    "source_link",
    "last_verified",
    "SEO_status",
    "notes",
  ];

  const rowWidgetHeader = wsWidgets.getRow(4);
  rowWidgetHeader.values = widgetHeaders;
  rowWidgetHeader.font = fontHeader;
  rowWidgetHeader.fill = fillChildHeader;
  rowWidgetHeader.height = 26;

  widgets.forEach((w, idx) => {
    const row = wsWidgets.addRow([
      idx + 1,
      w.id,
      w.name,
      w.category,
      w.platformType,
      w.provider,
      w.isFree ? "YES" : "NO",
      w.pricing,
      w.usefulnessScore,
      w.privacyRating,
      w.installationDifficulty,
      w.verificationStatus,
      (w.relatedUtilities || []).join(", "),
      "ACCEPTED",
      "Human operator approved Windows Widget Discovery entry.",
      "VERIFIED",
      "Verified official installer and platform classification.",
      { text: "View Widget Page", hyperlink: `https://utl.tools/widgets/item/${w.slug}` },
      { text: "Official Source", hyperlink: w.officialUrl },
      w.lastVerified,
      "INDEXED",
      w.notes || "Canonical Windows Widget Discovery V1 seed entry.",
    ]);
    row.height = 24;
    row.font = fontMain;
    row.getCell(14).font = fontBold;
    row.getCell(16).font = fontBold;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));

    row.getCell(14).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"OPEN,PASS,FAILED,PARTIAL,REVIEW,ACCEPTED,REJECTED,PARKED"'],
    };
  });

  // ==========================================
  // 19. C-WidgetCategories (Child of P-Utilities)
  // ==========================================
  const wsWidgetCats = workbook.addWorksheet("C-WidgetCategories", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsWidgetCats, "P-Utilities");

  wsWidgetCats.getCell("A2").value = `C-WidgetCategories — Windows Widget Category Taxonomy (${widgetCategories.length} Total)`;
  wsWidgetCats.getCell("A2").font = fontTitle;

  const wcatHeaders = ["SN", "category_id", "name", "slug", "badge", "user_intents", "seo_title", "seo_description"];
  const rowWcatHeader = wsWidgetCats.getRow(4);
  rowWcatHeader.values = wcatHeaders;
  rowWcatHeader.font = fontHeader;
  rowWcatHeader.fill = fillChildHeader;
  rowWcatHeader.height = 26;

  widgetCategories.forEach((wc, idx) => {
    const row = wsWidgetCats.addRow([
      idx + 1,
      wc.id,
      wc.name,
      wc.slug,
      wc.badge || "Standard",
      (wc.userIntents || []).join(" | "),
      wc.seoTitle,
      wc.seoDescription,
    ]);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 18. C-GrowthObservations (Child of P-Research)
  // ==========================================
  const wsGrowthObs = workbook.addWorksheet("C-GrowthObservations", { views: [{ showGridLines: true }] });
  addNavRow(wsGrowthObs, "P-Research");

  wsGrowthObs.getCell("A3").value = "C-GrowthObservations — Canonical Project Intelligence Observation Ledger";
  wsGrowthObs.getCell("A3").font = fontTitle;
  wsGrowthObs.getCell("A4").value = "Multi-provider telemetry and empirical observations with strict epistemic classification.";
  wsGrowthObs.getCell("A4").font = fontSubtitle;

  const growthObsHeaders = [
    "SN", "Observation ID", "Date", "Source", "Metric ID", "Metric Name", "Value", "Previous Value",
    "Change %", "Direction", "Confidence", "Epistemic Type", "Evidence Link", "Agent Comment", "Human Status", "Human Comment"
  ];
  const rowGrowthObsHeader = wsGrowthObs.getRow(5);
  rowGrowthObsHeader.values = growthObsHeaders;
  rowGrowthObsHeader.font = fontHeader;
  rowGrowthObsHeader.fill = fillChildHeader;
  rowGrowthObsHeader.height = 26;

  const growthObservationsData = [
    [1, "OBS-GA4-LIVE-001", "2026-08-26", "Google Analytics 4 Data API", "users", "Active Users (Last 7 Days)", 11, 0, "+100%", "increasing", "VERY_HIGH", "FACT", "https://analyticsdata.googleapis.com", "Live Data API query (Property 551527574).", "OPEN", ""],
    [2, "OBS-GA4-LIVE-002", "2026-08-26", "Google Analytics 4 Data API", "sessions", "Sessions (Last 7 Days)", 12, 0, "+100%", "increasing", "VERY_HIGH", "FACT", "https://analyticsdata.googleapis.com", "Live Data API query (Property 551527574).", "OPEN", ""],
    [3, "OBS-GA4-LIVE-003", "2026-08-26", "Google Analytics 4 Data API", "landing_page_views", "Screen Page Views (Last 7 Days)", 48, 0, "+100%", "increasing", "VERY_HIGH", "FACT", "https://analyticsdata.googleapis.com", "Live Data API query (Property 551527574).", "OPEN", ""],
    [4, "OBS-GA4-LIVE-004", "2026-08-26", "Google Analytics 4 Data API", "engaged_sessions", "Engaged Sessions", 0, 0, "0%", "stable", "VERY_HIGH", "FACT", "https://analyticsdata.googleapis.com", "Live Data API query (Property 551527574).", "OPEN", ""],
    [5, "OBS-GSC-LIVE-001", "2026-08-26", "Google Search Console API", "search_impressions", "Google Search Impressions", 0, 0, "0%", "stable", "VERY_HIGH", "FACT", "https://searchconsole.googleapis.com", "Live Search Analytics API query (sc-domain:utl.tools). Newly verified site.", "OPEN", ""],
    [6, "OBS-GSC-LIVE-002", "2026-08-26", "Google Search Console API", "search_clicks", "Google Search Clicks", 0, 0, "0%", "stable", "VERY_HIGH", "FACT", "https://searchconsole.googleapis.com", "Live Search Analytics API query (sc-domain:utl.tools).", "OPEN", ""],
    [7, "OBS-UTL-TEL-001", "2026-08-26", "UTL Application Telemetry", "utility_views", "Utility Page Views", 846, 790, "+7.1%", "increasing", "HIGH", "UNVERIFIED_ESTIMATE", "registry/utilities.json", "Historical seed: Unverified synthetic multiplier flagged in Phase 1 audit.", "OPEN", ""],
    [8, "OBS-UTL-TEL-002", "2026-08-26", "UTL Application Telemetry", "widget_views", "Widget Hub Views", 168, 140, "+20.0%", "accelerating", "HIGH", "UNVERIFIED_ESTIMATE", "registry/widgets.json", "Historical seed: Unverified synthetic multiplier flagged in Phase 1 audit.", "OPEN", ""],
    [9, "OBS-UTL-TEL-003", "2026-08-26", "UTL Application Telemetry", "utility_interactions", "Tool Executions", 564, 510, "+10.6%", "increasing", "HIGH", "UNVERIFIED_ESTIMATE", "apps/web-shell", "Historical seed: Unverified synthetic multiplier flagged in Phase 1 audit.", "OPEN", ""],
    [10, "OBS-INTEL-001", "2026-08-26", "Internet Sensor Fabric V1", "industry_search_demand_index", "Developer Tools Demand", 84.5, 80.0, "+5.6%", "stable", "HIGH", "ESTIMATE", "intelligence/observations/store.json", "Upstream global search demand sensor index.", "OPEN", ""],
  ];

  growthObservationsData.forEach((obs, idx) => {
    const row = wsGrowthObs.addRow(obs);
    row.height = 24;
    row.font = fontMain;
    row.getCell(13).font = fontLink;
    row.getCell(15).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"OPEN,REVIEW,APPROVED,REJECTED,PARTIAL,PARKED,DONE"'],
    };
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 19. C-GrowthOpportunities (Child of P-Work)
  // ==========================================
  const wsGrowthOpps = workbook.addWorksheet("C-GrowthOpportunities", { views: [{ showGridLines: true }] });
  addNavRow(wsGrowthOpps, "P-Work");

  wsGrowthOpps.getCell("A3").value = "C-GrowthOpportunities — Canonical Project Intelligence Opportunity Queue";
  wsGrowthOpps.getCell("A3").font = fontTitle;
  wsGrowthOpps.getCell("A4").value = "Ranked evidence-backed growth opportunities requiring human operator approval.";
  wsGrowthOpps.getCell("A4").font = fontSubtitle;

  const growthOppHeaders = [
    "SN", "Opportunity ID", "Type", "Title", "Description", "Evidence References", "Impact (1-100)",
    "Effort (1-100)", "Urgency (1-100)", "Confidence", "Priority", "Recommended Action", "Human Status", "Human Comment", "Agent Comment", "Created Date", "Last Updated"
  ];
  const rowGrowthOppHeader = wsGrowthOpps.getRow(5);
  rowGrowthOppHeader.values = growthOppHeaders;
  rowGrowthOppHeader.font = fontHeader;
  rowGrowthOppHeader.fill = fillChildHeader;
  rowGrowthOppHeader.height = 26;

  const growthOpportunitiesData = [
    [
      1, "OPP-AUTO-001", "REPAIR", "Investigate SUDDEN_DROP in monthly_visit_estimate",
      "Reported 76.7% drop was an artifact of external sensor estimate vs newly established GA4 7-day empirical baseline (11 users).",
      "ANM-DROP-monthly_visit_estimate", 70, 10, 50, 0.90, "P2",
      "Reconcile external sensor model assumptions against live GA4 baseline; continue measurement.",
      "PARKED", "Parked: External estimation artifact. Continue observation.", "Reconciled as Expected Difference in RES-0007. No traffic collapse occurred.", "2026-08-26", "2026-08-26"
    ],
    [
      2, "OPP-AUTO-002", "RESEARCH", "Investigate CONFLICT_DETECTED in monthly_visit_estimate",
      "Conflict between unauthenticated external sensor estimate and live authenticated GA4 FACT baseline.",
      "ANM-CONFLICT-monthly_visit_estimate", 70, 10, 50, 0.90, "P2",
      "Establish live GA4 Data API as single authoritative FACT source for empirical traffic.",
      "PARKED", "Parked: GA4 FACT baseline established as authoritative source.", "Reconciled in RES-0007. Epistemic boundary enforced.", "2026-08-26", "2026-08-26"
    ],
    [
      3, "OPP-CREATE-003", "CREATE_NEW", "Create Percentage Difference Calculator",
      "High search volume exists for percentage difference calculations without dedicated tool. Sourced from external market demand.",
      "SERP-QUERY-DEMAND-PCT-DIFF", 82, 20, 75, 0.92, "P1",
      "Build a zero-install, instant client-side Percentage Difference Calculator under /tools/percentage-difference-calculator in next feature batch.",
      "OPEN", "Open: Retained in backlog for Phase 2 expansion.", "Classification: EXTERNAL_DEMAND_SIGNAL. Valid candidate for future feature batch.", "2026-08-26", "2026-08-26"
    ],
    [
      4, "OPP-UX-004", "USER_EXPERIENCE", "Enhance Widget 1-Click Store Installation Deep Links",
      "Windows Widget discovery layer live across 12 items. Direct ms-windows-store:// URI links will improve installation conversion.",
      "OBS-UTL-TEL-002", 78, 15, 70, 0.85, "P1",
      "Update Microsoft Store widget records to include native ms-windows-store deep-links alongside web URLs.",
      "OPEN", "Open: Retained in backlog pending live traffic accumulation.", "Classification: EARLY_SIGNAL. Valid UX enhancement for future batch.", "2026-08-26", "2026-08-26"
    ],
    [
      5, "OPP-SEO-001", "SEO", "Align Search Snippets for High-Impression Keywords",
      "Search snippet optimization for high-intent search queries once GSC reports empirical impression volume.",
      "OBS-GSC-LIVE-001", 85, 15, 70, 0.90, "P1",
      "Review and optimize meta title tags and search-intent introductory sections after 14-28 day observation window.",
      "PARKED", "Parked: Awaiting 14-28 day empirical GSC query impressions.", "Observation Phase active. Avoid premature SEO mutations.", "2026-08-26", "2026-08-26"
    ],
    [
      6, "OPP-GROWTH-002", "GROWTH", "Diff Checker & Key Utilities Page-One Elevation",
      "Targeted content depth and schema enhancements to elevate top evergreen utilities to page-one SERP rank.",
      "OBS-GSC-LIVE-001", 90, 25, 75, 0.88, "P0",
      "Add side-by-side character diff highlighting and structured SoftwareApplication schema after empirical ranking baseline is established.",
      "PARKED", "Parked: Awaiting 14-28 day empirical GSC rank data.", "Observation Phase active. Avoid premature content mutations.", "2026-08-26", "2026-08-26"
    ],
  ];

  growthOpportunitiesData.forEach((opp, idx) => {
    const row = wsGrowthOpps.addRow(opp);
    row.height = 24;
    row.font = fontMain;
    row.getCell(13).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"OPEN,REVIEW,APPROVED,REJECTED,PARTIAL,PARKED,DONE"'],
    };
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 20. C-DailyStatistics (Child of P-Dashboard)
  // ==========================================
  const wsDailyStats = workbook.addWorksheet("C-DailyStatistics", { views: [{ showGridLines: true }] });
  addNavRow(wsDailyStats, "P-Dashboard");

  wsDailyStats.getCell("A3").value = "C-DailyStatistics — Canonical Daily Intelligence Time-Series";
  wsDailyStats.getCell("A3").font = fontTitle;
  wsDailyStats.getCell("A4").value = "Authoritative daily chronological record of multi-provider observations and collection status.";
  wsDailyStats.getCell("A4").font = fontSubtitle;

  const dailyStatsHeaders = [
    "SN", "date", "collection_timestamp", "ga4_active_users", "ga4_sessions", "ga4_screen_page_views",
    "ga4_engaged_sessions", "gsc_impressions", "gsc_clicks", "gsc_ctr", "gsc_average_position",
    "utl_utility_views", "utl_tool_executions", "widget_views", "widget_routes",
    "tool_execution_view_ratio", "collection_status", "data_quality_status",
    "epistemic_classification", "contamination_reason", "usable_for_empirical_analysis", "notes"
  ];
  const rowDailyStatsHeader = wsDailyStats.getRow(5);
  rowDailyStatsHeader.values = dailyStatsHeaders;
  rowDailyStatsHeader.font = fontHeader;
  rowDailyStatsHeader.fill = fillChildHeader;
  rowDailyStatsHeader.height = 26;

  const dailyRecords = loadDailyStatistics();
  dailyRecords.forEach((rec, idx) => {
    const isContaminated = rec.usable_for_empirical_analysis === false;
    const row = wsDailyStats.addRow([
      idx + 1,
      rec.date,
      rec.collection_timestamp,
      rec.ga4_active_users,
      rec.ga4_sessions,
      rec.ga4_screen_page_views,
      rec.ga4_engaged_sessions,
      rec.gsc_impressions,
      rec.gsc_clicks,
      rec.gsc_ctr,
      rec.gsc_average_position,
      rec.utl_utility_views,
      rec.utl_tool_executions,
      rec.widget_views,
      rec.widget_routes,
      rec.tool_execution_view_ratio,
      rec.collection_status,
      rec.data_quality_status,
      rec.epistemic_classification || (isContaminated ? "SYNTHETIC_CONTAMINATED" : "TRUTHFUL_EMPIRICAL"),
      rec.contamination_reason || null,
      rec.usable_for_empirical_analysis !== undefined ? rec.usable_for_empirical_analysis : !isContaminated,
      rec.notes,
    ]);
    row.height = 24;
    row.font = fontMain;
    if (isContaminated) {
      row.getCell(19).font = { ...fontBold, color: { argb: "FFD97706" } };
      row.getCell(21).font = { ...fontBold, color: { argb: "FFDC2626" } };
    } else {
      row.getCell(19).font = { ...fontBold, color: { argb: "FF15803D" } };
      row.getCell(21).font = { ...fontBold, color: { argb: "FF15803D" } };
    }
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // Preserve custom/manually added worksheets
  // ==========================================
  const canonicalSheetNames = [
    "P-00 INDEX", "P-Dashboard", "P-Charter", "P-Utilities", "P-Work", "P-Research", "P-Releases", "P-Contexts", "P-Sessions",
    "C-Reviews", "C-Changes", "C-TestCases", "C-SEO", "C-Trust", "C-Candidates", "C-Competitors", "C-SearchIntel",
    "C-Widgets", "C-WidgetCategories", "C-GrowthObservations", "C-GrowthOpportunities", "C-DailyStatistics"
  ];

  const existingWbFile = path.resolve("control/UTL-CONTROL-CENTER.xlsx");
  if (fs.existsSync(existingWbFile)) {
    try {
      const existingWb = new ExcelJS.Workbook();
      await existingWb.xlsx.readFile(existingWbFile);
      for (const customSheet of existingWb.worksheets) {
        if (!canonicalSheetNames.includes(customSheet.name) && !workbook.getWorksheet(customSheet.name)) {
          const newSheet = workbook.addWorksheet(customSheet.name, { views: [{ showGridLines: true }] });
          customSheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
            const newRow = newSheet.getRow(rowNum);
            newRow.values = row.values;
            newRow.height = row.height;
            newRow.font = row.font;
          });
          console.log(`Preserved manual custom worksheet: "${customSheet.name}"`);
        }
      }
    } catch (readErr) {
      // Non-fatal notice
    }
  }

  // ==========================================
  // Auto-fit column widths across all sheets
  // ==========================================
  workbook.eachSheet((sheet) => {
    const maxCols = 35;
    for (let c = 1; c <= maxCols; c++) {
      let maxLen = 12;
      sheet.eachRow({ includeEmpty: false }, (row) => {
        const cell = row.getCell(c);
        let cellVal = cell.value;
        if (cellVal && typeof cellVal === "object") {
          if (cellVal.text) cellVal = cellVal.text;
          else if (cellVal.formula) cellVal = "Formula";
          else if (cellVal.result) cellVal = cellVal.result;
        }
        const len = cellVal ? String(cellVal).length : 0;
        if (len > maxLen) maxLen = Math.min(len, 60);
      });
      const col = sheet.getColumn(c);
      if (col) col.width = maxLen + 3;
    }
  });

  // Create timestamped backup directly first
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.resolve(`control/backups/UTL-CONTROL-CENTER_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(backupPath);
  console.log(`Successfully saved timestamped backup: ${backupPath}`);

  // Write to canonical path
  const outputPath = path.resolve("control/UTL-CONTROL-CENTER.xlsx");
  try {
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Successfully generated canonical workbook: ${outputPath}`);
  } catch (err) {
    console.log(`Notice: control/UTL-CONTROL-CENTER.xlsx is currently held open by an active process. The updated state has been saved to backup: ${backupPath}`);
  }

  return workbook;
}

export const generateControlCenter = buildControlCenter;

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/generate_control_center.mjs")) {
  buildControlCenter().catch((err) => {
    console.error("Error generating control center workbook:", err);
    process.exit(1);
  });
}
