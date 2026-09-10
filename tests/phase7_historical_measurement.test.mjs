import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
  PRODUCTION_TIMELINE,
  loadEmpiricalDailyStatistics,
  runHistoricalReconstruction,
} from "../intelligence/project/historicalReconstructor.mjs";
import { loadDailyStatistics } from "../intelligence/project/dailyStatisticsStore.mjs";
import {
  PersistentTelemetryStore,
  defaultPersistentStore,
  FORBIDDEN_KEYS,
} from "../intelligence/telemetry/persistentTelemetryStore.mjs";
import {
  evaluateAdSenseReadiness,
  ADSENSE_POLICY_CHECKLIST,
  INTERNAL_MONETIZATION_TARGETS,
} from "../intelligence/project/monetizationModel.mjs";
import {
  getLiveStatistics,
  getMonthlyStatistics,
  getFirstSevenDaysSummary,
  calculateChange,
  buildReconstructedEmpiricalProgression,
} from "../intelligence/project/statisticsAggregator.mjs";

const ROOT_DIR = process.cwd();

// ============================================================================
// 1. GA4 historical records come directly from the GA4 API query results
// ============================================================================
test("1. GA4 historical records come directly from the GA4 API query results", () => {
  const empiricalRecords = loadEmpiricalDailyStatistics();
  assert.ok(empiricalRecords.length >= 11, "Must contain at least 11 empirical daily records");

  const day1 = empiricalRecords.find((r) => r.date === "2026-08-25");
  assert.ok(day1, "Day 1 (2026-08-25) must exist");
  assert.equal(day1.ga4.source, "SRC-GA4-UTL");
  assert.equal(day1.ga4.status, "EMPIRICAL_API");
  assert.equal(day1.ga4.active_users, 12);
  assert.equal(day1.ga4.sessions, 13);
  assert.equal(day1.ga4.screen_page_views, 55);

  const day2 = empiricalRecords.find((r) => r.date === "2026-08-26");
  assert.ok(day2, "Day 2 (2026-08-26) must exist");
  assert.equal(day2.ga4.active_users, 32);
  assert.equal(day2.ga4.sessions, 34);
  assert.equal(day2.ga4.screen_page_views, 46);

  const day3 = empiricalRecords.find((r) => r.date === "2026-08-27");
  assert.ok(day3, "Day 3 (2026-08-27) must exist");
  assert.equal(day3.ga4.active_users, 19);
  assert.equal(day3.ga4.sessions, 19);
  assert.equal(day3.ga4.screen_page_views, 20);
});

// ============================================================================
// 2. GSC historical records come directly from the GSC API query results
// ============================================================================
test("2. GSC historical records come directly from the GSC API query results", () => {
  const empiricalRecords = loadEmpiricalDailyStatistics();

  const day1 = empiricalRecords.find((r) => r.date === "2026-08-25");
  assert.equal(day1.gsc.source, "SRC-GSC-UTL");
  assert.equal(day1.gsc.impressions, 0);
  assert.equal(day1.gsc.clicks, 0);

  const day2 = empiricalRecords.find((r) => r.date === "2026-08-26");
  assert.equal(day2.gsc.impressions, 21);
  assert.equal(day2.gsc.clicks, 0);

  const day3 = empiricalRecords.find((r) => r.date === "2026-08-27");
  assert.equal(day3.gsc.impressions, 59);

  const day4 = empiricalRecords.find((r) => r.date === "2026-08-28");
  assert.equal(day4.gsc.impressions, 126);

  const day5 = empiricalRecords.find((r) => r.date === "2026-08-29");
  assert.equal(day5.gsc.impressions, 131);
});

// ============================================================================
// 3. Contaminated historical records (Aug 26 - Sep 3) remain preserved in daily_statistics.json
// ============================================================================
test("3. Contaminated historical records remain preserved in daily_statistics.json", () => {
  const dailyStore = loadDailyStatistics();
  const contaminated = dailyStore.filter((r) => r.usable_for_empirical_analysis === false);
  assert.equal(contaminated.length, 9, "Must have exactly 9 contaminated historical records preserved");

  const dates = contaminated.map((r) => r.date);
  assert.ok(dates.includes("2026-08-26"), "2026-08-26 must be preserved");
  assert.ok(dates.includes("2026-09-03"), "2026-09-03 must be preserved");

  for (const r of contaminated) {
    assert.equal(r.epistemic_classification, "SYNTHETIC_CONTAMINATED");
    assert.equal(r.usable_for_empirical_analysis, false);
    assert.ok(r.contamination_reason, "Must document contamination reason");
  }
});

