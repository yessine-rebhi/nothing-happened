import { switchToCleanupBranch, commitChanges, pushBranch } from '../../core/git.js';
import { loadCustomConfig } from '../../core/config.js';
import cleanup from '../../core/cleanup.js';

export async function cleanupCommand() {
  try {
    console.log('Starting cleanup process...');

    // Load configuration
    const config = loadCustomConfig(process.cwd());

    // Perform cleanup
    await cleanup(process.cwd(), { dryRun: config.dryRun });

    // Switch to the cleanup branch
    const branchName = config.branchName || 'nothing-happened';
    console.log(`Switching to cleanup branch: ${branchName}`);
    await switchToCleanupBranch(branchName);

    // Commit changes
    const commitMessage = config.commitMessage || 'Automated cleanup by nothing-happened';
    console.log(`Committing changes with message: "${commitMessage}"`);
    await commitChanges(commitMessage);

    // Push the cleanup branch
    // console.log(`Pushing branch: ${branchName}`);
    // await pushBranch(branchName);

    console.log('Cleanup process completed successfully!');
  } catch (error) {
    console.error('An error occurred during the cleanup process:');
    console.error(error.message);
  }
}