import fs from "fs";
import path from "path";

export class SensorFabricEngine {
  constructor(basePath = path.resolve("intelligence")) {
    this.basePath = basePath;
    this.domains = JSON.parse(fs.readFileSync(path.join(basePath, "registry/domains.json"), "utf-8"));
    this.entities = JSON.parse(fs.readFileSync(path.join(basePath, "registry/entities.json"), "utf-8"));
    this.sources = JSON.parse(fs.readFileSync(path.join(basePath, "registry/sources.json"), "utf-8"));
    this.sensors = JSON.parse(fs.readFileSync(path.join(basePath, "registry/sensors.json"), "utf-8"));
    this.observations = JSON.parse(fs.readFileSync(path.join(basePath, "observations/store.json"), "utf-8"));
    this.opportunities = JSON.parse(fs.readFileSync(path.join(basePath, "opportunities/store.json"), "utf-8"));
  }

  // Audit sensor health and cadences
  auditSensorHealth() {
    const activeSensors = this.sensors.filter((s) => s.status === "ACTIVE");
    const healthySensors = activeSensors.filter((s) => s.failure_count === 0);
    const failedSensors = activeSensors.filter((s) => s.failure_count > 0);

    return {
      total_sensors: this.sensors.length,
      active_sensors: activeSensors.length,
      healthy_sensors: healthySensors.length,
      failed_sensors: failedSensors.length,
    };
  }

  // Calculate Opportunity Score using the canonical formula
  calculateOpportunityScore(metrics) {
    const {
      demandScore = 50,
      growthScore = 50,
      intentMatch = 50,
      competitionGap = 50,
      geoPotential = 50,
      confidenceScore = 0.85,
      complexity = 20,
      maintenanceBurden = 10,
    } = metrics;

    const numerator =
      (demandScore * 0.25 +
        growthScore * 0.20 +
        intentMatch * 0.20 +
        competitionGap * 0.20 +
        geoPotential * 0.15) *
      confidenceScore;
    const denominator = 1 + (complexity * 0.005 + maintenanceBurden * 0.005);

    return parseFloat((numerator / denominator).toFixed(1));
  }

  // Perform Sensor Fusion across observations
  synthesizeIntelligence() {
    const health = this.auditSensorHealth();
    const factObservations = this.observations.filter((o) => o.epistemic_type === "FACT");
    const estimateObservations = this.observations.filter((o) => o.epistemic_type === "ESTIMATE");

    return {
      timestamp: new Date().toISOString(),
      sensor_health: health,
      fact_observations_count: factObservations.length,
      estimate_observations_count: estimateObservations.length,
      ranked_opportunities: this.opportunities.sort((a, b) => b.opportunity_score - a.opportunity_score),
    };
  }
}

// CLI Execution if run directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  console.log("==================================================");
  console.log("CANONICAL INTERNET SENSOR FABRIC ENGINE V1");
  console.log("==================================================");
  const engine = new SensorFabricEngine();
  const report = engine.synthesizeIntelligence();
  console.log(JSON.stringify(report, null, 2));
}