// ============================================================================
// 4. Contaminated records are excluded from empirical calculations
// ============================================================================
test("4. Contaminated records are excluded from empirical calculations", () => {
  const empiricalRecords = loadEmpiricalDailyStatistics();
  for (const r of empiricalRecords) {
    assert.equal(r.usable_for_empirical_analysis, true);
    assert.equal(r.epistemic_classification, "TRUTHFUL_EMPIRICAL");
  }

  // On 2026-09-03, contaminated record has 5,760 synthetic views.
  // Empirical record must have 3 real GA4 views.
  const sep3Empirical = empiricalRecords.find((r) => r.date === "2026-09-03");
  assert.ok(sep3Empirical);
  assert.equal(sep3Empirical.ga4.screen_page_views, 3);
  assert.notEqual(sep3Empirical.ga4.screen_page_views, 5760);
});

// ============================================================================
// 5. Reconstructed empirical history is stored with full provenance
// ============================================================================
test("5. Reconstructed empirical history is stored with full provenance", () => {
  const reconPath = path.resolve("intelligence/project/historical_measurement_reconstruction.json");
  assert.ok(fs.existsSync(reconPath), "historical_measurement_reconstruction.json must exist");

  const doc = JSON.parse(fs.readFileSync(reconPath, "utf-8"));
  assert.ok(doc.provenance_statement, "Must contain provenance_statement");
  assert.equal(doc.ga4_source.property_id, "551527574");
  assert.equal(doc.gsc_source.site_url, "sc-domain:utl.tools");
  assert.ok(doc.extracted_at);
  assert.ok(doc.first_seven_days_summary);
});

// ============================================================================
// 6. Day-1 of production operations is correctly identified (2026-08-25)
// ============================================================================
test("6. Day-1 of production operations is correctly identified (2026-08-25)", () => {
  assert.equal(PRODUCTION_TIMELINE.production_start_date, "2026-08-25");
  assert.equal(PRODUCTION_TIMELINE.ga4_measurement_start_date, "2026-08-25");
  assert.equal(PRODUCTION_TIMELINE.initial_commit_sha, "28360e6");

  const empirical = loadEmpiricalDailyStatistics();
  assert.equal(empirical[0].date, "2026-08-25");
});

// ============================================================================
// 7. Day-7 of production operations is correctly identified (2026-08-31)
// ============================================================================
test("7. Day-7 of production operations is correctly identified (2026-08-31)", () => {
  const firstSeven = getFirstSevenDaysSummary();
  assert.equal(firstSeven.window.start_date, "2026-08-25");
  assert.equal(firstSeven.window.end_date, "2026-08-31");
  assert.equal(firstSeven.window.days_count, 7);

  assert.equal(firstSeven.totals.total_sessions, 84);
  assert.equal(firstSeven.totals.total_page_views, 139);
  assert.equal(firstSeven.totals.total_search_impressions, 532);
  assert.equal(firstSeven.totals.total_search_clicks, 0);
});

// ============================================================================
// 8. Day-over-day changes calculate correctly and exclude contaminated records
// ============================================================================
test("8. Day-over-day changes calculate correctly and exclude contaminated records", () => {
  // Day 1 (13 sessions) to Day 2 (34 sessions)
  const c1 = calculateChange(34, 13);
  assert.equal(c1.change, 21);
  assert.equal(c1.pct_change, 161.54);

  // Day 2 (34 sessions) to Day 3 (19 sessions)
  const c2 = calculateChange(19, 34);
  assert.equal(c2.change, -15);
  assert.equal(c2.pct_change, -44.12);

  const timeline = buildReconstructedEmpiricalProgression();
  const day2Record = timeline.find((r) => r.date === "2026-08-26");
  assert.equal(day2Record.day_over_day_changes.ga4_sessions.change, 21);
  assert.equal(day2Record.day_over_day_changes.ga4_sessions.pct_change, 161.54);
});

