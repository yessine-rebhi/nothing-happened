import fs from 'fs';
import path from 'path';
import { info, warn } from "../cli/utils/logger.js";
import postcss from 'postcss';
import discardComments from 'postcss-discard-comments';
import { cleanCSSFile } from '../cli/utils/cleanCSSFile.js';
import { cleanHTMLFile } from '../cli/utils/cleanHtmlFile.js';
import { cleanJavaScriptFile } from '../cli/utils/cleanJSFile.js';
const configPath = path.resolve(process.cwd(), 'cleanup.config.json');
let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (error) {
  console.error('Failed to load cleanup.config.json:', error);
  process.exit(1);
}
function shouldExclude(filePath) {
  return config.excludedFilesAndDirs.some(excluded => {
    const excludedPath = path.resolve(process.cwd(), excluded);
    const filePathAbs = path.resolve(filePath);
    return filePathAbs.startsWith(excludedPath);
  });
}
async function getFilesToClean(directoryPath) {
  const files = await fs.promises.readdir(directoryPath);
  const filesToClean = [];
  for (const file of files) {
    const fullPath = path.join(directoryPath, file);
    if (shouldExclude(fullPath)) {
      continue;
    }
    const stats = await fs.promises.stat(fullPath);
    if (stats.isDirectory()) {
      const subFiles = await getFilesToClean(fullPath);
      filesToClean.push(...subFiles);
    } else {
      filesToClean.push(fullPath);
    }
  }
  return filesToClean;
}
async function cleanFile(filePath, dryMode) {
  const fileExtension = path.extname(filePath).slice(1).toLowerCase();
  if (config.cleaningRules[fileExtension]) {
    switch (fileExtension) {
      case 'js':
        if (config.cleaningRules.js.removeComments || config.cleaningRules.js.removeUnusedVariables) {
          await cleanJavaScriptFile(filePath, dryMode);
        }
        break;
      case 'css':
        if (config.cleaningRules.css.removeComments) {
          await cleanCSSFile(filePath, dryMode);
        }
        break;
      case 'html':
        if (config.cleaningRules.html.removeComments) {
          await cleanHTMLFile(filePath, dryMode);
        }
        break;
      default:
        break;
    }
  }
}
export default async function cleanup(directoryPath) {
  let {
    dryRun
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    dryRun: true
  };
  const filesToClean = await getFilesToClean(directoryPath);
  if (dryRun) {
    warn("Running in dry mode: No changes will be saved.");
  }
  await Promise.all(filesToClean.map(file => cleanFile(file, dryRun)));
  console.log("Cleanup complete.");
}