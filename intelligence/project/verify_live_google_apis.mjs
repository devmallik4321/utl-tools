import { GoogleAuthClient } from "./googleAuth.mjs";

async function verifyGoogleApis() {
  console.log("==================================================");
  console.log("VERIFYING LIVE GOOGLE APIS (READ-ONLY TEST)");
  console.log("==================================================");

  const authClient = new GoogleAuthClient();
  const hasCreds = authClient.hasCredentials();
  console.log(`Service Account Key Detected: ${hasCreds}`);

  if (!hasCreds) {
    console.error("ERROR: No credentials found.");
    process.exit(1);
  }

  // 1. Test OAuth2 Token Exchange
  const token = await authClient.getAccessToken();
  if (!token) {
    console.error("AUTHENTICATION FAILED: Could not obtain OAuth access token.");
    process.exit(1);
  }
  console.log("AUTHENTICATION SUCCESS: Valid OAuth2 Bearer Access Token obtained.");

  const ga4PropertyId = process.env.GA4_PROPERTY_ID || "551527574";
  const gscSiteUrl = process.env.GSC_SITE_URL || "sc-domain:utl.tools";

  // 2. Test GA4 Data API v1beta
  console.log(`\n--- Querying GA4 Data API (Property: ${ga4PropertyId}) ---`);
  try {
    const ga4Res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${ga4PropertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
            { name: "engagedSessions" },
          ],
        }),
      }
    );

    if (ga4Res.ok) {
      const data = await ga4Res.json();
      console.log("GA4 Data API: SUCCESS (200 OK)");
      const vals = data.rows?.[0]?.metricValues || [];
      console.log(`- Active Users (Last 7 Days): ${vals[0]?.value ?? 0}`);
      console.log(`- Sessions: ${vals[1]?.value ?? 0}`);
      console.log(`- Screen Page Views: ${vals[2]?.value ?? 0}`);
      console.log(`- Engaged Sessions: ${vals[3]?.value ?? 0}`);
    } else {
      const err = await ga4Res.text();
      console.warn(`GA4 Data API Query Error [${ga4Res.status}]:`, err);
    }
  } catch (err) {
    console.error("GA4 Request Exception:", err.message);
  }

  // 3. Test Google Search Console Search Analytics API
  console.log(`\n--- Querying Google Search Console API (Site: ${gscSiteUrl}) ---`);
  try {
    const startDateStr = new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0];
    const endDateStr = new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0];

    const gscRes = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(gscSiteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDateStr,
          endDate: endDateStr,
          dimensions: ["query"],
          rowLimit: 10,
        }),
      }
    );

    if (gscRes.ok) {
      const data = await gscRes.json();
      console.log("Google Search Console API: SUCCESS (200 OK)");
      const rows = data.rows || [];
      console.log(`- Rows Returned: ${rows.length}`);
      if (rows.length === 0) {
        console.log("- Status: SUCCESS / ZERO RESULTS (Normal for newly verified site)");
      } else {
        rows.slice(0, 5).forEach((r) => {
          console.log(`  * Query: "${r.keys[0]}" | Clicks: ${r.clicks} | Impressions: ${r.impressions} | CTR: ${(r.ctr * 100).toFixed(1)}% | Pos: ${r.position.toFixed(1)}`);
        });
      }
    } else {
      const err = await gscRes.text();
      console.warn(`Google Search Console API Query Error [${gscRes.status}]:`, err);
    }
  } catch (err) {
    console.error("GSC Request Exception:", err.message);
  }

  console.log("\n==================================================");
  console.log("LIVE GOOGLE APIS VERIFICATION COMPLETE");
  console.log("==================================================");
}

verifyGoogleApis().catch(console.error);