// ============================================================================
// 9. Percentage changes are reported as null when the previous day's value was 0
// ============================================================================
test("9. Percentage changes are reported as null when previous day value was 0", () => {
  const cZeroPrev = calculateChange(21, 0);
  assert.equal(cZeroPrev.change, 21);
  assert.equal(cZeroPrev.pct_change, null, "pct_change must be null when previous value is 0");

  const cBothZero = calculateChange(0, 0);
  assert.equal(cBothZero.change, 0);
  assert.equal(cBothZero.pct_change, null, "pct_change must be null when previous value is 0");

  const cNullPrev = calculateChange(10, null);
  assert.equal(cNullPrev.change, null);
  assert.equal(cNullPrev.pct_change, null);
});

// ============================================================================
// 10. Monthly traffic aggregation uses only empirical records
// ============================================================================
test("10. Monthly traffic aggregation uses only empirical records", () => {
  const monthly = getMonthlyStatistics("2026-09");
  assert.ok(monthly.month_to_date_metrics);

  // Excludes contaminated records
  assert.equal(monthly.contaminated_days_excluded, 3);
  assert.ok(monthly.month_to_date_metrics.ga4.page_views > 0);
  // Synthetic view count on 2026-09-03 was 5760; verify it did NOT enter monthly sum
  assert.ok(monthly.month_to_date_metrics.ga4.page_views < 5000);
});

// ============================================================================
// 11. Monthly unique users are never calculated by summing daily active users
// ============================================================================
test("11. Monthly unique users are never calculated by summing daily active users", () => {
  const monthly = getMonthlyStatistics("2026-09");
  const mData = monthly.month_to_date_metrics.ga4;

  assert.ok(mData.daily_active_users_summed_label.includes("Daily Active-User Observations (Summed)"));
  assert.ok(mData.monthly_unique_users_note.includes("daily active users must not be described as unique monthly users"));

  // monthly_unique_users is either null (offline/unauthenticated) or from authoritative monthly query
  if (mData.monthly_unique_users !== null) {
    assert.equal(typeof mData.monthly_unique_users, "number");
    assert.equal(mData.monthly_unique_users, 10);
  }
});

// ============================================================================
// 12. Sessions are explicitly distinguished from users
// ============================================================================
test("12. Sessions are explicitly distinguished from users", () => {
  const empirical = loadEmpiricalDailyStatistics();
  const day1 = empirical.find((r) => r.date === "2026-08-25");
  assert.notEqual(day1.ga4.active_users, day1.ga4.sessions);
  assert.equal(day1.ga4.active_users, 12);
  assert.equal(day1.ga4.sessions, 13);

  const day2 = empirical.find((r) => r.date === "2026-08-26");
  assert.notEqual(day2.ga4.active_users, day2.ga4.sessions);
  assert.equal(day2.ga4.active_users, 32);
  assert.equal(day2.ga4.sessions, 34);

  // Visits proxy is explicitly sessions, not users
  assert.equal(day1.ga4.visits_proxy, day1.ga4.sessions);
});

// ============================================================================
// 13. Search impressions are explicitly distinguished from visits
// ============================================================================
test("13. Search impressions are explicitly distinguished from visits", () => {
  const firstSeven = getFirstSevenDaysSummary();
  assert.equal(firstSeven.totals.total_search_impressions, 532);
  assert.equal(firstSeven.totals.total_sessions, 84);
  assert.notEqual(firstSeven.totals.total_search_impressions, firstSeven.totals.total_sessions);

  // GSC clicks was 0; zero search clicks arrived even with 532 impressions
  assert.equal(firstSeven.totals.total_search_clicks, 0);
});

// ============================================================================
// 14. 1,000 monthly visits internal target is never represented as Google requirement
// ============================================================================
test("14. 1,000 monthly visits internal target is never represented as Google requirement", () => {
  const readiness = evaluateAdSenseReadiness({ sessions: 10, users: 10, page_views: 13 });
  const sessionTarget = readiness.internal_business_targets.find((t) => t.target_id === "TARGET-SESSIONS");

  assert.ok(sessionTarget, "TARGET-SESSIONS must exist");
  assert.equal(sessionTarget.target_value, 1000);
  assert.ok(["INTERNAL_TARGET", "INTERNAL_BUSINESS_TARGET"].includes(sessionTarget.classification));
  assert.equal(sessionTarget.is_google_requirement, false);
  assert.ok(
    sessionTarget.policy_status.includes("NOT_A_GOOGLE_REQUIREMENT") ||
    sessionTarget.policy_status.includes("NOT a Google AdSense policy requirement")
  );

  for (const t of readiness.internal_business_targets) {
    assert.equal(t.is_google_requirement, false);
  }
});

