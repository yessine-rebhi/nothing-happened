import chalk from "chalk";
const levels = {
  info: chalk.blue,
  success: chalk.green,
  warn: chalk.yellow,
  error: chalk.red
};
function log(message) {
  let level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
  if (levels[level]) {
    console.log(levels[level](message));
  } else {
    console.log(message);
  }
}
function info(message) {
  log(message, 'info');
}
function success(message) {
  log(message, 'success');
}
function warn(message) {
  log(message, 'warn');
}
function error(message) {
  log(message, 'error');
}
export { info, success, warn, error };