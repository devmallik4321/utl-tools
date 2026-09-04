import { GoogleAuthClient } from "../googleAuth.mjs";

export class UtlGA4Adapter {
  constructor(options = {}) {
    this.provider_id = "SRC-GA4-UTL";
    this.provider_type = "ANALYTICS_DATA_API";
    this.measurementId = options.measurementId || process.env.GA4_MEASUREMENT_ID || "G-H2G4BK9Y36";
    this.propertyId = options.propertyId || process.env.GA4_PROPERTY_ID || "551527574";
    this.authClient = new GoogleAuthClient();
  }

  /**
   * Collect observations from Google Analytics 4 Data API v1beta.
   */
  async collect(project, dateWindow = "7daysAgo") {
    const now = new Date().toISOString();
    const days = dateWindow === "90daysAgo" ? 90 : dateWindow === "28daysAgo" ? 28 : 7;
    const periodStart = new Date(Date.now() - 86400000 * days).toISOString();

    const token = await this.authClient.getAccessToken(["https://www.googleapis.com/auth/analytics.readonly"]);

    if (token && this.propertyId) {
      try {
        const url = `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:runReport`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate: dateWindow, endDate: "yesterday" }],
            metrics: [
              { name: "activeUsers" },
              { name: "sessions" },
              { name: "screenPageViews" },
              { name: "engagedSessions" },
              { name: "eventCount" },
            ],
          }),
        });

        if (response.ok) {
          const report = await response.json();
          const row = report.rows?.[0]?.metricValues || [];
          const activeUsers = parseInt(row[0]?.value || "0", 10);
          const sessions = parseInt(row[1]?.value || "0", 10);
          const pageviews = parseInt(row[2]?.value || "0", 10);
          const engagedSessions = parseInt(row[3]?.value || "0", 10);
          const eventCount = parseInt(row[4]?.value || "0", 10);

          return [
            {
              observation_id: `OBS-GA4-LIVE-USERS-${Date.now()}`,
              project_id: project.project_id,
              source_id: this.provider_id,
              source_type: "GA4_DATA_API_V1BETA",
              metric_id: "users",
              timestamp: now,
              period_start: periodStart,
              period_end: now,
              value: activeUsers,
              unit: "users",
              dimensions: { property_id: this.propertyId, window: dateWindow },
              status: "SUCCESS",
              confidence: "VERY_HIGH",
              confidence_score: 0.99,
              freshness_hours: 4,
              epistemic_type: "FACT",
              provenance: {
                source_name: `Google Analytics 4 (${this.measurementId})`,
                collection_method: "GA4_RUN_REPORT_API",
              },
              collection_run_id: `RUN-${Date.now()}`,
            },
            {
              observation_id: `OBS-GA4-LIVE-SESSIONS-${Date.now()}`,
              project_id: project.project_id,
              source_id: this.provider_id,
              source_type: "GA4_DATA_API_V1BETA",
              metric_id: "sessions",
              timestamp: now,
              period_start: periodStart,
              period_end: now,
              value: sessions,
              unit: "sessions",
              dimensions: { property_id: this.propertyId, engaged_sessions: engagedSessions },
              status: "SUCCESS",
              confidence: "VERY_HIGH",
              confidence_score: 0.99,
              freshness_hours: 4,
              epistemic_type: "FACT",
              provenance: {
                source_name: `Google Analytics 4 (${this.measurementId})`,
                collection_method: "GA4_RUN_REPORT_API",
              },
              collection_run_id: `RUN-${Date.now()}`,
            },
            {
              observation_id: `OBS-GA4-LIVE-VIEWS-${Date.now()}`,
              project_id: project.project_id,
              source_id: this.provider_id,
              source_type: "GA4_DATA_API_V1BETA",
              metric_id: "landing_page_views",
              timestamp: now,
              period_start: periodStart,
              period_end: now,
              value: pageviews,
              unit: "views",
              dimensions: { property_id: this.propertyId, event_count: eventCount },
              status: "SUCCESS",
              confidence: "VERY_HIGH",
              confidence_score: 0.99,
              freshness_hours: 4,
              epistemic_type: "FACT",
              provenance: {
                source_name: `Google Analytics 4 (${this.measurementId})`,
                collection_method: "GA4_RUN_REPORT_API",
              },
              collection_run_id: `RUN-${Date.now()}`,
            },
            {
              observation_id: `OBS-GA4-LIVE-ENGAGED-${Date.now()}`,
              project_id: project.project_id,
              source_id: this.provider_id,
              source_type: "GA4_DATA_API_V1BETA",
              metric_id: "engaged_sessions",
              timestamp: now,
              period_start: periodStart,
              period_end: now,
              value: engagedSessions,
              unit: "sessions",
              dimensions: { property_id: this.propertyId },
              status: "SUCCESS",
              confidence: "VERY_HIGH",
              confidence_score: 0.99,
              freshness_hours: 4,
              epistemic_type: "FACT",
              provenance: {
                source_name: `Google Analytics 4 (${this.measurementId})`,
                collection_method: "GA4_RUN_REPORT_API",
              },
              collection_run_id: `RUN-${Date.now()}`,
            },
          ];
        } else {
          const errBody = await response.text();
          console.warn(`GA4 Data API call failed [${response.status}]: ${errBody}`);
          return this._emitUnavailableObservations(project, now, periodStart, "UNAVAILABLE", `API call failed [${response.status}]: ${errBody}`);
        }
      } catch (callErr) {
        console.warn("GA4 Data API network error:", callErr.message);
        return this._emitUnavailableObservations(project, now, periodStart, "UNAVAILABLE", `Network error: ${callErr.message}`);
      }
    }

    // Truthful Unavailable GA4 Observation: No token obtained or propertyId missing
    const hasCreds = typeof this.authClient.hasCredentials === "function" ? this.authClient.hasCredentials() : false;
    const authStatus = hasCreds ? "AUTH_EXPIRED" : "AUTH_UNAVAILABLE";
    const authReason = hasCreds ? "Service account token exchange failed or expired." : "Google Service Account credentials missing.";

    return this._emitUnavailableObservations(project, now, periodStart, authStatus, authReason);
  }

  _emitUnavailableObservations(project, now, periodStart, status, reason) {
    const metrics = [
      { id: "users", unit: "users" },
      { id: "sessions", unit: "sessions" },
      { id: "landing_page_views", unit: "views" },
      { id: "engaged_sessions", unit: "sessions" },
    ];

    return metrics.map((m, idx) => ({
      observation_id: `OBS-GA4-UNAVAIL-${m.id.toUpperCase()}-${Date.now()}-${idx}`,
      project_id: project.project_id,
      source_id: this.provider_id,
      source_type: "GA4_DATA_API_V1BETA",
      metric_id: m.id,
      timestamp: now,
      period_start: periodStart,
      period_end: now,
      value: null,
      unit: m.unit,
      dimensions: { measurement_id: this.measurementId, property_id: this.propertyId, reason },
      status: status,
      confidence: "LOW",
      confidence_score: 0.0,
      freshness_hours: 0,
      epistemic_type: "UNAVAILABLE",
      provenance: {
        source_name: `Google Analytics 4 (${this.measurementId})`,
        collection_method: "NONE",
        notes: `Data unavailable: ${reason}. Zero fallback values fabricated.`,
      },
      collection_run_id: `RUN-${Date.now()}`,
    }));
  }
}
