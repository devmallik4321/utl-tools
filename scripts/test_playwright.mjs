import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/mallik/Documents/AAEP/03-Projects/PLAYWRIGHT-HARNESS/node_modules/playwright");

async function test() {
  console.log("Launching Chromium...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent("<html><body><h1 id='title'>UTL Real Verification</h1></body></html>");
  const title = await page.locator("#title").innerText();
  console.log("Playwright headless browser verified! Title:", title);
  await browser.close();
}

test().catch(console.error);
