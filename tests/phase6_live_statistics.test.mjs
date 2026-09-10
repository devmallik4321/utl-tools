import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
  getLiveStatistics,
  getMonthlyStatistics,
  calculateChange,
  buildDailyProgression,
  generateStatisticsArtifacts,
} from "../intelligence/project/statisticsAggregator.mjs";
import { loadDailyStatistics, getEmpiricalDailyStatistics } from "../intelligence/project/dailyStatisticsStore.mjs";
import { TelemetryStore } from "../intelligence/telemetry/telemetryStore.mjs";

const ROOT_DIR = process.cwd();

// ============================================================================
// 1. Current day is represented correctly
// ============================================================================
test("1. Current day is represented correctly", () => {
  const liveStats = getLiveStatistics();
  assert.ok(liveStats.current_day, "current_day must exist");
  assert.equal(liveStats.current_day.date, "2026-09-04");
  assert.ok(liveStats.current_day.collection_timestamp);
  assert.equal(liveStats.current_day.epistemic_classification, "TRUTHFUL_EMPIRICAL");
  assert.equal(liveStats.current_day.ga4_active_users, 27);
  assert.equal(liveStats.current_day.ga4_sessions, 27);
  assert.equal(liveStats.current_day.ga4_screen_page_views, 30);
  assert.ok(liveStats.current_day.gsc_impressions === 477 || liveStats.current_day.gsc_impressions === 506);
  assert.equal(liveStats.current_day.gsc_clicks, 0);
});

// ============================================================================
// 2. Contaminated records are excluded from empirical calculations
// ============================================================================
test("2. Contaminated records are excluded from empirical calculations", () => {
  const allRecords = loadDailyStatistics();
  const contaminated = allRecords.filter((r) => r.usable_for_empirical_analysis === false);
  assert.equal(contaminated.length, 9, "Must have exactly 9 contaminated historical records");

  for (const r of contaminated) {
    assert.equal(r.epistemic_classification, "SYNTHETIC_CONTAMINATED");
    assert.equal(r.usable_for_empirical_analysis, false);
    assert.ok(r.contamination_reason);
  }

  const monthlyStats = getMonthlyStatistics("2026-09");
  assert.equal(monthlyStats.contaminated_days_excluded, 3, "September has 3 contaminated days (09-01, 09-02, 09-03)");

  // Assert synthetic multiplier views (e.g. 5760 on 2026-09-03) did NOT leak into monthly views
  assert.notEqual(monthlyStats.month_to_date_metrics.ga4.page_views, 5760 + 30);
  assert.equal(monthlyStats.month_to_date_metrics.ga4.page_views, 30);
});

// ============================================================================
// 3. September 4 is recognized as the first empirical baseline
// ============================================================================
test("3. September 4 is recognized as the first empirical baseline", () => {
  const liveStats = getLiveStatistics();
  const monthlyStats = getMonthlyStatistics("2026-09");

  assert.equal(liveStats.empirical_baseline_start, "2026-09-04");
  assert.equal(monthlyStats.empirical_start_date, "2026-09-04");

  const empirical = liveStats.daily_series.filter((r) => r.usable_for_empirical_analysis === true);
  assert.ok(empirical.length >= 1);
  assert.equal(empirical[0].date, "2026-09-04");
});

// ============================================================================
// 4. Unavailable values remain null
// ============================================================================
test("4. Unavailable values remain null", () => {
  const monthlyStats = getMonthlyStatistics("2026-09");
  const liveStats = getLiveStatistics();

  assert.equal(liveStats.current_day.first_party_utility_views, null);
  assert.equal(liveStats.current_day.first_party_tool_executions, null);
  assert.equal(liveStats.current_day.first_party_widget_views, null);

  assert.equal(monthlyStats.month_to_date_metrics.telemetry.utility_views, null);
  assert.equal(monthlyStats.month_to_date_metrics.telemetry.tool_executions, null);
  assert.equal(monthlyStats.month_to_date_metrics.telemetry.widget_views, null);
});

// ============================================================================
// 5. Zero-event connected telemetry remains zero
// ============================================================================
test("5. Zero-event connected telemetry remains zero", () => {
  const testStore = new TelemetryStore({ configured: true });
  const health = testStore.getHealthStatus();
  assert.equal(health.status, "ACTIVE");
  assert.equal(health.healthy, true);

  const diag = testStore.getOperationalDiagnostics();
  assert.equal(diag.events_received, 0);
  assert.equal(diag.events_accepted, 0);

  const agg = testStore.aggregateDailyTelemetry("2026-09-04");
  assert.equal(agg.status, "SUCCESS");
  assert.equal(agg.total_events, 0);
  assert.equal(agg.utility_views, 0);
  assert.equal(agg.tool_executions, 0);
});

