/**
 * UTL.tools — Production Observation Runner
 *
 * Executes the Phase 10 Production Observation, Daily Growth Monitoring & Anomaly Detection pipeline.
 * Guarantees same-day idempotency:
 * - No duplicate daily records
 * - No rolling-value contamination
 * - No historical overwrite
 * - No inflation of monthly totals
 * - Isolates provider failures
 * - Preserves GSC lag as null
 */

import {
  getProductionObservationSummary,
  ingestDailyObservation,
  detectOperationalAnomalies,
} from "../intelligence/project/productionObserver.mjs";
import { loadEmpiricalDailyStatistics } from "../intelligence/project/historicalReconstructor.mjs";

export function runProductionObservation(options = {}) {
  console.log("==================================================");
  console.log("RUNNING UTL.tools PHASE 10 PRODUCTION OBSERVATION");
  console.log("==================================================");

  const empiricalBefore = loadEmpiricalDailyStatistics();
  const countBefore = empiricalBefore.length;
  const latestBefore = empiricalBefore[countBefore - 1];

  // If new observation payload provided, ingest it
  if (options.observation) {
    const ingestResult = ingestDailyObservation(options.observation, options);
    console.log(`Ingest Status: ${ingestResult.status} for date ${ingestResult.date}`);
  }

  // Generate complete operational observation artifact
  const summary = getProductionObservationSummary();

  const empiricalAfter = loadEmpiricalDailyStatistics();
  const countAfter = empiricalAfter.length;

  console.log(`\nObservation Snapshot (${summary.today.date}):`);
  console.log(`- Sessions:             ${summary.today.sessions}`);
  console.log(`- Page Views:           ${summary.today.page_views}`);
  console.log(`- Active Users:         ${summary.today.active_users}`);
  console.log(`- GSC Impressions:      ${summary.today.search_impressions} (${summary.today.gsc_status})`);
  console.log(`- Telemetry Status:     ${summary.today.telemetry_status}`);

  console.log(`\nTraffic Trends:`);
  console.log(`- DoD Sessions Change:  ${summary.traffic_trends.day_over_day?.change ?? "null"} (${summary.traffic_trends.day_over_day?.state})`);
  console.log(`- Last 7 Days Sessions: ${summary.traffic_trends.last_7_days.sessions} (Status: ${summary.traffic_trends.last_7_days.status})`);
  console.log(`- Last 30D Sessions:    ${summary.traffic_trends.last_30_days.sessions} (Observed Days: ${summary.traffic_trends.last_30_days.days_observed}/30, Status: ${summary.traffic_trends.last_30_days.status})`);
  console.log(`- September MTD:        ${summary.traffic_trends.september_mtd.sessions} sessions, ${summary.traffic_trends.september_mtd.monthly_unique_users} unique users, ${summary.traffic_trends.september_mtd.search_impressions} search impressions`);
  console.log(`- Day 1 -> Today:       ${summary.traffic_trends.day_1_to_today.sessions} sessions, ${summary.traffic_trends.day_1_to_today.search_impressions} search impressions`);

  console.log(`\nInternal 1,000-Session Target:`);
  console.log(`- Target:               ${summary.internal_target.target_monthly_sessions} sessions / month (is_google_requirement: ${summary.internal_target.is_google_requirement})`);
  console.log(`- Current September:    ${summary.internal_target.current_september_sessions} sessions (${summary.internal_target.progress_percentage}%)`);
  console.log(`- Remaining Gap:        ${summary.internal_target.remaining_gap} sessions`);

  console.log(`\nOperational Anomalies Detected (${summary.anomalies.total_detected} total, ${summary.anomalies.technical_failures_count} technical failures):`);
  summary.anomalies.items.forEach((ano, idx) => {
    console.log(`  ${idx + 1}. [${ano.type}] (${ano.severity}) ${ano.description}`);
  });

  return {
    summary,
    idempotent: countBefore === countAfter,
  };
}

if (process.argv[1] && process.argv[1].endsWith("run_production_observation.mjs")) {
  runProductionObservation();
}
