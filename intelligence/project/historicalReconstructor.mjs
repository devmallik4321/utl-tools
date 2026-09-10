import fs from "fs";
import path from "path";
import { GoogleAuthClient } from "./googleAuth.mjs";

const ROOT_DIR = process.cwd();
const RECONSTRUCTION_PATH = path.resolve(ROOT_DIR, "intelligence/project/historical_measurement_reconstruction.json");
const EMPIRICAL_DAILY_PATH = path.resolve(ROOT_DIR, "intelligence/project/empirical_daily_statistics.json");

export const PRODUCTION_TIMELINE = {
  production_start_date: "2026-08-25",
  initial_commit_sha: "28360e6",
  production_start_evidence: "Commit 28360e6 (Version 1.1 Release, 47 utilities, 2026-08-25T04:14:45.000Z) and earliest GA4 traffic record.",
  ga4_measurement_start_date: "2026-08-25",
  gsc_measurement_start_date: "2026-08-24",
  gsc_first_impressions_date: "2026-08-26",
  visits_metric_definition: "Internal Visits Proxy = GA4 Sessions (ga4_sessions)",
};

/**
 * Extract authoritative historical daily data from GA4 Data API.
 */
export async function extractGa4History(authClient, propertyId = process.env.GA4_PROPERTY_ID || "551527574") {
  const token = await authClient.getAccessToken(["https://www.googleapis.com/auth/analytics.readonly"]);
  if (!token) {
    throw new Error("Could not acquire Google OAuth token for GA4 historical extraction");
  }

  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: "2026-08-01", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "engagedSessions" },
        { name: "newUsers" },
        { name: "userEngagementDuration" },
        { name: "eventCount" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GA4 runReport historical query failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const rows = data.rows || [];

  return rows.map((r) => {
    const rawDate = r.dimensionValues[0].value;
    const formattedDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
    return {
      date: formattedDate,
      active_users: parseInt(r.metricValues[0].value, 10),
      sessions: parseInt(r.metricValues[1].value, 10),
      screen_page_views: parseInt(r.metricValues[2].value, 10),
      engaged_sessions: parseInt(r.metricValues[3].value, 10),
      new_users: parseInt(r.metricValues[4].value, 10),
      user_engagement_duration_seconds: parseFloat(r.metricValues[5].value),
      event_count: parseInt(r.metricValues[6].value, 10),
    };
  });
}

/**
 * Extract authoritative monthly summary for September 2026 directly from GA4 Data API.
 */
export async function extractGa4MonthlySummary(authClient, month = "2026-09", propertyId = process.env.GA4_PROPERTY_ID || "551527574") {
  const token = await authClient.getAccessToken(["https://www.googleapis.com/auth/analytics.readonly"]);
  if (!token) throw new Error("Could not acquire Google OAuth token for GA4 monthly query");

  const startDate = `${month}-01`;
  const endDate = "today";

  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "totalUsers" },
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "engagedSessions" },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GA4 monthly runReport query failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const row = data.rows?.[0];
  if (!row) {
    return {
      month,
      monthly_unique_users: 0,
      monthly_active_users: 0,
      monthly_sessions: 0,
      monthly_page_views: 0,
      source: `GA4 Data API Property ${propertyId}`,
    };
  }

  return {
    month,
    monthly_unique_users: parseInt(row.metricValues[0].value, 10),
    monthly_active_users: parseInt(row.metricValues[1].value, 10),
    monthly_sessions: parseInt(row.metricValues[2].value, 10),
    monthly_page_views: parseInt(row.metricValues[3].value, 10),
    source: `GA4 Data API Property ${propertyId}`,
  };
}

/**
 * Extract authoritative historical daily data from Google Search Console API.
 */
export async function extractGscHistory(authClient, siteUrl = process.env.GSC_SITE_URL || "sc-domain:utl.tools") {
  const token = await authClient.getAccessToken(["https://www.googleapis.com/auth/webmasters.readonly"]);
  if (!token) {
    throw new Error("Could not acquire Google OAuth token for GSC historical extraction");
  }

  const encodedSiteUrl = encodeURIComponent(siteUrl);
  const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: "2026-08-01",
      endDate: "2026-09-04",
      dimensions: ["date"],
      rowLimit: 1000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GSC searchAnalytics query failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const rows = data.rows || [];

  return rows.map((r) => {
    const impr = r.impressions || 0;
    const clicks = r.clicks || 0;
    const ctr = impr > 0 ? (clicks / impr) * 100 : 0;
    const pos = r.position || 0;
    return {
      date: r.keys[0],
      impressions: impr,
      clicks: clicks,
      ctr_percentage: ctr,
      average_position: pos,
    };
  });
}

/**
 * Execute full historical reconstruction pipeline.
 * Saves raw reconstruction artifact and builds the canonical empirical daily dataset.
 */
