const cleanupRules = {
  comments: /\/\/\s*(TODO|FIXME).*/g, // Matches comments with TODO or FIXME
  unusedCode: /\/\/.*\n/, // Matches commented-out code
  emptyFiles: [], // Placeholder for identifying empty or temporary files
};

export default cleanupRules;