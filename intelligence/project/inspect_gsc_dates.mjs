import { GoogleAuthClient } from "./googleAuth.mjs";

async function inspectGscDates() {
  const authClient = new GoogleAuthClient();
  const token = await authClient.getAccessToken(["https://www.googleapis.com/auth/webmasters.readonly"]);
  const siteUrl = encodeURIComponent("sc-domain:utl.tools");
  const gscUrl = `https://searchconsole.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`;

  const dateRanges = [
    { start: "2026-08-01", end: "2026-08-30" },
    { start: "2026-08-20", end: "2026-08-30" },
    { start: "2026-08-26", end: "2026-08-30" },
  ];

  for (const dr of dateRanges) {
    const res = await fetch(gscUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: dr.start,
        endDate: dr.end,
        dimensions: ["date"],
      }),
    });
    console.log(`\nRange [${dr.start} to ${dr.end}] - Status: ${res.status}`);
    const data = await res.json();
    console.log("Rows:", data.rows);
  }
}

inspectGscDates().catch(console.error);
