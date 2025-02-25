import { switchToCleanupBranch, commitChanges, pushBranch } from '../../core/git.js';
import { loadCustomConfig } from '../../core/config.js';
import cleanup from '../../core/cleanup.js';
export async function cleanupCommand() {
  try {
    console.log('Starting cleanup process...');
    const config = loadCustomConfig(process.cwd());
    await cleanup(process.cwd(), config.dryRun);
    const branchName = config.branchName || 'nothing-happened';
    console.log("Switching to cleanup branch: ".concat(branchName));
    await switchToCleanupBranch(branchName);
    const commitMessage = config.commitMessage || 'Automated cleanup by nothing-happened';
    console.log("Committing changes with message: \"".concat(commitMessage, "\""));
  } catch (error) {
    console.error('An error occurred during the cleanup process:');
    console.error(error.message);
  }
}