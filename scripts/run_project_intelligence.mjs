import fs from "fs";
import path from "path";
import { runUtlProjectIntelligence } from "../intelligence/project/runner.mjs";
import { recordDailyStatistics } from "../intelligence/project/dailyStatisticsStore.mjs";
import { generateControlCenter } from "./generate_control_center.mjs";

async function main() {
  console.log("==================================================");
  console.log("PROJECT INTELLIGENCE V1 — UTL.tools RUNNER");
  console.log("==================================================");

  // 1. Run core intelligence pipeline
  const result = await runUtlProjectIntelligence();

  // 2. Persist snapshot to intelligence/project/last_run.json
  const snapshotPath = path.resolve("intelligence/project/last_run.json");
  const snapshotData = {
    executed_at: new Date().toISOString(),
    project_id: result.contract.project_id,
    project_name: result.contract.project_name,
    project_health: result.projectState.overall_health,
    primary_state: result.projectState.primary_state,
    observations_count: result.observations.length,
    anomalies_count: result.anomalies.length,
    opportunities_count: result.opportunities.length,
    recommendations_count: result.recommendations.length,
    opportunities: result.opportunities,
    recommendations: result.recommendations,
  };

  fs.writeFileSync(snapshotPath, JSON.stringify(snapshotData, null, 2));
  console.log(`\nSaved run snapshot to: ${snapshotPath}`);

  // 3. Record / update daily statistics history store
  recordDailyStatistics(result.observations);
  console.log("Updated daily statistics historical store.");

  // 4. Re-generate and synchronize canonical Control Center workbook
  console.log("\nSynchronizing UTL-CONTROL-CENTER.xlsx...");
  await generateControlCenter();

  console.log("\n✅ [SUCCESS] Project Intelligence run and Control Center synchronization complete.");
}

main().catch((err) => {
  console.error("Runner execution failed:", err);
  process.exit(1);
});
