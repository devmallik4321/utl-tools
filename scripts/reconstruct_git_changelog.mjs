import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

export function reconstructGitChangelog() {
  console.log("==================================================");
  console.log("RECONSTRUCTING HISTORICAL GIT CHANGELOG");
  console.log("==================================================");

  // 1. Read utilities registry for mapping
  const utilitiesPath = path.resolve("registry/utilities.json");
  const utilities = JSON.parse(fs.readFileSync(utilitiesPath, "utf-8"));
  const slugToUtility = new Map(utilities.map((u) => [u.slug, u]));
  const nameToUtility = new Map(utilities.map((u) => [u.name.toLowerCase(), u]));

  // 2. Fetch git log with commit details and touched files
  const gitLogResult = spawnSync("git", [
    "log",
    "--reverse",
    "--date=iso",
    "--format=START_COMMIT%n%h%n%ad%n%an%n%s%nFILES:"
  ], { encoding: "utf-8" });

  if (gitLogResult.error || gitLogResult.status !== 0) {
    throw new Error(`Git log execution failed: ${gitLogResult.stderr}`);
  }

  // Also fetch touched files for each commit
  const gitFilesResult = spawnSync("git", [
    "log",
    "--reverse",
    "--name-only",
    "--format=COMMIT:%h"
  ], { encoding: "utf-8" });

  const commitFilesMap = new Map();
  const fileBlocks = gitFilesResult.stdout.split("COMMIT:").slice(1);
  for (const block of fileBlocks) {
    const lines = block.trim().split("\n");
    const sha = lines[0].trim();
    const files = lines.slice(1).map((f) => f.trim()).filter(Boolean);
    commitFilesMap.set(sha, files);
  }

  // Parse raw git log
  const rawCommits = gitLogResult.stdout.split("START_COMMIT\n").slice(1);
  const reconstructedRecords = [];

  rawCommits.forEach((raw, idx) => {
    const lines = raw.split("\n");
    const sha = lines[0]?.trim();
    const timestamp = lines[1]?.trim();
    const author = lines[2]?.trim();
    const subject = lines[3]?.trim();
    const files = commitFilesMap.get(sha) || [];

    if (!sha) return;

    // Determine change type
    let changeType = "INFRASTRUCTURE";
    if (subject.startsWith("feat(expansion)") || subject.startsWith("feat(batch-")) {
      changeType = "EXPANSION_BATCH";
    } else if (subject.startsWith("feat(phase-2)")) {
      changeType = "EXPANSION_BATCH";
    } else if (subject.startsWith("feat: UTL.tools Version 1.1")) {
      changeType = "INITIAL_RELEASE";
    } else if (subject.startsWith("feat: UTL.tools Version 1.2")) {
      changeType = "OBSERVABILITY_UX";
    } else if (subject.startsWith("fix(remediation)")) {
      changeType = "REMEDIATION_PATCH";
    } else if (subject.startsWith("fix(")) {
      changeType = "BUGFIX";
    } else if (subject.startsWith("feat(intelligence)") || subject.startsWith("feat(widgets)")) {
      changeType = "PLATFORM_FEATURE";
    } else if (subject.startsWith("docs")) {
      changeType = "DOCUMENTATION";
    } else if (subject.startsWith("chore")) {
      changeType = "CHORE_RELEASE";
    }

    // Identify affected utilities from touched component files or registry changes
    const affectedUtilities = new Set();

    // Check files
    for (const f of files) {
      const match = f.match(/components\/tools\/([a-z]+)\/([A-Za-z0-9]+)\.tsx/);
      if (match) {
        const compName = match[2];
        // Match by slug or name
        for (const u of utilities) {
          const compClean = compName.replace(/Calculator|Generator|Converter|Tester|Checker|Lookup|Counter|Simulator|Reference|Expander|Builder|Resizer|Diff|Cleaner|Picker|Translator|Clock|Timer/i, "").toLowerCase();
          if (u.slug.includes(compClean) || u.name.toLowerCase().includes(compClean)) {
            affectedUtilities.add(u.slug);
          }
        }
      }
    }

    // Check parenthesized utility names in subject (e.g. feat(expansion): scale to 280 live utilities (cURL to OCaml...))
    const parenMatch = subject.match(/\((.*?)\)$/);
    if (parenMatch && changeType === "EXPANSION_BATCH") {
      const listedNames = parenMatch[1].split(",").map((s) => s.trim().toLowerCase());
      for (const rawName of listedNames) {
        for (const u of utilities) {
          if (u.name.toLowerCase().includes(rawName) || rawName.includes(u.name.toLowerCase().slice(0, 8))) {
            affectedUtilities.add(u.slug);
          }
        }
      }
    }

    const affectedList = Array.from(affectedUtilities);
    const utilityId = affectedList.length === 1 ? affectedList[0] : affectedList.length > 1 ? "MULTIPLE_UTILITIES" : "REPOSITORY";
    const utilityName = affectedList.length === 1
      ? slugToUtility.get(affectedList[0])?.name || affectedList[0]
      : affectedList.length > 1
      ? `Batch of ${affectedList.length} Utilities`
      : "UTL.tools Platform Repository";

    reconstructedRecords.push({
      entry_id: `GIT-${String(idx + 1).padStart(4, "0")}`,
      commit_sha: sha,
      timestamp: new Date(timestamp).toISOString(),
      author,
      subject,
      change_type: changeType,
      utility_id: utilityId,
      utility_name: utilityName,
      affected_utilities_count: affectedList.length,
      affected_utilities: affectedList,
      affected_files_count: files.length,
      affected_files: files,
      epistemic_classification: "VERIFIED",
      provenance: {
        method: "GIT_LOG_NAME_ONLY_INSPECTION",
        commit: sha,
        date: timestamp,
      },
    });
  });

  const outputPath = path.resolve("documentation/GIT-CHANGELOG.json");
  fs.writeFileSync(outputPath, JSON.stringify(reconstructedRecords, null, 2));
  console.log(`✅ Successfully reconstructed ${reconstructedRecords.length} authentic Git changelog records.`);
  console.log(`Saved to: ${outputPath}`);

  return reconstructedRecords;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/reconstruct_git_changelog.mjs")) {
  reconstructGitChangelog();
}
