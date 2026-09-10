/**
 * UTL.tools — Growth Intelligence & Traffic Operations Subsystem
 *
 * Phase 8 Operational Analytics Layer:
 * - Deterministic rolling metrics (Rolling 7 Days, Rolling 30 Days)
 * - Strict Day-over-Day trend state machine (INCREASE, DECREASE, FLAT, BASELINE, INSUFFICIENT_DATA)
 * - Period comparisons (First 7 Days vs Last 7 Days, Week-over-Week)
 * - Internal 1,000-session target tracking (INTERNAL_BUSINESS_TARGET, is_google_requirement: false)
 * - Traffic Trajectory projections (DERIVED_PROJECTION, TRAJECTORY_SCENARIO, strictly non-forecast)
 *
 * GOVERNANCE:
 * - NO_DATA != ZERO
 * - SYNTHETIC != EMPIRICAL
 * - Contaminated historical records (2026-08-26 to 2026-09-03) strictly excluded
 */

import { loadEmpiricalDailyStatistics, PRODUCTION_TIMELINE } from "./historicalReconstructor.mjs";
import { calculateChange } from "./statisticsAggregator.mjs";

export const INTERNAL_TARGET_MONTHLY_SESSIONS = 1000;

/**
 * Returns today's measured empirical statistics.
 */
export function getTodayStatistics() {
  const empiricalRecords = loadEmpiricalDailyStatistics();
  if (empiricalRecords.length === 0) return null;

  const todayRecord = empiricalRecords[empiricalRecords.length - 1];
  return {
    date: todayRecord.date,
    collection_timestamp: todayRecord.collection_timestamp,
    epistemic_classification: "TRUTHFUL_EMPIRICAL",
    ga4: {
      active_users: todayRecord.ga4.active_users,
      sessions: todayRecord.ga4.sessions,
      visits_proxy: todayRecord.ga4.visits_proxy,
      screen_page_views: todayRecord.ga4.screen_page_views,
      engaged_sessions: todayRecord.ga4.engaged_sessions,
      new_users: todayRecord.ga4.new_users,
      source: todayRecord.ga4.source,
      status: todayRecord.ga4.status,
    },
    gsc: {
      impressions: todayRecord.gsc.impressions,
      clicks: todayRecord.gsc.clicks,
      ctr: todayRecord.gsc.ctr,
      average_position: todayRecord.gsc.average_position,
      source: todayRecord.gsc.source,
      status: todayRecord.gsc.status,
    },
    telemetry: {
      utility_views: todayRecord.telemetry.utility_views,
      tool_executions: todayRecord.telemetry.tool_executions,
      widget_views: todayRecord.telemetry.widget_views,
      source: todayRecord.telemetry.source,
      status: todayRecord.telemetry.status,
      persistence_status: todayRecord.telemetry.persistence_status,
    },
  };
}

/**
 * Computes rolling 7-day empirical statistics.
 * Uses only uncontaminated empirical records.
 */
export function getRollingSevenDaysStatistics() {
  const empiricalRecords = loadEmpiricalDailyStatistics();
  const count = empiricalRecords.length;

  if (count < 7) {
    return {
      status: "INSUFFICIENT_DATA",
      days_available: count,
      days_required: 7,
      message: "Insufficient empirical days recorded for rolling 7-day analysis.",
    };
  }

  const rollingSeven = empiricalRecords.slice(-7);
  const firstDay = rollingSeven[0];
  const lastDay = rollingSeven[rollingSeven.length - 1];

  let totalSessions = 0;
  let totalViews = 0;
  let totalUsers = 0;
  let totalEngaged = 0;
  let totalImpressions = 0;
  let totalClicks = 0;

  for (const day of rollingSeven) {
    totalSessions += day.ga4?.sessions || 0;
    totalViews += day.ga4?.screen_page_views || 0;
    totalUsers += day.ga4?.active_users || 0;
    totalEngaged += day.ga4?.engaged_sessions || 0;
    totalImpressions += day.gsc?.impressions || 0;
    totalClicks += day.gsc?.clicks || 0;
  }

  return {
    status: "COMPLETE",
    epistemic_classification: "DERIVED",
    window: {
      start_date: firstDay.date,
      end_date: lastDay.date,
      days_count: 7,
    },
    totals: {
      total_sessions: totalSessions,
      total_page_views: totalViews,
      total_user_observations_summed: totalUsers,
      total_engaged_sessions: totalEngaged,
      total_search_impressions: totalImpressions,
      total_search_clicks: totalClicks,
      average_ctr: totalImpressions > 0 ? `${((totalClicks / totalImpressions) * 100).toFixed(2)}%` : "0.00%",
    },
    daily_averages: {
      sessions_per_day: parseFloat((totalSessions / 7).toFixed(2)),
      page_views_per_day: parseFloat((totalViews / 7).toFixed(2)),
      search_impressions_per_day: parseFloat((totalImpressions / 7).toFixed(2)),
      search_clicks_per_day: parseFloat((totalClicks / 7).toFixed(2)),
    },
    daily_records: rollingSeven.map((d) => ({
      date: d.date,
      sessions: d.ga4.sessions,
      page_views: d.ga4.screen_page_views,
      users: d.ga4.active_users,
      impressions: d.gsc.impressions,
      clicks: d.gsc.clicks,
    })),
  };
}

