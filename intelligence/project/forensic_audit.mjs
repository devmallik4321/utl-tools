import { GoogleAuthClient } from "./googleAuth.mjs";

async function runForensicAudit() {
  const authClient = new GoogleAuthClient();
  const ga4Token = await authClient.getAccessToken(["https://www.googleapis.com/auth/analytics.readonly"]);
  const gscToken = await authClient.getAccessToken(["https://www.googleapis.com/auth/webmasters.readonly"]);

  console.log("==================================================");
  console.log("FORENSIC AUDIT: RAW DATA & QUERY RECONCILIATION");
  console.log("==================================================");

  // ----------------------------------------------------
  // AUDIT 1: GA4 User Counts & Metrics
  // ----------------------------------------------------
  if (ga4Token) {
    const propertyId = "551527574";
    const ga4Url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

    const resUsers = await fetch(ga4Url, {
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
          { name: "eventCount" },
        ],
      }),
    });
    const dataUsers = await resUsers.json();
    console.log("\n[GA4 RAW OVERVIEW]");
    console.log("Metric Headers:", dataUsers.metricHeaders.map(m => m.name));
    console.log("Metric Values:", dataUsers.rows[0].metricValues.map(v => v.value));

    // Daily breakdown of users in GA4
    const resDailyUsers = await fetch(ga4Url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${ga4Token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "2026-08-20", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "totalUsers" },
          { name: "activeUsers" },
          { name: "newUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
    });
    const dataDailyUsers = await resDailyUsers.json();
    console.log("\n[GA4 DAILY BREAKDOWN]");
    dataDailyUsers.rows?.forEach(r => {
      console.log(`Date: ${r.dimensionValues[0].value} | TotalUsers: ${r.metricValues[0].value} | ActiveUsers: ${r.metricValues[1].value} | NewUsers: ${r.metricValues[2].value} | Sessions: ${r.metricValues[3].value} | PageViews: ${r.metricValues[4].value}`);
    });

    // Country Breakdown in GA4
    const resCountries = await fetch(ga4Url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${ga4Token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "2026-08-20", endDate: "today" }],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      }),
    });
    const dataCountries = await resCountries.json();
    console.log(`\n[GA4 COUNTRIES COUNT]: ${dataCountries.rows?.length || 0} distinct countries`);
    dataCountries.rows?.forEach(r => {
      console.log(`Country: ${r.dimensionValues[0].value} | Users: ${r.metricValues[0].value} | Sessions: ${r.metricValues[1].value}`);
    });

    // Traffic Channel Grouping
    const resChannels = await fetch(ga4Url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${ga4Token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "2026-08-20", endDate: "today" }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }, { name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "engagedSessions" }],
      }),
    });
    const dataChannels = await resChannels.json();
    console.log("\n[GA4 CHANNEL / SOURCE BREAKDOWN]");
    let sumSessions = 0;
    dataChannels.rows?.forEach(r => {
      const sess = parseInt(r.metricValues[0].value, 10);
      sumSessions += sess;
      console.log(`Channel: "${r.dimensionValues[0].value}" | Source: "${r.dimensionValues[1].value}" | Medium: "${r.dimensionValues[2].value}" | Sessions: ${sess} | Users: ${r.metricValues[1].value}`);
    });
    console.log(`Sum of Channel Sessions: ${sumSessions}`);
  }

  // ----------------------------------------------------
  // AUDIT 2: GSC Impressions & Daily Calculations
  // ----------------------------------------------------
  if (gscToken) {
    const siteUrl = encodeURIComponent("sc-domain:utl.tools");
    const gscUrl = `https://searchconsole.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`;

    // 1. Date Dimension
    const resDate = await fetch(gscUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${gscToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: "2026-08-20",
        endDate: "2026-08-30",
        dimensions: ["date"],
      }),
    });
    const dataDate = await resDate.json();
    console.log("\n[GSC DAILY IMPRESSIONS (date dimension)]");
    let sumDailyGsc = 0;
    dataDate.rows?.forEach(r => {
      sumDailyGsc += r.impressions;
      console.log(`Date: ${r.keys[0]} | Impressions: ${r.impressions} | Clicks: ${r.clicks} | CTR: ${(r.ctr * 100).toFixed(2)}% | Pos: ${r.position.toFixed(1)}`);
    });
    console.log(`Total Sum of Daily Impressions: ${sumDailyGsc}`);

    // 2. Query dimension with rowLimit: 25 vs full
    const resQ25 = await fetch(gscUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${gscToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: "2026-08-20",
        endDate: "2026-08-30",
        dimensions: ["query"],
        rowLimit: 25,
      }),
    });
    const dataQ25 = await resQ25.json();
    const sumQ25 = dataQ25.rows?.reduce((acc, r) => acc + r.impressions, 0) || 0;
    console.log(`\n[GSC QUERY DIMENSION ROW LIMIT 25 SUM]: ${sumQ25} impressions across ${dataQ25.rows?.length} queries`);

    // 3. Adapter exact query simulation for each day (Trailing 7 days to date-2)
    const testDays = ["2026-08-26", "2026-08-27", "2026-08-28", "2026-08-29", "2026-08-30", "2026-08-31", "2026-09-01"];
    console.log("\n[SIMULATING UtlSearchConsoleAdapter.collect() FOR HISTORICAL DATES]");
    for (const d of testDays) {
      const runTime = new Date(`${d}T04:00:00Z`).getTime();
      const startDateStr = new Date(runTime - 86400000 * 7).toISOString().split("T")[0];
      const endDateStr = new Date(runTime - 86400000 * 2).toISOString().split("T")[0];

      const resSim = await fetch(gscUrl, {
        method: "POST",
        headers: { "Authorization": `Bearer ${gscToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: startDateStr,
          endDate: endDateStr,
          dimensions: ["query"],
          rowLimit: 25,
        }),
      });
      const dataSim = await resSim.json();
      const rowsSim = dataSim.rows || [];
      const sumSim = rowsSim.reduce((acc, r) => acc + r.impressions, 0);
      const avgPosSim = rowsSim.length > 0 ? (rowsSim.reduce((acc, r) => acc + r.position, 0) / rowsSim.length).toFixed(1) : 0;
      console.log(`Run Date: ${d} | Queried [${startDateStr} to ${endDateStr}] | Top25 Query Rows Sum: ${sumSim} | Top25 Rows Count: ${rowsSim.length} | AvgPos: ${avgPosSim}`);
    }
  }
}

runForensicAudit().catch(console.error);
