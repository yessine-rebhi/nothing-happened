export async function cleanupCommand() {
  try {
    console.log('Starting cleanup process...');

    // Load configuration
    const config = loadCustomConfig(process.cwd());

    // Perform cleanup
    await cleanup(process.cwd(), config.dryRun);

    if (!config.dryRun) {
      // Switch to the cleanup branch
      const branchName = config.branchName || 'nothing-happened';
      console.log(`Switching to cleanup branch: ${branchName}`);
      await switchToCleanupBranch(branchName);

      // Commit changes
      const commitMessage = config.commitMessage || 'Automated cleanup by nothing-happened';
      console.log(`Committing changes with message: "${commitMessage}"`);
      await commitChanges(commitMessage);

      // Push the cleanup branch
      await pushBranch(branchName);
    } else {
      console.log("Dry run: No changes were committed or pushed.");
    }

    console.log('Cleanup process completed successfully!');
  } catch (error) {
    console.error('An error occurred during the cleanup process:');
    console.error(error.message);
  }
}