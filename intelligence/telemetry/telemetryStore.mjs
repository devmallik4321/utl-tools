import fs from "fs";
import path from "path";
import { validateTelemetryEvent, SCHEMA_VERSION } from "./telemetryContract.mjs";

const DEFAULT_STORE_PATH = path.resolve("intelligence/telemetry/events.json");

export class TelemetryStore {
  constructor(options = {}) {
    this.storePath = options.storePath || DEFAULT_STORE_PATH;
    this.configured = options.configured !== undefined ? options.configured : true;
    this.diagnostics = {
      events_received: 0,
      events_accepted: 0,
      events_rejected: 0,
      events_deduplicated: 0,
      last_successful_ingestion: null,
      last_aggregation: null,
      source_status: this.configured ? "ACTIVE" : "UNAVAILABLE",
      schema_version: SCHEMA_VERSION,
    };
    this._ensureStore();
  }

  _ensureStore() {
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.storePath)) {
      fs.writeFileSync(this.storePath, JSON.stringify([], null, 2));
    }
  }

  isConfigured() {
    return this.configured;
  }

  setConfigured(val) {
    this.configured = Boolean(val);
    this.diagnostics.source_status = this.configured ? "ACTIVE" : "UNAVAILABLE";
  }

  getHealthStatus() {
    if (!this.configured) {
      return {
        status: "UNAVAILABLE",
        healthy: false,
        reason: "TELEMETRY_SOURCE_UNCONFIGURED",
        schema_version: SCHEMA_VERSION,
      };
    }

    try {
      const events = this.loadEvents();
      return {
        status: "ACTIVE",
        healthy: true,
        reason: null,
        schema_version: SCHEMA_VERSION,
        events_in_store: events.length,
        last_ingestion: this.diagnostics.last_successful_ingestion,
      };
    } catch (err) {
      return {
        status: "DEGRADED",
        healthy: false,
        reason: `Storage read failure: ${err.message}`,
        schema_version: SCHEMA_VERSION,
      };
    }
  }

  getOperationalDiagnostics() {
    return {
      ...this.diagnostics,
      source_status: this.configured ? "ACTIVE" : "UNAVAILABLE",
    };
  }

  loadEvents() {
    this._ensureStore();
    try {
      const raw = fs.readFileSync(this.storePath, "utf-8");
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Could not read telemetry events, returning empty array:", e.message);
      return [];
    }
  }

  saveEvents(events) {
    this._ensureStore();
    fs.writeFileSync(this.storePath, JSON.stringify(events, null, 2));
  }

  recordEvent(rawEvent) {
    this.diagnostics.events_received++;

    if (!this.configured) {
      this.diagnostics.events_rejected++;
      return { recorded: false, error: "Telemetry store is disabled / unconfigured" };
    }

    const validation = validateTelemetryEvent(rawEvent);
    if (!validation.valid) {
      this.diagnostics.events_rejected++;
      return { recorded: false, error: validation.error };
    }

    const event = validation.sanitizedEvent;
    const events = this.loadEvents();

    // Check duplicate event_id
    if (events.some((e) => e.event_id === event.event_id)) {
      this.diagnostics.events_deduplicated++;
      return { recorded: false, duplicate: true, event_id: event.event_id };
    }

    events.push(event);
    this.saveEvents(events);

    this.diagnostics.events_accepted++;
    this.diagnostics.last_successful_ingestion = new Date().toISOString();

    return { recorded: true, event };
  }

  recordBatch(rawEvents) {
    if (!Array.isArray(rawEvents)) {
      throw new Error("recordBatch expects an array of events");
    }
    const results = [];
    for (const re of rawEvents) {
      results.push(this.recordEvent(re));
    }
    return results;
  }

  getEvents(filter = {}) {
    let events = this.loadEvents();
    if (filter.date) {
      events = events.filter((e) => e.timestamp.slice(0, 10) === filter.date);
    }
    if (filter.event_type) {
      events = events.filter((e) => e.event_type === filter.event_type);
    }
    if (filter.utility_id) {
      events = events.filter((e) => e.utility_id === filter.utility_id);
    }
    if (filter.widget_id) {
      events = events.filter((e) => e.widget_id === filter.widget_id);
    }
    return events;
  }

  aggregateDailyTelemetry(date) {
    this.diagnostics.last_aggregation = new Date().toISOString();

    if (!this.configured) {
      return {
        date,
        utility_views: null,
        tool_executions: null,
        widget_views: null,
        total_events: 0,
        status: "UNAVAILABLE",
        reason: "TELEMETRY_SOURCE_UNCONFIGURED",
        event_ids: [],
      };
    }

    const dayEvents = this.getEvents({ date });
    const views = dayEvents.filter((e) => e.event_type === "utility_view").length;
    const executions = dayEvents.filter((e) => e.event_type === "tool_execution").length;
    const widgetViews = dayEvents.filter((e) => e.event_type === "widget_view").length;

    return {
      date,
      utility_views: views,
      tool_executions: executions,
      widget_views: widgetViews,
      total_events: dayEvents.length,
      status: "SUCCESS",
      reason: null,
      event_ids: dayEvents.map((e) => e.event_id),
    };
  }

  clearEvents() {
    this.saveEvents([]);
  }
}

export const defaultTelemetryStore = new TelemetryStore();
