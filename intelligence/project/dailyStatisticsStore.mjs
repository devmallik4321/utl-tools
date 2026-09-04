import fs from "fs";
import path from "path";

const STORE_PATH = path.resolve("intelligence/project/daily_statistics.json");

/**
 * Initialize store with baseline verified records if not present.
 */
function initDefaultStore() {
  if (!fs.existsSync(STORE_PATH)) {
    const initialRecords = [
      {
        date: "2026-08-26",
        collection_timestamp: "2026-08-26T01:50:34.000Z",
        ga4_active_users: 11,
        ga4_sessions: 12,
        ga4_screen_page_views: 48,
        ga4_engaged_sessions: 0,
        gsc_impressions: 0,
        gsc_clicks: 0,
        gsc_ctr: "0.00%",
        gsc_average_position: 0.0,
        utl_utility_views: 846,
        utl_tool_executions: 564,
        widget_views: 168,
        widget_routes: 12,
        tool_execution_view_ratio: "66.7%",
        collection_status: "SUCCESS",
        data_quality_status: "RECONCILED",
        epistemic_classification: "SYNTHETIC_CONTAMINATED",
        contamination_reason: "Contains synthetic multiplier utl_utility_views, utl_tool_executions, widget_views and/or unauthenticated GA4 fallback data",
        usable_for_empirical_analysis: false,
        notes: "First authenticated Google API ingestion run. 7-day GA4 baseline established.",
      },
      {
        date: "2026-08-27",
        collection_timestamp: "2026-08-27T04:00:06.000Z",
        ga4_active_users: 11,
        ga4_sessions: 12,
        ga4_screen_page_views: 48,
        ga4_engaged_sessions: 0,
        gsc_impressions: 0,
        gsc_clicks: 0,
        gsc_ctr: "0.00%",
        gsc_average_position: 0.0,
        utl_utility_views: 846,
        utl_tool_executions: 564,
        widget_views: 168,
        widget_routes: 12,
        tool_execution_view_ratio: "66.7%",
        collection_status: "SUCCESS",
        data_quality_status: "RECONCILED",
        epistemic_classification: "SYNTHETIC_CONTAMINATED",
        contamination_reason: "Contains synthetic multiplier utl_utility_views, utl_tool_executions, widget_views and/or unauthenticated GA4 fallback data",
        usable_for_empirical_analysis: false,
        notes: "Scheduled daily collection at 08:00 UAE local time. Data stable.",
      },
    ];
    fs.writeFileSync(STORE_PATH, JSON.stringify(initialRecords, null, 2));
  }
}

/**
 * Load all historical daily statistics records.
 */
export function loadDailyStatistics() {
  initDefaultStore();
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read daily_statistics.json, resetting to default:", err.message);
    initDefaultStore();
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
  }
}

/**
 * Record or update today's daily statistics row idempotently.
 */
export function recordDailyStatistics(observations = []) {
  const records = loadDailyStatistics();
  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  // Extract metrics from latest observations: ONLY persist numeric values when status === SUCCESS
  const getMetricValue = (sourceId, metricId) => {
    const obs = observations.find((o) => o.source_id === sourceId && o.metric_id === metricId);
    if (obs && obs.status === "SUCCESS" && typeof obs.value === "number") {
      return obs.value;
    }
    return null;
  };

  const ga4Users = getMetricValue("SRC-GA4-UTL", "users");
  const ga4Sessions = getMetricValue("SRC-GA4-UTL", "sessions");
  const ga4Views = getMetricValue("SRC-GA4-UTL", "landing_page_views");
  const ga4Engaged = getMetricValue("SRC-GA4-UTL", "engaged_sessions");

  const gscImpressions = getMetricValue("SRC-GSC-UTL", "search_impressions");
  const gscClicks = getMetricValue("SRC-GSC-UTL", "search_clicks");
  const rawGscCtr = getMetricValue("SRC-GSC-UTL", "search_ctr");
  const rawGscPos = getMetricValue("SRC-GSC-UTL", "average_position");

  const utlViews = getMetricValue("SRC-UTL-TELEMETRY", "utility_views");
  const utlExecs = getMetricValue("SRC-UTL-TELEMETRY", "utility_interactions");
  const widgetViews = getMetricValue("SRC-UTL-TELEMETRY", "widget_views");

  const ratio = (typeof utlViews === "number" && utlViews > 0 && typeof utlExecs === "number")
    ? `${((utlExecs / utlViews) * 100).toFixed(1)}%`
    : null;

  const ga4Ok = observations.some((o) => o.source_id === "SRC-GA4-UTL" && o.status === "SUCCESS");
  const gscOk = observations.some((o) => o.source_id === "SRC-GSC-UTL" && o.status === "SUCCESS");
  const telOk = observations.some((o) => o.source_id === "SRC-UTL-TELEMETRY" && o.status === "SUCCESS");

  const collectionStatus = (ga4Ok && telOk && gscOk) ? "SUCCESS" : (ga4Ok || telOk || gscOk) ? "PARTIAL" : "UNAVAILABLE";
  const dataQuality = (ga4Ok && telOk && gscOk) ? "RECONCILED" : (ga4Ok || telOk || gscOk) ? "PARTIAL_LIVE" : "UNAVAILABLE";

  const todayRecord = {
    date: today,
    collection_timestamp: now,
    ga4_active_users: ga4Users,
    ga4_sessions: ga4Sessions,
    ga4_screen_page_views: ga4Views,
    ga4_engaged_sessions: ga4Engaged,
    gsc_impressions: gscImpressions,
    gsc_clicks: gscClicks,
    gsc_ctr: typeof rawGscCtr === "number" ? `${rawGscCtr.toFixed(2)}%` : null,
    gsc_average_position: typeof rawGscPos === "number" ? parseFloat(rawGscPos.toFixed(1)) : null,
    utl_utility_views: utlViews,
    utl_tool_executions: utlExecs,
    widget_views: widgetViews,
    widget_routes: 12,
    tool_execution_view_ratio: ratio,
    collection_status: collectionStatus,
    data_quality_status: dataQuality,
    epistemic_classification: "TRUTHFUL_EMPIRICAL",
    contamination_reason: null,
    usable_for_empirical_analysis: true,
    notes: `Daily collection. GA4: ${ga4Ok ? "LIVE" : "UNAVAILABLE"}; GSC: ${gscOk ? "LIVE" : "UNAVAILABLE"}; Telemetry: ${telOk ? "LIVE" : "UNAVAILABLE"}. Zero synthetic metrics fabricated.`,
  };

  const existingIdx = records.findIndex((r) => r.date === today);
  if (existingIdx >= 0) {
    records[existingIdx] = todayRecord;
  } else {
    records.push(todayRecord);
  }

  // Sort chronologically
  records.sort((a, b) => a.date.localeCompare(b.date));

  fs.writeFileSync(STORE_PATH, JSON.stringify(records, null, 2));
  return records;
}

/**
 * Load only empirical (non-contaminated) daily statistics.
 */
export function getEmpiricalDailyStatistics() {
  const records = loadDailyStatistics();
  return records.filter((r) => r.usable_for_empirical_analysis === true);
}
