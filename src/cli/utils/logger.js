import chalk from "chalk";

// Define log levels
const levels = {
  info: chalk.blue,
  success: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
};

// General log function
function log(message, level = 'info') {
  if (levels[level]) {
    console.log(levels[level](message));
  } else {
    console.log(message);
  }
}

// Info level logging
function info(message) {
  log(message, 'info');
}

// Success level logging
function success(message) {
  log(message, 'success');
}

// Warning level logging
function warn(message) {
  log(message, 'warn');
}

// Error level logging
function error(message) {
  log(message, 'error');
}

export { info, success, warn, error };