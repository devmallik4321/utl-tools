import { pathToFileURL } from "url";
import path from "path";
import fs from "fs";

import { utlProjectContract } from "./contract.mjs";
import { utlMetricDefinitions } from "./metrics.mjs";
import { UtlTelemetryAdapter } from "./adapters/UtlTelemetryAdapter.mjs";
import { UtlGA4Adapter } from "./adapters/UtlGA4Adapter.mjs";
import { UtlSearchConsoleAdapter } from "./adapters/UtlSearchConsoleAdapter.mjs";
import { UtlInternetIntelAdapter } from "./adapters/UtlInternetIntelAdapter.mjs";
import { utlOpportunityRules } from "./rules.mjs";

// Dynamically import from canonical reusable object
const reusableObjectPath = "C:/Users/mallik/Documents/AAEP/reusable objects/PROJECT-INTELLIGENCE/src/index.js";
const { createProjectIntelligenceEngine } = await import(pathToFileURL(reusableObjectPath).href);

export async function runUtlProjectIntelligence() {
  console.log("==================================================");
  console.log("RUNNING UTL.tools PROJECT INTELLIGENCE PIPELINE V1");
  console.log("==================================================");

  const engine = createProjectIntelligenceEngine();

  // 1. Register Canonical UTL Contract
  engine.registerProject(utlProjectContract);

  // 2. Register Metrics
  for (const metric of utlMetricDefinitions) {
    engine.registerMetric(metric);
  }

  // 3. Register Provider Adapters
  engine.registerProvider(new UtlTelemetryAdapter());
  engine.registerProvider(new UtlGA4Adapter());
  engine.registerProvider(new UtlSearchConsoleAdapter());
  engine.registerProvider(new UtlInternetIntelAdapter());

  // 4. Ingest and collect preliminary observations for rule evaluation
  const telemetry = new UtlTelemetryAdapter();
  const ga4 = new UtlGA4Adapter();
  const gsc = new UtlSearchConsoleAdapter();
  const intel = new UtlInternetIntelAdapter();

  const tempObs = [
    ...(await telemetry.collect(utlProjectContract)),
    ...(await ga4.collect(utlProjectContract)),
    ...(await gsc.collect(utlProjectContract)),
    ...(await intel.collect(utlProjectContract)),
  ];

  // 5. Evaluate UTL opportunity rules against observations
  const candidateInputs = [];
  for (const rule of utlOpportunityRules) {
    const candidate = rule.evaluate(tempObs);
    if (candidate) {
      candidateInputs.push(candidate);
    }
  }

  // 6. Run 17-stage Master Engine Pipeline
  const pipelineResult = await engine.runPipeline(candidateInputs);

  console.log(`\nProject Health: ${pipelineResult.projectState.overall_health}`);
  console.log(`Primary State Signal: ${pipelineResult.projectState.primary_state}`);
  console.log(`Observations Analyzed: ${tempObs.length}`);
  console.log(`Anomalies Detected: ${pipelineResult.anomalies.length}`);
  console.log(`Opportunities Generated: ${pipelineResult.opportunities.length}`);
  console.log(`Recommendations Formulated: ${pipelineResult.recommendations.length}`);

  return {
    engine,
    contract: utlProjectContract,
    observations: tempObs,
    ...pipelineResult,
  };
}

// Direct CLI execution
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runUtlProjectIntelligence().then((res) => {
    console.log("\nTop Opportunity Rationale:");
    if (res.opportunities[0]) {
      console.log(`- [${res.opportunities[0].priority}] ${res.opportunities[0].title}: ${res.opportunities[0].explanation}`);
    }
  }).catch((err) => {
    console.error("Pipeline run failed:", err);
    process.exit(1);
  });
}
