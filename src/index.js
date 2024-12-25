import { cleanup } from './core/cleanup.js';
import { isGitRepository, switchToCleanupBranch, commitChanges, pushBranch } from './core/git.js';
import loadConfig from './core/config.js';

export default {
  cleanup,
  git: {
    isGitRepository,
    switchToCleanupBranch,
    commitChanges,
    pushBranch,
  },
  loadConfig,
};