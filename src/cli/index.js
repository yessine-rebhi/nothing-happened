import { Command } from 'commander';
import { cleanupCommand } from './commands/cleanupCommand.js';

const program = new Command();

program
  .name('nothing-happened')
  .description('Automated code cleanup for your repository')
  .version('0.1.0');

program
  .command('cleanup')
  .description('Clean up your codebase and create a branch with changes')
  .action(cleanupCommand);

program.parse(process.argv);