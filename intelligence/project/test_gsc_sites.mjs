import { GoogleAuthClient } from "./googleAuth.mjs";

async function checkGscSites() {
  const auth = new GoogleAuthClient();
  const token = await auth.getAccessToken();

  const listRes = await fetch("https://searchconsole.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log("Sites list status:", listRes.status);
  const data = await listRes.json();
  console.log("Accessible sites:", JSON.stringify(data, null, 2));
}

checkGscSites().catch(console.error);