// ============================================================================
// 6. No inventory-to-usage multiplier exists
// ============================================================================
test("6. No inventory-to-usage multiplier exists", () => {
  const filesToCheck = [
    "intelligence/project/statisticsAggregator.mjs",
    "intelligence/project/dailyStatisticsStore.mjs",
    "intelligence/project/adapters/UtlTelemetryAdapter.mjs",
    "scripts/generate_system_metrics.mjs",
  ];

  for (const relPath of filesToCheck) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      const code = fs.readFileSync(fullPath, "utf-8");
      assert.doesNotMatch(code, /utilities\.length\s*\*\s*18/, `Forbidden multiplier in ${relPath}`);
      assert.doesNotMatch(code, /utilities\.length\s*\*\s*12/, `Forbidden multiplier in ${relPath}`);
      assert.doesNotMatch(code, /widgets\.length\s*\*\s*14/, `Forbidden multiplier in ${relPath}`);
      assert.doesNotMatch(code, /utilsCount\s*\*\s*18/, `Forbidden multiplier in ${relPath}`);
    }
  }
});

// ============================================================================
// 7. Monthly aggregation only uses empirical records
// ============================================================================
test("7. Monthly aggregation only uses empirical records", () => {
  const monthlyStats = getMonthlyStatistics("2026-09");
  const empiricalSeptember = getEmpiricalDailyStatistics().filter((r) => r.date.startsWith("2026-09"));

  const expectedViews = empiricalSeptember.reduce((acc, r) => acc + (r.ga4_screen_page_views || 0), 0);
  const expectedImpr = empiricalSeptember.reduce((acc, r) => acc + (r.gsc_impressions || 0), 0);

  assert.equal(monthlyStats.month_to_date_metrics.ga4.page_views, expectedViews);
  assert.equal(monthlyStats.month_to_date_metrics.gsc.impressions, expectedImpr);
  assert.equal(monthlyStats.empirical_days, empiricalSeptember.length);
});

// ============================================================================
// 8. Daily progression excludes contaminated records from changes
// ============================================================================
test("8. Daily progression excludes contaminated records from changes", () => {
  const liveStats = getLiveStatistics();
  for (const rec of liveStats.daily_series) {
    if (rec.usable_for_empirical_analysis === false) {
      assert.equal(rec.day_over_day_changes.ga4_page_views.change, null);
      assert.equal(rec.day_over_day_changes.ga4_page_views.pct_change, null);
    }
  }

  // First empirical record (2026-09-04) cannot be compared against contaminated 2026-09-03
  const sep4 = liveStats.daily_series.find((r) => r.date === "2026-09-04");
  assert.ok(sep4);
  assert.equal(sep4.day_over_day_changes.ga4_page_views.change, null);
  assert.equal(sep4.day_over_day_changes.ga4_page_views.pct_change, null);
});

// ============================================================================
// 9. Day-over-day percentage change is null when denominator is invalid
// ============================================================================
test("9. Day-over-day percentage change is null when denominator is invalid", () => {
  // Zero denominator
  const res1 = calculateChange(50, 0, true);
  assert.equal(res1.change, 50);
  assert.equal(res1.pct_change, null);

  // Null previous value
  const res2 = calculateChange(50, null, true);
  assert.equal(res2.change, null);
  assert.equal(res2.pct_change, null);

  // Non-empirical previous day
  const res3 = calculateChange(50, 25, false);
  assert.equal(res3.change, null);
  assert.equal(res3.pct_change, null);

  // Valid positive denominator
  const res4 = calculateChange(50, 25, true);
  assert.equal(res4.change, 25);
  assert.equal(res4.pct_change, 100.0);
});

// ============================================================================
// 10. Monthly active-user terminology does not incorrectly claim unique users
// ============================================================================
test("10. Monthly active-user terminology does not incorrectly claim unique users", () => {
  const monthlyStats = getMonthlyStatistics("2026-09");
  const ga4 = monthlyStats.month_to_date_metrics.ga4;

  assert.equal(ga4.daily_active_users_summed_label, "Daily Active-User Observations (Summed)");
  assert.ok(ga4.monthly_unique_users === null || typeof ga4.monthly_unique_users === "number");
  assert.ok(ga4.monthly_unique_users_note);
  assert.doesNotMatch(ga4.daily_active_users_summed_label, /^Monthly Unique Users$/i);
});

