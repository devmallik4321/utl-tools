import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

import {
  SCHEMA_VERSION,
  ALLOWED_EVENT_TYPES,
  FORBIDDEN_KEYS,
  validateTelemetryEvent,
  createTelemetryEvent,
  anonymizeSessionId
} from "../intelligence/telemetry/telemetryContract.mjs";

import { TelemetryStore } from "../intelligence/telemetry/telemetryStore.mjs";
import { UtlTelemetryAdapter } from "../intelligence/project/adapters/UtlTelemetryAdapter.mjs";
import { loadDailyStatistics, getEmpiricalDailyStatistics } from "../intelligence/project/dailyStatisticsStore.mjs";
import { defaultEvidenceStore } from "../intelligence/verification/evidenceStore.mjs";

const TEST_STORE_PATH = path.resolve("intelligence/telemetry/test_events.json");

function createIsolatedStore() {
  if (fs.existsSync(TEST_STORE_PATH)) {
    fs.unlinkSync(TEST_STORE_PATH);
  }
  return new TelemetryStore({ storePath: TEST_STORE_PATH, configured: true });
}

function cleanupIsolatedStore() {
  if (fs.existsSync(TEST_STORE_PATH)) {
    fs.unlinkSync(TEST_STORE_PATH);
  }
}

// ----------------------------------------------------
// WORKSTREAM A: TELEMETRY TESTS (1 to 13)
// ----------------------------------------------------

test("1. No event -> unavailable/null when the source itself is unavailable", async () => {
  const unconfiguredStore = new TelemetryStore({ storePath: TEST_STORE_PATH, configured: false });
  const agg = unconfiguredStore.aggregateDailyTelemetry("2026-09-04");

  assert.equal(agg.status, "UNAVAILABLE");
  assert.equal(agg.utility_views, null);
  assert.equal(agg.tool_executions, null);
  assert.equal(agg.widget_views, null);

  const adapter = new UtlTelemetryAdapter(process.cwd(), { telemetryStore: unconfiguredStore });
  const obs = await adapter.collect({ project_id: "PRJ-UTL" }, { date: "2026-09-04" });

  const viewsObs = obs.find((o) => o.metric_id === "utility_views");
  assert.equal(viewsObs?.value, null);
  assert.equal(viewsObs?.status, "UNAVAILABLE");
  assert.equal(viewsObs?.epistemic_type, "UNAVAILABLE");
});

test("2. Connected source with zero events -> zero", async () => {
  const store = createIsolatedStore();
  const agg = store.aggregateDailyTelemetry("2026-09-04");

  assert.equal(agg.status, "SUCCESS");
  assert.equal(agg.total_events, 0);
  assert.equal(agg.utility_views, 0);
  assert.equal(agg.tool_executions, 0);
  assert.equal(agg.widget_views, 0);

  const adapter = new UtlTelemetryAdapter(process.cwd(), { telemetryStore: store });
  const obs = await adapter.collect({ project_id: "PRJ-UTL" }, { date: "2026-09-04" });

  const viewsObs = obs.find((o) => o.metric_id === "utility_views");
  const execsObs = obs.find((o) => o.metric_id === "utility_interactions");
  const widgetObs = obs.find((o) => o.metric_id === "widget_views");

  assert.equal(viewsObs?.value, 0, "Empty connected store must report 0 views, not null");
  assert.equal(viewsObs?.status, "SUCCESS");
  assert.equal(viewsObs?.epistemic_type, "VERIFIED");

  assert.equal(execsObs?.value, 0);
  assert.equal(widgetObs?.value, 0);

  cleanupIsolatedStore();
});

