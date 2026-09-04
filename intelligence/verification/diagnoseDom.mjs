import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/mallik/Documents/AAEP/03-Projects/PLAYWRIGHT-HARNESS/node_modules/playwright");

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: "C:/Users/mallik/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe",
    headless: true,
  });
  const page = await browser.newPage();

  console.log("--- AGE CALCULATOR ---");
  await page.goto("http://localhost:3005/tools/age-calculator", { waitUntil: "networkidle" });
  const ageInputs = await page.$$eval("input", (els) => els.map((e) => ({ type: e.type, name: e.name, id: e.id, placeholder: e.placeholder, value: e.value })));
  console.log("age inputs:", ageInputs);
  const ageButtons = await page.$$eval("button", (els) => els.map((e) => e.textContent.trim()));
  console.log("age buttons:", ageButtons);

  console.log("--- WORD COUNTER ---");
  await page.goto("http://localhost:3005/tools/word-counter", { waitUntil: "networkidle" });
  const wcTextareas = await page.$$eval("textarea", (els) => els.map((e) => ({ placeholder: e.placeholder, value: e.value })));
  console.log("wc textareas:", wcTextareas);
  const wcButtons = await page.$$eval("button", (els) => els.map((e) => e.textContent.trim()));
  console.log("wc buttons:", wcButtons);

  // Type in textarea and see what changes
  const textarea = await page.$("textarea");
  if (textarea) {
    await textarea.focus();
    await textarea.type("The quick brown fox jumps over the lazy dog", { delay: 10 });
    await page.waitForTimeout(300);
    const bodyText = await page.textContent("body");
    console.log("wc body text snippet containing numbers:");
    const matches = bodyText.match(/\d+\s*(words?|chars?|characters?)/gi);
    console.log("matches:", matches);
  }

  console.log("--- BASE64 ENCODER ---");
  await page.goto("http://localhost:3005/tools/base64-encoder", { waitUntil: "networkidle" });
  const b64Textareas = await page.$$eval("textarea", (els) => els.map((e) => ({ placeholder: e.placeholder, value: e.value })));
  console.log("b64 textareas:", b64Textareas);
  const b64Buttons = await page.$$eval("button", (els) => els.map((e) => e.textContent.trim()));
  console.log("b64 buttons:", b64Buttons);

  await browser.close();
}

diagnose().catch((e) => console.error(e));
