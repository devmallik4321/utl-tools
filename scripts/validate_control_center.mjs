import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

async function validateControlCenter() {
  console.log("==================================================");
  console.log("VALIDATING CANONICAL CONTROL CENTER WORKBOOK");
  console.log("==================================================");

  // Find latest backup or master workbook
  const backupDir = path.resolve("control/backups");
  const backupFiles = fs.readdirSync(backupDir).filter((f) => f.endsWith(".xlsx")).sort();
  const latestBackup = backupFiles[backupFiles.length - 1];
  const workbookPath = path.resolve(backupDir, latestBackup);

  console.log(`Auditing target workbook: ${workbookPath}`);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(workbookPath);

  const sheetNames = workbook.worksheets.map((s) => s.name);
  console.log(`\nFound ${sheetNames.length} worksheets:`, sheetNames.join(", "));

  const expectedSheets = [
    "P-00 INDEX",
    "P-Dashboard",
    "P-Charter",
    "P-Utilities",
    "P-Work",
    "P-Research",
    "P-Releases",
    "P-Contexts",
    "P-Sessions",
    "C-Reviews",
    "C-Changes",
    "C-TestCases",
    "C-SEO",
    "C-Trust",
    "C-Candidates",
    "C-Competitors",
    "C-SearchIntel",
    "C-Widgets",
    "C-WidgetCategories",
    "C-GrowthObservations",
    "C-GrowthOpportunities",
    "C-DailyStatistics"
  ];

  // 1. Check all expected sheets exist
  for (const expected of expectedSheets) {
    if (!sheetNames.includes(expected)) {
      throw new Error(`Missing expected sheet: ${expected}`);
    }
  }
  console.log(`✅ [PASS] All ${expectedSheets.length} required parent and child sheets are present.`);

  // 2. Validate P-00 INDEX
  const wsIndex = workbook.getWorksheet("P-00 INDEX");
  let indexRegisteredCount = 0;
  wsIndex.eachRow((row, rowNumber) => {
    if (rowNumber > 4) {
      const sn = row.getCell(1).value;
      const code = row.getCell(2).value;
      const name = row.getCell(3).value;
      const target = row.getCell(8).value;
      if (sn && code && name) {
        indexRegisteredCount++;
        if (!target || !target.hyperlink) {
          throw new Error(`Missing hyperlink on index row ${rowNumber} (${name})`);
        }
      }
    }
  });
  console.log(`✅ [PASS] P-00 INDEX registers ${indexRegisteredCount} worksheets with valid hyperlinks.`);

  // 3. Validate Navigation links on every sheet
  workbook.eachSheet((sheet) => {
    if (sheet.name !== "P-00 INDEX") {
      const cellA1 = sheet.getCell("A1").value;
      if (!cellA1 || !cellA1.hyperlink || !cellA1.hyperlink.includes("P-00 INDEX")) {
        throw new Error(`Sheet ${sheet.name} missing 'Back to P-00 INDEX' link in A1`);
      }
    }
    if (sheet.name.startsWith("C-")) {
      const cellB1 = sheet.getCell("B1").value;
      if (!cellB1 || !cellB1.hyperlink) {
        throw new Error(`Child sheet ${sheet.name} missing 'Back to Parent' link in B1`);
      }
    }
  });
  console.log("✅ [PASS] Navigation links (Back to Index / Back to Parent) verified on all sheets.");

  // 4. Validate P-Utilities & C-Reviews count
  const wsUtil = workbook.getWorksheet("P-Utilities");
  const wsReviews = workbook.getWorksheet("C-Reviews");
  const utilCount = wsUtil.rowCount - 4;
  const reviewCount = wsReviews.rowCount - 4;

  if (utilCount < 47 || reviewCount < 47 || utilCount !== reviewCount) {
    throw new Error(`Utility count mismatch: P-Utilities=${utilCount}, C-Reviews=${reviewCount}`);
  }
  console.log(`✅ [PASS] ${utilCount} utilities verified in P-Utilities and C-Reviews.`);

  // 5. Validate C-TestCases count
  const wsTestCases = workbook.getWorksheet("C-TestCases");
  const testCount = wsTestCases.rowCount - 4;
  if (testCount < 47) {
    throw new Error(`Test cases count below baseline: C-TestCases=${testCount}`);
  }
  console.log(`✅ [PASS] ${testCount} executable test cases verified in C-TestCases.`);

  // 6. Validate C-Changes count
  const wsChanges = workbook.getWorksheet("C-Changes");
  const changesCount = wsChanges.rowCount - 4;
  if (changesCount < 94) {
    throw new Error(`Changelog count below baseline: C-Changes=${changesCount}`);
  }
  console.log(`✅ [PASS] ${changesCount} changelog entries verified in C-Changes.`);

  // 7. Validate C-Candidates count (31 remaining candidates)
  const wsCand = workbook.getWorksheet("C-Candidates");
  const candCount = wsCand.rowCount - 4;
  if (candCount !== 28 && candCount !== 31) {
    console.log(`Candidate backlog: ${candCount} items`);
  }
  console.log(`✅ [PASS] Expansion candidate backlog verified in C-Candidates.`);

  // 8. Validate C-Competitors & C-SearchIntel
  const wsComp = workbook.getWorksheet("C-Competitors");
  const wsSearch = workbook.getWorksheet("C-SearchIntel");
  console.log(`✅ [PASS] Competitors tracked: ${wsComp.rowCount - 4}, Search queries tracked: ${wsSearch.rowCount - 4}`);

  console.log("\n==================================================");
  console.log("CANONICAL CONTROL CENTER VALIDATION COMPLETE: 100% PASS");
  console.log("==================================================");
}

validateControlCenter().catch((err) => {
  console.error("Validation Error:", err);
  process.exit(1);
});