test("3. One real utility-view event -> exactly one view", () => {
  const store = createIsolatedStore();
  const event = createTelemetryEvent({
    event_type: "utility_view",
    utility_id: "age-calculator",
    source: "test-runner",
  });

  const res = store.recordEvent(event);
  assert.equal(res.recorded, true);

  const agg = store.aggregateDailyTelemetry(event.timestamp.slice(0, 10));
  assert.equal(agg.utility_views, 1);
  assert.equal(agg.tool_executions, 0);
  assert.equal(agg.widget_views, 0);

  cleanupIsolatedStore();
});

test("4. Ten real utility-view events -> exactly ten views", () => {
  const store = createIsolatedStore();
  const today = "2026-09-04";

  for (let i = 0; i < 10; i++) {
    store.recordEvent({
      event_id: `evt_view_${i}`,
      event_type: "utility_view",
      utility_id: `tool-${i}`,
      timestamp: `${today}T10:00:0${i}.000Z`,
      source: "web-shell",
    });
  }

  const agg = store.aggregateDailyTelemetry(today);
  assert.equal(agg.utility_views, 10);
  assert.equal(agg.total_events, 10);

  cleanupIsolatedStore();
});

test("5. One execution event -> exactly one execution", () => {
  const store = createIsolatedStore();
  const today = "2026-09-04";

  store.recordEvent({
    event_id: "evt_exec_001",
    event_type: "tool_execution",
    utility_id: "random-number-generator",
    timestamp: `${today}T10:05:00.000Z`,
    source: "web-shell",
  });

  const agg = store.aggregateDailyTelemetry(today);
  assert.equal(agg.tool_executions, 1);
  assert.equal(agg.utility_views, 0);
  assert.equal(agg.widget_views, 0);

  cleanupIsolatedStore();
});

test("6. Widget events are not counted as utility executions", () => {
  const store = createIsolatedStore();
  const today = "2026-09-04";

  store.recordEvent({
    event_id: "evt_widget_001",
    event_type: "widget_view",
    widget_id: "clock-widget",
    timestamp: `${today}T11:00:00.000Z`,
    source: "windows-widgets",
  });

  const agg = store.aggregateDailyTelemetry(today);
  assert.equal(agg.widget_views, 1);
  assert.equal(agg.utility_views, 0);
  assert.equal(agg.tool_executions, 0, "Widget views must not be counted as tool executions");

  cleanupIsolatedStore();
});

test("7. Duplicate event IDs do not double-count", () => {
  const store = createIsolatedStore();
  const today = "2026-09-04";

  const event = {
    event_id: "evt_dup_test_001",
    event_type: "utility_view",
    utility_id: "json-formatter",
    timestamp: `${today}T12:00:00.000Z`,
    source: "web-shell",
  };

  const res1 = store.recordEvent(event);
  assert.equal(res1.recorded, true);

  const res2 = store.recordEvent(event);
  assert.equal(res2.recorded, false);
  assert.equal(res2.duplicate, true);

  const agg = store.aggregateDailyTelemetry(today);
  assert.equal(agg.utility_views, 1, "Duplicate event ID must be discarded and count remains 1");

  cleanupIsolatedStore();
});

test("8. Invalid events are rejected", () => {
  const store = createIsolatedStore();

  // Missing event_id
  const r1 = store.recordEvent({ event_type: "utility_view", timestamp: new Date().toISOString() });
  assert.equal(r1.recorded, false);
  assert.ok(r1.error.includes("event_id"));

  // Invalid event_type
  const r2 = store.recordEvent({ event_id: "e1", event_type: "arbitrary_custom_event", timestamp: new Date().toISOString() });
  assert.equal(r2.recorded, false);
  assert.ok(r2.error.includes("event_type"));

  // Missing utility_id for tool_execution
  const r3 = store.recordEvent({ event_id: "e2", event_type: "tool_execution", timestamp: new Date().toISOString(), source: "test" });
  assert.equal(r3.recorded, false);
  assert.ok(r3.error.includes("utility_id"));

  cleanupIsolatedStore();
});

