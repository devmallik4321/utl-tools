import fs from "fs";
import path from "path";
import crypto from "crypto";

// Auto-load .env.local if present and not already in process.env
function loadEnvLocal() {
  const envLocalPath = path.resolve(".env.local");
  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnvLocal();

/**
 * Lightweight, zero-dependency Google Service Account JWT Authenticator
 * Implements Google OAuth 2.0 Server-to-Server flow using native Node.js crypto.
 */
export class GoogleAuthClient {
  constructor(options = {}) {
    loadEnvLocal();
    this.keyFilePath =
      options.keyFilePath ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      "C:\\Users\\mallik\\Documents\\AAEP\\.config\\utl-project-intelligence.json";
    this.keyJsonString = options.keyJsonString || process.env.GOOGLE_SERVICE_ACCOUNT_JSON || null;
    this.cachedToken = null;
    this.tokenExpiry = 0;
  }

  /**
   * Load service account credentials from environment or file.
   */
  getCredentials() {
    try {
      if (this.keyJsonString) {
        return JSON.parse(this.keyJsonString);
      }
      if (this.keyFilePath && fs.existsSync(this.keyFilePath)) {
        return JSON.parse(fs.readFileSync(this.keyFilePath, "utf-8"));
      }
    } catch (err) {
      console.warn("Notice: Could not parse Google Service Account credentials:", err.message);
    }
    return null;
  }

  /**
   * Check if credentials are present.
   */
  hasCredentials() {
    return !!this.getCredentials();
  }

  /**
   * Retrieve an active OAuth2 Bearer Access Token for the requested scopes.
   */
  async getAccessToken(scopes = ["https://www.googleapis.com/auth/analytics.readonly", "https://www.googleapis.com/auth/webmasters.readonly"]) {
    const creds = this.getCredentials();
    if (!creds || !creds.client_email || !creds.private_key) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    // Use cached token if valid for more than 5 minutes
    if (this.cachedToken && this.tokenExpiry > now + 300) {
      return this.cachedToken;
    }

    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    const claimSet = {
      iss: creds.client_email,
      scope: Array.isArray(scopes) ? scopes.join(" ") : scopes,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    const encodeBase64Url = (obj) =>
      Buffer.from(JSON.stringify(obj))
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const encodedHeader = encodeBase64Url(header);
    const encodedClaimSet = encodeBase64Url(claimSet);
    const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

    const signer = crypto.createSign("RSA-SHA256");
    signer.update(signatureInput);
    signer.end();

    const signature = signer
      .sign(creds.private_key, "base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const jwt = `${signatureInput}.${signature}`;

    // Request access token from Google OAuth endpoint
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: jwt,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Google OAuth Token request failed [${response.status}]: ${errText}`);
        return null;
      }

      const data = await response.json();
      this.cachedToken = data.access_token;
      this.tokenExpiry = now + (data.expires_in || 3600);
      return this.cachedToken;
    } catch (fetchErr) {
      console.warn("Network error during Google OAuth token exchange:", fetchErr.message);
      return null;
    }
  }
}
