import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

import { UtlTelemetryAdapter } from "../intelligence/project/adapters/UtlTelemetryAdapter.mjs";
import { UtlGA4Adapter } from "../intelligence/project/adapters/UtlGA4Adapter.mjs";
import { recordDailyStatistics, loadDailyStatistics } from "../intelligence/project/dailyStatisticsStore.mjs";
import { utlProjectContract } from "../intelligence/project/contract.mjs";
import { buildControlCenter } from "../scripts/generate_control_center.mjs";

test("Test 1: Telemetry adapter does NOT derive usage from utility count", async () => {
  const telemetry = new UtlTelemetryAdapter();
  const obs = await telemetry.collect(utlProjectContract);

  // Read actual utility count from registry
  const utilities = JSON.parse(fs.readFileSync("registry/utilities.json", "utf-8"));
  const count = utilities.length;

  const viewsObs = obs.find((o) => o.metric_id === "utility_views");
  const execsObs = obs.find((o) => o.metric_id === "utility_interactions");
  const widgetObs = obs.find((o) => o.metric_id === "widget_views");

  // Multipliers * 18, * 12, * 14 must NOT be present
  assert.notEqual(viewsObs?.value, count * 18, `Views must not equal count * 18 (${count * 18})`);
  assert.notEqual(execsObs?.value, count * 12, `Executions must not equal count * 12 (${count * 12})`);
  assert.notEqual(viewsObs?.value, 7560, "Views must not be synthetic 7,560");
  assert.notEqual(execsObs?.value, 5040, "Executions must not be synthetic 5,040");
  assert.notEqual(viewsObs?.value, 846, "Views must not be historical synthetic 846");
  assert.notEqual(execsObs?.value, 564, "Executions must not be historical synthetic 564");
});

test("Test 2: Telemetry unavailable state emits truthful null and UNAVAILABLE status", async () => {
  const telemetry = new UtlTelemetryAdapter();
  const obs = await telemetry.collect(utlProjectContract);

  const viewsObs = obs.find((o) => o.metric_id === "utility_views");
  const execsObs = obs.find((o) => o.metric_id === "utility_interactions");
  const widgetObs = obs.find((o) => o.metric_id === "widget_views");

  assert.equal(viewsObs?.value, null, "utility_views value must be null when telemetry is not connected");
  assert.equal(viewsObs?.status, "UNAVAILABLE", "utility_views status must be UNAVAILABLE");
  assert.equal(viewsObs?.epistemic_type, "UNAVAILABLE", "utility_views epistemic_type must be UNAVAILABLE");
  assert.equal(viewsObs?.dimensions?.reason, "NO_TELEMETRY_SOURCE");

  assert.equal(execsObs?.value, null, "utility_interactions value must be null");
  assert.equal(execsObs?.status, "UNAVAILABLE");

  assert.equal(widgetObs?.value, null, "widget_views value must be null");
  assert.equal(widgetObs?.status, "UNAVAILABLE");
});

test("Test 3: GA4 missing credentials emits null and never returns hardcoded user/session values", async () => {
  const ga4 = new UtlGA4Adapter();
  // Pass dummy contract without real auth to force fallback path
  const fakeContract = { ...utlProjectContract, available_data_sources: [] };
  const obs = await ga4.collect(fakeContract);

  const usersObs = obs.find((o) => o.metric_id === "users");
  const sessionsObs = obs.find((o) => o.metric_id === "sessions");
  const viewsObs = obs.find((o) => o.metric_id === "landing_page_views");

  // Must NEVER return 120, 12, 48
  assert.notEqual(usersObs?.value, 120, "Users must not be hardcoded 120");
  assert.notEqual(sessionsObs?.value, 12, "Sessions must not be hardcoded 12");
  assert.notEqual(viewsObs?.value, 48, "Views must not be hardcoded 48");

  if (usersObs?.status !== "SUCCESS") {
    assert.equal(usersObs?.value, null, "When GA4 is not successful, value must be null");
    assert.equal(usersObs?.epistemic_type, "UNAVAILABLE", "Epistemic type must be UNAVAILABLE");
  }
});

test("Test 4: GA4 expired credentials emits AUTH_EXPIRED with null value", async () => {
  const ga4 = new UtlGA4Adapter();
  const now = new Date().toISOString();
  const periodStart = new Date(Date.now() - 7 * 86400000).toISOString();
  const expiredObs = ga4._emitUnavailableObservations(
    utlProjectContract,
    now,
    periodStart,
    "AUTH_EXPIRED",
    "Token expired during refresh"
  );

  assert.equal(expiredObs.length, 4);
  for (const o of expiredObs) {
    assert.equal(o.value, null, `Metric ${o.metric_id} value must be null`);
    assert.equal(o.status, "AUTH_EXPIRED", `Metric ${o.metric_id} status must be AUTH_EXPIRED`);
    assert.equal(o.epistemic_type, "UNAVAILABLE", `Metric ${o.metric_id} epistemic_type must be UNAVAILABLE`);
    assert.equal(o.dimensions.reason, "Token expired during refresh");
  }
});