// ============================================================================
// 11. GSC monthly aggregation uses correct semantics
// ============================================================================
test("11. GSC monthly aggregation uses correct semantics", () => {
  const monthlyStats = getMonthlyStatistics("2026-09");
  const gsc = monthlyStats.month_to_date_metrics.gsc;

  assert.ok(gsc.impressions === 477 || gsc.impressions === 506);
  assert.equal(gsc.clicks, 0);
  assert.equal(gsc.ctr, "0.00%");
  assert.ok(gsc.average_position === 68.4 || gsc.average_position === 67.8);
  assert.equal(gsc.epistemic_type, "DERIVED");
  assert.equal(gsc.authoritative_source, "SRC-GSC-UTL");
});

// ============================================================================
// 12. Telemetry persistence state is truthfully represented
// ============================================================================
test("12. Telemetry persistence state is truthfully represented", () => {
  const monthlyStats = getMonthlyStatistics("2026-09");
  const liveStats = getLiveStatistics();

  assert.equal(monthlyStats.month_to_date_metrics.telemetry.persistence_status, "NON-PERSISTENT_EDGE / LOCAL_ACTIVE");
  assert.ok(monthlyStats.month_to_date_metrics.telemetry.persistence_note.includes("Vercel serverless edge"));
  assert.equal(liveStats.provider_health.telemetry.persistence, "NON-PERSISTENT_EDGE / LOCAL_ACTIVE");
});

// ============================================================================
// 13. Current-day metrics have authoritative provenance
// ============================================================================
test("13. Current-day metrics have authoritative provenance", () => {
  const liveStats = getLiveStatistics();
  const prov = liveStats.provenance;

  assert.ok(prov["SRC-GA4-UTL"]);
  assert.ok(prov["SRC-GSC-UTL"]);
  assert.ok(prov["SRC-UTL-TELEMETRY"]);
  assert.equal(liveStats.provider_health.ga4.source_id, "SRC-GA4-UTL");
  assert.equal(liveStats.provider_health.gsc.source_id, "SRC-GSC-UTL");
  assert.equal(liveStats.provider_health.telemetry.source_id, "SRC-UTL-TELEMETRY");
});

// ============================================================================
// 14. Monthly artifact is deterministic
// ============================================================================
test("14. Monthly artifact is deterministic", () => {
  const run1 = getMonthlyStatistics("2026-09");
  const run2 = getMonthlyStatistics("2026-09");

  // Omit generated_at timestamp for comparison
  const { generated_at: g1, ...clean1 } = run1;
  const { generated_at: g2, ...clean2 } = run2;

  assert.deepEqual(clean1, clean2);
});

// ============================================================================
// 15. Statistics API/read model does not expose contaminated values as empirical
// ============================================================================
test("15. Statistics API/read model does not expose contaminated values as empirical", () => {
  const routePath = path.join(ROOT_DIR, "apps/web-shell/src/app/api/statistics/route.ts");
  assert.ok(fs.existsSync(routePath), "Statistics route.ts must exist");

  const routeCode = fs.readFileSync(routePath, "utf-8");
  assert.ok(routeCode.includes("contaminated_history_segregated"), "Route must enforce contaminated segregation");

  const liveStats = getLiveStatistics();
  for (const s of liveStats.daily_series) {
    if (s.usable_for_empirical_analysis === false) {
      assert.equal(s.epistemic_classification, "SYNTHETIC_CONTAMINATED");
      assert.equal(s.contamination_status, "CONTAMINATED");
    }
  }
});

// ============================================================================
// 16. No hardcoded statistics are introduced
// ============================================================================
test("16. No hardcoded statistics are introduced", () => {
  const aggCode = fs.readFileSync(path.join(ROOT_DIR, "intelligence/project/statisticsAggregator.mjs"), "utf-8");

  // Must not have hardcoded active user assignments like "ga4_active_users = 27"
  assert.doesNotMatch(aggCode, /ga4_active_users\s*=\s*\d+;/);
  assert.doesNotMatch(aggCode, /gsc_impressions\s*=\s*\d+;/);
  assert.doesNotMatch(aggCode, /daily_active_users_summed\s*:\s*\d+/);
});
