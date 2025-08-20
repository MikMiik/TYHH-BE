const response = require("@/utils/response.js");

function notFoundHandler(req, res) {
  response.error(res, 404, "Not found resource");
}

module.exports = notFoundHandler;
