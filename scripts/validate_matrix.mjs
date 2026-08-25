import fs from "fs";

const matrixRaw = fs.readFileSync("documentation/UTILITY-REVIEW-MATRIX.csv", "utf-8").trim().split("\n");
console.log("Matrix total lines (including header):", matrixRaw.length);
console.log("Header columns:", matrixRaw[0].split(",").length);

const ids = new Set();
for (let i = 1; i < matrixRaw.length; i++) {
  const firstCol = matrixRaw[i].split(",")[0].replace(/"/g, "");
  ids.add(firstCol);
}
console.log("Unique utility IDs in matrix:", ids.size);

const changelogRaw = fs.readFileSync("documentation/UTILITY-CHANGELOG.csv", "utf-8").trim().split("\n");
console.log("Changelog total lines (including header):", changelogRaw.length);
console.log("Changelog entries count:", changelogRaw.length - 1);