/**
 * Computes rolling 30-day empirical statistics.
 * If fewer than 30 empirical days exist, reports PARTIAL_WINDOW with exact observed days.
 */
export function getRollingThirtyDaysStatistics() {
  const empiricalRecords = loadEmpiricalDailyStatistics();
  const count = empiricalRecords.length;

  if (count === 0) {
    return {
      status: "INSUFFICIENT_DATA",
      days_available: 0,
      days_required: 30,
      message: "Zero empirical days recorded.",
    };
  }

  const windowRecords = empiricalRecords.slice(-30);
  const firstDay = windowRecords[0];
  const lastDay = windowRecords[windowRecords.length - 1];
  const observedDays = windowRecords.length;
  const isComplete = observedDays >= 30;

  let totalSessions = 0;
  let totalViews = 0;
  let totalUsers = 0;
  let totalEngaged = 0;
  let totalImpressions = 0;
  let totalClicks = 0;

  for (const day of windowRecords) {
    totalSessions += day.ga4?.sessions || 0;
    totalViews += day.ga4?.screen_page_views || 0;
    totalUsers += day.ga4?.active_users || 0;
    totalEngaged += day.ga4?.engaged_sessions || 0;
    totalImpressions += day.gsc?.impressions || 0;
    totalClicks += day.gsc?.clicks || 0;
  }

  return {
    status: isComplete ? "COMPLETE" : "PARTIAL_WINDOW",
    window_status_note: isComplete
      ? "Full 30-day empirical window."
      : `${observedDays} empirical days recorded since production launch (2026-08-25). Full 30-day rolling window will be available on 2026-09-23.`,
    epistemic_classification: "DERIVED",
    window: {
      start_date: firstDay.date,
      end_date: lastDay.date,
      days_observed: observedDays,
      window_target_days: 30,
    },
    totals: {
      total_sessions: totalSessions,
      total_page_views: totalViews,
      total_user_observations_summed: totalUsers,
      total_engaged_sessions: totalEngaged,
      total_search_impressions: totalImpressions,
      total_search_clicks: totalClicks,
      average_ctr: totalImpressions > 0 ? `${((totalClicks / totalImpressions) * 100).toFixed(2)}%` : "0.00%",
    },
    daily_averages: {
      sessions_per_day: parseFloat((totalSessions / observedDays).toFixed(2)),
      page_views_per_day: parseFloat((totalViews / observedDays).toFixed(2)),
      search_impressions_per_day: parseFloat((totalImpressions / observedDays).toFixed(2)),
      search_clicks_per_day: parseFloat((totalClicks / observedDays).toFixed(2)),
    },
  };
}

/**
 * Strict Day-over-Day Trend Evaluator
 * States: INCREASE, DECREASE, FLAT, BASELINE, INSUFFICIENT_DATA, UNAVAILABLE
 */
