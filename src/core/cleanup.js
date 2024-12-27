import fs from 'fs';
import path from 'path';
import { readdir, isDirectory, readFile, writeFile, fileExists } from '../cli/utils/fileUtils.js';
import { warn } from "../cli/utils/logger.js";

// Load cleanup configuration
const configPath = path.resolve(process.cwd(), 'cleanup.config.json');

let config;

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (error) {
  console.error('Failed to load cleanup.config.json:', error);
  process.exit(1); // Exit if config loading fails
}

// Function to check if a file or directory should be excluded
function shouldExclude(filePath) {
  return config.excludedFilesAndDirs.some(excluded => filePath.includes(excluded));
}

// Function to recursively get files that are allowed to be cleaned (excluding specific ones)
async function getFilesToClean(directoryPath) {
  const files = await readdir(directoryPath);
  const filesToClean = [];

  for (const file of files) {
    const fullPath = path.join(directoryPath, file);

    // Skip excluded files and directories
    if (shouldExclude(fullPath)) {
      continue;
    }

    // If it's a directory, recurse into it
    if (await isDirectory(fullPath)) {
      const subFiles = await getFilesToClean(fullPath); // Recurse
      filesToClean.push(...subFiles);
    } else {
      filesToClean.push(fullPath); // Add file to clean list
    }
  }

  return filesToClean;
}

// Function to remove comments based on file type and config
function removeComments(content, fileType) {
  const rules = config.cleaningRules[fileType];

  if (!rules) {
    return content;
  }

  if (rules.removeComments) {
    switch (fileType) {
      case 'js':
        return content.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
      case 'css':
        return content.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
      case 'html':
        return content.replace(/<!--[\s\S]*?-->/g, "");
      default:
        return content;
    }
  }

  return content;
}

// Function to remove unused variables in JavaScript (This is a simple example, could be more complex)
function removeUnusedVariables(content) {
  // This can be improved by using static analysis tools like ESLint or UglifyJS
  return content.replace(/\bvar\s+\w+\b/g, '').replace(/\blet\s+\w+\b/g, '').replace(/\bconst\s+\w+\b/g, '');
}

// Function to clean a file based on the rules in config
async function cleanFile(filePath, dryMode) {
  const originalContent = await readFile(filePath);
  const fileExtension = path.extname(filePath).slice(1); // Get file type (e.g., js, css, html)

  // Remove comments based on config rules
  let cleanedContent = removeComments(originalContent, fileExtension);

  // Remove unused variables if it's a JS file and the config allows it
  if (fileExtension === 'js' && config.cleaningRules.js.removeUnusedVariables) {
    cleanedContent = removeUnusedVariables(cleanedContent);
  }

  // Dry mode: Just log the changes
  if (dryMode) {
    if (originalContent !== cleanedContent) {
      console.log(`Changes detected in: ${filePath}`);
    }
  } else {
    // Normal mode: Write the cleaned content back if changes were made
    if (originalContent !== cleanedContent) {
      await writeFile(filePath, cleanedContent);
      console.log(`Cleaned: ${filePath}`);
    }
  }
}

// Function to check if a file is unused (for deletion)
async function isFileUnused(filePath) {
  // For simplicity, this function checks if the file is not referenced anywhere else in the project
  // Implement your own logic to track file usage across the project
  return false; // Placeholder: you can integrate a tool to analyze code dependencies here
}

// Function to delete unused files
async function deleteUnusedFile(filePath) {
  if (fileExists(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted unused file: ${filePath}`);
  }
}

// Function to cleanup the project
export default async function cleanup(directoryPath, dryMode) {
  const filesToClean = await getFilesToClean(directoryPath);
  if (dryMode) warn(`Running in dry mode: No changes will be saved.`);


  for (const file of filesToClean) {
    // Clean each file
    await cleanFile(file, dryMode);

    // In dry mode, we only log changes; we don't delete files
    if (!dryMode) {
      // Optionally, check if the file is unused and delete it
      const unused = await isFileUnused(file);
      if (unused) {
        await deleteUnusedFile(file);
      }
    }
  }

  console.log("Cleanup complete.");
}