test("9. Utility inventory size never affects telemetry totals", async () => {
  const store = createIsolatedStore();
  const today = "2026-09-04";

  // Ingest 3 real views
  for (let i = 0; i < 3; i++) {
    store.recordEvent({
      event_id: `evt_inv_test_${i}`,
      event_type: "utility_view",
      utility_id: `tool-${i}`,
      timestamp: `${today}T14:00:00.000Z`,
      source: "web-shell",
    });
  }

  const adapter = new UtlTelemetryAdapter(process.cwd(), { telemetryStore: store });
  const obs = await adapter.collect({ project_id: "PRJ-UTL" }, { date: today });
  const viewsObs = obs.find((o) => o.metric_id === "utility_views");

  // Read inventory
  const inventory = JSON.parse(fs.readFileSync("registry/utilities.json", "utf-8"));
  assert.equal(viewsObs?.value, 3, "Views must equal 3 exact events");
  assert.notEqual(viewsObs?.value, inventory.length * 18, "Views must not use * 18 multiplier");
  assert.notEqual(viewsObs?.value, inventory.length, "Views must not equal raw inventory count");

  cleanupIsolatedStore();
});

test("10. Historical contaminated records cannot enter empirical aggregation", () => {
  const empirical = getEmpiricalDailyStatistics();
  const contaminatedDates = [
    "2026-08-26", "2026-08-27", "2026-08-28", "2026-08-29",
    "2026-08-30", "2026-08-31", "2026-09-01", "2026-09-02", "2026-09-03"
  ];

  for (const cd of contaminatedDates) {
    assert.equal(
      empirical.some((r) => r.date === cd),
      false,
      `Contaminated date ${cd} must NOT be present in empirical statistics`
    );
  }

  const allRecords = loadDailyStatistics();
  const contaminated = allRecords.filter((r) => contaminatedDates.includes(r.date));
  assert.equal(contaminated.length, 9, "Exactly 9 contaminated historical records must exist");
  for (const cr of contaminated) {
    assert.equal(cr.usable_for_empirical_analysis, false);
    assert.equal(cr.epistemic_classification, "SYNTHETIC_CONTAMINATED");
  }
});

test("11. Daily aggregation is deterministic", () => {
  const store = createIsolatedStore();
  const today = "2026-09-04";

  store.recordEvent({ event_id: "e1", event_type: "utility_view", utility_id: "t1", timestamp: `${today}T10:00:00Z`, source: "s" });
  store.recordEvent({ event_id: "e2", event_type: "tool_execution", utility_id: "t1", timestamp: `${today}T10:01:00Z`, source: "s" });
  store.recordEvent({ event_id: "e3", event_type: "widget_view", widget_id: "w1", timestamp: `${today}T10:02:00Z`, source: "s" });

  const agg1 = store.aggregateDailyTelemetry(today);
  const agg2 = store.aggregateDailyTelemetry(today);

  assert.deepEqual(agg1, agg2, "Daily aggregation results must be strictly deterministic across calls");

  cleanupIsolatedStore();
});

test("12. Re-running aggregation does not duplicate events", () => {
  const store = createIsolatedStore();
  const today = "2026-09-04";

  store.recordEvent({ event_id: "e1", event_type: "utility_view", utility_id: "t1", timestamp: `${today}T10:00:00Z`, source: "s" });

  const agg1 = store.aggregateDailyTelemetry(today);
  assert.equal(agg1.utility_views, 1);

  // Repeat aggregation multiple times
  const agg2 = store.aggregateDailyTelemetry(today);
  assert.equal(agg2.utility_views, 1);
  assert.equal(store.loadEvents().length, 1, "Store event count must remain 1");

  cleanupIsolatedStore();
});

