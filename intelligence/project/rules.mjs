export const utlOpportunityRules = [
  {
    rule_id: "RULE-GSC-001",
    name: "High Impressions + Low CTR Search Intent Alignment",
    evaluate(observations) {
      const gscImpressions = observations.find((o) => o.metric_id === "search_impressions");
      const gscCtr = observations.find((o) => o.metric_id === "search_ctr");

      if (
        gscImpressions &&
        typeof gscImpressions.value === "number" &&
        gscImpressions.value > 300 &&
        gscCtr &&
        typeof gscCtr.value === "number" &&
        gscCtr.value < 4.0
      ) {
        return {
          type: "SEO",
          title: "Align Search Snippets for High-Impression Keywords",
          description: `Search impressions are strong (${gscImpressions.value}), but CTR is ${gscCtr.value}%. Updating meta titles and snippet descriptions will capture lost click intent.`,
          evidence_ids: [gscImpressions.observation_id, gscCtr.observation_id],
          impact_score: 85,
          effort_score: 15,
          urgency_score: 80,
          confidence_score: 0.90,
          recommended_action: "Review and optimize meta title tags and search-intent introductory sections on top 5 impression tools.",
        };
      }
      return null;
    },
  },
  {
    rule_id: "RULE-GSC-002",
    name: "Page-One SERP Elevation Candidate (Positions 4-15)",
    evaluate(observations) {
      const avgPos = observations.find((o) => o.metric_id === "average_position");
      if (avgPos && typeof avgPos.value === "number" && avgPos.value >= 4.0 && avgPos.value <= 15.0) {
        return {
          type: "GROWTH",
          title: "Diff Checker & Key Utilities Page-One Elevation",
          description: `Key utilities are ranking at average position ${avgPos.value}. Targeted content depth and schema enhancements can push them to top-3 Google rankings.`,
          evidence_ids: [avgPos.observation_id],
          impact_score: 90,
          effort_score: 25,
          urgency_score: 85,
          confidence_score: 0.88,
          recommended_action: "Add side-by-side character diff highlighting and structured SoftwareApplication schema to Diff Checker.",
        };
      }
      return null;
    },
  },
  {
    rule_id: "RULE-MISSING-003",
    name: "Missing High-Demand Utility Opportunity",
    evaluate(observations) {
      return {
        type: "CREATE_NEW",
        title: "Create Percentage Difference Calculator",
        description: "Significant search volume exists for 'percentage difference calculator' and 'percentage increase decrease'. UTL currently has only standard percentage calculators.",
        evidence_ids: ["SERP-QUERY-DEMAND-PCT-DIFF"],
        impact_score: 82,
        effort_score: 20,
        urgency_score: 75,
        confidence_score: 0.92,
        recommended_action: "Build a zero-install, instant client-side Percentage Difference Calculator under /tools/percentage-difference-calculator in next feature batch.",
      };
    },
  },
  {
    rule_id: "RULE-WIDGET-004",
    name: "Windows Widget Discovery Internal Flow Optimization",
    evaluate(observations) {
      const widgetViews = observations.find((o) => o.metric_id === "widget_views");
      if (widgetViews && typeof widgetViews.value === "number" && widgetViews.value > 100) {
        return {
          type: "USER_EXPERIENCE",
          title: "Enhance Widget 1-Click Store Installation Deep Links",
          description: `Windows Widget hub received ${widgetViews.value} views. Adding direct ms-windows-store:// URI links will improve installation conversion.`,
          evidence_ids: [widgetViews.observation_id],
          impact_score: 78,
          effort_score: 15,
          urgency_score: 70,
          confidence_score: 0.85,
          recommended_action: "Update Microsoft Store widget records to include native ms-windows-store deep-links alongside web URLs.",
        };
      }
      return null;
    },
  },
];
