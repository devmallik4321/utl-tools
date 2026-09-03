"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, GitPullRequest, FileCode, Play } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Weekdays at 4:00 AM UTC", cron: "0 4 * * 1-5" },
  { name: "Every Sunday Midnight", cron: "0 0 * * 0" },
  { name: "Every 4 Hours", cron: "0 */4 * * *" },
  { name: "1st of Every Month", cron: "0 0 1 * *" },
];

export function CronToGitLabCiConverter() {
  const [cronExp, setCronExp] = useState<string>("0 4 * * 1-5");
  const [description, setDescription] = useState<string>("Nightly Security & Dependency Scan");
  const [targetBranch, setTargetBranch] = useState<string>("main");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { gitlabCiYaml, gitlabApiCurl } = useMemo(() => {
    const cleanCron = cronExp.trim() || "0 4 * * 1-5";
    const cleanDesc = description.trim() || "Scheduled Job";
    const cleanBranch = targetBranch.trim() || "main";

    const yml = `# .gitlab-ci.yml - Scheduled Job Configuration
stages:
  - scheduled-tasks

run-scheduled-scan:
  stage: scheduled-tasks
  image: alpine:latest
  rules:
    # Only run when triggered by GitLab Pipeline Schedule
    - if: $CI_PIPELINE_SOURCE == "schedule"
  script:
    - echo "Executing scheduled pipeline for branch: $CI_COMMIT_REF_NAME"
    - echo "Running security scan on: $(date)"
    - npm test || true
`;

    const curlCmd = `curl --request POST \\
  --header "PRIVATE-TOKEN: <your_gitlab_pat>" \\
  --form description="${cleanDesc}" \\
  --form ref="${cleanBranch}" \\
  --form cron="${cleanCron}" \\
  --form cron_timezone="UTC" \\
  --form active="true" \\
  "https://gitlab.com/api/v4/projects/<PROJECT_ID>/pipeline_schedules"`;

    return {
      gitlabCiYaml: yml,
      gitlabApiCurl: curlCmd,
    };
  }, [cronExp, description, targetBranch]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setCronExp(p.cron)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              cronExp === p.cron
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Cron Expression (UTC)
          </label>
          <input
            type="text"
            value={cronExp}
            onChange={(e) => setCronExp(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Schedule Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Target Git Branch
          </label>
          <input
            type="text"
            value={targetBranch}
            onChange={(e) => setTargetBranch(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Outputs */}
      <div className="space-y-4">
        {/* .gitlab-ci.yml */}
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-emerald-500" />
              .gitlab-ci.yml (Scheduled Rule)
            </h4>
            <button
              onClick={() => handleCopy("yml", gitlabCiYaml)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "yml" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "yml" ? "Copied!" : "Copy YAML"}</span>
            </button>
          </div>

          <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
            {gitlabCiYaml}
          </pre>
        </div>

        {/* GitLab REST API curl command */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Create Schedule via GitLab REST API:</span>
            <button
              onClick={() => handleCopy("curl", gitlabApiCurl)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "curl" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "curl" ? "Copied!" : "Copy cURL"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all">
            {gitlabApiCurl}
          </pre>
        </div>
      </div>
    </div>
  );
}