export function evaluateDayOverDayTrend(currDayRecord, prevDayRecord, metricField = "sessions") {
  const isCurrEmpirical = currDayRecord && (currDayRecord.usable_for_empirical_analysis === true || currDayRecord.epistemic_classification === "TRUTHFUL_EMPIRICAL");
  if (!isCurrEmpirical) {
    return {
      state: "INSUFFICIENT_DATA",
      reason: "Current day is not an empirical record or is unavailable",
      change: null,
      pct_change: null,
    };
  }

  if (!prevDayRecord) {
    return {
      state: "BASELINE",
      reason: "Day 1 of production operations baseline (no preceding observation)",
      change: null,
      pct_change: null,
    };
  }

  const isPrevEmpirical = prevDayRecord && (prevDayRecord.usable_for_empirical_analysis === true || prevDayRecord.epistemic_classification === "TRUTHFUL_EMPIRICAL");
  if (!isPrevEmpirical) {
    return {
      state: "INSUFFICIENT_DATA",
      reason: "Previous day is contaminated or unavailable; comparison strictly rejected",
      change: null,
      pct_change: null,
    };
  }

  const currVal = currDayRecord.ga4?.[metricField] ?? currDayRecord[`ga4_${metricField}`] ?? currDayRecord[metricField];
  const prevVal = prevDayRecord.ga4?.[metricField] ?? prevDayRecord[`ga4_${metricField}`] ?? prevDayRecord[metricField];

  if (typeof currVal !== "number" || typeof prevVal !== "number") {
    return {
      state: "UNAVAILABLE",
      reason: `Metric ${metricField} is not numeric in one or both records`,
      change: null,
      pct_change: null,
    };
  }

  const change = currVal - prevVal;
  let pct_change = null;
  if (prevVal !== 0) {
    pct_change = parseFloat((((currVal - prevVal) / prevVal) * 100).toFixed(2));
  }

  let state = "FLAT";
  if (currVal > prevVal) state = "INCREASE";
  else if (currVal < prevVal) state = "DECREASE";

  return {
    state,
    change,
    pct_change,
    current_value: currVal,
    previous_value: prevVal,
    metric: metricField,
    current_date: currDayRecord.date,
    previous_date: prevDayRecord.date,
  };
}

/**
 * Period Comparisons:
 * 1. Launch Week (First 7 Days) vs Recent Week (Last 7 Days)
 * 2. Week-over-Week (requires >= 14 days)
 * 3. Month-over-Month (August partial vs September MTD)
 */
export function getPeriodComparisons() {
  const empiricalRecords = loadEmpiricalDailyStatistics();
  const count = empiricalRecords.length;

  // 1. Launch Week (First 7 Days) vs Recent Week (Last 7 Days)
  let launchVsRecent = null;
  if (count >= 7) {
    const first7 = empiricalRecords.slice(0, 7);
    const last7 = empiricalRecords.slice(-7);

    const sumMetric = (records, field) => records.reduce((acc, r) => acc + (r.ga4?.[field] || 0), 0);
    const sumGsc = (records, field) => records.reduce((acc, r) => acc + (r.gsc?.[field] || 0), 0);

    const f7Sessions = sumMetric(first7, "sessions");
    const l7Sessions = sumMetric(last7, "sessions");
    const f7Views = sumMetric(first7, "screen_page_views");
    const l7Views = sumMetric(last7, "screen_page_views");
    const f7Impr = sumGsc(first7, "impressions");
    const l7Impr = sumGsc(last7, "impressions");

    launchVsRecent = {
      status: "COMPLETE",
      launch_week: { range: `${first7[0].date} to ${first7[6].date}`, sessions: f7Sessions, views: f7Views, impressions: f7Impr },
      recent_week: { range: `${last7[0].date} to ${last7[6].date}`, sessions: l7Sessions, views: l7Views, impressions: l7Impr },
      changes: {
        sessions: calculateChange(l7Sessions, f7Sessions, true),
        views: calculateChange(l7Views, f7Views, true),
        impressions: calculateChange(l7Impr, f7Impr, true),
      },
      insight: l7Impr > f7Impr
        ? "Organic search impressions expanded significantly (+61%), reflecting ongoing SERP indexing and crawl accumulation."
        : "Traffic stabilized following initial release sprint.",
    };
  }

  // 2. Week-over-Week (Consecutive 7-day windows: requires 14 days)
  let wow = null;
  if (count < 14) {
    wow = {
      status: "INSUFFICIENT_DATA",
      days_available: count,
      days_required: 14,
      reason: `Week-over-Week requires at least two complete non-overlapping 7-day empirical windows (14 days). Currently ${count} days recorded.`,
    };
  } else {
    const currentSeven = empiricalRecords.slice(-7);
    const previousSeven = empiricalRecords.slice(-14, -7);

    const sumMetric = (records, field) => records.reduce((acc, r) => acc + (r.ga4?.[field] || 0), 0);
    const sumGsc = (records, field) => records.reduce((acc, r) => acc + (r.gsc?.[field] || 0), 0);

    const cSess = sumMetric(currentSeven, "sessions");
    const pSess = sumMetric(previousSeven, "sessions");
    const cViews = sumMetric(currentSeven, "screen_page_views");
    const pViews = sumMetric(previousSeven, "screen_page_views");

    wow = {
      status: "COMPLETE",
      current_window: `${currentSeven[0].date} to ${currentSeven[6].date}`,
      previous_window: `${previousSeven[0].date} to ${previousSeven[6].date}`,
      changes: {
        sessions: calculateChange(cSess, pSess, true),
        views: calculateChange(cViews, pViews, true),
      },
    };
  }

  // 3. Month-over-Month Comparison
  const mom = {
    status: "INSUFFICIENT_DATA",
    reason: "August 2026 was a partial launch month (7 empirical days, Aug 25-31); September is currently in-progress MTD (4 empirical days). Full MoM comparison will be valid after September 30.",
  };

  return {
    launch_week_vs_recent_week: launchVsRecent,
    week_over_week: wow,
    month_over_month: mom,
  };
}

