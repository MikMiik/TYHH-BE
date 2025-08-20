const { session } = require("@/middlewares/setContext");

function getCurrentUser() {
  return session.get("userId");
}

module.exports = getCurrentUser;
