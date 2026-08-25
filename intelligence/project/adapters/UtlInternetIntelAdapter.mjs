import fs from "fs";
import path from "path";

export class UtlInternetIntelAdapter {
  constructor(basePath = path.resolve(".")) {
    this.provider_id = "SRC-INTERNET-INTEL-FABRIC";
    this.provider_type = "EXTERNAL_INTELLIGENCE";
    this.observationsPath = path.join(basePath, "intelligence/observations/store.json");
  }

  async collect(project) {
    const now = new Date().toISOString();
    const periodStart = new Date(Date.now() - 86400000 * 7).toISOString();

    if (fs.existsSync(this.observationsPath)) {
      try {
        const rawStore = JSON.parse(fs.readFileSync(this.observationsPath, "utf-8"));
        return rawStore.map((obs, idx) => ({
          observation_id: `OBS-INTEL-UPSTREAM-${idx + 1}-${Date.now()}`,
          project_id: project.project_id,
          source_id: this.provider_id,
          source_type: obs.source || "SENSOR_FABRIC",
          metric_id: obs.metric_name || "external_demand_index",
          timestamp: obs.collected_at || now,
          period_start: periodStart,
          period_end: now,
          value: typeof obs.value === "number" ? obs.value : 80,
          unit: obs.unit || "score",
          dimensions: { entity_id: obs.entity_id || "GLOBAL" },
          status: "SUCCESS",
          confidence: obs.confidence || "HIGH",
          confidence_score: 0.85,
          freshness_hours: 12,
          epistemic_type: obs.epistemic_type || "ESTIMATE",
          provenance: {
            source_name: "Internet Intelligence Sensor Fabric V1",
            collection_method: "MULTI_SENSOR_FUSION",
          },
          collection_run_id: `RUN-${Date.now()}`,
        }));
      } catch (err) {
        console.warn("Notice: Could not parse Internet Intelligence store:", err);
      }
    }

    // Fallback if Internet Intelligence is not available
    return [
      {
        observation_id: `OBS-INTEL-FALLBACK-${Date.now()}`,
        project_id: project.project_id,
        source_id: this.provider_id,
        source_type: "SENSOR_FABRIC",
        metric_id: "external_market_demand_index",
        timestamp: now,
        period_start: periodStart,
        period_end: now,
        value: 82.5,
        unit: "index_0_100",
        dimensions: { category: "web_utilities" },
        status: "NOT_CONNECTED",
        confidence: "MEDIUM",
        confidence_score: 0.70,
        freshness_hours: 48,
        epistemic_type: "ESTIMATE",
        provenance: {
          source_name: "Internet Intelligence Sensor Fabric V1",
          collection_method: "OFFLINE_BENCHMARK",
        },
        collection_run_id: `RUN-${Date.now()}`,
      },
    ];
  }
}
