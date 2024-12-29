import _defineProperty from "@babel/runtime/helpers/defineProperty";
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
import path from "path";
import { info, error } from "../cli/utils/logger.js";
import { fileExists, readJsonFile } from "../cli/utils/fileUtils.js";
const DEFAULT_CONFIG = {
  rules: {
    comments: false,
    unusedCode: true
  },
  excludePatterns: ["node_modules", ".git", ".github", "package-lock.json", "yarn.lock", ".env", ".env.example", ".gitignore", "README.md", "LICENSE", "cleanup.config.json", ".npmignore"],
  dryRun: true
};
export function loadCustomConfig(directoryPath) {
  const configFile = path.join(directoryPath, "cleanup.config.json");
  if (fileExists(configFile)) {
    try {
      const customConfig = readJsonFile(configFile);
      info("Loaded custom configuration from: ".concat(configFile));
      return mergeConfigs(DEFAULT_CONFIG, customConfig);
    } catch (err) {
      error("Error parsing config file: ".concat(configFile));
      error(err.message);
      return DEFAULT_CONFIG;
    }
  }
  info("No custom configuration found. Using default settings.");
  return DEFAULT_CONFIG;
}
function mergeConfigs(defaultConfig, customConfig) {
  const merged = _objectSpread({}, defaultConfig);
  for (const key in customConfig) {
    if (typeof customConfig[key] === "object" && !Array.isArray(customConfig[key]) && customConfig[key] !== null) {
      merged[key] = mergeConfigs(defaultConfig[key] || {}, customConfig[key]);
    } else {
      merged[key] = customConfig[key];
    }
  }
  return merged;
}