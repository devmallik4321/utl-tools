async function runProductionSmoke() {
  console.log("==================================================");
  console.log("TESTING LIVE PRODUCTION UTL.tools DEPLOYMENT");
  console.log("==================================================");

  const routes = [
    "https://utl.tools",
    "https://utl.tools/tools/random-number-generator",
    "https://utl.tools/tools/diff-checker",
    "https://utl.tools/tools/aspect-ratio-scale-multiplier",
    "https://utl.tools/tools/my-ip",
    "https://utl.tools/sitemap.xml",
    "https://utl.tools/robots.txt"
  ];

  for (const url of routes) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "UTL-Production-Smoke/1.0" } });
      console.log(`[ROUTE] ${url} -> Status ${res.status} (${res.headers.get("server") || "CDN"}, Cache: ${res.headers.get("x-vercel-cache") || "N/A"})`);
    } catch (e) {
      console.error(`[ROUTE FAILED] ${url}: ${e.message}`);
    }
  }

  console.log("\nTesting Production Telemetry API...");
  try {
    const telGet = await fetch("https://utl.tools/api/telemetry");
    const getContentType = telGet.headers.get("content-type") || "";
    console.log(`[API GET] /api/telemetry -> Status ${telGet.status}, Content-Type: ${getContentType}`);
    const getText = await telGet.text();
    if (getContentType.includes("application/json")) {
      console.log(`[API GET DATA]`, JSON.parse(getText));
    } else {
      console.log(`[API GET HTML FALLBACK] (Length: ${getText.length}) - Vercel build still in progress or static fallback active.`);
    }
  } catch (e) {
    console.error(`[API GET ERROR]: ${e.message}`);
  }
}

runProductionSmoke();
