import path from "path";
import { readFile, writeFile, isDirectory, readdir } from "../cli/utils/fileUtils.js";
import { info, success, warn, error } from "../cli/utils/logger.js";
import cleanupRules from "./rules.js";
import { loadCustomConfig } from "./config.js";

// Function to clean a single file based on the configured rules
async function cleanFile(filePath, config) {
  try {
    const originalContent = await readFile(filePath);
    let cleanedContent = originalContent;

    // Apply cleanup rules based on the configuration
    if (config.rules.unusedCode) {
      cleanedContent = cleanedContent.replace(cleanupRules.unusedCode, "");
    }

    // Only write changes if there was a modification
    if (originalContent !== cleanedContent) {
      await writeFile(filePath, cleanedContent);
      success(`Cleaned: ${filePath}`);
    }
  } catch (err) {
    error(`Error cleaning ${filePath}: ${err.message}`);
  }
}

// Function to clean the entire directory
async function cleanDirectory(directoryPath, config) {
  const files = await readdir(directoryPath);

  for (const file of files) {
    const fullPath = path.join(directoryPath, file);

    // Check if the file matches any exclusion pattern
    const isExcluded = config.excludePatterns.some((pattern) => {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')); // Convert wildcard patterns to regex
      return regex.test(fullPath);
    });

    // If the file is excluded, skip it without logging
    if (isExcluded) {
      continue;
    }

    // If it's a directory, recursively clean it
    if (await isDirectory(fullPath)) {
      await cleanDirectory(fullPath, config);
    } else {
      await cleanFile(fullPath, config); // Clean the file if not excluded
    }
  }
}

// Main cleanup function that handles both dry-run and actual cleanup
export async function cleanup(directoryPath, options = { dryRun: false }) {
  info(`Starting cleanup for directory: ${directoryPath}`);

  // Load custom configuration
  const config = loadCustomConfig(directoryPath);

  // Override dry-run if specified in options
  if (options.dryRun !== undefined) {
    config.dryRun = options.dryRun;
  }

  // If in dry-run mode, just preview the changes
  if (config.dryRun) {
    warn("Running in dry-run mode. No changes will be made.");
    const files = await readdir(directoryPath);
    for (const file of files) {
      const fullPath = path.join(directoryPath, file);
      if (!(await isDirectory(fullPath))) {
        const originalContent = await readFile(fullPath);
        const previewContent = originalContent.replace(cleanupRules.unusedCode, "");
        if (originalContent !== previewContent) {
          info(`Preview of changes for: ${fullPath}`);
        }
      }
    }
  } else {
    // Perform the actual cleanup process
    await cleanDirectory(directoryPath, config);
  }

  info("Cleanup complete.");
}