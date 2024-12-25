import path from "path";
import { info, error } from "../cli/utils/logger.js"; // Logging utilities
import { fileExists, readJsonFile } from "../cli/utils/fileUtils.js";

const DEFAULT_CONFIG = {
  rules: {
    comments: true, // Enable or disable cleaning comments
    unusedCode: true, // Enable or disable cleaning unused code
  },
  excludePatterns: ["**/node_modules/**", "**/dist/**"], // Paths to exclude from cleaning
  dryRun: false, // Default to actual cleanup mode
};

// Function to load a custom configuration file
export function loadCustomConfig(directoryPath) {
  const configFile = path.join(directoryPath, "cleanup.config.json");

  // Check if the configuration file exists
  if (fileExists(configFile)) {
    try {
      const customConfig = readJsonFile(configFile); // Use file utility to read the file
      info(`Loaded custom configuration from ${configFile}`);

      // Merge the default configuration with the custom one, giving precedence to the custom config
      return { ...DEFAULT_CONFIG, ...customConfig };
    } catch (err) {
      error(`Error parsing config file: ${configFile}`);
      error(err.message);
      // Return the default config if there is an error reading the custom config
      return DEFAULT_CONFIG;
    }
  }

  // If no custom config file is found, log and return default config
  info("No custom configuration found. Using default settings.");
  return DEFAULT_CONFIG;
}