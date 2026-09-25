// Build-time stand-in for the "debug" logging package, which stdlib uses
// internally. statinfer never enables that logging, so every call does nothing.
module.exports = function createDebug() {
  const log = function () {};
  log.enabled = false;
  return log;
};