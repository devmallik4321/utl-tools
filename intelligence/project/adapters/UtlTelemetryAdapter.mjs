import fs from "fs";
import path from "path";
import { defaultTelemetryStore } from "../../telemetry/telemetryStore.mjs";

export class UtlTelemetryAdapter {
  constructor(basePath = path.resolve("."), options = {}) {
    this.provider_id = "SRC-UTL-TELEMETRY";
    this.provider_type = "INTERNAL_TELEMETRY";
    this.basePath = basePath;
    this.telemetryStore = options.telemetryStore || (options.connectStore ? defaultTelemetryStore : null);
  }

  connectStore(store = defaultTelemetryStore) {
    this.telemetryStore = store;
  }

  async collect(project, options = {}) {
    const now = new Date().toISOString();
    const periodStart = new Date(Date.now() - 86400000).toISOString();
    const today = (options.date || now).slice(0, 10);

    // Read local canonical registries to get authoritative structural inventory counts
    const utilsPath = path.join(this.basePath, "registry/utilities.json");
    const widgetsPath = path.join(this.basePath, "registry/widgets.json");

    const utilsCount = fs.existsSync(utilsPath) ? JSON.parse(fs.readFileSync(utilsPath, "utf-8")).length : 0;
    const widgetsCount = fs.existsSync(widgetsPath) ? JSON.parse(fs.readFileSync(widgetsPath, "utf-8")).length : 0;

    // Truthful Unavailable Telemetry when store is disconnected or unconfigured
    if (!this.telemetryStore || !this.telemetryStore.isConfigured()) {
      return [
        {
          observation_id: `OBS-UTL-TEL-001-${Date.now()}`,
          project_id: project.project_id,
          source_id: this.provider_id,
          source_type: "INTERNAL_TELEMETRY",
          metric_id: "utility_views",
          timestamp: now,
          period_start: periodStart,
          period_end: now,
          value: null,
          unit: "views",
          dimensions: { reason: "NO_TELEMETRY_SOURCE", inventory_count: utilsCount },
          status: "UNAVAILABLE",
          confidence: "LOW",
          confidence_score: 0.0,
          freshness_hours: 0,
          epistemic_type: "UNAVAILABLE",
          provenance: {
            source_name: "UTL Application Telemetry",
            collection_method: "NONE",
            notes: "No live client telemetry database connected. Inventory counts are not converted to views.",
          },
          collection_run_id: `RUN-${Date.now()}`,
        },
        {
          observation_id: `OBS-UTL-TEL-002-${Date.now()}`,
          project_id: project.project_id,
          source_id: this.provider_id,
          source_type: "INTERNAL_TELEMETRY",
          metric_id: "widget_views",
          timestamp: now,
          period_start: periodStart,
          period_end: now,
          value: null,
          unit: "views",
          dimensions: { reason: "NO_TELEMETRY_SOURCE", inventory_count: widgetsCount },
          status: "UNAVAILABLE",
          confidence: "LOW",
          confidence_score: 0.0,
          freshness_hours: 0,
          epistemic_type: "UNAVAILABLE",
          provenance: {
            source_name: "UTL Application Telemetry",
            collection_method: "NONE",
            notes: "No live widget telemetry database connected. Widget counts are not converted to views.",
          },
          collection_run_id: `RUN-${Date.now()}`,
        },
        {
          observation_id: `OBS-UTL-TEL-003-${Date.now()}`,
          project_id: project.project_id,
          source_id: this.provider_id,
          source_type: "INTERNAL_TELEMETRY",
          metric_id: "utility_interactions",
          timestamp: now,
          period_start: periodStart,
          period_end: now,
          value: null,
          unit: "actions",
          dimensions: { reason: "NO_TELEMETRY_SOURCE", inventory_count: utilsCount },
          status: "UNAVAILABLE",
          confidence: "LOW",
          confidence_score: 0.0,
          freshness_hours: 0,
          epistemic_type: "UNAVAILABLE",
          provenance: {
            source_name: "UTL Application Telemetry",
            collection_method: "NONE",
            notes: "No live interaction telemetry database connected. Inventory counts are not converted to actions.",
          },
          collection_run_id: `RUN-${Date.now()}`,
        },
      ];
    }

    // Telemetry Store is connected: Aggregate genuine empirical events
    const daily = this.telemetryStore.aggregateDailyTelemetry(today);

    if (daily.status === "UNAVAILABLE") {
      return [
        {
          observation_id: `OBS-UTL-TEL-001-${Date.now()}`,
          project_id: project.project_id,
          source_id: this.provider_id,
          source_type: "INTERNAL_TELEMETRY",
          metric_id: "utility_views",
          timestamp: now,
          period_start: periodStart,
          period_end: now,
          value: null,
          unit: "views",
          dimensions: { reason: "NO_TELEMETRY_SOURCE", inventory_count: utilsCount },
          status: "UNAVAILABLE",
          confidence: "LOW",
          confidence_score: 0.0,
          freshness_hours: 0,
          epistemic_type: "UNAVAILABLE",
          provenance: {
            source_name: "UTL Application Telemetry",
            collection_method: "NONE",
            notes: daily.reason || "Telemetry source unavailable.",
          },
          collection_run_id: `RUN-${Date.now()}`,
        },
        {
          observation_id: `OBS-UTL-TEL-002-${Date.now()}`,
          project_id: project.project_id,
          source_id: this.provider_id,
          source_type: "INTERNAL_TELEMETRY",
          metric_id: "widget_views",
          timestamp: now,
          period_start: periodStart,
          period_end: now,
          value: null,
          unit: "views",
          dimensions: { reason: "NO_TELEMETRY_SOURCE", inventory_count: widgetsCount },
          status: "UNAVAILABLE",
          confidence: "LOW",
          confidence_score: 0.0,
          freshness_hours: 0,
          epistemic_type: "UNAVAILABLE",
          provenance: {
            source_name: "UTL Application Telemetry",
            collection_method: "NONE",
            notes: daily.reason || "Widget telemetry unavailable.",
          },
          collection_run_id: `RUN-${Date.now()}`,
        },
        {
          observation_id: `OBS-UTL-TEL-003-${Date.now()}`,
          project_id: project.project_id,
          source_id: this.provider_id,
          source_type: "INTERNAL_TELEMETRY",
          metric_id: "utility_interactions",
          timestamp: now,
          period_start: periodStart,
          period_end: now,
          value: null,
          unit: "actions",
          dimensions: { reason: "NO_TELEMETRY_SOURCE", inventory_count: utilsCount },
          status: "UNAVAILABLE",
          confidence: "LOW",
          confidence_score: 0.0,
          freshness_hours: 0,
          epistemic_type: "UNAVAILABLE",
          provenance: {
            source_name: "UTL Application Telemetry",
            collection_method: "NONE",
            notes: daily.reason || "Interaction telemetry unavailable.",
          },
          collection_run_id: `RUN-${Date.now()}`,
        },
      ];
    }

    // Connected source with 0 real events -> value: 0, status: SUCCESS, epistemic_type: VERIFIED
    // Connected source with N real events -> value: N, status: SUCCESS, epistemic_type: FACT
    const isZero = daily.total_events === 0;
    const epistemic = isZero ? "VERIFIED" : "FACT";
    const reason = isZero ? "ZERO_EVENTS_RECORDED" : "FIRST_PARTY_EVENTS_AGGREGATED";

    return [
      {
        observation_id: `OBS-UTL-TEL-001-${Date.now()}`,
        project_id: project.project_id,
        source_id: this.provider_id,
        source_type: "INTERNAL_TELEMETRY",
        metric_id: "utility_views",
        timestamp: now,
        period_start: periodStart,
        period_end: now,
        value: daily.utility_views,
        unit: "views",
        dimensions: { reason, total_events_analyzed: daily.total_events, inventory_count: utilsCount },
        status: "SUCCESS",
        confidence: "HIGH",
        confidence_score: 1.0,
        freshness_hours: 0,
        epistemic_type: epistemic,
        provenance: {
          source_name: "UTL Application Telemetry Store",
          collection_method: "FIRST_PARTY_INGEST",
          notes: `Authoritative daily aggregation of ${daily.total_events} first-party telemetry events. Zero inventory multipliers applied.`,
        },
        collection_run_id: `RUN-${Date.now()}`,
      },
      {
        observation_id: `OBS-UTL-TEL-002-${Date.now()}`,
        project_id: project.project_id,
        source_id: this.provider_id,
        source_type: "INTERNAL_TELEMETRY",
        metric_id: "widget_views",
        timestamp: now,
        period_start: periodStart,
        period_end: now,
        value: daily.widget_views,
        unit: "views",
        dimensions: { reason, total_events_analyzed: daily.total_events, inventory_count: widgetsCount },
        status: "SUCCESS",
        confidence: "HIGH",
        confidence_score: 1.0,
        freshness_hours: 0,
        epistemic_type: epistemic,
        provenance: {
          source_name: "UTL Application Telemetry Store",
          collection_method: "FIRST_PARTY_INGEST",
          notes: `Authoritative daily aggregation of ${daily.total_events} first-party telemetry events. Zero inventory multipliers applied.`,
        },
        collection_run_id: `RUN-${Date.now()}`,
      },
      {
        observation_id: `OBS-UTL-TEL-003-${Date.now()}`,
        project_id: project.project_id,
        source_id: this.provider_id,
        source_type: "INTERNAL_TELEMETRY",
        metric_id: "utility_interactions",
        timestamp: now,
        period_start: periodStart,
        period_end: now,
        value: daily.tool_executions,
        unit: "actions",
        dimensions: { reason, total_events_analyzed: daily.total_events, inventory_count: utilsCount },
        status: "SUCCESS",
        confidence: "HIGH",
        confidence_score: 1.0,
        freshness_hours: 0,
        epistemic_type: epistemic,
        provenance: {
          source_name: "UTL Application Telemetry Store",
          collection_method: "FIRST_PARTY_INGEST",
          notes: `Authoritative daily aggregation of ${daily.total_events} first-party telemetry events. Zero inventory multipliers applied.`,
        },
        collection_run_id: `RUN-${Date.now()}`,
      },
    ];
  }
}
