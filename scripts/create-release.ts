#!/usr/bin/env bun
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { execSync } from "child_process";
import fs from "fs";
import inquirer from "inquirer";
import semver from "semver";

// look for --dry-run flag
const dryRun = process.argv.includes("--dry-run");
if (dryRun) {
  console.log("Running in dry-run mode");
}

// Function to execute shell commands
function exec(command: string): string {
  try {
    return execSync(command, { encoding: "utf8" }).trim();
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    throw error;
  }
}

// Function to get current version from package.json
function getCurrentVersion(): string {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  return packageJson.version;
}

// Function to update version in package.json
function updateVersion(newVersion: string): void {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  packageJson.version = newVersion;
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
}

// Function to get merged PRs since last release
function getMergedPRs(): string {
  let prList: string;
  try {
    const lastTag = exec("git describe --tags --abbrev=0");
    prList = exec(
      `gh pr list --base main --state merged --limit 1000 --json number,title,mergedAt --jq '.[] | select(.mergedAt > "${lastTag}") | "- " + .title + " (#" + (.number | tostring) + ")"'`,
    );
  } catch (error) {
    // If no tags found, get the last 10 merged PRs
    prList = exec(
      'gh pr list --base main --state merged --limit 10 --json number,title --jq \'.[] | "- " + .title + " (#" + (.number | tostring) + ")"\'',
    );
  }
  return prList;
}

/**
 * Runs action if not dry-run or prints message to console
 */
function runAction(action: any, message: string): void {
  if (dryRun) {
    console.log(message);
  } else {
    action();
  }
}

/**
 * Function to commit changes
 */
function commitChanges(version: string): void {
  exec("git add .");
  exec(`git commit -m "chore: release v${version}"`);
}

/**
 * Function to create a pull request
 */
function createPullRequest(version: string, mergedPRs: string): void {
  const title = `Release v${version}`;
  const body = `## Release Notes\n\n${mergedPRs}`;
  exec(
    `gh pr create --base production --head main --title "${title}" --body "${body}"`,
  );
  console.log(`Created pull request: ${title}`);
}

/**
 * Function to open a pull request in the browser
 */
function openPullRequest(version: string): void {
  exec(`gh pr view --web release-v${version}`);
}

// Main function
async function createRelease(): Promise<void> {
  const currentVersion = getCurrentVersion();
  console.log(`Current version: ${currentVersion}`);

  // Prompt for new version
  const { versionBump } = await inquirer.prompt([
    {
      type: "list",
      name: "versionBump",
      message: "Select the type of version bump:",
      choices: [
        { name: "Breaking (Major)", value: "major" },
        { name: "Feature (Minor)", value: "minor" },
        { name: "Fix (Patch)", value: "patch" },
      ],
    },
  ]);

  const newVersion = semver.inc(currentVersion, versionBump) || "";
  console.log(`New version: ${newVersion}`);

  const mergedPRs = getMergedPRs();
  console.log("Merged PRs since last release:");
  console.log(mergedPRs);

  // Update version in package.json
  runAction(() => updateVersion(newVersion), "Updated version in package.json");

  // Commit changes
  runAction(() => commitChanges(newVersion), "Committed changes");

  // Push changes to main
  runAction(() => exec("git push origin main"), "Pushed changes to main");

  // Create pull request from main to production
  runAction(
    () => createPullRequest(newVersion, mergedPRs),
    "Created pull request",
  );

  // Open the pull request
  runAction(
    () => openPullRequest(newVersion),
    `Opening pull request for v${newVersion}`,
  );
}

createRelease().catch(console.error);
