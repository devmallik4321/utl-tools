import { GoogleAuthClient } from "./googleAuth.mjs";

async function runDeepAudit() {
  const authClient = new GoogleAuthClient();
  const ga4Token = await authClient.getAccessToken(["https://www.googleapis.com/auth/analytics.readonly"]);
  const gscToken = await authClient.getAccessToken(["https://www.googleapis.com/auth/webmasters.readonly"]);

  console.log("==================================================");
  console.log("DEEP READ-ONLY AUDIT: GA4 & GOOGLE SEARCH CONSOLE");
  console.log("==================================================");

  // 1. GA4 Queries
  if (ga4Token) {
    const propertyId = "551527574";
    const ga4Url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

    // Overview & Totals
    const resOverview = await fetch(ga4Url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${ga4Token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "2026-08-20", endDate: "today" }],
        metrics: [
          { name: "totalUsers" },
          { name: "activeUsers" },
          { name: "newUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "engagedSessions" },
          { name: "engagementRate" },
          { name: "userEngagementDuration" },
          { name: "averageSessionDuration" },
          { name: "eventCount" },
        ],
      }),
    });
    if (resOverview.ok) {
      const data = await resOverview.json();
      console.log("\n--- GA4 TOTALS (Aug 20 - Sep 1, 2026) ---");
      console.log("Metric Headers:", data.metricHeaders?.map(m => m.name));
      console.log("Values:", data.rows?.[0]?.metricValues?.map(v => v.value));
    }

    // Top Pages / Routes
    const resPages = await fetch(ga4Url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${ga4Token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "2026-08-20", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "activeUsers" },
          { name: "engagedSessions" },
          { name: "averageSessionDuration" },
        ],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 25,
      }),
    });
    if (resPages.ok) {
      const data = await resPages.json();
      console.log("\n--- GA4 TOP VISITED PAGES / ROUTES ---");
      data.rows?.forEach(r => {
        console.log(`Path: ${r.dimensionValues[0].value} | Views: ${r.metricValues[0].value} | Users: ${r.metricValues[1].value} | Engaged: ${r.metricValues[2].value} | AvgDur: ${parseFloat(r.metricValues[3].value).toFixed(1)}s`);
      });
    }

    // Traffic Sources
    const resSources = await fetch(ga4Url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${ga4Token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "2026-08-20", endDate: "today" }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }, { name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "engagedSessions" }],
        limit: 10,
      }),
    });
    if (resSources.ok) {
      const data = await resSources.json();
      console.log("\n--- GA4 TRAFFIC SOURCES ---");
      data.rows?.forEach(r => {
        console.log(`Channel: ${r.dimensionValues[0].value} | Source: ${r.dimensionValues[1].value} | Medium: ${r.dimensionValues[2].value} | Sessions: ${r.metricValues[0].value} | Users: ${r.metricValues[1].value}`);
      });
    }

    // Devices & Geography
    const resDevices = await fetch(ga4Url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${ga4Token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "2026-08-20", endDate: "today" }],
        dimensions: [{ name: "deviceCategory" }, { name: "country" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        limit: 15,
      }),
    });
    if (resDevices.ok) {
      const data = await resDevices.json();
      console.log("\n--- GA4 DEVICES & COUNTRIES ---");
      data.rows?.forEach(r => {
        console.log(`Device: ${r.dimensionValues[0].value} | Country: ${r.dimensionValues[1].value} | Users: ${r.metricValues[0].value} | Sessions: ${r.metricValues[1].value}`);
      });
    }

    // Events
    const resEvents = await fetch(ga4Url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${ga4Token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "2026-08-20", endDate: "today" }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 15,
      }),
    });
    if (resEvents.ok) {
      const data = await resEvents.json();
      console.log("\n--- GA4 EVENTS ---");
      data.rows?.forEach(r => {
        console.log(`Event: ${r.dimensionValues[0].value} | Count: ${r.metricValues[0].value} | Users: ${r.metricValues[1].value}`);
      });
    }
  }

  // 2. GSC Queries
  if (gscToken) {
    const siteUrl = encodeURIComponent("sc-domain:utl.tools");
    const gscUrl = `https://searchconsole.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`;

    // Query Breakdown
    const resGscQuery = await fetch(gscUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${gscToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: "2026-08-20",
        endDate: "2026-08-30",
        dimensions: ["query"],
        rowLimit: 50,
      }),
    });
    if (resGscQuery.ok) {
      const data = await resGscQuery.json();
      console.log("\n--- GSC QUERIES (sc-domain:utl.tools) ---");
      console.log(`Total queries found: ${data.rows?.length || 0}`);
      data.rows?.forEach(r => {
        console.log(`Query: "${r.keys[0]}" | Impressions: ${r.impressions} | Clicks: ${r.clicks} | CTR: ${(r.ctr * 100).toFixed(2)}% | Pos: ${r.position.toFixed(1)}`);
      });
    }

    // Page Breakdown
    const resGscPage = await fetch(gscUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${gscToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: "2026-08-20",
        endDate: "2026-08-30",
        dimensions: ["page"],
        rowLimit: 50,
      }),
    });
    if (resGscPage.ok) {
      const data = await resGscPage.json();
      console.log("\n--- GSC PAGES RECEIVING IMPRESSIONS ---");
      console.log(`Total pages found: ${data.rows?.length || 0}`);
      data.rows?.forEach(r => {
        console.log(`Page: ${r.keys[0]} | Impressions: ${r.impressions} | Clicks: ${r.clicks} | CTR: ${(r.ctr * 100).toFixed(2)}% | Pos: ${r.position.toFixed(1)}`);
      });
    }

    // Country & Device Breakdown
    const resGscGeo = await fetch(gscUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${gscToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: "2026-08-20",
        endDate: "2026-08-30",
        dimensions: ["country", "device"],
        rowLimit: 20,
      }),
    });
    if (resGscGeo.ok) {
      const data = await resGscGeo.json();
      console.log("\n--- GSC COUNTRIES & DEVICES ---");
      data.rows?.forEach(r => {
        console.log(`Country: ${r.keys[0]} | Device: ${r.keys[1]} | Impressions: ${r.impressions} | Clicks: ${r.clicks} | Pos: ${r.position.toFixed(1)}`);
      });
    }
  }
}

runDeepAudit().catch(console.error);
