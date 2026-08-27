import ExcelJS from "exceljs";
import path from "path";

async function inspectFills() {
  const wb = new ExcelJS.Workbook();
  const filePath = path.resolve("control/UTL-CONTROL-CENTER.xlsx");
  await wb.xlsx.readFile(filePath);

  console.log(`Auditing workbook: ${filePath}`);
  console.log(`Worksheet count: ${wb.worksheets.length}`);

  let totalBlackCells = 0;
  let emptyFilledCells = 0;

  for (const sheet of wb.worksheets) {
    let sheetBlackCells = 0;
    let sheetEmptyFilled = 0;

    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (cell.fill && cell.fill.type === "pattern") {
          const color = cell.fill.fgColor?.argb || cell.fill.bgColor?.argb || "";
          const isBlack = color === "FF000000" || color === "000000" || color.toLowerCase() === "ff000000";
          const isEmpty = cell.value === null || cell.value === undefined || cell.value === "";

          if (isBlack) {
            sheetBlackCells++;
            totalBlackCells++;
          }
          if (isEmpty && cell.fill.fgColor) {
            sheetEmptyFilled++;
            emptyFilledCells++;
          }
        }
      });
    });

    if (sheetBlackCells > 0 || sheetEmptyFilled > 0) {
      console.log(`Sheet "${sheet.name}": Black cells=${sheetBlackCells}, Empty filled cells=${sheetEmptyFilled}`);
    }
  }

  console.log(`Total black-filled cells in workbook: ${totalBlackCells}`);
  console.log(`Total empty cells with fill formatting: ${emptyFilledCells}`);
}

inspectFills().catch(console.error);
