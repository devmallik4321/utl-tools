import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

import {
  validateTelemetryEvent,
  SCHEMA_VERSION,
  FORBIDDEN_KEYS,
} from "../intelligence/telemetry/telemetryContract.mjs";
import { TelemetryStore } from "../intelligence/telemetry/telemetryStore.mjs";
import { UtlTelemetryAdapter } from "../intelligence/project/adapters/UtlTelemetryAdapter.mjs";
import { EvidenceStore } from "../intelligence/verification/evidenceStore.mjs";
import {
  loadDailyStatistics,
  recordDailyStatistics,
  getEmpiricalDailyStatistics,
} from "../intelligence/project/dailyStatisticsStore.mjs";

const FIXTURES_DIR = path.resolve("intelligence/telemetry/test_fixtures_p5");

function getIsolatedStore() {
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }
  const storePath = path.join(FIXTURES_DIR, `events_p5_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);
  return new TelemetryStore({ storePath, configured: true });
}

function cleanupFixtures() {
  if (fs.existsSync(FIXTURES_DIR)) {
    fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
  }
}

// ============================================================================
// 1. Production configuration validity
// ============================================================================
test("1. Production configuration validity", () => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8"));
  const webPkg = JSON.parse(fs.readFileSync(path.resolve("apps/web-shell/package.json"), "utf-8"));
  const nextConfigPath = path.resolve("apps/web-shell/next.config.mjs");

  assert.equal(pkg.private, true);
  assert.equal(pkg.workspaces.includes("apps/*"), true);
  assert.ok(webPkg.scripts.build);
  assert.ok(webPkg.scripts.start);
  assert.equal(fs.existsSync(nextConfigPath), true);
});

// ============================================================================
// 2. Telemetry endpoint availability
// ============================================================================
test("2. Telemetry endpoint availability", async () => {
  const routePath = path.resolve("apps/web-shell/src/app/api/telemetry/route.ts");
  assert.equal(fs.existsSync(routePath), true);

  const routeCode = fs.readFileSync(routePath, "utf-8");
  assert.match(routeCode, /export\s+async\s+function\s+GET/);
  assert.match(routeCode, /export\s+async\s+function\s+POST/);
  assert.match(routeCode, /status:\s*"ACTIVE"/);
  assert.match(routeCode, /schema_version:\s*"1.0.0"/);
});

// ============================================================================
// 3. Telemetry contract enforcement
// ============================================================================
test("3. Telemetry contract enforcement", () => {
  // Unsupported schema version
  const badVersion = {
    event_id: "evt_p5_contract_1",
    event_type: "utility_view",
    utility_id: "tool-1",
    timestamp: new Date().toISOString(),
    source: "web-shell",
    schema_version: "3.0.0",
  };
  const res1 = validateTelemetryEvent(badVersion);
  assert.equal(res1.valid, false);
  assert.match(res1.error, /Unsupported schema_version/);

  // Missing required utility_id
  const missingId = {
    event_id: "evt_p5_contract_2",
    event_type: "tool_execution",
    timestamp: new Date().toISOString(),
    source: "web-shell",
  };
  const res2 = validateTelemetryEvent(missingId);
  assert.equal(res2.valid, false);
  assert.match(res2.error, /utility_id is required/);
});

// ============================================================================
// 4. Genuine event persistence
// ============================================================================
test("4. Genuine event persistence", () => {
  const store = getIsolatedStore();
  const event = {
    event_id: "evt_p5_persist_01",
    event_type: "utility_view",
    utility_id: "json-formatter",
    timestamp: new Date().toISOString(),
    source: "web-shell",
  };

  const rec = store.recordEvent(event);
  assert.equal(rec.recorded, true);

  const loaded = store.loadEvents();
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].event_id, "evt_p5_persist_01");
  assert.equal(loaded[0].utility_id, "json-formatter");

  cleanupFixtures();
});

// ============================================================================
// 5. Duplicate-event rejection/deduplication
// ============================================================================
test("5. Duplicate-event rejection/deduplication", () => {
  const store = getIsolatedStore();
  const event = {
    event_id: "evt_p5_dedup_01",
    event_type: "tool_execution",
    utility_id: "diff-checker",
    timestamp: new Date().toISOString(),
    source: "web-shell",
  };

  const rec1 = store.recordEvent(event);
  assert.equal(rec1.recorded, true);

  const rec2 = store.recordEvent(event);
  assert.equal(rec2.recorded, false);
  assert.equal(rec2.duplicate, true);

  assert.equal(store.loadEvents().length, 1);
  assert.equal(store.getOperationalDiagnostics().events_deduplicated, 1);

  cleanupFixtures();
});

// ============================================================================
// 6. Privacy rejection
// ============================================================================
test("6. Privacy rejection", () => {
  for (const fk of FORBIDDEN_KEYS) {
    const badPayload = {
      event_id: `evt_privacy_${fk}`,
      event_type: "utility_view",
      utility_id: "password-generator",
      timestamp: new Date().toISOString(),
      source: "web-shell",
      [fk]: "confidential_sensitive_value",
    };
    const res = validateTelemetryEvent(badPayload);
    assert.equal(res.valid, false);
    assert.match(res.error, /Privacy violation/);
  }
});

// ============================================================================
// 7. Zero-event semantics
// ============================================================================
test("7. Zero-event semantics", () => {
  const store = getIsolatedStore();
  const today = new Date().toISOString().slice(0, 10);
  const agg = store.aggregateDailyTelemetry(today);

  assert.equal(agg.status, "SUCCESS");
  assert.equal(agg.utility_views, 0);
  assert.equal(agg.tool_executions, 0);
  assert.equal(agg.widget_views, 0);
  assert.equal(agg.total_events, 0);

  cleanupFixtures();
});

// ============================================================================
// 8. Non-zero genuine-event semantics
// ============================================================================
test("8. Non-zero genuine-event semantics", () => {
  const store = getIsolatedStore();
  const today = new Date().toISOString().slice(0, 10);

  store.recordEvent({ event_id: "evt_g_1", event_type: "utility_view", utility_id: "tool-a", timestamp: new Date().toISOString(), source: "web-shell" });
  store.recordEvent({ event_id: "evt_g_2", event_type: "tool_execution", utility_id: "tool-a", timestamp: new Date().toISOString(), source: "web-shell" });
  store.recordEvent({ event_id: "evt_g_3", event_type: "tool_execution", utility_id: "tool-b", timestamp: new Date().toISOString(), source: "web-shell" });

  const agg = store.aggregateDailyTelemetry(today);
  assert.equal(agg.status, "SUCCESS");
  assert.equal(agg.utility_views, 1);
  assert.equal(agg.tool_executions, 2);
  assert.equal(agg.total_events, 3);

  cleanupFixtures();
});

// ============================================================================
// 9. Unavailable-source semantics
// ============================================================================
test("9. Unavailable-source semantics", () => {
  const store = new TelemetryStore({ configured: false });
  const today = new Date().toISOString().slice(0, 10);
  const agg = store.aggregateDailyTelemetry(today);

  assert.equal(agg.status, "UNAVAILABLE");
  assert.equal(agg.utility_views, null);
  assert.equal(agg.tool_executions, null);
  assert.equal(agg.widget_views, null);

  // Invariant: null is not zero
  assert.notEqual(agg.utility_views, 0);
  assert.notEqual(agg.tool_executions, 0);
});

// ============================================================================
// 10. Daily statistics idempotency
// ============================================================================
test("10. Daily statistics idempotency", () => {
  const initial = loadDailyStatistics();
  const mockObservations = [
    { source_id: "SRC-UTL-TELEMETRY", metric_id: "utility_views", status: "SUCCESS", value: 0 },
    { source_id: "SRC-UTL-TELEMETRY", metric_id: "utility_interactions", status: "SUCCESS", value: 0 },
    { source_id: "SRC-UTL-TELEMETRY", metric_id: "widget_views", status: "SUCCESS", value: 0 },
  ];

  recordDailyStatistics(mockObservations);
  const run1 = loadDailyStatistics();

  recordDailyStatistics(mockObservations);
  const run2 = loadDailyStatistics();

  assert.equal(run1.length, run2.length);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecords = run2.filter((r) => r.date === todayStr);
  assert.equal(todayRecords.length, 1);
});

// ============================================================================
// 11. Historical contamination isolation
// ============================================================================
test("11. Historical contamination isolation", () => {
  const allRecords = loadDailyStatistics();
  const empiricalRecords = getEmpiricalDailyStatistics();

  const contaminatedCount = allRecords.filter((r) => r.epistemic_classification === "SYNTHETIC_CONTAMINATED").length;
  assert.equal(contaminatedCount, 9);

  for (const emp of empiricalRecords) {
    assert.equal(emp.usable_for_empirical_analysis, true);
    assert.notEqual(emp.epistemic_classification, "SYNTHETIC_CONTAMINATED");
  }
});

// ============================================================================
// 12. Test evidence integrity
// ============================================================================
test("12. Test evidence integrity", () => {
  const evidenceStore = new EvidenceStore();
  const summary = evidenceStore.getExecutionSummary();
  const doc = evidenceStore.loadEvidence();

  assert.equal(summary.total_specifications, 420);
  assert.equal(summary.executed_count, 420);
  assert.equal(summary.pass_count, 417);
  assert.equal(summary.requires_human_validation_count, 3);
  assert.equal(summary.fail_count, 0);

  // Verify passing items have assertion_result === true and non-empty actual_output
  const passingItems = doc.results.filter((r) => r.status === "PASS");
  assert.equal(passingItems.length, 417);
  for (const p of passingItems) {
    assert.equal(p.assertion_result, true);
    assert.ok(p.actual_output && p.actual_output.length > 0);
  }
});

// ============================================================================
// 13. Human-validation preservation
// ============================================================================
test("13. Human-validation preservation", () => {
  const evidenceStore = new EvidenceStore();
  const humanItems = evidenceStore.getHumanValidationRequired();

  assert.equal(humanItems.length, 3);
  const slugs = humanItems.map((h) => h.slug || h.utility_id);
  assert.ok(slugs.includes("my-ip"));
  assert.ok(slugs.includes("ping-test"));
  assert.ok(slugs.includes("dns-lookup"));

  for (const h of humanItems) {
    assert.equal(h.status, "REQUIRES_HUMAN_VALIDATION");
    assert.notEqual(h.status, "PASS");
  }
});

// ============================================================================
// 14. Dashboard provenance
// ============================================================================
test("14. Dashboard provenance", () => {
  const metricsDoc = JSON.parse(fs.readFileSync(path.resolve("intelligence/project/system_metrics.json"), "utf-8"));
  assert.ok(Array.isArray(metricsDoc.metrics));

  for (const m of metricsDoc.metrics) {
    assert.ok(m.metric_id);
    assert.ok(m.source);
    assert.ok(m.epistemic_type);
    assert.ok(m.calculation_method);
  }
});

// ============================================================================
// 15. Provider failure isolation
// ============================================================================
test("15. Provider failure isolation", async () => {
  const unconfiguredStore = new TelemetryStore({ configured: false });
  const adapter = new UtlTelemetryAdapter(path.resolve("."), { telemetryStore: unconfiguredStore });
  const mockProject = { project_id: "UTL-TOOLS" };

  const obs = await adapter.collect(mockProject);
  assert.ok(Array.isArray(obs));

  for (const o of obs) {
    assert.equal(o.status, "UNAVAILABLE");
    assert.equal(o.value, null);
  }
});

// ============================================================================
// 16. Production health classification
// ============================================================================
test("16. Production health classification", () => {
  const contractPath = path.resolve("documentation/MONITORING-CONTRACT.md");
  assert.equal(fs.existsSync(contractPath), true);

  const text = fs.readFileSync(contractPath, "utf-8");
  assert.match(text, /HEALTHY/);
  assert.match(text, /ATTENTION_REQUIRED/);
  assert.match(text, /DEGRADED/);
  assert.match(text, /UNAVAILABLE/);
  assert.match(text, /ACTIVE/);
});

// ============================================================================
// 17. Evidence traceability
// ============================================================================
test("17. Evidence traceability", () => {
  const doc = JSON.parse(fs.readFileSync(path.resolve("intelligence/verification/test_execution_evidence.json"), "utf-8"));
  assert.ok(doc.run_id);
  assert.ok(doc.executed_at);

  const sample = doc.results[0];
  const itemFile = path.resolve(`intelligence/verification/evidence/${sample.test_id}.json`);
  assert.equal(fs.existsSync(itemFile), true);

  const parsed = JSON.parse(fs.readFileSync(itemFile, "utf-8"));
  assert.equal(parsed.test_id, sample.test_id);
  assert.equal(parsed.utility_id, sample.utility_id);
});

// ============================================================================
// 18. No synthetic operational metrics
// ============================================================================
test("18. No synthetic operational metrics", () => {
  const adapterCode = fs.readFileSync(path.resolve("intelligence/project/adapters/UtlTelemetryAdapter.mjs"), "utf-8");
  assert.equal(adapterCode.includes("utilsCount * 18"), false);
  assert.equal(adapterCode.includes("utilsCount * 12"), false);
  assert.equal(adapterCode.includes("widgetsCount * 14"), false);
});

// ============================================================================
// 19. No synthetic PASS results
// ============================================================================
test("19. No synthetic PASS results", () => {
  const evidenceStore = new EvidenceStore();
  const summary = evidenceStore.getExecutionSummary();
  assert.equal(summary.pass_count, 417);
  assert.equal(summary.requires_human_validation_count, 3);
  assert.equal(summary.pass_count + summary.requires_human_validation_count, 420);
});

// ============================================================================
// 20. No NO_DATA -> ZERO conversion
// ============================================================================
test("20. No NO_DATA -> ZERO conversion", () => {
  const unconfiguredStore = new TelemetryStore({ configured: false });
  const agg = unconfiguredStore.aggregateDailyTelemetry("2026-09-04");

  assert.equal(agg.utility_views, null);
  assert.notEqual(agg.utility_views, 0);

  const configuredStore = getIsolatedStore();
  const zeroAgg = configuredStore.aggregateDailyTelemetry("2026-09-04");
  assert.equal(zeroAgg.utility_views, 0);
  assert.notEqual(zeroAgg.utility_views, null);

  cleanupFixtures();
});
