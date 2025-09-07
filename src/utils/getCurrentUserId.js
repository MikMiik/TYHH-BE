const { session } = require("@/middlewares/setContext");

function getCurrentUserId() {
  return session.get("userId");
}

module.exports = getCurrentUserId;
