const cleanupRules = {
  comments: /^\/\/\s*(TODO|FIXME|Unnecessary).*(\n|$)/gm,
  unusedCode: /^\/\/.*(\n|$)/gm,
  emptyFiles: []
};
export default cleanupRules;