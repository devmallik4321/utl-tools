import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { UtlTelemetryAdapter } from "../intelligence/project/adapters/UtlTelemetryAdapter.mjs";
import { UtlGA4Adapter } from "../intelligence/project/adapters/UtlGA4Adapter.mjs";
import { loadDailyStatistics, getEmpiricalDailyStatistics } from "../intelligence/project/dailyStatisticsStore.mjs";
import { buildReleasesLedger } from "../scripts/reconstruct_releases.mjs";

const ROOT_DIR = process.cwd();

async function getLatestWorkbook() {
  const backupDir = path.resolve("control/backups");
  const backupFiles = fs.readdirSync(backupDir).filter((f) => f.endsWith(".xlsx")).sort();
  const latestBackup = backupFiles[backupFiles.length - 1];
  const workbookPath = path.resolve(backupDir, latestBackup);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(workbookPath);
  return { workbook, workbookPath };
}

test("1. Registry count equals generated inventory count", async () => {
  const registry = JSON.parse(fs.readFileSync(path.resolve("registry/utilities.json"), "utf-8"));
  assert.equal(registry.length, 420, "Registry must contain 420 utilities");

  const { workbook } = await getLatestWorkbook();
  const wsUtil = workbook.getWorksheet("P-Utilities");
  const utilRows = wsUtil.rowCount - 4;
  assert.equal(utilRows, registry.length, "P-Utilities count must match registry exactly");
});

test("2. Component count is independently derived from filesystem", () => {
  const toolsDir = path.resolve("apps/web-shell/src/components/tools");
  let tsxCount = 0;
  function countTsx(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) countTsx(full);
      else if (e.isFile() && e.name.endsWith(".tsx") && e.name !== "ToolDispatcher.tsx") {
        tsxCount++;
      }
    }
  }
  countTsx(toolsDir);
  const registry = JSON.parse(fs.readFileSync(path.resolve("registry/utilities.json"), "utf-8"));
  assert.equal(tsxCount, 420, "Filesystem component count must be 420");
  assert.equal(tsxCount, registry.length, "Component count must equal registry count");
});

test("3. Dispatcher mapping count is independently inspected", () => {
  const dispatcherPath = path.resolve("apps/web-shell/src/components/tools/ToolDispatcher.tsx");
  const code = fs.readFileSync(dispatcherPath, "utf-8");
  const regex = /"([^"]+)":\s*[A-Za-z0-9_]+/g;
  const slugs = [];
  let m;
  while ((m = regex.exec(code)) !== null) {
    slugs.push(m[1]);
  }
  const registry = JSON.parse(fs.readFileSync(path.resolve("registry/utilities.json"), "utf-8"));
  const registrySlugSet = new Set(registry.map((u) => u.slug));

  const missing = registry.filter((u) => !slugs.includes(u.slug));
  assert.equal(missing.length, 0, "No active registry utility may be missing from ToolDispatcher");

  const aliases = slugs.filter((s) => !registrySlugSet.has(s));
  assert.equal(aliases.length, 6, "Must account for exactly 6 backward-compatibility aliases");
  assert.equal(slugs.length, 426, "Total dispatcher mappings must be exactly 426 (420 active + 6 aliases)");
});

test("4. Dashboard formulas do not contain the old A5:A100 truncation", async () => {
  const { workbook } = await getLatestWorkbook();
  const wsDash = workbook.getWorksheet("P-Dashboard");
  let checkedFormulas = 0;
  wsDash.eachRow((row, rowNumber) => {
    if (rowNumber >= 6) {
      const cellVal = row.getCell(3).value;
      if (cellVal && typeof cellVal === "object" && cellVal.formula) {
        checkedFormulas++;
        assert.equal(
          cellVal.formula.includes("A5:A100)") || cellVal.formula.includes("A5:A100,"),
          false,
          `Formula on row ${rowNumber} contains truncated A5:A100: ${cellVal.formula}`
        );
        assert.ok(
          cellVal.formula.includes("1000"),
          `Formula on row ${rowNumber} must use bounded 1000 range: ${cellVal.formula}`
        );
      }
    }
  });
  assert.ok(checkedFormulas >= 7, "Must verify all dashboard KPI formulas");
});

test("5. Test specifications are not counted as executed tests", async () => {
  const { workbook } = await getLatestWorkbook();
  const wsTestCases = workbook.getWorksheet("C-TestCases");
  let passCount = 0;
  wsTestCases.eachRow((row, rowNumber) => {
    if (rowNumber > 4) {
      const status = row.getCell(10).value;
      if (status === "PASS") passCount++;
    }
  });
  assert.equal(passCount, 0, "Zero automated PASS test rows may exist without automated runner");

  const wsDash = workbook.getWorksheet("P-Dashboard");
  const executedTestRow = wsDash.getRow(20); // Row 20 (SN 14: Automated Tests Executed)
  assert.equal(executedTestRow.getCell(2).value, "Automated Tests Executed");
  assert.equal(executedTestRow.getCell(3).value.formula, 'COUNTIF(\'C-TestCases\'!J5:J1000,"PASS")');
});