// ============================================================================
// 15. No fake AdSense readiness probability exists
// ============================================================================
test("15. No fake AdSense readiness probability exists", () => {
  const readiness = evaluateAdSenseReadiness({ sessions: 50, users: 40, page_views: 100 });

  assert.ok(["NOT_READY", "READY_FOR_REVIEW"].includes(readiness.overall_readiness_state));
  assert.equal(readiness.probability, undefined, "No probability field permitted");
  assert.equal(readiness.approval_probability, undefined, "No approval_probability permitted");
  assert.equal(readiness.score_percentage, undefined, "No fake score percentage permitted");

  const readinessJson = JSON.stringify(readiness);
  assert.equal(/\b\d+%\s*(approval|readiness|probability)/i.test(readinessJson), false);
});

// ============================================================================
// 16. Persistent telemetry data survives separate serverless function invocations
// ============================================================================
test("16. Persistent telemetry data survives separate cold starts (disk round-trip)", async () => {
  const testStoreDir = path.resolve("control/test_scratch_telemetry");
  const testStorePath = path.join(testStoreDir, "test_events.json");

  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
  if (!fs.existsSync(testStoreDir)) fs.mkdirSync(testStoreDir, { recursive: true });

  // Instance 1 writes
  const store1 = new PersistentTelemetryStore({
    storePath: testStorePath,
  });

  const res = await store1.recordEvent({
    event_id: "evt-cold-start-001",
    event_type: "utility_view",
    source: "web-client",
    timestamp: new Date().toISOString(),
    utility_id: "json-formatter",
    session_id: "sess-abc",
  });
  assert.equal(res.recorded, true);

  // Instance 2 reads (simulating process restart / cold start)
  const store2 = new PersistentTelemetryStore({
    storePath: testStorePath,
  });

  const events = await store2.loadEvents();
  assert.equal(events.length, 1);
  assert.equal(events[0].event_id, "evt-cold-start-001");
  assert.equal(events[0].utility_id, "json-formatter");

  // Clean up test file
  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
});

// ============================================================================
// 17. Telemetry deduplication correctly prevents double-counting identical event_ids
// ============================================================================
test("17. Telemetry deduplication correctly prevents double-counting identical event_ids", async () => {
  const testStoreDir = path.resolve("control/test_scratch_telemetry");
  const testStorePath = path.join(testStoreDir, "test_dedup_events.json");
  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);

  const store = new PersistentTelemetryStore({ storePath: testStorePath });

  const ev1 = {
    event_id: "evt-dedup-001",
    event_type: "tool_execution",
    source: "web-client",
    timestamp: new Date().toISOString(),
    utility_id: "uuid-generator",
  };

  const res1 = await store.recordEvent(ev1);
  assert.equal(res1.recorded, true);

  const res2 = await store.recordEvent(ev1);
  assert.equal(res2.recorded, false);
  assert.equal(res2.duplicate, true);

  const loaded = await store.loadEvents();
  assert.equal(loaded.length, 1);

  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
});

// ============================================================================
// 18. Forbidden telemetry fields are rejected
// ============================================================================
test("18. Forbidden telemetry fields are rejected", async () => {
  const testStoreDir = path.resolve("control/test_scratch_telemetry");
  const testStorePath = path.join(testStoreDir, "test_forbidden_events.json");
  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);

  const store = new PersistentTelemetryStore({ storePath: testStorePath });

  for (const forbiddenKey of FORBIDDEN_KEYS) {
    const badPayload = {
      event_id: `evt-forbidden-${forbiddenKey}`,
      event_type: "tool_execution",
      source: "web-client",
      timestamp: new Date().toISOString(),
      utility_id: "sql-formatter",
      [forbiddenKey]: "sensitive-user-content-must-be-rejected",
    };

    const res = await store.recordEvent(badPayload);
    assert.equal(res.recorded, false, `Field ${forbiddenKey} must be rejected`);
    assert.ok(res.error.includes("Forbidden key") || res.error.includes("Privacy violation"));
  }

  const events = await store.loadEvents();
  assert.equal(events.length, 0, "No events with forbidden fields should be persisted");

  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
});

