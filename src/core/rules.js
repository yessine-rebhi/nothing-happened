const cleanupRules = {
  // Match comments with TODO or FIXME, but not comments containing URLs
  comments: /\/\/\s*(TODO|FIXME|Unnecessary).*/g,

  // Match unused code (both commented-out and declared but unused variables/functions)
  unusedCode: /\/\/.*\n/g, // Matches commented-out code

  // Placeholder for detecting empty or temporary files (can be extended further)
  emptyFiles: [],
};

export default cleanupRules;
