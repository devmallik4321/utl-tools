import fs from "fs";
import path from "path";

const DEFAULT_EVIDENCE_PATH = path.resolve("intelligence/verification/test_execution_evidence.json");
const DEFAULT_HISTORY_PATH = path.resolve("intelligence/verification/run_history.json");
const EVIDENCE_DIR = path.resolve("intelligence/verification/evidence");

export class EvidenceStore {
  constructor(evidencePath = DEFAULT_EVIDENCE_PATH, historyPath = DEFAULT_HISTORY_PATH) {
    this.evidencePath = evidencePath;
    this.historyPath = historyPath;
    this.evidenceDir = path.dirname(evidencePath);
    this._ensureStore();
  }

  _ensureStore() {
    if (!fs.existsSync(this.evidenceDir)) {
      fs.mkdirSync(this.evidenceDir, { recursive: true });
    }
    const singleDir = path.join(this.evidenceDir, "evidence");
    if (!fs.existsSync(singleDir)) {
      fs.mkdirSync(singleDir, { recursive: true });
    }
    if (!fs.existsSync(this.historyPath)) {
      // If canonical evidence exists, initialize history ledger with it
      if (fs.existsSync(this.evidencePath)) {
        try {
          const initialDoc = JSON.parse(fs.readFileSync(this.evidencePath, "utf-8"));
          if (initialDoc && initialDoc.run_id) {
            const initialSummary = this._buildRunSummary(initialDoc);
            fs.writeFileSync(this.historyPath, JSON.stringify([initialSummary], null, 2));
            return;
          }
        } catch {
          // ignore error and create empty array
        }
      }
      fs.writeFileSync(this.historyPath, JSON.stringify([], null, 2));
    }
  }

  _buildRunSummary(evidenceDoc) {
    const summary = evidenceDoc.summary || {};
    const results = evidenceDoc.results || [];
    const pass = summary.pass_count !== undefined ? summary.pass_count : results.filter((r) => r.status === "PASS").length;
    const fail = summary.fail_count !== undefined ? summary.fail_count : results.filter((r) => r.status === "FAIL").length;
    const human = summary.requires_human_validation_count !== undefined ? summary.requires_human_validation_count : results.filter((r) => r.status === "REQUIRES_HUMAN_VALIDATION").length;
    const blocked = summary.blocked_count !== undefined ? summary.blocked_count : results.filter((r) => r.status === "BLOCKED").length;
    const executed = summary.executed_count !== undefined ? summary.executed_count : pass + fail + human + blocked;
    const total = summary.total_specifications !== undefined ? summary.total_specifications : 420;
    const untested = summary.untested_count !== undefined ? summary.untested_count : Math.max(0, total - executed);

    return {
      run_id: evidenceDoc.run_id,
      executed_at: evidenceDoc.executed_at,
      runner_version: evidenceDoc.runner_version || "Playwright Chromium (Headless)",
      runtime: evidenceDoc.runtime || "Node.js",
      total_specifications: total,
      executed_count: executed,
      pass_count: pass,
      fail_count: fail,
      requires_human_validation_count: human,
      blocked_count: blocked,
      untested_count: untested,
      results_summary: results.map((r) => ({
        test_id: r.test_id,
        utility_id: r.utility_id,
        slug: r.slug,
        status: r.status,
        duration_ms: r.duration_ms,
        error_message: r.error_message || null,
      })),
    };
  }

  loadEvidence() {
    this._ensureStore();
    if (!fs.existsSync(this.evidencePath)) {
      return {
        run_id: null,
        executed_at: null,
        runner_version: "Playwright Chromium (Headless)",
        total_specifications: 420,
        executed_count: 0,
        pass_count: 0,
        fail_count: 0,
        requires_human_validation_count: 0,
        blocked_count: 0,
        untested_count: 420,
        results: [],
      };
    }
    try {
      const raw = fs.readFileSync(this.evidencePath, "utf-8");
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  saveEvidence(evidenceDoc) {
    this._ensureStore();
    // 1. Save canonical latest evidence
    fs.writeFileSync(this.evidencePath, JSON.stringify(evidenceDoc, null, 2));

    // 2. Persist individual evidence items into evidence/ directory
    const singleDir = path.join(this.evidenceDir, "evidence");
    if (Array.isArray(evidenceDoc.results)) {
      for (const res of evidenceDoc.results) {
        if (res.test_id) {
          const itemPath = path.join(singleDir, `${res.test_id}.json`);
          fs.writeFileSync(itemPath, JSON.stringify(res, null, 2));
        }
      }
    }

    // 3. Append or update run in run_history.json ledger
    this._recordRunHistory(evidenceDoc);
  }

  _recordRunHistory(evidenceDoc) {
    if (!evidenceDoc || !evidenceDoc.run_id) return;
    const history = this.getRunHistory();
    const runSummary = this._buildRunSummary(evidenceDoc);

    const existingIndex = history.findIndex((h) => h.run_id === runSummary.run_id);
    if (existingIndex >= 0) {
      history[existingIndex] = runSummary;
    } else {
      history.push(runSummary);
    }

    fs.writeFileSync(this.historyPath, JSON.stringify(history, null, 2));
  }

  getRunHistory() {
    this._ensureStore();
    if (!fs.existsSync(this.historyPath)) {
      return [];
    }
    try {
      const raw = fs.readFileSync(this.historyPath, "utf-8");
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  getLatestRun() {
    const history = this.getRunHistory();
    if (history.length > 0) {
      return history[history.length - 1];
    }
    return this.getExecutionSummary();
  }

  getUtilityHistory(utilityId) {
    const history = this.getRunHistory();
    const utilityRuns = [];

    for (const run of history) {
      const match = (run.results_summary || []).find(
        (r) => r.utility_id === utilityId || r.slug === utilityId
      );
      if (match) {
        utilityRuns.push({
          run_id: run.run_id,
          executed_at: run.executed_at,
          runner_version: run.runner_version,
          test_id: match.test_id,
          status: match.status,
          duration_ms: match.duration_ms,
          error_message: match.error_message,
        });
      }
    }

    return utilityRuns;
  }

  getHumanValidationRequired() {
    const latestDoc = this.loadEvidence();
    if (!latestDoc || !Array.isArray(latestDoc.results)) {
      return [];
    }
    return latestDoc.results.filter((r) => r.status === "REQUIRES_HUMAN_VALIDATION");
  }

  getExecutionSummary() {
    const doc = this.loadEvidence();
    if (!doc || !doc.results) {
      return {
        total_specifications: 420,
        executed_count: 0,
        pass_count: 0,
        fail_count: 0,
        requires_human_validation_count: 0,
        blocked_count: 0,
        untested_count: 420,
      };
    }

    const pass = doc.results.filter((r) => r.status === "PASS").length;
    const fail = doc.results.filter((r) => r.status === "FAIL").length;
    const human = doc.results.filter((r) => r.status === "REQUIRES_HUMAN_VALIDATION").length;
    const blocked = doc.results.filter((r) => r.status === "BLOCKED").length;
    const executed = pass + fail + human + blocked;
    const untested = Math.max(0, 420 - executed);

    return {
      run_id: doc.run_id,
      executed_at: doc.executed_at,
      runner_version: doc.runner_version || "Playwright Chromium (Headless)",
      total_specifications: 420,
      executed_count: executed,
      pass_count: pass,
      fail_count: fail,
      requires_human_validation_count: human,
      blocked_count: blocked,
      untested_count: untested,
    };
  }
}

export const defaultEvidenceStore = new EvidenceStore();