// ============================================================================
// 19. No sensitive payload data is persisted
// ============================================================================
test("19. No sensitive payload data is persisted", async () => {
  const testStoreDir = path.resolve("control/test_scratch_telemetry");
  const testStorePath = path.join(testStoreDir, "test_safe_events.json");
  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);

  const store = new PersistentTelemetryStore({ storePath: testStorePath });

  const safeEvent = {
    event_id: "evt-safe-999",
    event_type: "utility_view",
    source: "web-client",
    timestamp: new Date().toISOString(),
    utility_id: "color-picker",
    session_id: "sess-safe-123",
  };

  const res = await store.recordEvent(safeEvent);
  assert.equal(res.recorded, true);

  const events = await store.loadEvents();
  const persisted = events[0];
  assert.ok(persisted);

  for (const key of Object.keys(persisted)) {
    assert.equal(FORBIDDEN_KEYS.includes(key), false, `Persisted key ${key} must not be in FORBIDDEN_KEYS`);
  }

  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
});

// ============================================================================
// 20. Utility-level aggregates originate from actual telemetry events
// ============================================================================
test("20. Utility-level aggregates originate from actual telemetry events, not catalog size", async () => {
  const testStoreDir = path.resolve("control/test_scratch_telemetry");
  const testStorePath = path.join(testStoreDir, "test_agg_events.json");
  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);

  const store = new PersistentTelemetryStore({ storePath: testStorePath });

  await store.recordEvent({ event_id: "e1", event_type: "utility_view", source: "web-client", timestamp: new Date().toISOString(), utility_id: "tool-a" });
  await store.recordEvent({ event_id: "e2", event_type: "utility_view", source: "web-client", timestamp: new Date().toISOString(), utility_id: "tool-a" });
  await store.recordEvent({ event_id: "e3", event_type: "tool_execution", source: "web-client", timestamp: new Date().toISOString(), utility_id: "tool-a" });
  await store.recordEvent({ event_id: "e4", event_type: "utility_view", source: "web-client", timestamp: new Date().toISOString(), utility_id: "tool-b" });

  const aggs = await store.getUtilityAggregates();
  const toolA = aggs.find((a) => a.utility_id === "tool-a");
  const toolB = aggs.find((a) => a.utility_id === "tool-b");

  assert.ok(toolA);
  assert.equal(toolA.views, 2);
  assert.equal(toolA.executions, 1);
  assert.equal(toolA.execution_rate_percentage, 50.0);

  assert.ok(toolB);
  assert.equal(toolB.views, 1);
  assert.equal(toolB.executions, 0);

  // Top utilities
  const top = await store.getTopUtilities(2);
  assert.equal(top[0].utility_id, "tool-a");
  assert.equal(top[0].views, 2);

  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
});

// ============================================================================
// 21. Historical reconstruction is deterministic
// ============================================================================
test("21. Historical reconstruction is deterministic", async () => {
  const res1 = await runHistoricalReconstruction();
  const res2 = await runHistoricalReconstruction();

  assert.equal(res1.empiricalDailyRecords.length, res2.empiricalDailyRecords.length);
  assert.equal(
    res1.reconstructionArtifact.first_seven_days_summary.totals.total_sessions,
    res2.reconstructionArtifact.first_seven_days_summary.totals.total_sessions
  );
  assert.equal(
    res1.reconstructionArtifact.first_seven_days_summary.totals.total_page_views,
    res2.reconstructionArtifact.first_seven_days_summary.totals.total_page_views
  );
  assert.equal(
    res1.reconstructionArtifact.first_seven_days_summary.totals.total_search_impressions,
    res2.reconstructionArtifact.first_seven_days_summary.totals.total_search_impressions
  );
});

// ============================================================================
// 22. Statistics remain truthful when a provider becomes unavailable
// ============================================================================
test("22. Statistics remain truthful when a provider becomes unavailable", () => {
  const liveStats = getLiveStatistics();
  const monthlyStats = getMonthlyStatistics("2026-09");
  const empirical = loadEmpiricalDailyStatistics();

  // First party telemetry views on edge are unavailable
  assert.equal(liveStats.current_day.first_party_utility_views, null);
  assert.equal(monthlyStats.month_to_date_metrics.telemetry.utility_views, null);
  assert.notEqual(liveStats.current_day.first_party_utility_views, 0);

  // In empirical daily series, telemetry status is UNAVAILABLE
  assert.equal(empirical[0].telemetry.status, "UNAVAILABLE");
  assert.equal(empirical[0].telemetry.utility_views, null);
  assert.equal(empirical[0].telemetry.tool_executions, null);
});
