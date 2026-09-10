/**
 * UTL.tools — Phase 10 Production Observation, Daily Growth Monitoring & Anomaly Detection Test Suite
 *
 * Covers all 26 required Phase 10 invariants:
 * 1. Date-dimensioned daily GA4 measurement
 * 2. Date-dimensioned daily GSC measurement
 * 3. No rolling-value-as-daily-record
 * 4. No monthly-value-as-daily-record
 * 5. GSC lag remains null
 * 6. Provider failure remains null
 * 7. DoD baseline behavior
 * 8. DoD unavailable behavior
 * 9. Rolling 7D partial-window behavior
 * 10. Rolling 30D partial-window behavior
 * 11. MTD additive aggregation
 * 12. Monthly unique-user distinction
 * 13. 1,000 target arithmetic
 * 14. AdSense requirement isolation
 * 15. Low traffic != measurement failure
 * 16. Source lag != zero
 * 17. Measurement failure classification
 * 18. Same-day scheduler idempotency
 * 19. Historical record immutability
 * 20. Full provenance lineage
 * 21. API consistency
 * 22. Control Center consistency
 * 23. No synthetic metrics
 * 24. No NO_DATA -> zero conversion
 * 25. Contaminated records remain excluded
 * 26. Canonical containment invariants remain valid
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

import {
  validateDailyObservation,
  ingestDailyObservation,
  detectOperationalAnomalies,
  getProductionObservationSummary,
  DataIntegrityError,
} from "../intelligence/project/productionObserver.mjs";
import { runProductionObservation } from "../scripts/run_production_observation.mjs";
import {
  loadEmpiricalDailyStatistics,
  PRODUCTION_TIMELINE,
} from "../intelligence/project/historicalReconstructor.mjs";
import { loadDailyStatistics } from "../intelligence/project/dailyStatisticsStore.mjs";
import {
  getTodayStatistics,
  getRollingSevenDaysStatistics,
  getRollingThirtyDaysStatistics,
  evaluateDayOverDayTrend,
  getInternalTargetProgress,
} from "../intelligence/project/growthIntelligence.mjs";
import { getCanonicalStatistics } from "../intelligence/project/statisticsAggregator.mjs";

// ============================================================================
// 1. Date-dimensioned daily GA4 measurement
// ============================================================================
test("1. Date-dimensioned daily GA4 measurement", () => {
  const empirical = loadEmpiricalDailyStatistics();
  assert.ok(empirical.length >= 11);

  for (const r of empirical) {
    assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(typeof r.ga4.sessions, "number");
    assert.equal(typeof r.ga4.screen_page_views, "number");
    assert.equal(r.ga4.source, "SRC-GA4-UTL");
  }

  // Verify single-day query passes validation
  assert.doesNotThrow(() => {
    validateDailyObservation({
      date: "2026-09-04",
      query_window: { start_date: "2026-09-04", end_date: "2026-09-04" },
    });
  });
});

// ============================================================================
// 2. Date-dimensioned daily GSC measurement
// ============================================================================
test("2. Date-dimensioned daily GSC measurement", () => {
  const empirical = loadEmpiricalDailyStatistics();
  for (const r of empirical) {
    assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(r.gsc.source, "SRC-GSC-UTL");
    if (r.gsc.impressions !== null) {
      assert.equal(typeof r.gsc.impressions, "number");
      assert.equal(typeof r.gsc.clicks, "number");
    }
  }
});

// ============================================================================
// 3. No rolling-value-as-daily-record
// ============================================================================
test("3. No rolling-value-as-daily-record", () => {
  assert.throws(
    () => {
      validateDailyObservation({
        date: "2026-09-04",
        query_window: { start_date: "2026-08-28", end_date: "2026-09-04" },
      });
    },
    (err) => err instanceof DataIntegrityError && err.message.includes("Multi-day query window")
  );

  assert.throws(
    () => {
      validateDailyObservation({
        date: "2026-09-04",
        is_rolling_aggregate: true,
      });
    },
    (err) => err instanceof DataIntegrityError && err.message.includes("rolling/monthly")
  );
});

// ============================================================================
// 4. No monthly-value-as-daily-record
// ============================================================================
test("4. No monthly-value-as-daily-record", () => {
  assert.throws(
    () => {
      validateDailyObservation({
        date: "2026-09-04",
        is_monthly_aggregate: true,
      });
    },
    (err) => err instanceof DataIntegrityError && err.message.includes("rolling/monthly")
  );
});

// ============================================================================
// 5. GSC lag remains null
// ============================================================================
test("5. GSC lag remains null", () => {
  const empirical = loadEmpiricalDailyStatistics();
  const sep3 = empirical.find((r) => r.date === "2026-09-03");
  const sep4 = empirical.find((r) => r.date === "2026-09-04");

  assert.ok(sep3 && sep4);
  assert.equal(sep3.gsc.impressions, null);
  assert.equal(sep3.gsc.clicks, null);
  assert.match(sep3.gsc.status, /PENDING_.*LAG/);

  assert.equal(sep4.gsc.impressions, null);
  assert.equal(sep4.gsc.clicks, null);
  assert.match(sep4.gsc.status, /PENDING_.*LAG/);
});

// ============================================================================
// 6. Provider failure remains null
// ============================================================================
test("6. Provider failure remains null", () => {
  const summary = getProductionObservationSummary();
  // Telemetry is unconfigured in serverless edge environment
  assert.equal(summary.today.telemetry_views, null);
  assert.equal(summary.today.telemetry_executions, null);
  assert.equal(summary.today.telemetry_status, "UNAVAILABLE");
});

// ============================================================================
// 7. DoD baseline behavior
// ============================================================================
test("7. DoD baseline behavior", () => {
  const empirical = loadEmpiricalDailyStatistics();
  const day1 = empirical[0];

  const dod = evaluateDayOverDayTrend(day1, null, "sessions");
  assert.equal(dod.state, "BASELINE");
  assert.equal(dod.change, null);
  assert.equal(dod.pct_change, null);
});

// ============================================================================
// 8. DoD unavailable behavior
// ============================================================================
test("8. DoD unavailable behavior", () => {
  const legacyStore = loadDailyStatistics();
  const contaminated = legacyStore.find((r) => r.usable_for_empirical_analysis === false);
  const empirical = loadEmpiricalDailyStatistics()[0];

  // Comparing against contaminated record is strictly rejected
  const dodContaminated = evaluateDayOverDayTrend(empirical, contaminated, "sessions");
  assert.equal(dodContaminated.state, "INSUFFICIENT_DATA");
  assert.equal(dodContaminated.change, null);

  // Comparing when current is null is rejected
  const dodNull = evaluateDayOverDayTrend({ date: "2026-09-05", usable_for_empirical_analysis: false }, empirical, "sessions");
  assert.equal(dodNull.state, "INSUFFICIENT_DATA");
});

// ============================================================================
// 9. Rolling 7D partial-window behavior
// ============================================================================
test("9. Rolling 7D partial-window behavior", () => {
  const r7 = getRollingSevenDaysStatistics();
  assert.equal(r7.status, "COMPLETE");
  assert.equal(r7.totals.total_sessions, 18);
  assert.equal(r7.totals.total_page_views, 21);
  assert.equal(r7.totals.total_search_impressions, 380);
});

// ============================================================================
// 10. Rolling 30D partial-window behavior
// ============================================================================
test("10. Rolling 30D partial-window behavior", () => {
  const r30 = getRollingThirtyDaysStatistics();
  assert.equal(r30.status, "PARTIAL_WINDOW");
  assert.equal(r30.window.days_observed, 11);
  assert.equal(r30.window.window_target_days, 30);
  assert.ok(r30.window_status_note.includes("11 empirical days recorded"));
  assert.equal(r30.totals.total_sessions, 94);
  assert.equal(r30.totals.total_search_impressions, 586);
});

// ============================================================================
// 11. MTD additive aggregation
// ============================================================================
test("11. MTD additive aggregation", () => {
  const canonical = getCanonicalStatistics();
  const mtd = canonical.canonical_windows.september_mtd;

  assert.equal(mtd.totals.sessions, 10);
  assert.equal(mtd.totals.page_views, 13);
  assert.equal(mtd.totals.engaged_sessions, 5);
  assert.equal(mtd.totals.search_impressions, 54);
  assert.equal(mtd.totals.search_clicks, 0);

  // Cross check daily sum
  const empirical = loadEmpiricalDailyStatistics();
  const sep = empirical.filter((r) => r.date.startsWith("2026-09"));
  const sumSess = sep.reduce((a, b) => a + (b.ga4?.sessions || 0), 0);
  const sumViews = sep.reduce((a, b) => a + (b.ga4?.screen_page_views || 0), 0);
  assert.equal(sumSess, 10);
  assert.equal(sumViews, 13);
});

// ============================================================================
// 12. Monthly unique-user distinction
// ============================================================================
test("12. Monthly unique-user distinction", () => {
  const canonical = getCanonicalStatistics();
  const mtd = canonical.canonical_windows.september_mtd;

  assert.equal(mtd.monthly_unique_users, 10);
  assert.equal(mtd.totals.user_observations_summed, 10);
  assert.ok(mtd.monthly_unique_users_note.includes("GA4 Data API monthly query"));
});

// ============================================================================
// 13. 1,000 target arithmetic
// ============================================================================
test("13. 1,000 target arithmetic", () => {
  const target = getInternalTargetProgress(10, 1000);
  assert.equal(target.target_sessions, 1000);
  assert.equal(target.current_mtd_sessions, 10);
  assert.equal(target.remaining_gap_to_target, 990);
  assert.equal(target.progress_percentage, 1.0);
  assert.equal(target.status, "IN_PROGRESS");
});

// ============================================================================
// 14. AdSense requirement isolation
// ============================================================================
test("14. AdSense requirement isolation", () => {
  const target = getInternalTargetProgress(10, 1000);
  assert.equal(target.is_google_requirement, false);
  assert.equal(target.classification, "INTERNAL_BUSINESS_TARGET");
  assert.ok(target.governance_rule.includes("NOT a Google AdSense policy requirement"));
});

// ============================================================================
// 15. Low traffic != measurement failure
// ============================================================================
test("15. Low traffic != measurement failure", () => {
  const anomalies = detectOperationalAnomalies();
  const lowTraffic = anomalies.find((a) => a.type === "LOW_TRAFFIC");

  assert.ok(lowTraffic);
  assert.equal(lowTraffic.is_technical_failure, false);
  assert.equal(lowTraffic.severity, "INFORMATIONAL");
  assert.ok(lowTraffic.description.includes("not a measurement failure"));
});

// ============================================================================
// 16. Source lag != zero
// ============================================================================
test("16. Source lag != zero", () => {
  const anomalies = detectOperationalAnomalies();
  const lag = anomalies.find((a) => a.type === "SOURCE_LAG");

  assert.ok(lag);
  assert.equal(lag.is_technical_failure, false);
  assert.equal(lag.observed_value, null);
  assert.ok(lag.description.includes("Truthfully preserved as null"));
});

// ============================================================================
// 17. Measurement failure classification
// ============================================================================
test("17. Measurement failure classification", () => {
  const crashAnomalies = detectOperationalAnomalies({ empiricalRecords: [] });
  const failure = crashAnomalies.find((a) => a.type === "MEASUREMENT_FAILURE");

  assert.ok(failure);
  assert.equal(failure.is_technical_failure, true);
  assert.equal(failure.severity, "CRITICAL");
});

// ============================================================================
// 18. Same-day scheduler idempotency
// ============================================================================
test("18. Same-day scheduler idempotency", () => {
  const empiricalBefore = loadEmpiricalDailyStatistics();
  const countBefore = empiricalBefore.length;

  const result1 = runProductionObservation();
  assert.equal(result1.idempotent, true);

  const result2 = runProductionObservation();
  assert.equal(result2.idempotent, true);

  const empiricalAfter = loadEmpiricalDailyStatistics();
  assert.equal(empiricalAfter.length, countBefore);
});

// ============================================================================
// 19. Historical record immutability
// ============================================================================
test("19. Historical record immutability", () => {
  // Attempting to overwrite established historical record with altered sessions throws DataIntegrityError
  assert.throws(
    () => {
      ingestDailyObservation({
        date: "2026-08-25",
        ga4: { sessions: 999 },
      });
    },
    (err) => err instanceof DataIntegrityError && err.message.includes("Immutable empirical record")
  );
});

// ============================================================================
// 20. Full provenance lineage
// ============================================================================
test("20. Full provenance lineage", () => {
  const summary = getProductionObservationSummary();
  assert.ok(summary.governance);
  assert.ok(summary.source_health.ga4);
  assert.ok(summary.source_health.gsc);
  assert.ok(summary.source_health.telemetry);
  assert.ok(summary.production_timeline.production_start_date);
});

// ============================================================================
// 21. API consistency
// ============================================================================
test("21. API consistency", () => {
  const summary = getProductionObservationSummary();
  const canonical = getCanonicalStatistics();

  assert.equal(summary.traffic_trends.last_30_days.sessions, canonical.canonical_windows.last_30d.totals.sessions);
  assert.equal(summary.traffic_trends.september_mtd.sessions, canonical.canonical_windows.september_mtd.totals.sessions);
  assert.equal(summary.traffic_trends.day_1_to_today.sessions, canonical.canonical_windows.day_1_to_today.totals.sessions);
});

// ============================================================================
// 22. Control Center consistency
// ============================================================================
test("22. Control Center consistency", async () => {
  const wbPath = path.resolve("control/UTL-CONTROL-CENTER.xlsx");
  assert.ok(fs.existsSync(wbPath));

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(wbPath);

  const statsSheet = wb.getWorksheet("P-Statistics");
  assert.ok(statsSheet);

  let foundBlock13 = false;
  let foundBlock14 = false;

  statsSheet.eachRow((row) => {
    const c1 = String(row.getCell(1).value || "");
    if (c1.includes("## 13. RECONCILIATION & AUDIT LEDGER")) foundBlock13 = true;
    if (c1.includes("## 14. DAILY OPERATIONS & ANOMALIES")) foundBlock14 = true;
  });

  assert.ok(foundBlock13, "Block 13 must be present in P-Statistics");
  assert.ok(foundBlock14, "Block 14 must be present in P-Statistics");
});

// ============================================================================
// 23. No synthetic metrics
// ============================================================================
test("23. No synthetic metrics", () => {
  const files = [
    "intelligence/project/productionObserver.mjs",
    "scripts/run_production_observation.mjs",
    "scripts/reconcile_statistics.mjs",
    "intelligence/project/statisticsAggregator.mjs",
    "intelligence/project/dailyStatisticsStore.mjs",
    "intelligence/project/growthIntelligence.mjs",
  ];

  const forbidden = [/\*\s*18/g, /\*\s*12/g, /\*\s*14/g, /utilities\.length\s*\*/g];

  for (const file of files) {
    const p = path.resolve(file);
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, "utf-8");
    for (const pat of forbidden) {
      assert.equal(pat.test(content), false, `Forbidden synthetic pattern ${pat} found in ${file}`);
    }
  }
});

