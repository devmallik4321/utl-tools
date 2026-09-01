import { GoogleAuthClient } from "../googleAuth.mjs";

export class UtlSearchConsoleAdapter {
  constructor(options = {}) {
    this.provider_id = "SRC-GSC-UTL";
    this.provider_type = "SEARCH_CONSOLE_API";
    this.siteUrl = options.siteUrl || process.env.GSC_SITE_URL || "sc-domain:utl.tools";
    this.authClient = new GoogleAuthClient();
  }

  /**
   * Collect observations from Google Search Console Search Analytics API.
   */
  async collect(project, dateWindow = "7daysAgo") {
    const now = new Date().toISOString();
    const days = dateWindow === "90daysAgo" ? 90 : dateWindow === "28daysAgo" ? 28 : 7;
    const periodStart = new Date(Date.now() - 86400000 * days).toISOString();
    const startDateStr = new Date(Date.now() - 86400000 * days).toISOString().split("T")[0];
    const endDateStr = new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0];

    const token = await this.authClient.getAccessToken(["https://www.googleapis.com/auth/webmasters.readonly"]);

    if (token) {
      try {
        const encodedSite = encodeURIComponent(this.siteUrl);
        const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

        // 1. Authoritative Property-Level Total Query (without query dimension truncation)
        const totalResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: startDateStr,
            endDate: endDateStr,
          }),
        });

        let totalImpressions = 0;
        let totalClicks = 0;
        let avgCtr = 0;
        let avgPos = 0;

        if (totalResponse.ok) {
          const totalReport = await totalResponse.json();
          const totalRow = totalReport.rows?.[0];
          if (totalRow) {
            totalImpressions = totalRow.impressions || 0;
            totalClicks = totalRow.clicks || 0;
            avgCtr = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
            avgPos = totalRow.position ? parseFloat(totalRow.position.toFixed(1)) : 0;
          }
        }

        // 2. Query-Level Discovery (separate query for keyword opportunity analysis)
        let topQueriesCount = 0;
        try {
          const queryResponse = await fetch(url, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              startDate: startDateStr,
              endDate: endDateStr,
              dimensions: ["query"],
              rowLimit: 50,
            }),
          });
          if (queryResponse.ok) {
            const queryReport = await queryResponse.json();
            topQueriesCount = queryReport.rows?.length || 0;
          }
        } catch (qErr) {
          console.warn("GSC query-level breakdown notice:", qErr.message);
        }

        return [
          {
            observation_id: `OBS-GSC-LIVE-IMPRESSIONS-${Date.now()}`,
            project_id: project.project_id,
            source_id: this.provider_id,
            source_type: "GSC_SEARCH_ANALYTICS_API",
            metric_id: "search_impressions",
            timestamp: now,
            period_start: periodStart,
            period_end: now,
            value: totalImpressions,
            unit: "impressions",
            dimensions: { property: this.siteUrl, top_queries_count: topQueriesCount, window: dateWindow },
            status: "SUCCESS",
            confidence: "VERY_HIGH",
            confidence_score: 0.99,
            freshness_hours: 48,
            epistemic_type: "FACT",
            provenance: {
              source_name: `Google Search Console (${this.siteUrl})`,
              collection_method: "SEARCH_ANALYTICS_PROPERTY_TOTAL_API",
            },
            collection_run_id: `RUN-${Date.now()}`,
          },
            {
              observation_id: `OBS-GSC-LIVE-CLICKS-${Date.now()}`,
              project_id: project.project_id,
              source_id: this.provider_id,
              source_type: "GSC_SEARCH_ANALYTICS_API",
              metric_id: "search_clicks",
              timestamp: now,
              period_start: periodStart,
              period_end: now,
              value: totalClicks,
              unit: "clicks",
              dimensions: { property: this.siteUrl, window: dateWindow },
              status: "SUCCESS",
              confidence: "VERY_HIGH",
              confidence_score: 0.99,
              freshness_hours: 48,
              epistemic_type: "FACT",
              provenance: {
                source_name: `Google Search Console (${this.siteUrl})`,
                collection_method: "SEARCH_ANALYTICS_QUERY_API",
              },
              collection_run_id: `RUN-${Date.now()}`,
            },
            {
              observation_id: `OBS-GSC-LIVE-CTR-${Date.now()}`,
              project_id: project.project_id,
              source_id: this.provider_id,
              source_type: "GSC_SEARCH_ANALYTICS_API",
              metric_id: "search_ctr",
              timestamp: now,
              period_start: periodStart,
              period_end: now,
              value: avgCtr,
              unit: "percentage",
              dimensions: { property: this.siteUrl, window: dateWindow },
              status: "SUCCESS",
              confidence: "VERY_HIGH",
              confidence_score: 0.99,
              freshness_hours: 48,
              epistemic_type: "FACT",
              provenance: {
                source_name: `Google Search Console (${this.siteUrl})`,
                collection_method: "SEARCH_ANALYTICS_QUERY_API",
              },
              collection_run_id: `RUN-${Date.now()}`,
            },
            {
              observation_id: `OBS-GSC-LIVE-POS-${Date.now()}`,
              project_id: project.project_id,
              source_id: this.provider_id,
              source_type: "GSC_SEARCH_ANALYTICS_API",
              metric_id: "average_position",
              timestamp: now,
              period_start: periodStart,
              period_end: now,
              value: avgPos,
              unit: "rank",
              dimensions: { property: this.siteUrl, window: dateWindow },
              status: "SUCCESS",
              confidence: "VERY_HIGH",
              confidence_score: 0.99,
              freshness_hours: 48,
              epistemic_type: "FACT",
              provenance: {
                source_name: `Google Search Console (${this.siteUrl})`,
                collection_method: "SEARCH_ANALYTICS_QUERY_API",
              },
              collection_run_id: `RUN-${Date.now()}`,
            },
          ];
      } catch (callErr) {
        console.warn("GSC API network error:", callErr.message);
      }
    }

    // Fallback if token unavailable
    return [
      {
        observation_id: `OBS-GSC-UTL-001-${Date.now()}`,
        project_id: project.project_id,
        source_id: this.provider_id,
        source_type: "GSC_SEARCH_ANALYTICS",
        metric_id: "search_impressions",
        timestamp: now,
        period_start: periodStart,
        period_end: now,
        value: 0,
        unit: "impressions",
        dimensions: { property: this.siteUrl, auth_state: "AUTH_REQUIRED" },
        status: "AUTH_REQUIRED",
        confidence: "MEDIUM",
        confidence_score: 0.75,
        freshness_hours: 48,
        epistemic_type: "ESTIMATE",
        provenance: {
          source_name: `Google Search Console (${this.siteUrl})`,
          collection_method: "SERP_PROPERTY_BENCHMARK",
        },
        collection_run_id: `RUN-${Date.now()}`,
      },
    ];
  }
}
