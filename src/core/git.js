import chalk from "chalk";
import simpleGit from 'simple-git';
const git = simpleGit();
function validateBranchName(branchName) {
  const validChars = /^[a-zA-Z0-9\-_\.\/]+$/;
  if (!validChars.test(branchName)) {
    throw new Error("Invalid branch name: ".concat(branchName));
  }
}
export function isGitRepository() {
  return git.checkIsRepo();
}
export async function cleanGitStatus() {
  return await git.status().then(status => {
    if (status.isClean) {
      console.log("No uncommitted changes detected.");
    } else {
      console.error(chalk.red("Uncommitted changes detected. Please commit or stash your changes before proceeding."));
      process.exit(1);
    }
  }).catch(error => {
    console.error(chalk.red("Error checking Git status:"), error);
    process.exit(1);
  });
}
export async function switchToCleanupBranch() {
  let branchName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "nothing-happened";
  try {
    validateBranchName(branchName);
    const branches = await git.branch();
    if (branches.all.includes(branchName)) {
      console.log(chalk.green("Switching to existing branch: ".concat(branchName)));
      await git.checkout(branchName);
    } else {
      console.log(chalk.green("Creating and switching to new branch: ".concat(branchName)));
      await git.checkout(['-b', branchName]);
    }
  } catch (error) {
    console.error(chalk.red("Error switching branches:"), error);
    process.exit(1);
  }
}
export async function commitChanges(message) {
  try {
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
    process.exit(1);
  }
}
export async function pushBranch() {
  let branchName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "nothing-happened";
  try {
    validateBranchName(branchName);
    await git.push('origin', branchName);
    console.log(chalk.green("Branch '".concat(branchName, "' pushed to remote.")));
  } catch (error) {
    console.error(chalk.red("Error pushing branch:"), error);
    process.exit(1);
  }
}