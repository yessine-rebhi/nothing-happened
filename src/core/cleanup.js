import path from "path";
import { readFile, writeFile, isDirectory, readdir } from "../cli/utils/fileUtils.js";
import { info, success, warn, error } from "../cli/utils/logger.js";
import cleanupRules from "./rules.js";
import { loadCustomConfig } from "./config.js";

// Function to match advanced exclude patterns
function isPathExcluded(filePath, excludePatterns) {
  return excludePatterns.some((pattern) => {
    const regex = new RegExp(
      pattern
        .replace(/\./g, "\\.") // Escape dots
        .replace(/\*\*/g, ".*") // Replace double wildcards
        .replace(/\*/g, "[^/]*") // Replace single wildcards
    );
    return regex.test(filePath);
  });
}

// Function to clean a single file
async function cleanFile(filePath, config) {
  try {
    const originalContent = await readFile(filePath, "utf-8");
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
      if (!config.dryRun) {
        await writeFile(filePath, cleanedContent, "utf-8");
        success(`Cleaned: ${filePath}`);
      } else {
        info(`Dry-run preview of changes for: ${filePath}`);
        console.log(cleanedContent);
      }
    }
  } catch (err) {
    error(`Error cleaning ${filePath}: ${err.message}`);
  }
}

// Function to clean a directory
async function cleanDirectory(directoryPath, config) {
  const files = await readdir(directoryPath);

  for (const file of files) {
    const fullPath = path.resolve(directoryPath, file);

    if (isPathExcluded(fullPath, config.excludePatterns)) {
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
  }

  await cleanDirectory(directoryPath, config);

  info("Cleanup complete.");
}