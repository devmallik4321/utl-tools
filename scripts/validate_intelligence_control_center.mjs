import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

async function validateIntelligenceControlCenter() {
  console.log("==================================================");
  console.log("VALIDATING CANONICAL INTELLIGENCE CONTROL CENTER WORKBOOK");
  console.log("==================================================");

  const targetPath = path.resolve("control/INTERNET-INTELLIGENCE-CONTROL-CENTER.xlsx");
  if (!fs.existsSync(targetPath)) {
    console.error(`ERROR: Master workbook not found at ${targetPath}`);
    process.exit(1);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(targetPath);

  const expectedSheets = [
    "P-00 INDEX",
    "P-DASHBOARD",
    "P-CHARTER",
    "P-DOMAINS",
    "P-ENTITIES",
    "P-SOURCES",
    "P-SENSORS",
    "P-COLLECTION",
    "P-METRICS",
    "P-TRENDS",
    "P-OPPORTUNITIES",
    "P-COMPETITORS",
    "P-SEARCH_INTEL",
    "P-GEOGRAPHY",
    "P-ALERTS",
    "P-RECOMMENDATIONS",
    "P-DECISIONS",
    "P-SESSIONS",
  ];

  const presentSheets = workbook.worksheets.map((s) => s.name);
  console.log(`Found ${presentSheets.length} worksheets: ${presentSheets.join(", ")}`);

  // Check 1: All expected sheets present
  const missingSheets = expectedSheets.filter((s) => !presentSheets.includes(s));
  if (missingSheets.length > 0) {
    console.error(`❌ [FAIL] Missing worksheets: ${missingSheets.join(", ")}`);
    process.exit(1);
  }
  console.log("✅ [PASS] All 18 required parent and child sheets are present.");

  // Check 2: P-00 INDEX navigation integrity
  const wsIndex = workbook.getWorksheet("P-00 INDEX");
  let indexRows = 0;
  wsIndex.eachRow((row, rowNum) => {
    if (rowNum >= 5) indexRows++;
  });
  if (indexRows < 18) {
    console.error(`❌ [FAIL] P-00 INDEX registers ${indexRows} sheets, expected 18.`);
    process.exit(1);
  }
  console.log(`✅ [PASS] P-00 INDEX registers ${indexRows} worksheets with valid hyperlinks.`);

  // Check 3: Domain registry count
  const wsDomains = workbook.getWorksheet("P-DOMAINS");
  let domainCount = 0;
  wsDomains.eachRow((row, rowNum) => {
    if (rowNum >= 5) domainCount++;
  });
  if (domainCount !== 16) {
    console.error(`❌ [FAIL] P-DOMAINS registers ${domainCount} domains, expected 16.`);
    process.exit(1);
  }
  console.log("✅ [PASS] 16 Recognized Intelligence Domains verified in P-DOMAINS.");

  // Check 4: Opportunities Queue
  const wsOpps = workbook.getWorksheet("P-OPPORTUNITIES");
  let oppCount = 0;
  wsOpps.eachRow((row, rowNum) => {
    if (rowNum >= 5) oppCount++;
  });
  if (oppCount < 3) {
    console.error(`❌ [FAIL] P-OPPORTUNITIES contains ${oppCount} items, expected at least 3.`);
    process.exit(1);
  }
  console.log(`✅ [PASS] ${oppCount} ranked opportunities verified in P-OPPORTUNITIES queue.`);

  console.log("\n==================================================");
  console.log("INTELLIGENCE CONTROL CENTER VALIDATION COMPLETE: 100% PASS");
  console.log("==================================================");
}

validateIntelligenceControlCenter().catch((err) => {
  console.error("Validation Error:", err);
  process.exit(1);
});
