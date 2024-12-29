import path from "path";
import { info, error } from "../cli/utils/logger.js";
import { fileExists, readJsonFile } from "../cli/utils/fileUtils.js";

// Default configuration settings
const DEFAULT_CONFIG = {
  rules: {
    comments: false,
    unusedCode: true,
  },
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
  dryRun: true,
};

export function loadCustomConfig(directoryPath) {
  const configFile = path.join(directoryPath, "cleanup.config.json");

  // Check if the custom configuration file exists
  if (fileExists(configFile)) {
    try {
      const customConfig = readJsonFile(configFile);
      info(`Loaded custom configuration from: ${configFile}`);

      // Deep merge the default config with the custom one, ensuring nested keys are preserved
      return mergeConfigs(DEFAULT_CONFIG, customConfig);
    } catch (err) {
      error(`Error parsing config file: ${configFile}`);
      error(err.message);
      return DEFAULT_CONFIG;
    }
  }

  // If no config file is found, return the default configuration
  info("No custom configuration found. Using default settings.");
  return DEFAULT_CONFIG;
}

function mergeConfigs(defaultConfig, customConfig) {
  const merged = { ...defaultConfig };

  for (const key in customConfig) {
    if (
      typeof customConfig[key] === "object" &&
      !Array.isArray(customConfig[key]) &&
      customConfig[key] !== null
    ) {
      merged[key] = mergeConfigs(defaultConfig[key] || {}, customConfig[key]);
    } else {
      merged[key] = customConfig[key];
    }
  }

  return merged;
}