test("Test 5: Daily statistics store preserves null without fabricating numbers or zeros", () => {
  const mockObservations = [
    { source_id: "SRC-GA4-UTL", metric_id: "users", value: null, status: "AUTH_EXPIRED" },
    { source_id: "SRC-GA4-UTL", metric_id: "sessions", value: null, status: "AUTH_EXPIRED" },
    { source_id: "SRC-GA4-UTL", metric_id: "landing_page_views", value: null, status: "AUTH_EXPIRED" },
    { source_id: "SRC-GA4-UTL", metric_id: "engaged_sessions", value: null, status: "AUTH_EXPIRED" },
    { source_id: "SRC-GSC-UTL", metric_id: "search_impressions", value: null, status: "AUTH_UNAVAILABLE" },
    { source_id: "SRC-GSC-UTL", metric_id: "search_clicks", value: null, status: "AUTH_UNAVAILABLE" },
    { source_id: "SRC-GSC-UTL", metric_id: "search_ctr", value: null, status: "AUTH_UNAVAILABLE" },
    { source_id: "SRC-GSC-UTL", metric_id: "average_position", value: null, status: "AUTH_UNAVAILABLE" },
    { source_id: "SRC-UTL-TELEMETRY", metric_id: "utility_views", value: null, status: "UNAVAILABLE" },
    { source_id: "SRC-UTL-TELEMETRY", metric_id: "utility_interactions", value: null, status: "UNAVAILABLE" },
    { source_id: "SRC-UTL-TELEMETRY", metric_id: "widget_views", value: null, status: "UNAVAILABLE" },
  ];

  // Load existing, backup, record test day, then reload
  const today = new Date().toISOString().slice(0, 10);
  recordDailyStatistics(mockObservations);

  const records = loadDailyStatistics();
  const todayRecord = records.find((r) => r.date === today);

  assert.ok(todayRecord, "Today record must exist in store");
  assert.equal(todayRecord.ga4_active_users, null, "GA4 users must be null");
  assert.equal(todayRecord.ga4_sessions, null, "GA4 sessions must be null");
  assert.equal(todayRecord.ga4_screen_page_views, null, "GA4 screen views must be null");
  assert.equal(todayRecord.utl_utility_views, null, "Telemetry views must be null");
  assert.equal(todayRecord.utl_tool_executions, null, "Telemetry executions must be null");
  assert.equal(todayRecord.widget_views, null, "Widget views must be null");
  assert.equal(todayRecord.tool_execution_view_ratio, null, "Ratio must be null when views are null");
  assert.equal(todayRecord.collection_status, "UNAVAILABLE");
  assert.equal(todayRecord.data_quality_status, "UNAVAILABLE");
});

test("Test 6: Scheduler pipeline execution completes without fabricating operational values", async () => {
  const telemetry = new UtlTelemetryAdapter();
  const ga4 = new UtlGA4Adapter();
  const obs = [
    ...(await telemetry.collect(utlProjectContract)),
    ...(await ga4.collect(utlProjectContract)),
  ];

  recordDailyStatistics(obs);
  const records = loadDailyStatistics();
  const latest = records[records.length - 1];

  // Ensure no fabricated numbers
  assert.notEqual(latest.utl_utility_views, 7560);
  assert.notEqual(latest.utl_tool_executions, 5040);
  assert.notEqual(latest.tool_execution_view_ratio, "66.7%");
  if (latest.collection_status === "UNAVAILABLE") {
    assert.equal(latest.utl_utility_views, null);
    assert.equal(latest.utl_tool_executions, null);
  }
});

test("Test 7: Synthetic test rows are classified as UNTESTED functional specifications", async () => {
  const workbook = await buildControlCenter();
  const wsTestCases = workbook.getWorksheet("C-TestCases");
  assert.ok(wsTestCases, "C-TestCases worksheet must exist");

  const row5 = wsTestCases.getRow(5);
  const statusCol = row5.getCell(10).value;
  const humanComment = row5.getCell(11).value;
  const agentComment = row5.getCell(12).value;
  const tester = row5.getCell(15).value;

  assert.equal(statusCol, "UNTESTED", "Status must be UNTESTED, not fake PASS");
  assert.equal(humanComment, "Specification documented; automated execution pending Phase 2 test harness");
  assert.equal(agentComment, "Pending automated DOM runner");
  assert.equal(tester, "UNASSIGNED", "Tester must be UNASSIGNED, not Antigravity QA Engine");

  // Check that no rows in C-TestCases have PASS status
  let passCount = 0;
  wsTestCases.eachRow((row, rowNumber) => {
    if (rowNumber > 4 && row.getCell(10).value === "PASS") {
      passCount++;
    }
  });
  assert.equal(passCount, 0, "No rows in C-TestCases should claim PASS without automated test runner");
});

test("Test 8: Synthetic changelog loop eliminated; uses authentic foundational changelog", async () => {
  const workbook = await buildControlCenter();
  const wsChanges = workbook.getWorksheet("C-Changes");
  assert.ok(wsChanges, "C-Changes worksheet must exist");

  const totalChangeRows = wsChanges.rowCount - 4;
  // Should NOT be 840 (which was 420 * 2 synthetic entries)
  assert.notEqual(totalChangeRows, 840, "C-Changes must not contain 840 synthetic loop entries");
  // Foundational entries (76) + 1 governance audit row (77) + Phase 2 Git commits (57) = 134
  assert.ok(totalChangeRows >= 77, "C-Changes must contain at least 77 records (foundational + governance + Git commits)");

  // Verify first row is LOG-0001
  const firstRow = wsChanges.getRow(5);
  assert.equal(firstRow.getCell(2).value, "LOG-0001");
  assert.equal(firstRow.getCell(4).value, "random-number-generator");

  // Verify LOG-0077 GOVERNANCE_AUDIT exists
  let foundLog77 = false;
  wsChanges.eachRow((row) => {
    if (row.getCell(2).value === "LOG-0077" && row.getCell(7).value === "GOVERNANCE_AUDIT") {
      foundLog77 = true;
    }
  });
  assert.equal(foundLog77, true, "LOG-0077 GOVERNANCE_AUDIT must be present in C-Changes");
});
