import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

async function verifyDailyStats() {
  const backupDir = path.resolve("control/backups");
  const backupFiles = fs.readdirSync(backupDir).filter((f) => f.endsWith(".xlsx")).sort();
  const latestBackup = backupFiles[backupFiles.length - 1];
  const workbookPath = path.resolve(backupDir, latestBackup);

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(workbookPath);

  const ws = wb.getWorksheet("C-DailyStatistics");
  if (!ws) {
    throw new Error("C-DailyStatistics worksheet missing!");
  }

  console.log(`=== C-DailyStatistics in ${latestBackup} ===`);
  console.log(`Row count: ${ws.rowCount}`);

  ws.eachRow((row, rowNumber) => {
    if (rowNumber >= 4) {
      console.log(`Row ${rowNumber}:`, JSON.stringify(row.values.slice(1, 15)));
    }
  });
}

verifyDailyStats().catch(console.error);
