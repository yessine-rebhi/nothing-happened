import { execSync } from "child_process";
import chalk from "chalk";
import simpleGit from 'simple-git';

function runGitCommand(command) {
  try {
    const output = execSync(command, { encoding: "utf-8" });
    return output.trim();
  } catch (error) {
    console.error(chalk.red(`Error executing Git command: ${command}`));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

export function isGitRepository() {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function ensureCleanGitStatus() {
  const status = runGitCommand("git status --porcelain");
  if (status) {
    console.error(chalk.red("Uncommitted changes detected. Please commit or stash your changes before proceeding."));
    process.exit(1);
  }
}

export async function switchToCleanupBranch(branchName = "nothing-happened") {
  const branches = runGitCommand("git branch --list");
  if (branches.includes(branchName)) {
    console.log(chalk.green(`Switching to existing branch: ${branchName}`));
    runGitCommand(`git checkout ${branchName}`);
  } else {
    console.log(chalk.green(`Creating and switching to new branch: ${branchName}`));
    runGitCommand(`git checkout -b ${branchName}`);
  }
}

export async function commitChanges(message) {
  try {
    const git = simpleGit();
    const status = await git.status();

    if (status.files.length === 0) {
      console.log("No changes to commit.");
      return; // Skip commit if no changes
    }

    await git.commit(message);
    console.log("Committed changes successfully.");
  } catch (error) {
    console.error("Error executing Git command:", error);
  }
}

export async function pushBranch(branchName = "nothing-happened") {
  runGitCommand(`git push origin ${branchName}`);
  console.log(chalk.green(`Branch '${branchName}' pushed to remote.`));
}