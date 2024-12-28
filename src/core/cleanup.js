import { ESLint } from "eslint";
import glob from "glob";
import madge from "madge";
import depcheck from "depcheck";
import fs from "fs/promises";
import path from "path";
import { loadCustomConfig } from "./config.js";

const DEFAULT_CONFIG = {
  removeComments: true,
  removeUnusedVariables: true,
  deleteUnusedFiles: true,
  removeUnusedDependencies: true,
  excludedFilesAndDirs: [
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
  dryRun: true,
};

async function removeComments(filePath, dryRun) {
  if (!DEFAULT_CONFIG.removeComments) return;
  const eslint = new ESLint({ fix: true, overrideConfig: { rules: { 'no-unused-vars': 'error' } } });
  const results = await eslint.lintFiles([filePath]);
  await ESLint.outputFixes(results);
  if (!dryRun) {
    await fs.writeFile(filePath, results[0].output, "utf-8");
    console.log(`Comments removed from: ${filePath}`);
  } else {
    console.log(`Dry run: Would remove comments from: ${filePath}`);
  }
}

async function removeUnusedVariables(filePath, dryRun) {
  if (!DEFAULT_CONFIG.removeUnusedVariables) return;
  const eslint = new ESLint({ fix: true, overrideConfig: { rules: { 'no-unused-vars': 'error' } } });
  const results = await eslint.lintFiles([filePath]);
  await ESLint.outputFixes(results);
  if (!dryRun) {
    await fs.writeFile(filePath, results[0].output, "utf-8");
    console.log(`Unused variables removed from: ${filePath}`);
  } else {
    console.log(`Dry run: Would remove unused variables from: ${filePath}`);
  }
}

async function findUnusedFiles(directoryPath) {
  const result = await madge({ paths: [directoryPath], exclude: DEFAULT_CONFIG.excludedFilesAndDirs });
  return result.orphans;
}

async function findUnusedDependencies(directoryPath) {
  return new Promise((resolve, reject) => {
    depcheck(directoryPath, { exclude: DEFAULT_CONFIG.excludedFilesAndDirs }, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.missing);
      }
    });
  });
}

export default async function cleanup(directoryPath, dryRun = DEFAULT_CONFIG.dryRun) {
  const config = loadCustomConfig(directoryPath);

  // Glob pattern for all files excluding specified directories and files
  const files = await new Promise((resolve, reject) => {
    glob(
      path.join(directoryPath, '**', '*.{js,css,html}'),
      {
        ignore: config.excludedFilesAndDirs.map((pattern) => path.join(directoryPath, pattern)),
      },
      (err, files) => {
        if (err) reject(err);
        else resolve(files);
      }
    );
  });

  // Clean each file
  for (const filePath of files) {
    if (config.removeComments) await removeComments(filePath, dryRun);
    if (config.removeUnusedVariables) await removeUnusedVariables(filePath, dryRun);
  }

  // Remove unused files
  if (config.deleteUnusedFiles) {
    const unusedFiles = await findUnusedFiles(directoryPath);
    for (const file of unusedFiles) {
      const filePath = path.join(directoryPath, file);
      if (!dryRun) {
        await fs.unlink(filePath);
        console.log(`Deleted unused file: ${filePath}`);
      } else {
        console.log(`Dry run: Would delete unused file: ${filePath}`);
      }
    }
  }

  // Remove unused dependencies
  if (config.removeUnusedDependencies) {
    const unusedDeps = await findUnusedDependencies(directoryPath);
    if (!dryRun) {
      // Logic to remove unused dependencies from package.json
      // For now, log the unused dependencies
      console.log("Unused dependencies identified:", unusedDeps);
      // TODO: Implement removal from package.json
    } else {
      console.log("Dry run: Would remove unused dependencies:", unusedDeps);
    }
  }

  console.log("Cleanup process completed.");
}