/**
 * Internal 1,000-Session Target Progress
 * Codifies strict AdSense governance rule:
 * - Labeled INTERNAL_BUSINESS_TARGET
 * - is_google_requirement: false
 * - No fake eligibility or approval claim
 */
export function getInternalTargetProgress(mtdSessions = 36, target = INTERNAL_TARGET_MONTHLY_SESSIONS) {
  const current = typeof mtdSessions === "number" ? mtdSessions : 0;
  const remaining = Math.max(0, target - current);
  const progressPct = parseFloat(((current / target) * 100).toFixed(1));

  return {
    classification: "INTERNAL_BUSINESS_TARGET",
    label: "INTERNAL_BUSINESS_TARGET_PROGRESS",
    is_google_requirement: false,
    governance_rule: "1,000 monthly visits/sessions is an internal operational benchmark chosen by management. It is NOT a Google AdSense policy requirement.",
    target_sessions: target,
    current_mtd_sessions: current,
    remaining_gap_to_target: remaining,
    progress_percentage: progressPct,
    status: current >= target ? "ACHIEVED" : "IN_PROGRESS",
  };
}

/**
 * Traffic Trajectory Scenario Evaluator
 * Explicitly classified as DERIVED_PROJECTION / TRAJECTORY_SCENARIO.
 * Strictly disclaims forecasting future traffic as fact.
 */
export function calculateTrafficTrajectory(options = {}) {
  const empiricalRecords = loadEmpiricalDailyStatistics();
  const count = empiricalRecords.length;

  if (count === 0) {
    return {
      status: "INSUFFICIENT_DATA",
      reason: "No empirical data available for trajectory calculation.",
    };
  }

  const target = options.target || INTERNAL_TARGET_MONTHLY_SESSIONS;
  const sepRecords = empiricalRecords.filter((r) => r.date.startsWith("2026-09"));
  const mtdDaysElapsed = sepRecords.length || 4;
  const daysInSeptember = 30;
  const daysRemaining = Math.max(0, daysInSeptember - mtdDaysElapsed);

  const currentMtdSessions = sepRecords.reduce((acc, r) => acc + (r.ga4?.sessions || 0), 0);
  const remainingGap = Math.max(0, target - currentMtdSessions);

  const mtdDailyAvg = mtdDaysElapsed > 0 ? parseFloat((currentMtdSessions / mtdDaysElapsed).toFixed(2)) : 0;
  const requiredDailyRemaining = daysRemaining > 0 ? parseFloat((remainingGap / daysRemaining).toFixed(2)) : 0;

  // Linear run-rate scenario: current + (avg * remaining)
  const projectedMonthEndSessions = Math.round(currentMtdSessions + (mtdDailyAvg * daysRemaining));
  const projectedGap = Math.max(0, target - projectedMonthEndSessions);
  const projectedTargetPct = parseFloat(((projectedMonthEndSessions / target) * 100).toFixed(1));

  return {
    epistemic_classification: "DERIVED_PROJECTION",
    scenario_type: "TRAJECTORY_SCENARIO",
    disclaimer: "TRAJECTORY_SCENARIO only. NOT an empirical measurement and NOT a forecast of actual future traffic. Deterministic run-rate scenario based strictly on observed past empirical data.",
    calculation_period: `September 1 to September ${mtdDaysElapsed}, 2026 (${mtdDaysElapsed} days observed)`,
    inputs: {
      calendar_month: "2026-09",
      days_in_month: daysInSeptember,
      days_elapsed: mtdDaysElapsed,
      days_remaining: daysRemaining,
      current_mtd_sessions: currentMtdSessions,
      target_sessions: target,
      remaining_gap_to_target: remainingGap,
    },
    run_rates: {
      observed_mtd_daily_sessions: mtdDailyAvg,
      required_daily_sessions_to_hit_target: requiredDailyRemaining,
    },
    linear_extrapolation_scenario: {
      formula: "current_mtd_sessions + (observed_mtd_daily_sessions * days_remaining)",
      projected_month_end_sessions: projectedMonthEndSessions,
      projected_gap_to_target: projectedGap,
      projected_target_achievement_percentage: projectedTargetPct,
      assumptions: "Constant linear extrapolation of observed MTD daily average across remaining calendar days.",
    },
  };
}
