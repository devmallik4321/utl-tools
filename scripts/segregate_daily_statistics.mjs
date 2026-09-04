import fs from "fs";
import path from "path";

export function segregateHistoricalDailyStatistics() {
  const storePath = path.resolve("intelligence/project/daily_statistics.json");
  const records = JSON.parse(fs.readFileSync(storePath, "utf-8"));

  const updatedRecords = records.map((rec) => {
    // Records before 2026-09-04 are contaminated with synthetic usage multipliers or GA4 fallbacks
    if (rec.date < "2026-09-04") {
      return {
        ...rec,
        epistemic_classification: "SYNTHETIC_CONTAMINATED",
        contamination_reason: "Telemetry derived from inventory multipliers (*18, *12, *14) and/or GA4 fallback substitution (120 users).",
        usable_for_empirical_analysis: false,
      };
    } else {
      return {
        ...rec,
        epistemic_classification: "TRUTHFUL_EMPIRICAL",
        contamination_reason: null,
        usable_for_empirical_analysis: true,
      };
    }
  });

  fs.writeFileSync(storePath, JSON.stringify(updatedRecords, null, 2));
  console.log(`✅ Updated ${updatedRecords.length} daily statistics records with explicit epistemic classification.`);
  console.log(`- Contaminated records (segregated): ${updatedRecords.filter(r => !r.usable_for_empirical_analysis).length}`);
  console.log(`- Empirical truthful records: ${updatedRecords.filter(r => r.usable_for_empirical_analysis).length}`);

  return updatedRecords;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/segregate_daily_statistics.mjs")) {
  segregateHistoricalDailyStatistics();
}
