import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/mallik/Documents/AAEP/03-Projects/PLAYWRIGHT-HARNESS/node_modules/playwright");

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3005/tools/age-calculator", { waitUntil: "networkidle" });
  
  // Fill first date input (birth date) to 2000-01-01
  const birthInput = page.locator("input[type='date']").first();
  await birthInput.fill("2000-01-01");
  await birthInput.dispatchEvent("change");

  // Read updated text in page
  const pageText = await page.locator("main").innerText();
  console.log("Calculated 26 years:", pageText.includes("26"));
  console.log("Found Next Birthday countdown:", pageText.includes("Birthday") || pageText.includes("Days"));

  // Check copy button interaction
  const copyBtn = page.locator("button:has-text('Copy')").first();
  const copyVisible = await copyBtn.isVisible();
  console.log("Copy button visible:", copyVisible);
  if (copyVisible) {
    await copyBtn.click();
    console.log("Copy button clicked successfully");
  }

  await browser.close();
}

test().catch(console.error);
