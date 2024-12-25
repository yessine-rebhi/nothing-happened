import { cleanup } from '../../src/core/cleanup.js';
import { loadConfig } from '../../src/core/config.js';
import { commitChanges, pushBranch, switchToCleanupBranch } from '../../src/core/git.js';

async function runAction() {
  console.log('Running cleanup action...');
  const config = loadConfig(process.cwd())
  await cleanup(process.cwd());

  switchToCleanupBranch(config.branchName || 'nothing-happened');
  commitChanges('Automated cleanup via GitHub Action');
  pushBranch(config.branchName || 'nothing-happened');

  console.log('Cleanup action completed!');
}

runAction();