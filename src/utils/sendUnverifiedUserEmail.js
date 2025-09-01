const { generateMailToken } = require("@/services/jwt.service");
const generateClientUrl = require("./generateClientUrl");
const throwError = require("./throwError");
const queue = require("@/utils/queue");

function sendUnverifiedUserEmail(userId, path = "login", transaction = null) {
  return (async () => {
    try {
      const { token } = generateMailToken(userId);
      const verifyUrl = generateClientUrl(path, { token });
      await queue.dispatch(
        "sendVerifyEmailJob",
        {
          userId,
          token,
          verifyUrl,
        },
        transaction
      );
    } catch (error) {
      throwError(
        500,
        "Failed to send unverified user email. Please try again later."
      );
    }
  })();
}

module.exports = sendUnverifiedUserEmail;