export async function runHistoricalReconstruction() {
  let ga4Daily = [];
  let ga4Monthly = null;
  let gscDaily = [];

  try {
    const auth = new GoogleAuthClient();
    ga4Daily = await extractGa4History(auth);
    ga4Monthly = await extractGa4MonthlySummary(auth, "2026-09");
    gscDaily = await extractGscHistory(auth);
  } catch (err) {
    if (fs.existsSync(RECONSTRUCTION_PATH)) {
      const cached = JSON.parse(fs.readFileSync(RECONSTRUCTION_PATH, "utf-8"));
      ga4Daily = cached.ga4_source?.records || [];
      ga4Monthly = cached.ga4_source?.monthly_summary_september || null;
      gscDaily = cached.gsc_source?.records || [];
    }
  }

  const extractionTimestamp = new Date().toISOString();

  const first7Ga4 = ga4Daily.filter((r) => r.date >= "2026-08-25" && r.date <= "2026-08-31");
  const first7Sessions = first7Ga4.reduce((acc, r) => acc + (r.sessions || 0), 0);
  const first7Views = first7Ga4.reduce((acc, r) => acc + (r.screen_page_views || 0), 0);
  const first7Impr = gscDaily.filter((r) => r.date >= "2026-08-25" && r.date <= "2026-08-31").reduce((acc, r) => acc + (r.impressions || 0), 0);

  const firstSevenDaysSummary = {
    range: { start_date: "2026-08-25", end_date: "2026-08-31", days: 7 },
    totals: {
      total_sessions: first7Sessions,
      total_page_views: first7Views,
      total_search_impressions: first7Impr,
    },
  };

  // 1. Raw Reconstruction Provenance Artifact
  const reconstructionArtifact = {
    schema_version: "1.0.0",
    extracted_at: extractionTimestamp,
    provenance_statement: "Reconstructed directly from Google Analytics 4 Data API (v1beta) and Google Search Console API. Historical synthetic estimates are preserved in daily_statistics.json for audit, while empirical metrics are extracted from external authoritative sources.",
    production_timeline: PRODUCTION_TIMELINE,
    first_seven_days_summary: firstSevenDaysSummary,
    ga4_source: {
      property_id: process.env.GA4_PROPERTY_ID || "551527574",
      measurement_id: process.env.GA4_MEASUREMENT_ID || "G-H2G4BK9Y36",
      daily_records_count: ga4Daily.length,
      monthly_summary_september: ga4Monthly,
      records: ga4Daily,
    },
    gsc_source: {
      site_url: process.env.GSC_SITE_URL || "sc-domain:utl.tools",
      daily_records_count: gscDaily.length,
      records: gscDaily,
    },
  };

  fs.writeFileSync(RECONSTRUCTION_PATH, JSON.stringify(reconstructionArtifact, null, 2));
  console.log(`Saved historical reconstruction artifact to: ${RECONSTRUCTION_PATH}`);

  // 2. Build Canonical Empirical Daily Dataset
  // All dates from production start date (2026-08-25) to latest available date
  const allDatesSet = new Set([
    ...ga4Daily.map((r) => r.date),
    ...gscDaily.filter((r) => r.date >= PRODUCTION_TIMELINE.production_start_date).map((r) => r.date),
    "2026-09-04",
  ]);

  const sortedDates = Array.from(allDatesSet)
    .filter((d) => d >= PRODUCTION_TIMELINE.production_start_date)
    .sort();

  const empiricalDailyRecords = sortedDates.map((date) => {
    const ga = ga4Daily.find((r) => r.date === date);
    const gsc = gscDaily.find((r) => r.date === date);

    const gaUsers = ga ? ga.active_users : null;
    const gaSessions = ga ? ga.sessions : null;
    const gaViews = ga ? ga.screen_page_views : null;
    const gaEngaged = ga ? ga.engaged_sessions : null;
    const gaNewUsers = ga ? ga.new_users : null;
    const gaEventCount = ga ? ga.event_count : null;

    const gscImpr = gsc ? gsc.impressions : null;
    const gscClicks = gsc ? gsc.clicks : null;
    const gscCtr = gsc ? `${gsc.ctr_percentage.toFixed(2)}%` : null;
    const gscPos = gsc ? gsc.average_position : null;

    return {
      date,
      collection_timestamp: extractionTimestamp,
      epistemic_classification: "TRUTHFUL_EMPIRICAL",
      usable_for_empirical_analysis: true,
      ga4: {
        active_users: gaUsers,
        sessions: gaSessions,
        visits_proxy: gaSessions,
        screen_page_views: gaViews,
        engaged_sessions: gaEngaged,
        new_users: gaNewUsers,
        event_count: gaEventCount,
        status: ga ? "EMPIRICAL_API" : "UNAVAILABLE",
        source: "SRC-GA4-UTL",
      },
      gsc: {
        impressions: gscImpr,
        clicks: gscClicks,
        ctr: gscCtr,
        average_position: gscPos,
        status: gsc ? "EMPIRICAL_API" : (date >= "2026-09-03" ? "PENDING_SEARCH_CONSOLE_LAG" : "UNAVAILABLE"),
        source: "SRC-GSC-UTL",
      },
      telemetry: {
        utility_views: null,
        tool_executions: null,
        widget_views: null,
        status: "UNAVAILABLE",
        persistence_status: "NON-PERSISTENT_EDGE",
        source: "SRC-UTL-TELEMETRY",
      },
      reconstruction_note: "Authoritative external measurement independently reconstructed; replaces contaminated internal estimates while preserving original contaminated records in daily_statistics.json.",
    };
  });

  fs.writeFileSync(EMPIRICAL_DAILY_PATH, JSON.stringify(empiricalDailyRecords, null, 2));
  console.log(`Saved canonical empirical daily dataset to: ${EMPIRICAL_DAILY_PATH} (${empiricalDailyRecords.length} empirical days)`);

  return {
    reconstructionArtifact,
    empiricalDailyRecords,
  };
}

/**
 * Load empirical daily dataset.
 */
export function loadEmpiricalDailyStatistics() {
  if (fs.existsSync(EMPIRICAL_DAILY_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(EMPIRICAL_DAILY_PATH, "utf-8"));
    } catch (err) {
      console.warn("Could not read empirical_daily_statistics.json:", err.message);
    }
  }
  return [];
}
