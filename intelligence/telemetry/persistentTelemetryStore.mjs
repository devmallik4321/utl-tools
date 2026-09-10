import fs from "fs";
import path from "path";
import crypto from "crypto";
import { validateTelemetryEvent, SCHEMA_VERSION, FORBIDDEN_KEYS } from "./telemetryContract.mjs";

export { FORBIDDEN_KEYS };

const DEFAULT_PERSISTENT_PATH = path.resolve("intelligence/telemetry/persistent_events.json");

/**
 * File-backed durable persistent engine
 */
export class FileStorageEngine {
  constructor(filePath = DEFAULT_PERSISTENT_PATH) {
    this.filePath = filePath;
    this._ensureFile();
  }

  _ensureFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  async loadEvents() {
    this._ensureFile();
    try {
      const raw = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  async saveEvents(events) {
    this._ensureFile();
    fs.writeFileSync(this.filePath, JSON.stringify(events, null, 2));
  }

  async saveEvent(event) {
    const events = await this.loadEvents();
    if (events.some((e) => e.event_id === event.event_id)) {
      return { saved: false, duplicate: true };
    }
    events.push(event);
    await this.saveEvents(events);
    return { saved: true, duplicate: false };
  }

  async clear() {
    await this.saveEvents([]);
  }

  getType() {
    return "PERSISTENT_FILE";
  }

  isPersistent() {
    return true;
  }
}

/**
 * Upstash Redis REST API Engine (0-dependency, serverless HTTP REST)
 */
export class UpstashRedisEngine {
  constructor(url, token) {
    this.url = url.replace(/\/$/, "");
    this.token = token;
  }

  async _command(command, ...args) {
    const res = await fetch(`${this.url}/${command}/${args.map(encodeURIComponent).join("/")}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok) throw new Error(`Upstash HTTP Error: ${res.status}`);
    const data = await res.json();
    return data.result;
  }

  async saveEvent(event) {
    // Atomic deduplication via SET NX with 30-day TTL (2592000 seconds)
    const dedupKey = `utl:dedup:${event.event_id}`;
    const acquired = await this._command("SET", dedupKey, "1", "NX", "EX", "2592000");
    if (!acquired) {
      return { saved: false, duplicate: true };
    }

    // Append to list of events
    await this._command("LPUSH", "utl:events", JSON.stringify(event));
    return { saved: true, duplicate: false };
  }

  async loadEvents() {
    try {
      const rawList = await this._command("LRANGE", "utl:events", "0", "-1");
      return (rawList || []).map((s) => JSON.parse(s));
    } catch {
      return [];
    }
  }

  async clear() {
    await this._command("DEL", "utl:events");
  }

  getType() {
    return "UPSTASH_REDIS";
  }

  isPersistent() {
    return true;
  }
}

/**
 * PersistentTelemetryStore
 * High-reliability, privacy-first telemetry store supporting multi-engine persistence and utility-level aggregates.
 */
export class PersistentTelemetryStore {
  constructor(options = {}) {
    this.configured = options.configured !== undefined ? options.configured : true;
    this.retentionDays = options.retentionDays || 30;

    // Detect / initialize storage engine
    if (options.engine) {
      this.engine = options.engine;
    } else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      this.engine = new UpstashRedisEngine(
        process.env.UPSTASH_REDIS_REST_URL,
        process.env.UPSTASH_REDIS_REST_TOKEN
      );
    } else {
      const storePath = options.storePath || process.env.TELEMETRY_PERSISTENT_STORE_PATH || DEFAULT_PERSISTENT_PATH;
      this.engine = new FileStorageEngine(storePath);
    }

    this.diagnostics = {
      events_received: 0,
      events_accepted: 0,
      events_rejected: 0,
      events_deduplicated: 0,
      last_successful_ingestion: null,
      last_aggregation: null,
      schema_version: SCHEMA_VERSION,
    };
  }

  getEngineType() {
    return this.engine.getType();
  }

  isPersistent() {
    return this.engine.isPersistent();
  }

  getPersistenceStatus() {
    if (!this.configured) {
      return "DISABLED";
    }
    if (this.engine.getType() === "UPSTASH_REDIS") {
      return "PERSISTENT_CLOUD_REDIS";
    }
    if (this.engine.getType() === "PERSISTENT_FILE") {
      return "PERSISTENT_DURABLE_STORAGE";
    }
    return "NON-PERSISTENT_EDGE";
  }

  async recordEvent(rawEvent) {
    this.diagnostics.events_received++;

    if (!this.configured) {
      this.diagnostics.events_rejected++;
      return { recorded: false, error: "Persistent telemetry store disabled" };
    }

    const validation = validateTelemetryEvent(rawEvent);
    if (!validation.valid) {
      this.diagnostics.events_rejected++;
      return { recorded: false, error: validation.error };
    }

    const event = validation.sanitizedEvent;

    // Persist via engine with atomic deduplication
    const result = await this.engine.saveEvent(event);
    if (result.duplicate) {
      this.diagnostics.events_deduplicated++;
      return { recorded: false, duplicate: true, event_id: event.event_id };
    }

    this.diagnostics.events_accepted++;
    this.diagnostics.last_successful_ingestion = new Date().toISOString();

    return { recorded: true, event };
  }

  async recordBatch(rawEvents) {
    if (!Array.isArray(rawEvents)) {
      throw new Error("recordBatch expects an array");
    }
    const results = [];
    for (const re of rawEvents) {
      results.push(await this.recordEvent(re));
    }
    return results;
  }

  async loadEvents(filter = {}) {
    let events = await this.engine.loadEvents();

    if (filter.date) {
      events = events.filter((e) => e.timestamp.slice(0, 10) === filter.date);
    }
    if (filter.month) {
      events = events.filter((e) => e.timestamp.slice(0, 7) === filter.month);
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

  async aggregateDaily(date) {
    this.diagnostics.last_aggregation = new Date().toISOString();
    const dayEvents = await this.loadEvents({ date });

    const views = dayEvents.filter((e) => e.event_type === "utility_view").length;
    const executions = dayEvents.filter((e) => e.event_type === "tool_execution").length;
    const widgetViews = dayEvents.filter((e) => e.event_type === "widget_view").length;

    return {
      date,
      utility_views: views,
      tool_executions: executions,
      widget_views: widgetViews,
      total_events: dayEvents.length,
      execution_rate: views > 0 ? parseFloat(((executions / views) * 100).toFixed(1)) : 0.0,
      status: "SUCCESS",
      engine: this.getEngineType(),
      is_persistent: this.isPersistent(),
    };
  }

  async aggregateMonthly(month) {
    const monthEvents = await this.loadEvents({ month });

    const views = monthEvents.filter((e) => e.event_type === "utility_view").length;
    const executions = monthEvents.filter((e) => e.event_type === "tool_execution").length;
    const widgetViews = monthEvents.filter((e) => e.event_type === "widget_view").length;

    return {
      month,
      utility_views: views,
      tool_executions: executions,
      widget_views: widgetViews,
      total_events: monthEvents.length,
      execution_rate: views > 0 ? parseFloat(((executions / views) * 100).toFixed(1)) : 0.0,
      status: "SUCCESS",
      engine: this.getEngineType(),
      is_persistent: this.isPersistent(),
    };
  }

  /**
   * Utility-Level Aggregation (views, executions, rates by individual utility)
   */
  async getUtilityAggregates(filter = {}) {
    const events = await this.loadEvents(filter);
    const utilityMap = new Map();

    for (const ev of events) {
      if (!ev.utility_id) continue;
      const uid = ev.utility_id;
      if (!utilityMap.has(uid)) {
        utilityMap.set(uid, {
          utility_id: uid,
          views: 0,
          executions: 0,
        });
      }
      const record = utilityMap.get(uid);
      if (ev.event_type === "utility_view") {
        record.views++;
      } else if (ev.event_type === "tool_execution") {
        record.executions++;
      }
    }

    const result = Array.from(utilityMap.values()).map((rec) => ({
      utility_id: rec.utility_id,
      views: rec.views,
      executions: rec.executions,
      execution_rate_percentage: rec.views > 0 ? parseFloat(((rec.executions / rec.views) * 100).toFixed(1)) : 0.0,
    }));

    return result;
  }

  async getTopUtilities(limit = 10, filter = {}) {
    const aggregates = await this.getUtilityAggregates(filter);
    aggregates.sort((a, b) => b.views - a.views || b.executions - a.executions);
    return aggregates.slice(0, limit);
  }

  async getBottomUtilities(limit = 10, filter = {}) {
    const aggregates = await this.getUtilityAggregates(filter);
    aggregates.sort((a, b) => a.views - b.views || a.executions - b.executions);
    return aggregates.slice(0, limit);
  }

  async getWidgetAggregates(filter = {}) {
    const events = await this.loadEvents(filter);
    const widgetMap = new Map();

    for (const ev of events) {
      if (ev.event_type !== "widget_view" || !ev.widget_id) continue;
      const wid = ev.widget_id;
      widgetMap.set(wid, (widgetMap.get(wid) || 0) + 1);
    }

    return Array.from(widgetMap.entries()).map(([widget_id, views]) => ({
      widget_id,
      views,
    }));
  }

  async getZeroUsageUtilities(allUtilities = [], filter = {}) {
    const aggregates = await this.getUtilityAggregates(filter);
    const activeSet = new Set(aggregates.map((a) => a.utility_id));
    return allUtilities
      .filter((u) => !activeSet.has(u.slug || u.utility_id))
      .map((u) => ({
        utility_id: u.slug || u.utility_id,
        name: u.name,
        views: 0,
        executions: 0,
      }));
  }

  async getHealthStatus() {
    if (!this.configured) {
      return {
        status: "UNAVAILABLE",
        persistence: "UNCONFIGURED",
        event_count: null,
        notes: "Persistent telemetry store explicitly unconfigured or disabled.",
      };
    }
    const events = await this.loadEvents();
    return {
      status: "SUCCESS",
      persistence: this.getPersistenceStatus(),
      engine: this.getEngineType(),
      event_count: events.length,
      diagnostics: this.diagnostics,
    };
  }

  async clear() {
    await this.engine.clear();
  }
}

export const defaultPersistentStore = new PersistentTelemetryStore();
