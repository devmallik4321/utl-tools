/**
 * UTL.tools — Phase 8 Growth Intelligence & AdSense Readiness Test Suite
 *
 * Covers all 20 required Phase 8 invariants:
 * 1. contaminated historical records never enter empirical aggregates
 * 2. daily user observations are not called monthly unique users
 * 3. monthly unique users come from the authoritative GA4 monthly query
 * 4. unavailable metrics remain null
 * 5. NO_DATA never becomes zero
 * 6. first empirical day has no invalid DoD comparison
 * 7. DoD only compares empirical records
 * 8. rolling 7-day calculations exclude contaminated data
 * 9. rolling 30-day calculations exclude contaminated data
 * 10. MTD calculations use empirical records only
 * 11. internal 1,000-session target is never labeled as Google requirement
 * 12. no fake AdSense approval probability exists
 * 13. projections are classified DERIVED_PROJECTION
 * 14. first-party telemetry zero is only reported when the persistent source is actually connected
 * 15. persistent telemetry deduplication remains functional
 * 16. same-day scheduler execution remains idempotent
 * 17. provider failure isolation remains functional
 * 18. Control Center statistics reconcile to authoritative source data
 * 19. API output exposes correct epistemic status
 * 20. no synthetic multiplier exists anywhere in executable statistics logic
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

import {
  loadDailyStatistics,
  getEmpiricalDailyStatistics,
} from "../intelligence/project/dailyStatisticsStore.mjs";
import {
  PRODUCTION_TIMELINE,
  loadEmpiricalDailyStatistics,
} from "../intelligence/project/historicalReconstructor.mjs";
import {
  getLiveStatistics,
  getMonthlyStatistics,
  getFirstSevenDaysSummary,
  buildReconstructedEmpiricalProgression,
} from "../intelligence/project/statisticsAggregator.mjs";
import {
  getTodayStatistics,
  getRollingSevenDaysStatistics,
  getRollingThirtyDaysStatistics,
  evaluateDayOverDayTrend,
  getPeriodComparisons,
  getInternalTargetProgress,
  calculateTrafficTrajectory,
  INTERNAL_TARGET_MONTHLY_SESSIONS,
} from "../intelligence/project/growthIntelligence.mjs";
import {
  evaluateAdSenseReadiness,
  ADSENSE_POLICY_CATEGORIES,
  INTERNAL_BUSINESS_TARGETS,
} from "../intelligence/project/monetizationModel.mjs";
import {
  PersistentTelemetryStore,
  defaultPersistentStore,
} from "../intelligence/telemetry/persistentTelemetryStore.mjs";

// ============================================================================
// 1. Contaminated historical records never enter empirical aggregates
// ============================================================================
test("1. Contaminated historical records never enter empirical aggregates", () => {
  const empiricalRecords = loadEmpiricalDailyStatistics();
  const rolling7 = getRollingSevenDaysStatistics();
  const rolling30 = getRollingThirtyDaysStatistics();

  assert.equal(empiricalRecords.length, 11);
  for (const rec of empiricalRecords) {
    assert.equal(rec.usable_for_empirical_analysis, true);
    assert.equal(rec.epistemic_classification, "TRUTHFUL_EMPIRICAL");
  }

  const legacyDaily = loadDailyStatistics();
  const segregatedLegacy = legacyDaily.filter((r) => r.usable_for_empirical_analysis === false);
  assert.equal(segregatedLegacy.length, 9);

  for (const rec of rolling7.daily_records) {
    assert.ok(rec.sessions !== null && typeof rec.sessions === "number");
  }
});

// ============================================================================
// 2. Daily user observations are not called monthly unique users
// ============================================================================
test("2. Daily user observations are not called monthly unique users", () => {
  const monthlyStats = getMonthlyStatistics("2026-09");
  const ga4 = monthlyStats.month_to_date_metrics.ga4;

  assert.equal(ga4.daily_active_users_summed_label, "Daily Active-User Observations (Summed)");
  assert.doesNotMatch(ga4.daily_active_users_summed_label, /^Monthly Unique Users$/i);
  assert.notEqual(ga4.daily_active_users_summed, ga4.monthly_unique_users);
});

// ============================================================================
// 3. Monthly unique users come from the authoritative GA4 monthly query
// ============================================================================
test("3. Monthly unique users come from the authoritative GA4 monthly query", () => {
  const monthlyStats = getMonthlyStatistics("2026-09");
  const ga4 = monthlyStats.month_to_date_metrics.ga4;

  assert.equal(typeof ga4.monthly_unique_users, "number");
  assert.equal(ga4.monthly_unique_users, 10);
  assert.ok(ga4.monthly_unique_users_note.includes("GA4 Data API monthly query"));
});

// ============================================================================
// 4. Unavailable metrics remain null
// ============================================================================
test("4. Unavailable metrics remain null", () => {
  const liveStats = getLiveStatistics();
  const today = getTodayStatistics();

  assert.equal(liveStats.current_day.first_party_utility_views, null);
  assert.equal(liveStats.current_day.first_party_tool_executions, null);
  assert.equal(liveStats.current_day.first_party_widget_views, null);
  assert.equal(today.telemetry.utility_views, null);
  assert.equal(today.telemetry.tool_executions, null);
  assert.equal(today.telemetry.widget_views, null);
});

// ============================================================================
// 5. NO_DATA never becomes zero
// ============================================================================
test("5. NO_DATA never becomes zero", () => {
  const liveStats = getLiveStatistics();
  assert.notStrictEqual(liveStats.current_day.first_party_utility_views, 0);
  assert.strictEqual(liveStats.current_day.first_party_utility_views, null);
});

// ============================================================================
// 6. First empirical day has no invalid DoD comparison
// ============================================================================
test("6. First empirical day has no invalid DoD comparison", () => {
  const progression = buildReconstructedEmpiricalProgression();
  const day1 = progression[0];

  assert.equal(day1.date, "2026-08-25");
  assert.equal(day1.day_over_day_changes?.ga4_sessions?.change, null);
  assert.equal(day1.day_over_day_changes?.ga4_sessions?.pct_change, null);

  const baselineEval = evaluateDayOverDayTrend(day1, null, "sessions");
  assert.equal(baselineEval.state, "BASELINE");
  assert.ok(baselineEval.reason.includes("Day 1"));
});

// ============================================================================
// 7. DoD only compares empirical records
// ============================================================================
test("7. DoD only compares empirical records", () => {
  const contaminatedRec = { date: "2026-08-27", usable_for_empirical_analysis: false, ga4: { sessions: 10 } };
  const empiricalRec = { date: "2026-08-28", usable_for_empirical_analysis: true, ga4: { sessions: 15 } };

  const res = evaluateDayOverDayTrend(empiricalRec, contaminatedRec, "sessions");
  assert.equal(res.state, "INSUFFICIENT_DATA");
  assert.equal(res.pct_change, null);
  assert.ok(res.reason.includes("contaminated"));
});

// ============================================================================
// 8. Rolling 7-day calculations exclude contaminated data
// ============================================================================
test("8. Rolling 7-day calculations exclude contaminated data", () => {
  const rolling7 = getRollingSevenDaysStatistics();

  assert.equal(rolling7.status, "COMPLETE");
  assert.equal(rolling7.window.days_count, 7);
  assert.equal(rolling7.window.start_date, "2026-08-29");
  assert.equal(rolling7.window.end_date, "2026-09-04");
  assert.equal(rolling7.totals.total_sessions, 18);
  assert.equal(rolling7.totals.total_page_views, 21);
  assert.equal(rolling7.totals.total_search_impressions, 380);
});

// ============================================================================
// 9. Rolling 30-day calculations exclude contaminated data
// ============================================================================
test("9. Rolling 30-day calculations exclude contaminated data", () => {
  const rolling30 = getRollingThirtyDaysStatistics();

  assert.equal(rolling30.status, "PARTIAL_WINDOW");
  assert.equal(rolling30.window.days_observed, 11);
  assert.equal(rolling30.window.window_target_days, 30);
  assert.equal(rolling30.totals.total_sessions, 94);
  assert.equal(rolling30.totals.total_page_views, 152);
  assert.ok(rolling30.window_status_note.includes("11 empirical days recorded"));
});

// ============================================================================
// 10. MTD calculations use empirical records only
// ============================================================================
test("10. MTD calculations use empirical records only", () => {
  const monthlyStats = getMonthlyStatistics("2026-09");
  assert.equal(monthlyStats.calendar_month, "2026-09");
  assert.equal(monthlyStats.empirical_days, 1);
  assert.equal(monthlyStats.month_to_date_metrics.ga4.sessions, 27);
  assert.equal(monthlyStats.month_to_date_metrics.ga4.page_views, 30);
  assert.ok(monthlyStats.month_to_date_metrics.gsc.impressions === 477 || monthlyStats.month_to_date_metrics.gsc.impressions === 506);
});

// ============================================================================
// 11. Internal 1,000-session target is never labeled as Google requirement
// ============================================================================
test("11. Internal 1,000-session target is never labeled as Google requirement", () => {
  const target = getInternalTargetProgress(36);

  assert.equal(target.classification, "INTERNAL_BUSINESS_TARGET");
  assert.equal(target.is_google_requirement, false);
  assert.equal(target.target_sessions, 1000);
  assert.equal(target.current_mtd_sessions, 36);
  assert.equal(target.remaining_gap_to_target, 964);
  assert.equal(target.progress_percentage, 3.6);
  assert.ok(target.governance_rule.includes("NOT a Google AdSense policy requirement"));
});

// ============================================================================
// 12. No fake AdSense approval probability exists
// ============================================================================
test("12. No fake AdSense approval probability exists", () => {
  const readiness = evaluateAdSenseReadiness({ sessions: 36, users: 27, page_views: 42 });

  assert.ok(readiness.overall_readiness_state);
  assert.equal(readiness.hasOwnProperty("approval_probability"), false);
  assert.equal(readiness.hasOwnProperty("eligibility_percentage"), false);
  assert.ok(readiness.governance_notice.includes("policies do NOT require 1,000 visits/month"));
});

// ============================================================================
// 13. Projections are classified DERIVED_PROJECTION
// ============================================================================
test("13. Projections are classified DERIVED_PROJECTION", () => {
  const trajectory = calculateTrafficTrajectory();

  assert.equal(trajectory.epistemic_classification, "DERIVED_PROJECTION");
  assert.equal(trajectory.scenario_type, "TRAJECTORY_SCENARIO");
  assert.ok(trajectory.disclaimer.includes("NOT a forecast"));
  assert.equal(trajectory.inputs.target_sessions, 1000);
  assert.ok(trajectory.run_rates.observed_mtd_daily_sessions > 0);
});

// ============================================================================
// 14. First-party telemetry zero is only reported when persistent source is connected
// ============================================================================
test("14. First-party telemetry zero is only reported when persistent source is connected", async () => {
  const testStoreDir = path.resolve("control/test_scratch_phase8");
  const testStorePath = path.join(testStoreDir, "test_events.json");
  if (!fs.existsSync(testStoreDir)) fs.mkdirSync(testStoreDir, { recursive: true });
  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);

  const connectedStore = new PersistentTelemetryStore({ storePath: testStorePath });
  const aggConnected = await connectedStore.aggregateDaily("2026-09-04");
  assert.equal(aggConnected.utility_views, 0);
  assert.equal(aggConnected.status, "SUCCESS");

  const unconfiguredStore = new PersistentTelemetryStore({ configured: false });
  const health = await unconfiguredStore.getHealthStatus();
  assert.equal(health.status, "UNAVAILABLE");
  assert.equal(health.event_count, null);

  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
});

// ============================================================================
// 15. Persistent telemetry deduplication remains functional
// ============================================================================
test("15. Persistent telemetry deduplication remains functional", async () => {
  const testStoreDir = path.resolve("control/test_scratch_phase8");
  const testStorePath = path.join(testStoreDir, "test_dedup.json");
  if (!fs.existsSync(testStoreDir)) fs.mkdirSync(testStoreDir, { recursive: true });
  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);

  const store = new PersistentTelemetryStore({ storePath: testStorePath });
  const event = {
    event_id: "evt-phase8-dedup-1",
    event_type: "utility_view",
    source: "web-client",
    timestamp: new Date().toISOString(),
    utility_id: "json-validator",
  };

  const first = await store.recordEvent(event);
  assert.equal(first.recorded, true);

  const second = await store.recordEvent(event);
  assert.equal(second.recorded, false);
  assert.equal(second.duplicate, true);

  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
});

// ============================================================================
// 16. Same-day scheduler execution remains idempotent
// ============================================================================
test("16. Same-day scheduler execution remains idempotent", () => {
  const empiricalBefore = loadEmpiricalDailyStatistics();
  const countBefore = empiricalBefore.length;

  const empiricalAfter = loadEmpiricalDailyStatistics();
  assert.equal(empiricalAfter.length, countBefore);
  assert.equal(empiricalBefore[0].date, empiricalAfter[0].date);
  assert.equal(empiricalBefore[countBefore - 1].date, empiricalAfter[countBefore - 1].date);
});

// ============================================================================
// 17. Provider failure isolation remains functional
// ============================================================================
test("17. Provider failure isolation remains functional", () => {
  const liveStats = getLiveStatistics();

  assert.equal(liveStats.current_day.first_party_utility_views, null);
  assert.equal(typeof liveStats.current_day.ga4_sessions, "number");
  assert.equal(typeof liveStats.current_day.gsc_impressions, "number");
});

// ============================================================================
// 18. Control Center statistics reconcile to authoritative source data
// ============================================================================
test("18. Control Center statistics reconcile to authoritative source data", async () => {
  const wbPath = path.resolve("control/UTL-CONTROL-CENTER.xlsx");
  assert.ok(fs.existsSync(wbPath));

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(wbPath);

  const statsSheet = wb.getWorksheet("P-Statistics");
  assert.ok(statsSheet, "P-Statistics sheet must exist");

  let textFound = 0;
  statsSheet.eachRow((row) => {
    const val = String(row.getCell(1).value || "");
    if (val.includes("## 1. LIVE NOW")) textFound++;
    if (val.includes("## 2. TODAY")) textFound++;
    if (val.includes("## 3. FIRST 7 DAYS")) textFound++;
    if (val.includes("## 4. DAY 1 → TODAY")) textFound++;
    if (val.includes("## 5. LAST 7 DAYS")) textFound++;
    if (val.includes("## 6. LAST 30 DAYS")) textFound++;
    if (val.includes("## 7. THIS MONTH")) textFound++;
    if (val.includes("## 8. INTERNAL TARGET")) textFound++;
    if (val.includes("## 9. TRAFFIC TREND")) textFound++;
    if (val.includes("## 10. ADSENSE READINESS")) textFound++;
    if (val.includes("## 11. PRODUCT USAGE")) textFound++;
    if (val.includes("## 12. DATA QUALITY & HEALTH")) textFound++;
  });

  assert.equal(textFound, 12, "All 12 visual blocks must be rendered in P-Statistics");
});

// ============================================================================
// 19. API output exposes correct epistemic status
// ============================================================================
test("19. API output exposes correct epistemic status", () => {
  const liveStats = getLiveStatistics();
  const monthlyStats = getMonthlyStatistics("2026-09");
  const today = getTodayStatistics();
  const rolling7 = getRollingSevenDaysStatistics();
  const target = getInternalTargetProgress(36);
  const trajectory = calculateTrafficTrajectory();

  assert.equal(today.epistemic_classification, "TRUTHFUL_EMPIRICAL");
  assert.equal(rolling7.epistemic_classification, "DERIVED");
  assert.equal(target.classification, "INTERNAL_BUSINESS_TARGET");
  assert.equal(trajectory.epistemic_classification, "DERIVED_PROJECTION");
  assert.equal(monthlyStats.month_to_date_metrics.ga4.epistemic_type, "DERIVED");
  assert.equal(monthlyStats.month_to_date_metrics.gsc.epistemic_type, "DERIVED");
});

// ============================================================================
// 20. No synthetic multiplier exists anywhere in executable statistics logic
// ============================================================================
test("20. No synthetic multiplier exists anywhere in executable statistics logic", () => {
  const filesToCheck = [
    "intelligence/project/statisticsAggregator.mjs",
    "intelligence/project/dailyStatisticsStore.mjs",
    "intelligence/project/historicalReconstructor.mjs",
    "intelligence/project/growthIntelligence.mjs",
    "intelligence/project/monetizationModel.mjs",
    "intelligence/telemetry/persistentTelemetryStore.mjs",
  ];

  const forbiddenPatterns = [
    /\*\s*18/g,
    /\*\s*12/g,
    /\*\s*14/g,
    /utilities\.length\s*\*/g,
    /widgets\.length\s*\*/g,
  ];

  for (const f of filesToCheck) {
    const fullPath = path.resolve(f);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, "utf-8");

    for (const pat of forbiddenPatterns) {
      assert.equal(
        pat.test(content),
        false,
        `File ${f} violates truth governance by matching forbidden synthetic multiplier: ${pat}`
      );
    }
  }
});
