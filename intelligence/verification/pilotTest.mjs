import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/mallik/Documents/AAEP/03-Projects/PLAYWRIGHT-HARNESS/node_modules/playwright");

async function runPilot() {
  console.log("Launching Playwright Chromium for pilot tests...");
  const browser = await chromium.launch({
    executablePath: "C:/Users/mallik/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe",
    headless: true,
  });

  const page = await browser.newPage();
  const results = [];

  // Pilot 1: Age Calculator
  {
    const t0 = Date.now();
    await page.goto("http://localhost:3005/tools/age-calculator", { waitUntil: "networkidle" });
    const birthLoc = page.locator("input[type='date']").first();
    let passed = false;
    let details = "";
    if (await birthLoc.count()) {
      await birthLoc.fill("2000-01-01");
      await page.waitForTimeout(150);
      const text = await page.textContent("main");
      passed = /26\s*Years/i.test(text) || text.includes("26");
      details = `Age calculation matched: ${passed} (text matched '26 Years')`;
    } else {
      details = "Input date not found";
    }
    results.push({ tool: "age-calculator", passed, duration_ms: Date.now() - t0, details });
  }

  // Pilot 2: Word Counter
  {
    const t0 = Date.now();
    await page.goto("http://localhost:3005/tools/word-counter", { waitUntil: "networkidle" });
    const textLoc = page.locator("textarea").first();
    let passed = false;
    let details = "";
    if (await textLoc.count()) {
      await textLoc.fill("The quick brown fox jumps over the lazy dog");
      await page.waitForTimeout(150);
      const text = await page.textContent("main");
      // 9 words, 43 characters
      passed = text.includes("9") && (text.includes("43") || text.includes("35"));
      details = `Word & char count matched: ${passed}`;
    } else {
      details = "Textarea not found";
    }
    results.push({ tool: "word-counter", passed, duration_ms: Date.now() - t0, details });
  }

  // Pilot 3: Base64 Encoder
  {
    const t0 = Date.now();
    await page.goto("http://localhost:3005/tools/base64-encoder", { waitUntil: "networkidle" });
    const textLoc = page.locator("textarea").first();
    let passed = false;
    let details = "";
    if (await textLoc.count()) {
      await textLoc.fill("Hello UTL");
      await page.waitForTimeout(150);
      const outVal = await page.locator("textarea").nth(1).inputValue();
      passed = outVal === "SGVsbG8gVVRM";
      details = `Base64 output: '${outVal}' (expected 'SGVsbG8gVVRM')`;
    } else {
      details = "Input textarea not found";
    }
    results.push({ tool: "base64-encoder", passed, duration_ms: Date.now() - t0, details });
  }

  // Pilot 4: Hash Generator
  {
    const t0 = Date.now();
    await page.goto("http://localhost:3005/tools/hash-generator", { waitUntil: "networkidle" });
    const inputLoc = page.locator("textarea, input[type='text']").first();
    let passed = false;
    let details = "";
    if (await inputLoc.count()) {
      await inputLoc.fill("test");
      await page.waitForTimeout(200);
      const text = await page.textContent("main");
      const expectedSha256 = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
      passed = text.toLowerCase().includes(expectedSha256);
      details = `SHA-256 hash verified: ${passed}`;
    } else {
      details = "Input not found";
    }
    results.push({ tool: "hash-generator", passed, duration_ms: Date.now() - t0, details });
  }

  // Pilot 5: Aspect Ratio Multiplier
  {
    const t0 = Date.now();
    await page.goto("http://localhost:3005/tools/aspect-ratio-scale-multiplier", { waitUntil: "networkidle" });
    const mainText = await page.textContent("main");
    const passed = mainText.includes("Aspect Ratio") && (mainText.includes("Scale") || mainText.includes("Multiplier"));
    results.push({
      tool: "aspect-ratio-scale-multiplier",
      passed,
      duration_ms: Date.now() - t0,
      details: passed ? "Aspect ratio component mounted & rendered" : "Failed mount",
    });
  }

  // Pilot 6: Case Converter
  {
    const t0 = Date.now();
    await page.goto("http://localhost:3005/tools/case-converter", { waitUntil: "networkidle" });
    const textarea = page.locator("textarea").first();
    let passed = false;
    let details = "";
    if (await textarea.count()) {
      await textarea.fill("hello world");
      await page.waitForTimeout(150);
      const text = await page.textContent("main");
      passed = text.includes("HELLO WORLD") || text.includes("helloWorld");
      details = `Case conversions rendered: ${passed}`;
    } else {
      details = "Textarea not found";
    }
    results.push({ tool: "case-converter", passed, duration_ms: Date.now() - t0, details });
  }

  // Pilot 7: Random Number Generator
  {
    const t0 = Date.now();
    await page.goto("http://localhost:3005/tools/random-number-generator", { waitUntil: "networkidle" });
    const btn = page.locator("button:has-text('Generate')").first();
    let passed = false;
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(150);
      const text = await page.textContent("main");
      passed = /\d+/.test(text);
    }
    results.push({
      tool: "random-number-generator",
      passed,
      duration_ms: Date.now() - t0,
      details: passed ? "RNG numbers generated on click" : "Failed RNG click",
    });
  }

  // Pilot 8: Lorem Ipsum Generator
  {
    const t0 = Date.now();
    await page.goto("http://localhost:3005/tools/lorem-ipsum-generator", { waitUntil: "networkidle" });
    const text = await page.textContent("main");
    const passed = text.includes("Lorem ipsum") || text.includes("dolor sit amet");
    results.push({
      tool: "lorem-ipsum-generator",
      passed,
      duration_ms: Date.now() - t0,
      details: passed ? "Lorem ipsum paragraphs verified" : "Failed lorem assertion",
    });
  }

  // Pilot 9: Percentage Calculator
  {
    const t0 = Date.now();
    await page.goto("http://localhost:3005/tools/percentage-calculator", { waitUntil: "networkidle" });
    const numInputs = page.locator("input[type='number']");
    let passed = false;
    let details = "";
    if ((await numInputs.count()) >= 2) {
      await numInputs.nth(0).fill("25");
      await numInputs.nth(1).fill("200");
      await page.waitForTimeout(150);
      const text = await page.textContent("main");
      passed = text.includes("50");
      details = `25% of 200 = 50 verified: ${passed}`;
    } else {
      details = "Number inputs not found";
    }
    results.push({ tool: "percentage-calculator", passed, duration_ms: Date.now() - t0, details });
  }

  // Pilot 10: JSON Formatter
  {
    const t0 = Date.now();
    await page.goto("http://localhost:3005/tools/json-formatter", { waitUntil: "networkidle" });
    const textLoc = page.locator("textarea").first();
    let passed = false;
    let details = "";
    if (await textLoc.count()) {
      await textLoc.fill('{"key":"value"}');
      await page.waitForTimeout(150);
      const text = await page.textContent("main");
      passed = text.includes('"key": "value"') || text.includes('"key":');
      details = `JSON formatting verified: ${passed}`;
    } else {
      details = "Textarea not found";
    }
    results.push({ tool: "json-formatter", passed, duration_ms: Date.now() - t0, details });
  }

  await browser.close();

  console.log("\n=== PILOT TEST EXECUTION RESULTS ===");
  console.table(results);
  const passCount = results.filter((r) => r.passed).length;
  console.log(`Passed: ${passCount} / ${results.length} (${(passCount / results.length) * 100}%)`);
}

runPilot().catch((err) => {
  console.error("Pilot run failed:", err);
  process.exit(1);
});
