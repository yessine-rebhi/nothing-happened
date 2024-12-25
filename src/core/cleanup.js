import path from "path";
import { readFile, writeFile, isDirectory, readdir } from "../cli/utils/fileUtils.js";
import { info, success, warn, error } from "../cli/utils/logger.js";
import cleanupRules from "./rules.js";
import { loadCustomConfig } from "./config.js";

// Function to clean a single file
async function cleanFile(filePath, config) {
  try {
    const originalContent = await readFile(filePath);
    let cleanedContent = originalContent;

    // Apply cleanup rules based on the configuration
    if (config.rules.comments) {
      cleanedContent = cleanedContent.replace(cleanupRules.comments, "");
    }
    if (config.rules.unusedCode) {
      cleanedContent = cleanedContent.replace(cleanupRules.unusedCode, "");
    }

    // If changes are made, write the cleaned content back to the file
    if (originalContent !== cleanedContent) {
      await writeFile(filePath, cleanedContent);
      success(`Cleaned: ${filePath}`);
    }
  } catch (err) {
    error(`Error cleaning ${filePath}: ${err.message}`);
  }
}

// Function to recursively clean a directory
async function cleanDirectory(directoryPath, config) {
  const files = await readdir(directoryPath);

  for (const file of files) {
    const fullPath = path.join(directoryPath, file);

    // Skip excluded paths based on patterns in the config
    if (config.excludePatterns.some((pattern) => fullPath.includes(pattern))) {
      warn(`Skipping excluded path: ${fullPath}`);
      continue;
    }

    if (await isDirectory(fullPath)) {
      await cleanDirectory(fullPath, config);
    } else {
      await cleanFile(fullPath, config);
    }
  }
}

// Main cleanup function
export async function cleanup(directoryPath, options = { dryRun: false }) {
  info(`Starting cleanup for directory: ${directoryPath}`);

  // Load configuration from the config.js file
  const config = loadCustomConfig(directoryPath);
  info("Loaded configuration:", config);

  // Override dry-run option if specified
  if (options.dryRun !== undefined) {
    config.dryRun = options.dryRun;
  }

  if (config.dryRun) {
    warn("Running in dry-run mode. No changes will be made.");
    // Log the potential changes without writing them to the files
    const files = await readdir(directoryPath);
    for (const file of files) {
      const fullPath = path.join(directoryPath, file);
      if (!(await isDirectory(fullPath))) {
        const originalContent = await readFile(fullPath);
        const previewContent = originalContent.replace(cleanupRules.comments, "");
        if (originalContent !== previewContent) {
          info(`Preview of changes for: ${fullPath}`);
          console.log(previewContent);
        }
      }
    }
  } else {
    // Perform the cleanup operation
    await cleanDirectory(directoryPath, config);
  }

  info("Cleanup complete.");
}