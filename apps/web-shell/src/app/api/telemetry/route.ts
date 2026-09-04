import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ALLOWED_EVENT_TYPES = ["utility_view", "tool_execution", "widget_view"];

const FORBIDDEN_KEYS = [
  "password",
  "passwd",
  "token",
  "auth",
  "secret",
  "query",
  "input",
  "email",
  "name",
  "ip",
  "user_agent",
  "credit_card",
  "ssn",
  "cookie",
  "payload"
];

function getStorePath() {
  if (process.env.TELEMETRY_STORE_PATH) {
    return path.resolve(process.env.TELEMETRY_STORE_PATH);
  }
  const defaultPath = path.resolve(process.cwd(), "intelligence/telemetry/events.json");
  try {
    const dir = path.dirname(defaultPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.accessSync(dir, fs.constants.W_OK);
    return defaultPath;
  } catch {
    const tmpDir = process.env.TMPDIR || process.env.TEMP || "/tmp";
    return path.join(tmpDir, "utl_events.json");
  }
}

function loadEvents(): any[] {
  const storePath = getStorePath();
  try {
    if (!fs.existsSync(storePath)) {
      fs.mkdirSync(path.dirname(storePath), { recursive: true });
      fs.writeFileSync(storePath, JSON.stringify([], null, 2));
      return [];
    }
    const raw = fs.readFileSync(storePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveEvents(events: any[]) {
  const storePath = getStorePath();
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(events, null, 2));
}

function anonymizeSessionId(sessionId?: string): string | undefined {
  if (!sessionId) return undefined;
  const day = new Date().toISOString().slice(0, 10);
  return crypto.createHash("sha256").update(`${day}:${sessionId}:utl-salt`).digest("hex").slice(0, 16);
}

export async function POST(request: Request) {
  try {
    const rawEvent = await request.json();

    if (!rawEvent || typeof rawEvent !== "object") {
      return NextResponse.json({ error: "Invalid payload: must be a non-null JSON object" }, { status: 400 });
    }

    if (rawEvent.schema_version && rawEvent.schema_version !== "1.0.0") {
      return NextResponse.json(
        { error: `Unsupported schema_version '${rawEvent.schema_version}'. Required: '1.0.0'` },
        { status: 400 }
      );
    }

    // Required fields check
    if (!rawEvent.event_id || typeof rawEvent.event_id !== "string" || !rawEvent.event_id.trim()) {
      return NextResponse.json({ error: "event_id is required" }, { status: 400 });
    }

    if (!rawEvent.event_type || !ALLOWED_EVENT_TYPES.includes(rawEvent.event_type)) {
      return NextResponse.json(
        { error: `event_type must be one of: ${ALLOWED_EVENT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!rawEvent.timestamp || typeof rawEvent.timestamp !== "string" || isNaN(Date.parse(rawEvent.timestamp))) {
      return NextResponse.json({ error: "timestamp must be valid ISO 8601 string" }, { status: 400 });
    }

    if (rawEvent.event_type === "utility_view" || rawEvent.event_type === "tool_execution") {
      if (!rawEvent.utility_id || typeof rawEvent.utility_id !== "string") {
        return NextResponse.json({ error: `utility_id is required for ${rawEvent.event_type}` }, { status: 400 });
      }
    }

    if (rawEvent.event_type === "widget_view") {
      if (!rawEvent.widget_id || typeof rawEvent.widget_id !== "string") {
        return NextResponse.json({ error: "widget_id is required for widget_view" }, { status: 400 });
      }
    }

    // Privacy contract check: Scan for forbidden keys
    for (const key of Object.keys(rawEvent)) {
      const lk = key.toLowerCase();
      for (const forbidden of FORBIDDEN_KEYS) {
        if (lk === forbidden || lk.includes(forbidden)) {
          return NextResponse.json(
            { error: `Privacy violation: Forbidden key '${key}' detected in event payload` },
            { status: 400 }
          );
        }
      }
    }

    if (rawEvent.metadata && typeof rawEvent.metadata === "object") {
      for (const mkey of Object.keys(rawEvent.metadata)) {
        const lmk = mkey.toLowerCase();
        for (const forbidden of FORBIDDEN_KEYS) {
          if (lmk === forbidden || lmk.includes(forbidden)) {
            return NextResponse.json(
              { error: `Privacy violation: Forbidden key '${mkey}' detected in event metadata` },
              { status: 400 }
            );
          }
        }
      }
    }

    // Construct clean sanitized event
    const sanitized = {
      event_id: String(rawEvent.event_id).trim(),
      event_type: rawEvent.event_type,
      timestamp: new Date(rawEvent.timestamp).toISOString(),
      utility_id: rawEvent.utility_id ? String(rawEvent.utility_id).trim() : undefined,
      widget_id: rawEvent.widget_id ? String(rawEvent.widget_id).trim() : undefined,
      session_id: anonymizeSessionId(rawEvent.session_id),
      source: rawEvent.source ? String(rawEvent.source).trim() : "web-shell",
      schema_version: "1.0.0",
      metadata: rawEvent.metadata ? { ...rawEvent.metadata } : undefined,
    };

    // Load and check duplicate event_id
    const events = loadEvents();
    if (events.some((e) => e.event_id === sanitized.event_id)) {
      return NextResponse.json(
        { message: "Duplicate event discarded", event_id: sanitized.event_id, duplicate: true },
        { status: 200 }
      );
    }

    events.push(sanitized);
    saveEvents(events);

    return NextResponse.json({ success: true, event_id: sanitized.event_id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: `Internal error: ${err?.message || "Unknown error"}` }, { status: 500 });
  }
}

export async function GET() {
  const events = loadEvents();
  return NextResponse.json({
    status: "ACTIVE",
    provider: "SRC-UTL-TELEMETRY",
    schema_version: "1.0.0",
    total_events_collected: events.length,
  });
}
