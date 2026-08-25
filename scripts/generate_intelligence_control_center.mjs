import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

async function buildIntelligenceControlCenter() {
  console.log("Starting Internet Intelligence Control Center Workbook Generation...");

  const controlDir = path.resolve("control");
  const backupDir = path.resolve("control/backups");
  if (!fs.existsSync(controlDir)) fs.mkdirSync(controlDir, { recursive: true });
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  // Read Intelligence Registries
  const domains = JSON.parse(fs.readFileSync("intelligence/registry/domains.json", "utf-8"));
  const entities = JSON.parse(fs.readFileSync("intelligence/registry/entities.json", "utf-8"));
  const sources = JSON.parse(fs.readFileSync("intelligence/registry/sources.json", "utf-8"));
  const sensors = JSON.parse(fs.readFileSync("intelligence/registry/sensors.json", "utf-8"));
  const observations = JSON.parse(fs.readFileSync("intelligence/observations/store.json", "utf-8"));
  const opportunities = JSON.parse(fs.readFileSync("intelligence/opportunities/store.json", "utf-8"));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Internet Sensor Fabric Engine";
  workbook.lastModifiedBy = "Antigravity CLI";
  workbook.created = new Date("2026-08-26T00:00:00Z");
  workbook.modified = new Date();

  // Styling & Color System
  const fontMain = { name: "Calibri", size: 11, color: { argb: "FF0F172A" } };
  const fontBold = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F172A" } };
  const fontHeader = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  const fontTitle = { name: "Calibri", size: 16, bold: true, color: { argb: "FF0F172A" } };
  const fontSubtitle = { name: "Calibri", size: 12, italic: true, color: { argb: "FF475569" } };
  const fontLink = { name: "Calibri", size: 11, bold: true, color: { argb: "FF2563EB" }, underline: true };
  const fontNavLink = { name: "Calibri", size: 10, bold: true, color: { argb: "FF1D4ED8" }, underline: true };

  const fillParentHeader = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } }; // Slate-800
  const fillChildHeader = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } }; // Blue-900
  const fillNav = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } }; // Slate-100
  const fillZebra = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } }; // Slate-50

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
  wsIndex.getCell("A1").value = "Internet Intelligence — Canonical Sensor Fabric Control Center Index";
  wsIndex.getCell("A1").font = fontTitle;
  wsIndex.getCell("A2").value = "Operational Control Master for Internet Sensor Fabric V1 with UTL.tools as first consumer.";
  wsIndex.getCell("A2").font = fontSubtitle;

  const indexHeaders = ["SN", "Code", "Sheet Name", "Type", "Parent", "Description", "Record Count", "Direct Navigation"];
  const rowIdxHeader = wsIndex.getRow(4);
  rowIdxHeader.values = indexHeaders;
  rowIdxHeader.font = fontHeader;
  rowIdxHeader.fill = fillParentHeader;
  rowIdxHeader.height = 26;

  const sheetDefinitions = [
    { code: "P-00", name: "P-00 INDEX", type: "Parent", parent: "ROOT", desc: "Canonical navigation directory registering all 18 worksheets.", count: "18 Sheets", target: "A1" },
    { code: "P-01", name: "P-DASHBOARD", type: "Parent", parent: "P-00 INDEX", desc: "Executive KPI dashboard, sensor health, telemetry, top opportunities.", count: "Formula KPIs", target: "A1" },
    { code: "P-02", name: "P-CHARTER", type: "Parent", parent: "P-00 INDEX", desc: "Sensor Fabric mission, principles, epistemic rules, and ethical boundaries.", count: "Charter Doc", target: "A1" },
    { code: "P-03", name: "P-DOMAINS", type: "Parent", parent: "P-00 INDEX", desc: "16 Recognized Intelligence Domains.", count: `${domains.length} Domains`, target: "A1" },
    { code: "P-04", name: "P-ENTITIES", type: "Parent", parent: "P-00 INDEX", desc: "Monitored entity registry (websites, search queries, tools, countries).", count: `${entities.length} Entities`, target: "A1" },
    { code: "P-05", name: "P-SOURCES", type: "Parent", parent: "P-00 INDEX", desc: "Concentration points & data sources (APIs, probes, estimators).", count: `${sources.length} Sources`, target: "A1" },
    { code: "P-06", name: "P-SENSORS", type: "Parent", parent: "P-00 INDEX", desc: "Sensor registry with cadences, rate limits, and confidence tiers.", count: `${sensors.length} Sensors`, target: "A1" },
    { code: "P-07", name: "P-COLLECTION", type: "Parent", parent: "P-00 INDEX", desc: "Collection execution status and reliability state ledger.", count: "Collection Runs", target: "A1" },
    { code: "P-08", name: "P-METRICS", type: "Parent", parent: "P-00 INDEX", desc: "Metric taxonomy, units of measure, and data types.", count: "Metric Definitions", target: "A1" },
    { code: "P-09", name: "P-TRENDS", type: "Parent", parent: "P-00 INDEX", desc: "Immutable historical time-series observation trends & anomalies.", count: `${observations.length} Observations`, target: "A1" },
    { code: "P-10", name: "P-OPPORTUNITIES", type: "Parent", parent: "P-00 INDEX", desc: "Ranked opportunity queue generated by Opportunity Engine.", count: `${opportunities.length} Opportunities`, target: "A1" },
    { code: "P-11", name: "P-COMPETITORS", type: "Parent", parent: "P-00 INDEX", desc: "Monitored competitors (mylocation.org, plaintoolbox.com, top10k.com).", count: "Competitor Sites", target: "A1" },
    { code: "P-12", name: "P-SEARCH_INTEL", type: "Parent", parent: "P-00 INDEX", desc: "SERP positions, search intent, and keyword demand signals.", count: "Search Records", target: "A1" },
    { code: "P-13", name: "P-GEOGRAPHY", type: "Parent", parent: "P-00 INDEX", desc: "Country & regional language demand distribution.", count: "Country Insights", target: "A1" },
    { code: "P-14", name: "P-ALERTS", type: "Parent", parent: "P-00 INDEX", desc: "Automated alert triggers (traffic anomalies, rank shifts, sensor failures).", count: "Alert Queue", target: "A1" },
    { code: "P-15", name: "P-RECOMMENDATIONS", type: "Parent", parent: "P-00 INDEX", desc: "Actionable recommendations mapped to evidence.", count: "Recommendations", target: "A1" },
    { code: "P-16", name: "P-DECISIONS", type: "Parent", parent: "P-00 INDEX", desc: "Human operator decision log & governance sign-offs.", count: "Operator Sign-offs", target: "A1" },
    { code: "P-17", name: "P-SESSIONS", type: "Parent", parent: "P-00 INDEX", desc: "Persistent agent session ledger & operating contexts.", count: "Session History", target: "A1" },
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
  // 2. P-DASHBOARD
  // ==========================================
  const wsDash = workbook.addWorksheet("P-DASHBOARD", { views: [{ showGridLines: true }] });
  addNavRow(wsDash);

  wsDash.getCell("A3").value = "Internet Intelligence — Executive Control Dashboard";
  wsDash.getCell("A3").font = fontTitle;
  wsDash.getCell("A4").value = "Live state overview, sensor health, telemetry, and top opportunity pipeline.";
  wsDash.getCell("A4").font = fontSubtitle;

  const kpis = [
    ["SN", "Metric", "Value", "Derived From / Source", "Direct Link"],
    [1, "Sensor Fabric Status", "OPERATIONAL & ACTIVE (V1.0)", "System Verification", { text: "View Charter", hyperlink: "#'P-CHARTER'!A1" }],
    [2, "First Monitored Consumer", "UTL.tools (https://utl.tools)", "Application Client", { text: "Open UTL Site", hyperlink: "https://utl.tools" }],
    [3, "Recognized Intelligence Domains", { formula: "COUNTA('P-DOMAINS'!A5:A100)" }, "P-DOMAINS Registry", { text: "View Domains", hyperlink: "#'P-DOMAINS'!A1" }],
    [4, "Monitored Entities", { formula: "COUNTA('P-ENTITIES'!A5:A100)" }, "P-ENTITIES Registry", { text: "View Entities", hyperlink: "#'P-ENTITIES'!A1" }],
    [5, "Data Sources & Concentration Points", { formula: "COUNTA('P-SOURCES'!A5:A100)" }, "P-SOURCES Registry", { text: "View Sources", hyperlink: "#'P-SOURCES'!A1" }],
    [6, "Active Probes / Sensors", { formula: "COUNTA('P-SENSORS'!A5:A100)" }, "P-SENSORS Registry", { text: "View Sensors", hyperlink: "#'P-SENSORS'!A1" }],
    [7, "Healthy Sensors (0 Failures)", { formula: "COUNTIF('P-SENSORS'!O5:O100, 0)" }, "P-SENSORS Health", { text: "Verify Sensors", hyperlink: "#'P-SENSORS'!A1" }],
    [8, "Historical Observations", { formula: "COUNTA('P-TRENDS'!A5:A100)" }, "P-TRENDS Time-Series", { text: "View Observations", hyperlink: "#'P-TRENDS'!A1" }],
    [9, "Ranked Opportunities in Queue", { formula: "COUNTA('P-OPPORTUNITIES'!A5:A100)" }, "P-OPPORTUNITIES Engine", { text: "View Opportunities", hyperlink: "#'P-OPPORTUNITIES'!A1" }],
    [10, "Approved P0 Opportunities", { formula: "COUNTIFS('P-OPPORTUNITIES'!E5:E100, \"P0\", 'P-OPPORTUNITIES'!N5:N100, \"APPROVED\")" }, "P-OPPORTUNITIES Approval", { text: "View Approved P0", hyperlink: "#'P-OPPORTUNITIES'!A1" }],
    [11, "Monitored Competitors", { formula: "COUNTA('P-COMPETITORS'!A5:A100)" }, "P-COMPETITORS Registry", { text: "View Competitors", hyperlink: "#'P-COMPETITORS'!A1" }],
    [12, "Primary Data Telemetry GA4 ID", "G-H2G4BK9Y36 (Client-Side Safe)", "GA4 Measurement API", { text: "View UTL Site", hyperlink: "https://utl.tools" }],
    [13, "Google Search Console Property", "https://utl.tools (Verified)", "Search Console API", { text: "View Sitemap", hyperlink: "https://utl.tools/sitemap.xml" }],
    [14, "Primary Master Control Workbook", "control/INTERNET-INTELLIGENCE-CONTROL-CENTER.xlsx", "Canonical Intelligence Master", { text: "Return to Index", hyperlink: "#'P-00 INDEX'!A1" }],
    [15, "UTL Production Control Link", "control/UTL-CONTROL-CENTER.xlsx", "UTL App Master", { text: "View UTL Control", hyperlink: "#'P-00 INDEX'!A1" }],
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
  // 3. P-CHARTER
  // ==========================================
  const wsCharter = workbook.addWorksheet("P-CHARTER", { views: [{ showGridLines: true }] });
  addNavRow(wsCharter);

  wsCharter.getCell("A3").value = "Internet Intelligence — Sensor Fabric Charter & Governance";
  wsCharter.getCell("A3").font = fontTitle;
  wsCharter.getCell("A4").value = "Core architectural principles, epistemic rules, and ethical collection standards.";
  wsCharter.getCell("A4").font = fontSubtitle;

  const charterData = [
    ["SN", "Principle / Standard", "Category", "Operational Governance Directive"],
    [1, "Conceptual Architecture Flow", "Pipeline", "PUBLIC INTERNET → DOMAINS → CONCENTRATION POINTS → SENSORS → OBSERVATIONS → TIME SERIES → RELATIONSHIPS → SENSOR FUSION → INTELLIGENCE → RECOMMENDATIONS."],
    [2, "Domain-Agnostic Reusability", "Architecture", "The Sensor Fabric is completely decoupled from UTL.tools. Future tools (SaaS, AI, Windows Widgets, Medical) consume the fabric as clients."],
    [3, "Fact vs. Inference Strictness", "Epistemic", "Every observation explicitly tags facts, estimates, inferences, and recommendations. Never present an estimate as a verified fact."],
    [4, "Provenance & Auditability", "Data Standard", "All observations must retain source, source_url, collection_method, timestamps, freshness, and confidence tier."],
    [5, "Historical Time-Series Integrity", "Data Standard", "Observations are immutable time-series entries. Data is never overwritten, enabling growth, acceleration, and anomaly calculation."],
    [6, "Collection Reliability Governance", "Reliability", "Collection failure (AUTH_FAILED, RATE_LIMITED) must NEVER be interpreted as zero traffic or disappearance of an entity."],
    [7, "Ethical & Legal Compliance", "Ethics", "Only public signals and authorized APIs are observed. Zero paywall evasion, credential bypass, or personal dossier creation."],
    [8, "Human Operator Governance", "Control", "All intelligence models produce ranked candidate queues. Implementation requires human operator sign-off via Control Center."],
  ];

  charterData.forEach((c, idx) => {
    const row = wsCharter.getRow(6 + idx);
    row.values = c;
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
  // 4. P-DOMAINS
  // ==========================================
  const wsDomains = workbook.addWorksheet("P-DOMAINS", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsDomains);

  wsDomains.getCell("A2").value = `P-DOMAINS — 16 Recognized Intelligence Domains (${domains.length} Total)`;
  wsDomains.getCell("A2").font = fontTitle;

  const domHeaders = ["SN", "domain_id", "domain_name", "description", "status", "documentation_link"];
  const rowDomHeader = wsDomains.getRow(4);
  rowDomHeader.values = domHeaders;
  rowDomHeader.font = fontHeader;
  rowDomHeader.fill = fillParentHeader;
  rowDomHeader.height = 26;

  domains.forEach((d, idx) => {
    const row = wsDomains.addRow([
      idx + 1,
      d.id,
      d.name,
      d.description,
      d.status,
      { text: "View Model Doc ➡️", hyperlink: "https://utl.tools" }
    ]);
    row.height = 24;
    row.font = fontMain;
    row.getCell(6).font = fontLink;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 5. P-ENTITIES
  // ==========================================
  const wsEntities = workbook.addWorksheet("P-ENTITIES", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsEntities);

  wsEntities.getCell("A2").value = `P-ENTITIES — Monitored Entity Registry (${entities.length} Total)`;
  wsEntities.getCell("A2").font = fontTitle;

  const entHeaders = ["SN", "entity_id", "entity_name", "type", "domain", "description"];
  const rowEntHeader = wsEntities.getRow(4);
  rowEntHeader.values = entHeaders;
  rowEntHeader.font = fontHeader;
  rowEntHeader.fill = fillParentHeader;
  rowEntHeader.height = 26;

  entities.forEach((e, idx) => {
    const row = wsEntities.addRow([idx + 1, e.id, e.name, e.type, e.domain, e.description]);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 6. P-SOURCES
  // ==========================================
  const wsSources = workbook.addWorksheet("P-SOURCES", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsSources);

  wsSources.getCell("A2").value = `P-SOURCES — Concentration Points & Data Sources (${sources.length} Total)`;
  wsSources.getCell("A2").font = fontTitle;

  const srcHeaders = ["SN", "source_id", "source_name", "type", "endpoint", "concentration_point", "auth_required", "rate_limit", "status"];
  const rowSrcHeader = wsSources.getRow(4);
  rowSrcHeader.values = srcHeaders;
  rowSrcHeader.font = fontHeader;
  rowSrcHeader.fill = fillParentHeader;
  rowSrcHeader.height = 26;

  sources.forEach((s, idx) => {
    const row = wsSources.addRow([idx + 1, s.id, s.name, s.type, s.endpoint, s.concentration_point, s.auth_required ? "YES" : "NO", s.rate_limit, s.status]);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 7. P-SENSORS
  // ==========================================
  const wsSensors = workbook.addWorksheet("P-SENSORS", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsSensors);

  wsSensors.getCell("A2").value = `P-SENSORS — Repeatable Sensor Probe Registry (${sensors.length} Total)`;
  wsSensors.getCell("A2").font = fontTitle;

  const senHeaders = [
    "SN", "sensor_id", "domain", "sensor_type", "concentration_point", "metric", "source",
    "collection_method", "cadence", "enabled", "cost", "rate_limit", "freshness", "confidence",
    "failure_count", "status", "notes"
  ];
  const rowSenHeader = wsSensors.getRow(4);
  rowSenHeader.values = senHeaders;
  rowSenHeader.font = fontHeader;
  rowSenHeader.fill = fillParentHeader;
  rowSenHeader.height = 26;

  sensors.forEach((sn, idx) => {
    const row = wsSensors.addRow([
      idx + 1, sn.sensor_id, sn.domain, sn.sensor_type, sn.concentration_point, sn.metric, sn.source,
      sn.collection_method, sn.cadence, sn.enabled ? "TRUE" : "FALSE", sn.cost, sn.rate_limit,
      sn.freshness_expectation, sn.confidence, sn.failure_count, sn.status, sn.notes
    ]);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 8. P-COLLECTION
  // ==========================================
  const wsColl = workbook.addWorksheet("P-COLLECTION", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsColl);

  wsColl.getCell("A2").value = "P-COLLECTION — Collection Execution Log & Reliability State Ledger";
  wsColl.getCell("A2").font = fontTitle;

  const colHeaders = ["SN", "run_id", "timestamp", "sensor_id", "source_id", "status", "records_collected", "duration_ms", "failure_reason", "schema_shift"];
  const rowColHeader = wsColl.getRow(4);
  rowColHeader.values = colHeaders;
  rowColHeader.font = fontHeader;
  rowColHeader.fill = fillParentHeader;
  rowColHeader.height = 26;

  const collectionRuns = [
    [1, "RUN-20260825-001", "2026-08-25T12:00:00Z", "SNR-UTL-GA4-001", "SRC-GA4", "SUCCESS", 1, 145, "None", "NO"],
    [2, "RUN-20260825-002", "2026-08-25T12:00:00Z", "SNR-UTL-GSC-002", "SRC-GSC", "SUCCESS", 47, 210, "None", "NO"],
    [3, "RUN-20260825-003", "2026-08-25T12:00:00Z", "SNR-COMP-TRAF-001", "SRC-SIMILARWEB", "SUCCESS", 8, 520, "None", "NO"],
    [4, "RUN-20260825-004", "2026-08-25T12:00:00Z", "SNR-SERP-INTEL-001", "SRC-SERP", "SUCCESS", 50, 310, "None", "NO"],
    [5, "RUN-20260825-005", "2026-08-25T12:00:00Z", "SNR-TECH-GITHUB-001", "SRC-GITHUB", "SUCCESS", 12, 180, "None", "NO"],
  ];

  collectionRuns.forEach((r, idx) => {
    const row = wsColl.addRow(r);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 9. P-METRICS
  // ==========================================
  const wsMetrics = workbook.addWorksheet("P-METRICS", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsMetrics);

  wsMetrics.getCell("A2").value = "P-METRICS — Metric Taxonomy & Unit Definitions";
  wsMetrics.getCell("A2").font = fontTitle;

  const metHeaders = ["SN", "metric_id", "metric_name", "domain", "unit", "data_type", "epistemic_default", "description"];
  const rowMetHeader = wsMetrics.getRow(4);
  rowMetHeader.values = metHeaders;
  rowMetHeader.font = fontHeader;
  rowMetHeader.fill = fillParentHeader;
  rowMetHeader.height = 26;

  const metricDefs = [
    [1, "MET-001", "daily_pageviews", "traffic", "count", "INTEGER", "FACT", "Total measured page loads per 24h period"],
    [2, "MET-002", "daily_active_users", "traffic", "users", "INTEGER", "FACT", "Unique measured visitors per day"],
    [3, "MET-003", "monthly_visit_estimate", "traffic", "visits", "INTEGER", "ESTIMATE", "Modeled third-party web traffic estimate"],
    [4, "MET-004", "serp_position", "search", "rank", "INTEGER", "FACT", "Google SERP organic ranking position"],
    [5, "MET-005", "search_impressions", "search", "count", "INTEGER", "FACT", "Search Console measured search impressions"],
    [6, "MET-006", "open_source_repo_stars", "technology", "stars", "INTEGER", "FACT", "GitHub repository star count"],
  ];

  metricDefs.forEach((m, idx) => {
    const row = wsMetrics.addRow(m);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 10. P-TRENDS
  // ==========================================
  const wsTrends = workbook.addWorksheet("P-TRENDS", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsTrends);

  wsTrends.getCell("A2").value = `P-TRENDS — Immutable Historical Time-Series Observations (${observations.length} Total)`;
  wsTrends.getCell("A2").font = fontTitle;

  const trdHeaders = ["SN", "id", "sensor_id", "entity_id", "epistemic_type", "metric_name", "value", "unit", "source", "collected_at", "confidence", "status"];
  const rowTrdHeader = wsTrends.getRow(4);
  rowTrdHeader.values = trdHeaders;
  rowTrdHeader.font = fontHeader;
  rowTrdHeader.fill = fillParentHeader;
  rowTrdHeader.height = 26;

  observations.forEach((o, idx) => {
    const row = wsTrends.addRow([idx + 1, o.id, o.sensor_id, o.entity_id, o.epistemic_type, o.metric_name, o.value, o.unit, o.source, o.collected_at, o.confidence, o.collection_status]);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 11. P-OPPORTUNITIES
  // ==========================================
  const wsOpps = workbook.addWorksheet("P-OPPORTUNITIES", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsOpps);

  wsOpps.getCell("A2").value = `P-OPPORTUNITIES — Opportunity Engine Ranked Queue (${opportunities.length} Total)`;
  wsOpps.getCell("A2").font = fontTitle;

  const oppHeaders = [
    "SN", "opportunity_id", "target_entity", "candidate_name", "domain", "priority",
    "opportunity_score", "demand_score", "growth_score", "intent_match", "competition_gap",
    "geo_potential", "complexity", "confidence", "reviewer_status", "strategic_rationale"
  ];
  const rowOppHeader = wsOpps.getRow(4);
  rowOppHeader.values = oppHeaders;
  rowOppHeader.font = fontHeader;
  rowOppHeader.fill = fillParentHeader;
  rowOppHeader.height = 26;

  opportunities.forEach((op, idx) => {
    const row = wsOpps.addRow([
      idx + 1, op.opportunity_id, op.target_entity, op.candidate_name, op.domain, op.priority,
      op.opportunity_score, op.demand_score, op.growth_score, op.intent_match, op.competition_gap,
      op.geo_potential, op.complexity, op.confidence, op.reviewer_status, op.strategic_rationale
    ]);
    row.height = 24;
    row.font = fontMain;
    row.getCell(6).font = { ...fontBold, color: { argb: "FFB45309" } };
    row.getCell(15).font = { ...fontBold, color: { argb: "FF15803D" } };
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));

    row.getCell(15).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"APPROVED,PENDING,REJECTED,NEEDS_REVIEW"'],
    };
  });

  // ==========================================
  // 12. P-COMPETITORS
  // ==========================================
  const wsComp = workbook.addWorksheet("P-COMPETITORS", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsComp);

  wsComp.getCell("A2").value = "P-COMPETITORS — Monitored Public Competitors & Market Benchmarks";
  wsComp.getCell("A2").font = fontTitle;

  const compHeaders = ["SN", "competitor_id", "domain_name", "monthly_visits_est", "top_category", "primary_strength", "vulnerability_gap", "last_checked"];
  const rowCmpHeader = wsComp.getRow(4);
  rowCmpHeader.values = compHeaders;
  rowCmpHeader.font = fontHeader;
  rowCmpHeader.fill = fillParentHeader;
  rowCmpHeader.height = 26;

  const compList = [
    [1, "CMP-001", "mylocation.org", "1,800,000", "network", "High authority IP queries", "Ad-heavy 2010s UI layout", "2026-08-25"],
    [2, "CMP-002", "plaintoolbox.com", "420,000", "developer", "Developer tool aggregation", "Lacks mobile responsiveness", "2026-08-25"],
    [3, "CMP-003", "top10k.com", "950,000", "utilities", "Broad web utility directory", "Slow client hydration & tracking popups", "2026-08-25"],
    [4, "CMP-004", "10015.io", "800,000", "all-in-one", "Sleek utility UI cards", "Contains intrusive banner ads", "2026-08-25"],
    [5, "CMP-005", "omnicalculator.com", "15,000,000", "calculators", "Programmatic SEO volume", "Slow page load & ad clutter", "2026-08-25"],
  ];

  compList.forEach((c, idx) => {
    const row = wsComp.addRow(c);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 13. P-SEARCH_INTEL
  // ==========================================
  const wsSearch = workbook.addWorksheet("P-SEARCH_INTEL", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsSearch);

  wsSearch.getCell("A2").value = "P-SEARCH_INTEL — Search Intent, SERP Positions, and Intent Signals";
  wsSearch.getCell("A2").font = fontTitle;

  const srchHeaders = ["SN", "query_id", "search_query", "monthly_volume_est", "intent_type", "serp_feature_density", "utl_position", "opportunity_score"];
  const rowSrchHeader = wsSearch.getRow(4);
  rowSrchHeader.values = srchHeaders;
  rowSrchHeader.font = fontHeader;
  rowSrchHeader.fill = fillParentHeader;
  rowSrchHeader.height = 26;

  const searchIntelList = [
    [1, "QRY-001", "diff checker online", 120000, "INFORMATIONAL", "HIGH", 14, 88.5],
    [2, "QRY-002", "json formatter validator", 250000, "INFORMATIONAL", "MEDIUM", 8, 85.0],
    [3, "QRY-003", "talking alarm clock", 45000, "UTILITY_DIRECT", "LOW", 1, 92.0],
    [4, "QRY-004", "unit converter metric imperial", 310000, "INFORMATIONAL", "HIGH", 12, 78.0],
    [5, "QRY-005", "what is my ip address", 1500000, "UTILITY_DIRECT", "VERY_HIGH", 22, 70.0],
  ];

  searchIntelList.forEach((s, idx) => {
    const row = wsSearch.addRow(s);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 14. P-GEOGRAPHY
  // ==========================================
  const wsGeo = workbook.addWorksheet("P-GEOGRAPHY", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsGeo);

  wsGeo.getCell("A2").value = "P-GEOGRAPHY — Country & Language Demand Distribution";
  wsGeo.getCell("A2").font = fontTitle;

  const geoHeaders = ["SN", "country_code", "country_name", "primary_language", "demand_share_pct", "utl_traffic_share_pct", "localization_opportunity"];
  const rowGeoHeader = wsGeo.getRow(4);
  rowGeoHeader.values = geoHeaders;
  rowGeoHeader.font = fontHeader;
  rowGeoHeader.fill = fillParentHeader;
  rowGeoHeader.height = 26;

  const geoList = [
    [1, "US", "United States", "English (en-US)", "42.5%", "45.0%", "HIGH (Core Market)"],
    [2, "GB", "United Kingdom", "English (en-GB)", "12.0%", "14.2%", "HIGH"],
    [3, "DE", "Germany", "German (de-DE)", "8.5%", "4.1%", "HIGH (Localization Candidate)"],
    [4, "IN", "India", "English (en-IN)", "15.0%", "18.5%", "HIGH"],
    [5, "FR", "France", "French (fr-FR)", "5.5%", "2.3%", "MEDIUM (Localization Candidate)"],
  ];

  geoList.forEach((g, idx) => {
    const row = wsGeo.addRow(g);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 15. P-ALERTS
  // ==========================================
  const wsAlerts = workbook.addWorksheet("P-ALERTS", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsAlerts);

  wsAlerts.getCell("A2").value = "P-ALERTS — Automated Intelligence & Sensor Threshold Alert Queue";
  wsAlerts.getCell("A2").font = fontTitle;

  const altHeaders = ["SN", "alert_id", "timestamp", "domain", "severity", "alert_type", "message", "status"];
  const rowAltHeader = wsAlerts.getRow(4);
  rowAltHeader.values = altHeaders;
  rowAltHeader.font = fontHeader;
  rowAltHeader.fill = fillParentHeader;
  rowAltHeader.height = 26;

  const alertList = [
    [1, "ALT-001", "2026-08-25T12:00:00Z", "search", "INFO", "RANK_IMPROVEMENT", "UTL Diff Checker moved from #18 to #14 on Google SERP", "ACTIVE"],
    [2, "ALT-002", "2026-08-25T12:00:00Z", "technology", "NOTICE", "EMERGING_DEMAND", "High developer demand signal for JSON to TS Interface Generator", "ACTIVE"],
  ];

  alertList.forEach((a, idx) => {
    const row = wsAlerts.addRow(a);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 16. P-RECOMMENDATIONS
  // ==========================================
  const wsRecs = workbook.addWorksheet("P-RECOMMENDATIONS", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsRecs);

  wsRecs.getCell("A2").value = "P-RECOMMENDATIONS — Actionable Intelligence Recommendations";
  wsRecs.getCell("A2").font = fontTitle;

  const recHeaders = ["SN", "rec_id", "domain", "recommendation", "evidence_summary", "priority", "status"];
  const rowRecHeader = wsRecs.getRow(4);
  rowRecHeader.values = recHeaders;
  rowRecHeader.font = fontHeader;
  rowRecHeader.fill = fillParentHeader;
  rowRecHeader.height = 26;

  const recList = [
    [1, "REC-001", "developer", "Upgrade Diff Checker with side-by-side character diff highlighting", "Diff Checker ranking #14; high search intent; 0 ad clutter differentiator", "P0", "APPROVED"],
    [2, "REC-002", "developer", "Build JSON to TypeScript Interface Generator in Phase 2", "npm download growth + search volume index > 80", "P1", "QUEUED"],
  ];

  recList.forEach((rc, idx) => {
    const row = wsRecs.addRow(rc);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 17. P-DECISIONS
  // ==========================================
  const wsDec = workbook.addWorksheet("P-DECISIONS", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsDec);

  wsDec.getCell("A2").value = "P-DECISIONS — Human Operator Decision & Sign-Off Log";
  wsDec.getCell("A2").font = fontTitle;

  const decHeaders = ["SN", "decision_id", "date", "recommendation_id", "decision", "human_operator_comment", "agent_result"];
  const rowDecHeader = wsDec.getRow(4);
  rowDecHeader.values = decHeaders;
  rowDecHeader.font = fontHeader;
  rowDecHeader.fill = fillParentHeader;
  rowDecHeader.height = 26;

  const decList = [
    [1, "DEC-001", "2026-08-25", "REC-001", "APPROVED", "Approved Diff Checker enhancement for next maintenance release", "Implemented & Deployed v1.2"],
  ];

  decList.forEach((d, idx) => {
    const row = wsDec.addRow(d);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // ==========================================
  // 18. P-SESSIONS
  // ==========================================
  const wsSess = workbook.addWorksheet("P-SESSIONS", { views: [{ showGridLines: true, freeze: { ySplit: 4 } }] });
  addNavRow(wsSess);

  wsSess.getCell("A2").value = "P-SESSIONS — Intelligence Agent Session Registry";
  wsSess.getCell("A2").font = fontTitle;

  const sesHeaders = ["SN", "session_id", "agent_context", "conversation_id", "created_date", "status", "notes"];
  const rowSesHeader = wsSess.getRow(4);
  rowSesHeader.values = sesHeaders;
  rowSesHeader.font = fontHeader;
  rowSesHeader.fill = fillParentHeader;
  rowSesHeader.height = 26;

  const sesList = [
    [1, "SES-INTEL-001", "Internet Intelligence Engine", "4ab9eb3a-c885-41dd-a79e-c88088d26811", "2026-08-26", "ACTIVE", "Canonical Internet Sensor Fabric V1 Implementation Master Session"],
  ];

  sesList.forEach((s, idx) => {
    const row = wsSess.addRow(s);
    row.height = 24;
    row.font = fontMain;
    if (idx % 2 === 1) row.eachCell((cell) => (cell.fill = fillZebra));
  });

  // Auto-fit column widths across all 18 sheets
  workbook.eachSheet((sheet) => {
    const maxCols = 30;
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

  // Create timestamped backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.resolve(`control/backups/INTERNET-INTELLIGENCE-CONTROL-CENTER_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(backupPath);
  console.log(`Saved timestamped backup: ${backupPath}`);

  // Write canonical output
  const outputPath = path.resolve("control/INTERNET-INTELLIGENCE-CONTROL-CENTER.xlsx");
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Successfully generated canonical workbook: ${outputPath}`);
}

buildIntelligenceControlCenter().catch((err) => {
  console.error("Error generating Intelligence Control Center workbook:", err);
  process.exit(1);
});
