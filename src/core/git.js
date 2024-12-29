import { execSync } from "child_process";
import chalk from "chalk";
import simpleGit from 'simple-git';
function runGitCommand(command) {
  try {
    const output = execSync(command, {
      encoding: "utf-8"
    });
    return output.trim();
  } catch (error) {
    console.error(chalk.red("Error executing Git command: ".concat(command)));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
export function isGitRepository() {
  try {
    execSync("git rev-parse --is-inside-work-tree", {
      stdio: "ignore"
    });
    return true;
  } catch (_unused) {
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
export async function switchToCleanupBranch() {
  let branchName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "nothing-happened";
  const branches = runGitCommand("git branch --list");
  if (branches.includes(branchName)) {
    console.log(chalk.green("Switching to existing branch: ".concat(branchName)));
    runGitCommand("git checkout ".concat(branchName));
  } else {
    console.log(chalk.green("Creating and switching to new branch: ".concat(branchName)));
    runGitCommand("git checkout -b ".concat(branchName));
  }
}
export async function commitChanges(message) {
  try {
    const git = simpleGit();
    await git.add('.');
    console.log("Staged all changes successfully.");
    const status = await git.status();
    if (status.staged.length === 0) {
      console.log("No changes to commit.");
      return;
    }
    await git.commit(message);
    console.log("Committed changes successfully.");
  } catch (error) {
    console.error("Error during commit process:", error.message);
  }
}
export async function pushBranch() {
  let branchName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "nothing-happened";
  runGitCommand("git push origin ".concat(branchName));
  console.log(chalk.green("Branch '".concat(branchName, "' pushed to remote.")));
}