test("13. Privacy-sensitive fields are rejected according to contract", () => {
  const store = createIsolatedStore();

  const forbiddenExamples = [
    { event_id: "p1", event_type: "utility_view", utility_id: "t1", timestamp: new Date().toISOString(), source: "s", password: "secretPassword" },
    { event_id: "p2", event_type: "utility_view", utility_id: "t1", timestamp: new Date().toISOString(), source: "s", query: "personal search query" },
    { event_id: "p3", event_type: "utility_view", utility_id: "t1", timestamp: new Date().toISOString(), source: "s", token: "bearer-token-1234" },
    { event_id: "p4", event_type: "utility_view", utility_id: "t1", timestamp: new Date().toISOString(), source: "s", input: "user raw form input" },
    { event_id: "p5", event_type: "utility_view", utility_id: "t1", timestamp: new Date().toISOString(), source: "s", email: "user@example.com" },
    { event_id: "p6", event_type: "utility_view", utility_id: "t1", timestamp: new Date().toISOString(), source: "s", metadata: { payload: "sensitive data" } },
  ];

  for (const bad of forbiddenExamples) {
    const res = store.recordEvent(bad);
    assert.equal(res.recorded, false, `Event with forbidden key must be rejected: ${JSON.stringify(bad)}`);
    assert.ok(res.error.includes("Privacy violation"), `Error message must cite privacy violation: ${res.error}`);
  }

  cleanupIsolatedStore();
});

// ----------------------------------------------------
// WORKSTREAM B: AUTOMATED COMPONENT VERIFICATION TESTS
// ----------------------------------------------------

test("14. Automated verification harness evidence model completeness", () => {
  const summary = defaultEvidenceStore.getExecutionSummary();
  assert.equal(summary.total_specifications, 420, "Total specifications must be 420");
  assert.ok(summary.executed_count > 0, "Automated tests must have executed");

  const doc = defaultEvidenceStore.loadEvidence();
  assert.ok(doc.run_id, "Evidence document must have run_id");
  assert.ok(doc.executed_at, "Evidence document must have executed_at");
  assert.ok(doc.runner_version, "Evidence document must record runner_version");
  assert.ok(Array.isArray(doc.results), "Evidence document must contain results array");

  // Check structure of first result
  const first = doc.results[0];
  assert.ok(first.test_id, "Test record must have test_id");
  assert.ok(first.utility_id, "Test record must have utility_id");
  assert.ok(first.slug, "Test record must have slug");
  assert.ok(["PASS", "FAIL", "REQUIRES_HUMAN_VALIDATION", "BLOCKED"].includes(first.status));
  assert.ok(first.execution_timestamp, "Test record must have execution_timestamp");
  assert.ok(typeof first.duration_ms === "number", "Test record must record duration_ms");
  assert.ok(first.evidence_link, "Test record must have evidence_link");
});

test("15. Human validation boundary correctly classifies external/hardware dependencies", () => {
  const doc = defaultEvidenceStore.loadEvidence();
  const humanTests = doc.results.filter((r) => r.status === "REQUIRES_HUMAN_VALIDATION");
  assert.ok(humanTests.length >= 1, "Must identify utilities requiring human/external validation");

  for (const ht of humanTests) {
    assert.equal(ht.status, "REQUIRES_HUMAN_VALIDATION");
    assert.ok(ht.notes.includes("REQUIRES_HUMAN_VALIDATION"), "Must document reason for human validation requirement");
    assert.equal(ht.assertion_result, null, "Unexecuted hardware/network probe must not have fake true assertion");
  }
});

test("16. Passing tests have verified assertion and non-empty DOM output evidence", () => {
  const doc = defaultEvidenceStore.loadEvidence();
  const passingTests = doc.results.filter((r) => r.status === "PASS");
  assert.ok(passingTests.length >= 10, "Must have verified passing automated tests");

  for (const pt of passingTests) {
    assert.equal(pt.status, "PASS");
    assert.equal(pt.assertion_result, true, "PASS test must have assertion_result === true");
    assert.ok(pt.actual_output && pt.actual_output.length > 5, "PASS test must record actual DOM output");
    assert.ok(pt.duration_ms >= 0, "PASS test must record duration");
  }
});