test("6. Historical synthetic telemetry is classified as contaminated", () => {
  const records = loadDailyStatistics();
  const contaminated = records.filter(
    (r) => r.date >= "2026-08-26" && r.date <= "2026-09-03"
  );
  assert.ok(contaminated.length >= 8, "Must contain all historical records from 2026-08-26 to 2026-09-03");
  for (const r of contaminated) {
    assert.equal(r.epistemic_classification, "SYNTHETIC_CONTAMINATED", `Record ${r.date} must be marked SYNTHETIC_CONTAMINATED`);
    assert.equal(r.usable_for_empirical_analysis, false, `Record ${r.date} must not be usable for empirical analysis`);
    assert.ok(r.contamination_reason && r.contamination_reason.length > 10, `Record ${r.date} must have explicit contamination reason`);
  }
});

test("7. Contaminated historical telemetry is excluded from empirical traffic calculations", () => {
  const empirical = getEmpiricalDailyStatistics();
  for (const r of empirical) {
    assert.equal(r.usable_for_empirical_analysis, true, `Empirical record ${r.date} must be usable`);
    assert.notEqual(r.epistemic_classification, "SYNTHETIC_CONTAMINATED", `Empirical record ${r.date} cannot be SYNTHETIC_CONTAMINATED`);
  }
  const contaminatedDates = ["2026-08-26", "2026-08-27", "2026-08-28", "2026-08-29", "2026-08-30", "2026-08-31", "2026-09-01", "2026-09-02", "2026-09-03"];
  for (const cd of contaminatedDates) {
    assert.equal(empirical.some((r) => r.date === cd), false, `Contaminated date ${cd} must be excluded from empirical stats`);
  }
});

test("8. No hardcoded GA4 fallback numbers exist in executable adapter behavior", async () => {
  const adapter = new UtlGA4Adapter();
  adapter.authClient = {
    isConfigured: () => false,
    hasCredentials: () => false,
    getAccessToken: async () => null,
  };
  const observations = await adapter.collect({ project_id: "PRJ-UTL" });
  for (const obs of observations) {
    assert.equal(obs.value, null, `Metric ${obs.metric_id} must have null value on auth failure`);
    assert.notEqual(obs.value, 120, "GA4 users must never fallback to 120");
    assert.notEqual(obs.value, 12, "GA4 sessions must never fallback to 12");
    assert.notEqual(obs.value, 48, "GA4 views must never fallback to 48");
    assert.ok(["AUTH_UNAVAILABLE", "AUTH_EXPIRED", "UNAVAILABLE"].includes(obs.status));
  }
});

test("9. No inventory-to-usage multiplier exists in telemetry collection", async () => {
  const adapterSource = fs.readFileSync(path.resolve("intelligence/project/adapters/UtlTelemetryAdapter.mjs"), "utf-8");
  assert.equal(/\*\s*18/.test(adapterSource), false, "Must not contain * 18 multiplier");
  assert.equal(/\*\s*12/.test(adapterSource), false, "Must not contain * 12 multiplier");
  assert.equal(/\*\s*14/.test(adapterSource), false, "Must not contain * 14 multiplier");

  const adapter = new UtlTelemetryAdapter();
  const observations = await adapter.collect({ project_id: "PRJ-UTL" });
  for (const obs of observations) {
    assert.equal(obs.value, null, `Telemetry metric ${obs.metric_id} must be null`);
    assert.equal(obs.status, "UNAVAILABLE", `Telemetry metric ${obs.metric_id} status must be UNAVAILABLE`);
  }
});

test("10. Changelog rows correspond to actual repository evidence", () => {
  const changelogPath = path.resolve("documentation/GIT-CHANGELOG.json");
  assert.ok(fs.existsSync(changelogPath), "GIT-CHANGELOG.json must exist");
  const changelog = JSON.parse(fs.readFileSync(changelogPath, "utf-8"));
  assert.ok(changelog.length >= 50, "Must contain reconstructed git commits (at least 50)");

  for (const c of changelog) {
    assert.ok(c.commit_sha && c.commit_sha.length >= 7, "Each commit must have commit_sha");
    assert.ok(c.timestamp, "Each commit must have timestamp");
    assert.ok(c.subject, "Each commit must have subject");
    assert.equal(c.epistemic_classification, "VERIFIED", "Git changelog entries must be VERIFIED");
  }
});

