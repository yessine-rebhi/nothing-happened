const cleanupRules = {
  comments: /\/\/\s*(TODO|FIXME|Unnecessary).*/g,
  unusedCode: /\/\/.*\n/g,
  emptyFiles: []
};
export default cleanupRules;