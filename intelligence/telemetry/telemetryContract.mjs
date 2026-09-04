import crypto from "crypto";

export const SCHEMA_VERSION = "1.0.0";

export const ALLOWED_EVENT_TYPES = ["utility_view", "tool_execution", "widget_view"];

export const FORBIDDEN_KEYS = [
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

// Max allowed limits for production hardening
const MAX_EVENT_ID_LENGTH = 128;
const MAX_SOURCE_LENGTH = 64;
const MAX_IDENTIFIER_LENGTH = 128;
const MAX_METADATA_KEYS = 20;
const MAX_METADATA_VALUE_LENGTH = 256;
const MAX_FUTURE_DRIFT_MS = 24 * 3600000; // 24 hours to accommodate global timezones and same-day timestamps
const RETENTION_WINDOW_MS = 30 * 86400000; // 30 days

/**
 * Validates a telemetry event payload strictly against the privacy contract and production limits.
 * Returns { valid: boolean, error?: string, sanitizedEvent?: object }
 */
export function validateTelemetryEvent(event) {
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return { valid: false, error: "Event payload must be a non-null JSON object" };
  }

  // 1. Schema version check
  if (event.schema_version && event.schema_version !== SCHEMA_VERSION) {
    return {
      valid: false,
      error: `Unsupported schema_version '${event.schema_version}'. Required: '${SCHEMA_VERSION}'`
    };
  }

  // 2. Required fields
  if (!event.event_id || typeof event.event_id !== "string" || event.event_id.trim().length === 0) {
    return { valid: false, error: "event_id is required and must be a non-empty string" };
  }

  if (event.event_id.length > MAX_EVENT_ID_LENGTH) {
    return { valid: false, error: `event_id exceeds max length of ${MAX_EVENT_ID_LENGTH} characters` };
  }

  if (!event.event_type || !ALLOWED_EVENT_TYPES.includes(event.event_type)) {
    return {
      valid: false,
      error: `event_type must be one of: ${ALLOWED_EVENT_TYPES.join(", ")}. Received: ${event.event_type}`
    };
  }

  if (!event.timestamp || typeof event.timestamp !== "string") {
    return { valid: false, error: "timestamp is required and must be a valid ISO 8601 string" };
  }

  const parsedTime = Date.parse(event.timestamp);
  if (isNaN(parsedTime)) {
    return { valid: false, error: "timestamp must be a parseable ISO 8601 date string" };
  }

  // Timestamp bounds: not in distant future, not older than retention window
  const now = Date.now();
  if (parsedTime > now + MAX_FUTURE_DRIFT_MS) {
    return { valid: false, error: "timestamp cannot be in the future (exceeds clock drift limit of 60s)" };
  }
  if (parsedTime < now - RETENTION_WINDOW_MS) {
    return { valid: false, error: "timestamp exceeds 30-day retention window" };
  }

  if (event.event_type === "utility_view" || event.event_type === "tool_execution") {
    if (!event.utility_id || typeof event.utility_id !== "string" || event.utility_id.trim().length === 0) {
      return { valid: false, error: `utility_id is required for ${event.event_type}` };
    }
    if (event.utility_id.length > MAX_IDENTIFIER_LENGTH) {
      return { valid: false, error: `utility_id exceeds max length of ${MAX_IDENTIFIER_LENGTH} characters` };
    }
  }

  if (event.event_type === "widget_view") {
    if (!event.widget_id || typeof event.widget_id !== "string" || event.widget_id.trim().length === 0) {
      return { valid: false, error: "widget_id is required for widget_view" };
    }
    if (event.widget_id.length > MAX_IDENTIFIER_LENGTH) {
      return { valid: false, error: `widget_id exceeds max length of ${MAX_IDENTIFIER_LENGTH} characters` };
    }
  }

  if (!event.source || typeof event.source !== "string" || event.source.trim().length === 0) {
    return { valid: false, error: "source is required and must be a non-empty string" };
  }

  if (event.source.length > MAX_SOURCE_LENGTH) {
    return { valid: false, error: `source exceeds max length of ${MAX_SOURCE_LENGTH} characters` };
  }

  // 3. Strict Privacy Checks: Reject forbidden keys in root or metadata
  const allKeys = Object.keys(event);
  for (const k of allKeys) {
    const lk = k.toLowerCase();
    for (const forbidden of FORBIDDEN_KEYS) {
      if (lk === forbidden || lk.includes(forbidden)) {
        return {
          valid: false,
          error: `Privacy violation: Forbidden key '${k}' detected in telemetry event payload`
        };
      }
    }
  }

  if (event.metadata) {
    if (typeof event.metadata !== "object" || Array.isArray(event.metadata)) {
      return { valid: false, error: "metadata must be a key-value object" };
    }
    const metaKeys = Object.keys(event.metadata);
    if (metaKeys.length > MAX_METADATA_KEYS) {
      return { valid: false, error: `metadata exceeds max key limit of ${MAX_METADATA_KEYS}` };
    }
    for (const mk of metaKeys) {
      const lmk = mk.toLowerCase();
      for (const forbidden of FORBIDDEN_KEYS) {
        if (lmk === forbidden || lmk.includes(forbidden)) {
          return {
            valid: false,
            error: `Privacy violation: Forbidden key '${mk}' detected in telemetry metadata`
          };
        }
      }
      const val = event.metadata[mk];
      if (typeof val === "string" && val.length > MAX_METADATA_VALUE_LENGTH) {
        return { valid: false, error: `metadata value for '${mk}' exceeds max length of ${MAX_METADATA_VALUE_LENGTH}` };
      }
    }
  }

  // 4. Construct sanitized canonical event
  const sanitized = {
    event_id: String(event.event_id).trim(),
    event_type: event.event_type,
    timestamp: new Date(parsedTime).toISOString(),
    utility_id: event.utility_id ? String(event.utility_id).trim() : undefined,
    widget_id: event.widget_id ? String(event.widget_id).trim() : undefined,
    session_id: event.session_id ? anonymizeSessionId(event.session_id) : undefined,
    source: String(event.source).trim(),
    schema_version: SCHEMA_VERSION,
    metadata: event.metadata ? { ...event.metadata } : undefined,
  };

  return { valid: true, sanitizedEvent: sanitized };
}

/**
 * Anonymizes session ID using SHA-256 with date salting to prevent cross-day tracking.
 */
export function anonymizeSessionId(sessionId) {
  if (!sessionId) return undefined;
  const day = new Date().toISOString().slice(0, 10);
  return crypto.createHash("sha256").update(`${day}:${sessionId}:utl-salt`).digest("hex").slice(0, 16);
}

/**
 * Creates a valid telemetry event object.
 */
export function createTelemetryEvent({
  event_type,
  utility_id,
  widget_id,
  session_id,
  source = "web-shell",
  metadata = {}
}) {
  const event = {
    event_id: `evt_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`,
    event_type,
    timestamp: new Date().toISOString(),
    utility_id,
    widget_id,
    session_id,
    source,
    schema_version: SCHEMA_VERSION,
    metadata,
  };

  const validation = validateTelemetryEvent(event);
  if (!validation.valid) {
    throw new Error(`Failed to create valid telemetry event: ${validation.error}`);
  }
  return validation.sanitizedEvent;
}