test("11. Release rows are not fabricated", () => {
  const ledger = buildReleasesLedger();
  assert.ok(ledger.length >= 40, "Release ledger must contain all milestones (at least 40)");

  for (const rel of ledger) {
    assert.ok(["VERIFIED", "DERIVED"].includes(rel.epistemic_classification), `Release ${rel.release_id} must be VERIFIED or DERIVED`);
    assert.notEqual(rel.epistemic_classification, "FACT", "Release milestone must never be labeled FACT");
    assert.ok(rel.provenance_evidence && rel.provenance_evidence.length > 10, `Release ${rel.release_id} must have provenance evidence`);
  }

  // Batches 1 to 29 must be DERIVED
  const derivedBatches = ledger.filter((r) => r.release_id.startsWith("EXP-BATCH-") && parseInt(r.release_id.slice(10), 10) <= 29);
  assert.equal(derivedBatches.length, 29);
  for (const b of derivedBatches) {
    assert.equal(b.epistemic_classification, "DERIVED");
  }

  // Batches 30 to 37 must be VERIFIED
  const verifiedBatches = ledger.filter((r) => r.release_id.startsWith("EXP-BATCH-") && parseInt(r.release_id.slice(10), 10) >= 30);
  assert.equal(verifiedBatches.length, 8);
  for (const b of verifiedBatches) {
    assert.equal(b.epistemic_classification, "VERIFIED");
  }
});

test("12. Every dashboard claim marked VERIFIED has an authoritative provenance source", () => {
  const metricsPath = path.resolve("intelligence/project/system_metrics.json");
  assert.ok(fs.existsSync(metricsPath), "system_metrics.json must exist");
  const metricsDoc = JSON.parse(fs.readFileSync(metricsPath, "utf-8"));

  const verified = metricsDoc.metrics.filter((m) => m.epistemic_type === "VERIFIED");
  assert.ok(verified.length >= 5, "Must have verified system metrics");
  for (const m of verified) {
    assert.ok(m.source, `Metric ${m.metric_id} must have a source`);
    assert.ok(m.calculation_method, `Metric ${m.metric_id} must have calculation_method`);
    assert.ok(m.provenance, `Metric ${m.metric_id} must have provenance`);
    assert.equal(m.confidence, 1.0, `Metric ${m.metric_id} confidence must be 1.0`);
  }
});

test("13. Unavailable metrics remain null", () => {
  const metricsPath = path.resolve("intelligence/project/system_metrics.json");
  const metricsDoc = JSON.parse(fs.readFileSync(metricsPath, "utf-8"));
  const telViews = metricsDoc.metrics.find((m) => m.metric_id === "live_telemetry_views");
  const telExecs = metricsDoc.metrics.find((m) => m.metric_id === "live_telemetry_executions");

  assert.ok(telViews);
  assert.equal(telViews.value, null, "live_telemetry_views must be null");
  assert.equal(telViews.status, "UNAVAILABLE", "live_telemetry_views status must be UNAVAILABLE");
  assert.equal(telViews.epistemic_type, "UNAVAILABLE");

  assert.ok(telExecs);
  assert.equal(telExecs.value, null, "live_telemetry_executions must be null");
  assert.equal(telExecs.status, "UNAVAILABLE", "live_telemetry_executions status must be UNAVAILABLE");
  assert.equal(telExecs.epistemic_type, "UNAVAILABLE");
});

test("14. NO_DATA is never converted into zero", () => {
  const store = loadDailyStatistics();
  const empiricalRecord = store.find((r) => r.usable_for_empirical_analysis === true);
  if (empiricalRecord) {
    assert.equal(empiricalRecord.utl_utility_views, null, "utl_utility_views must remain null when uncollected, not 0");
    assert.equal(empiricalRecord.utl_tool_executions, null, "utl_tool_executions must remain null when uncollected, not 0");
  }
});

test("15. Generator and validator do not pass merely because they share generated row counts", () => {
  const validatorSource = fs.readFileSync(path.resolve("scripts/validate_control_center.mjs"), "utf-8");
  assert.ok(validatorSource.includes("registry/utilities.json"), "Validator must independently inspect utilities.json");
  assert.ok(validatorSource.includes("apps/web-shell/src/components/tools"), "Validator must independently inspect filesystem");
  assert.ok(validatorSource.includes("ToolDispatcher.tsx"), "Validator must independently inspect ToolDispatcher");
  assert.ok(validatorSource.includes("GIT-CHANGELOG.json"), "Validator must independently inspect Git changelog");
});
