import { execSync } from "child_process";
import chalk from "chalk";

/**
 * Executes a Git command and returns the output.
 * Throws an error if the command fails.
 */
function runGitCommand(command) {
  try {
    const output = execSync(command, { encoding: "utf-8" });
    return output.trim();
  } catch (error) {
    console.error(chalk.red(`Error executing Git command: ${command}`));
    console.error(chalk.red(error.message));
    process.exit(1); // Exit the process if Git command fails
  }
}

/**
 * Checks if the directory is a Git repository.
 */
export function isGitRepository() {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures the Git repository is clean before making changes.
 */
export function ensureCleanGitStatus() {
  const status = runGitCommand("git status --porcelain");
  if (status) {
    console.error(chalk.red("Uncommitted changes detected. Please commit or stash your changes before proceeding."));
    process.exit(1);
  }
}

/**
 * Creates or switches to the 'nothing-happened' branch.
 */
export function switchToCleanupBranch(branchName = "nothing-happened") {
  const branches = runGitCommand("git branch --list");
  if (branches.includes(branchName)) {
    console.log(chalk.green(`Switching to existing branch: ${branchName}`));
    runGitCommand(`git checkout ${branchName}`);
  } else {
    console.log(chalk.green(`Creating and switching to new branch: ${branchName}`));
    runGitCommand(`git checkout -b ${branchName}`);
  }
}

/**
 * Adds and commits changes with a custom message.
 */
export function commitChanges(commitMessage = "Cleanup: Automated code cleanup") {
  runGitCommand("git add .");
  runGitCommand(`git commit -m "${commitMessage}"`);
  console.log(chalk.green("Changes committed successfully."));
}

/**
 * Pushes the cleanup branch to the remote repository.
 */
export function pushBranch(branchName = "nothing-happened") {
  runGitCommand(`git push origin ${branchName}`);
  console.log(chalk.green(`Branch '${branchName}' pushed to remote.`));
}