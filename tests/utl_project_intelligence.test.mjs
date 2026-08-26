import test from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "url";
import path from "path";

import { utlProjectContract } from "../intelligence/project/contract.mjs";
import { utlMetricDefinitions } from "../intelligence/project/metrics.mjs";
import { UtlTelemetryAdapter } from "../intelligence/project/adapters/UtlTelemetryAdapter.mjs";
import { UtlGA4Adapter } from "../intelligence/project/adapters/UtlGA4Adapter.mjs";
import { UtlSearchConsoleAdapter } from "../intelligence/project/adapters/UtlSearchConsoleAdapter.mjs";
import { UtlInternetIntelAdapter } from "../intelligence/project/adapters/UtlInternetIntelAdapter.mjs";
import { GoogleAuthClient } from "../intelligence/project/googleAuth.mjs";
import { utlOpportunityRules } from "../intelligence/project/rules.mjs";
import { runUtlProjectIntelligence } from "../intelligence/project/runner.mjs";

test("UTL.tools Project Contract - Canonical Invariants", () => {
  assert.equal(utlProjectContract.project_id, "UTL");
  assert.equal(utlProjectContract.project_name, "UTL.tools");
  assert.equal(utlProjectContract.project_type, "WEB_PLATFORM");
  assert.equal(utlProjectContract.approval_required, true);
  assert.equal(utlProjectContract.goals.length >= 5, true);
  assert.equal(utlProjectContract.non_goals.length >= 5, true);
  assert.equal(utlProjectContract.available_data_sources.includes("SRC-GA4-UTL"), true);
  assert.equal(utlProjectContract.available_data_sources.includes("SRC-GSC-UTL"), true);
  assert.equal(utlProjectContract.available_data_sources.includes("SRC-UTL-TELEMETRY"), true);
});

test("Google Auth Client - Safe Handling without Credentials", async () => {
  const auth = new GoogleAuthClient();
  assert.equal(auth.hasCredentials(), false);
  const token = await auth.getAccessToken();
  assert.equal(token, null);
});

test("UTL Provider Adapters - Epistemic & Auth Required Transparency", async () => {
  const telemetry = new UtlTelemetryAdapter();
  const telObs = await telemetry.collect(utlProjectContract);
  assert.equal(telObs.length >= 3, true);
  assert.equal(telObs[0].epistemic_type, "FACT");
  assert.equal(telObs[0].status, "SUCCESS");

  const ga4 = new UtlGA4Adapter();
  const ga4Obs = await ga4.collect(utlProjectContract);
  assert.equal(ga4Obs.length >= 2, true);
  assert.equal(ga4Obs[0].status, "AUTH_REQUIRED");
  assert.equal(ga4Obs[0].epistemic_type, "ESTIMATE");

  const gsc = new UtlSearchConsoleAdapter();
  const gscObs = await gsc.collect(utlProjectContract);
  assert.equal(gscObs.length >= 4, true);
  assert.equal(gscObs[0].status, "AUTH_REQUIRED");
  assert.equal(gscObs[0].epistemic_type, "ESTIMATE");

  const intel = new UtlInternetIntelAdapter();
  const intelObs = await intel.collect(utlProjectContract);
  assert.equal(intelObs.length >= 1, true);
});

test("UTL Metrics Registry - Comprehensive Coverage", () => {
  const metricIds = utlMetricDefinitions.map((m) => m.metric_id);
  assert.equal(metricIds.includes("users"), true);
  assert.equal(metricIds.includes("organic_users"), true);
  assert.equal(metricIds.includes("search_impressions"), true);
  assert.equal(metricIds.includes("search_clicks"), true);
  assert.equal(metricIds.includes("search_ctr"), true);
  assert.equal(metricIds.includes("average_position"), true);
  assert.equal(metricIds.includes("utility_views"), true);
  assert.equal(metricIds.includes("utility_interactions"), true);
  assert.equal(metricIds.includes("widget_views"), true);
});

test("UTL Opportunity Rules - Deterministic Evaluation", () => {
  const mockObs = [
    { metric_id: "search_impressions", value: 500, observation_id: "OBS-01" },
    { metric_id: "search_ctr", value: 2.5, observation_id: "OBS-02" },
    { metric_id: "average_position", value: 8.5, observation_id: "OBS-03" },
    { metric_id: "widget_views", value: 150, observation_id: "OBS-04" },
  ];

  const ruleA = utlOpportunityRules.find((r) => r.rule_id === "RULE-GSC-001");
  const oppA = ruleA.evaluate(mockObs);
  assert.equal(oppA !== null, true);
  assert.equal(oppA.type, "SEO");
  assert.equal(oppA.impact_score > 70, true);

  const ruleB = utlOpportunityRules.find((r) => r.rule_id === "RULE-GSC-002");
  const oppB = ruleB.evaluate(mockObs);
  assert.equal(oppB !== null, true);
  assert.equal(oppB.type, "GROWTH");
});

test("UTL Project Intelligence Engine - End-to-End Pipeline & Governance", async () => {
  const result = await runUtlProjectIntelligence();

  assert.equal(result.projectState.project_id, "UTL");
  assert.equal(result.opportunities.length >= 4, true);
  assert.equal(result.recommendations.length >= 4, true);

  for (const rec of result.recommendations) {
    assert.equal(rec.approval_required, true);
    assert.equal(rec.status, "PROPOSED");
  }

  const topRec = result.recommendations[0];
  const dec = await result.engine.recordHumanDecision(
    topRec,
    "APPROVE",
    "Operator approved recommendation for next sprint.",
    "Operator-Mallik"
  );

  assert.equal(dec.decision.decision, "APPROVE");
  assert.equal(dec.updatedRecommendation.status, "APPROVED");
  assert.equal(dec.executionHandoff !== undefined, true);
  assert.equal(dec.executionHandoff?.status, "READY");

  const val = await result.engine.validateOutcome(
    dec.executionHandoff,
    480,
    620
  );

  assert.equal(val.validation_status, "SUCCESS");
  assert.equal(val.change_pct > 0, true);
});
