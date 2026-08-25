import path from "path";
import { pathToFileURL } from "url";

// Dynamically import from canonical reusable object
const reusableObjectPath = "C:/Users/mallik/Documents/AAEP/reusable objects/PROJECT-INTELLIGENCE/src/index.js";
const { createProjectContract } = await import(pathToFileURL(reusableObjectPath).href);

export const utlProjectContract = createProjectContract({
  project_id: "UTL",
  project_name: "UTL.tools",
  project_type: "WEB_PLATFORM",
  goals: [
    {
      goal_id: "GOAL-001",
      name: "Increase qualified organic search traffic",
      target_metric_id: "organic_users",
      target_value: 5000,
      timeframe_days: 90,
      status: "ACTIVE",
    },
    {
      goal_id: "GOAL-002",
      name: "Increase useful client-side utility executions",
      target_metric_id: "utility_interactions",
      target_value: 12000,
      timeframe_days: 90,
      status: "ACTIVE",
    },
    {
      goal_id: "GOAL-003",
      name: "Expand discovery of Windows Desktop Widgets",
      target_metric_id: "widget_views",
      target_value: 3000,
      timeframe_days: 90,
      status: "ACTIVE",
    },
    {
      goal_id: "GOAL-004",
      name: "Improve Google SERP rankings for high-intent queries",
      target_metric_id: "average_position",
      target_value: 5.0,
      timeframe_days: 90,
      status: "ACTIVE",
    },
    {
      goal_id: "GOAL-005",
      name: "Identify and prioritize high-value missing utilities",
      target_metric_id: "missing_utility_opportunities",
      target_value: 10,
      timeframe_days: 90,
      status: "ACTIVE",
    },
  ],
  non_goals: [
    "Maximizing meaningless, unengaged traffic",
    "Keyword stuffing and doorway pages",
    "Misleading SEO titles and clickbait",
    "Automated content generation or spam",
    "Automatic production code changes without human sign-off",
    "Intrusive advertising or subscription paywalls",
    "Collecting or transmitting user input payloads",
  ],
  success_metrics: [
    "users",
    "sessions",
    "engaged_sessions",
    "organic_users",
    "search_impressions",
    "search_clicks",
    "search_ctr",
    "average_position",
    "utility_views",
    "utility_interactions",
    "widget_views",
    "widget_external_clicks",
  ],
  available_data_sources: [
    "SRC-GA4-UTL",
    "SRC-GSC-UTL",
    "SRC-UTL-TELEMETRY",
    "SRC-CONTROL-CENTER",
  ],
  available_external_sources: [
    "SRC-INTERNET-INTEL-FABRIC",
  ],
  observation_cadence: "DAILY",
  opportunity_types: [
    "IMPROVE_EXISTING",
    "CREATE_NEW",
    "SEO",
    "CONTENT",
    "PERFORMANCE",
    "USER_EXPERIENCE",
    "RESEARCH",
    "GROWTH",
  ],
  decision_types: ["APPROVE", "REJECT", "PARK", "REQUEST_MORE_EVIDENCE", "MODIFY"],
  approval_required: true, // STRICT V1 SAFETY: All recommendations require human approval
  execution_capabilities: ["ANTIGRAVITY_CLI"],
  validation_capabilities: ["GA4_METRICS", "GSC_SEARCH_ANALYTICS"],
  data_retention_policy: "365_DAYS",
  custom_weights: {
    impact: 0.35,
    confidence: 0.25,
    urgency: 0.25,
    evidence: 0.15,
    effort: 0.10,
  },
});