// ============================================================================
// 24. No NO_DATA -> zero conversion
// ============================================================================
test("24. No NO_DATA -> zero conversion", () => {
  const summary = getProductionObservationSummary();
  assert.equal(summary.today.search_impressions, null);
  assert.equal(summary.today.telemetry_views, null);
  assert.notEqual(summary.today.search_impressions, 0);
  assert.notEqual(summary.today.telemetry_views, 0);
});

// ============================================================================
// 25. Contaminated records remain excluded
// ============================================================================
test("25. Contaminated records remain excluded", () => {
  const legacyDaily = loadDailyStatistics();
  const contaminated = legacyDaily.filter((r) => r.usable_for_empirical_analysis === false);
  assert.equal(contaminated.length, 9);

  const empirical = loadEmpiricalDailyStatistics();
  assert.equal(empirical.length, 11);
  for (const r of empirical) {
    assert.equal(r.usable_for_empirical_analysis, true);
    assert.equal(r.epistemic_classification, "TRUTHFUL_EMPIRICAL");
  }
});

// ============================================================================
// 26. Canonical containment invariants remain valid
// ============================================================================
test("26. Canonical containment invariants remain valid", () => {
  const canonical = getCanonicalStatistics();
  for (const inv of canonical.containment_invariants) {
    assert.equal(inv.passed, true, `Invariant ${inv.id} failed: ${inv.proof}`);
  }
});
