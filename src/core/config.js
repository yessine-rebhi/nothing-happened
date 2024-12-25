import path from "path";
import { info, error } from "../cli/utils/logger.js";
import { fileExists, readJsonFile } from "../cli/utils/fileUtils.js";

const DEFAULT_CONFIG = {
  rules: {
    comments: true,
    unusedCode: true,
  },
  excludePatterns: ["**/node_modules/**", "**/dist/**"],
  dryRun: false,
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
      return DEFAULT_CONFIG;
    }
  }

  info("No custom configuration found. Using default settings.");
  return DEFAULT_CONFIG;
}