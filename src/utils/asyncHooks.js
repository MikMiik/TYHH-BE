const { AsyncResource } = require("node:async_hooks");
function ensureAsyncContext(middleware) {
  return (req, res, next) => middleware(req, res, AsyncResource.bind(next));
}

module.exports = ensureAsyncContext;
