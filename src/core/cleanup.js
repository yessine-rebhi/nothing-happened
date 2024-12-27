import { ESLint } from "eslint";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import madge from "madge";

// Configurable cleanup rules
const config = {
  removeComments: true,
  removeUnusedVariables: true,
  deleteUnusedFiles: true,
  excludePatterns: [
    "node_modules",
    ".git",
    ".github",
    "package-lock.json",
    "yarn.lock",
    ".env",
    ".env.example",
    ".gitignore",
    "README.md",
    "LICENSE",
    "cleanup.config.json",
    ".npmignore"
  ],
};

// Helper to remove comments from code using ESLint
async function removeComments(filePath) {
  const eslint = new ESLint({ fix: true });
  const results = await eslint.lintFiles([filePath]);
  await ESLint.outputFixes(results);
}

// Helper to check unused files using Madge
async function findUnusedFiles(directoryPath) {
  const result = await madge(directoryPath);
  return result.orphans(); // List of files not used anywhere
}

// Helper to clean file content
async function cleanFile(filePath) {
  try {
    const originalContent = await fs.readFile(filePath, "utf-8");

    let cleanedContent = originalContent;

    // Remove comments
    if (config.removeComments) {
      await removeComments(filePath);
      cleanedContent = await fs.readFile(filePath, "utf-8");
    }

    // Remove unused variables (ESLint handles this with autofix)
    if (config.removeUnusedVariables) {
      await removeComments(filePath);
      cleanedContent = await fs.readFile(filePath, "utf-8");
    }

    if (originalContent !== cleanedContent) {
      await fs.writeFile(filePath, cleanedContent, "utf-8");
      console.log(`Cleaned file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to clean file ${filePath}: ${error.message}`);
  }
}

export default async function cleanup(directoryPath) {
  try {
    const allFiles = await glob(`${directoryPath}/**/*.*`, {
      ignore: config.excludePatterns.map((pattern) => `${directoryPath}/${pattern}`),
    });

    console.log("Cleaning files...");
    for (const file of allFiles) {
      await cleanFile(file);
    }

    if (config.deleteUnusedFiles) {
      console.log("Identifying unused files...");
      const unusedFiles = await findUnusedFiles(directoryPath);

      for (const unusedFile of unusedFiles) {
        const filePath = path.resolve(directoryPath, unusedFile);
        await fs.rm(filePath, { force: true, recursive: true });
        console.log(`Deleted unused file/directory: ${filePath}`);
      }
    }

    console.log("Cleanup complete!");
  } catch (error) {
    console.error(`Error during cleanup: ${error.message}`);
  }
}