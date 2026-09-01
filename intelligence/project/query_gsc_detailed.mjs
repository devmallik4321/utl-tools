import { GoogleAuthClient } from "./googleAuth.mjs";

async function queryGscDetailed() {
  const authClient = new GoogleAuthClient();
  const token = await authClient.getAccessToken(["https://www.googleapis.com/auth/webmasters.readonly"]);

  console.log("==================================================");
  console.log("QUERYING GOOGLE SEARCH CONSOLE IN DETAIL");
  console.log("==================================================");

  const sites = ["sc-domain:utl.tools", "https://utl.tools/"];

  for (const site of sites) {
    console.log(`\nTesting Site: ${site}`);
    const encodedSite = encodeURIComponent(site);

    // 1. Overall Aggregates
    const urlAgg = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;
    const resAgg = await fetch(urlAgg, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: "2026-08-01",
        endDate: "2026-08-30",
      }),
    });
    if (resAgg.ok) {
      const data = await resAgg.json();
      console.log("Aggregate Response:", JSON.stringify(data));
    } else {
      console.log(`Agg query failed [${resAgg.status}]:`, await resAgg.text());
    }

    // 2. Query dimension
    const resQuery = await fetch(urlAgg, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: "2026-08-01",
        endDate: "2026-08-30",
        dimensions: ["query"],
        rowLimit: 50,
      }),
    });
    if (resQuery.ok) {
      const data = await resQuery.json();
      console.log("Query Dimension Rows:", JSON.stringify(data.rows || []));
    }

    // 3. Page dimension
    const resPage = await fetch(urlAgg, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: "2026-08-01",
        endDate: "2026-08-30",
        dimensions: ["page"],
        rowLimit: 50,
      }),
    });
    if (resPage.ok) {
      const data = await resPage.json();
      console.log("Page Dimension Rows:", JSON.stringify(data.rows || []));
    }

    // 4. Date dimension
    const resDate = await fetch(urlAgg, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: "2026-08-01",
        endDate: "2026-08-30",
        dimensions: ["date"],
        rowLimit: 50,
      }),
    });
    if (resDate.ok) {
      const data = await resDate.json();
      console.log("Date Dimension Rows:", JSON.stringify(data.rows || []));
    }
  }
}

queryGscDetailed().catch(console.error);
