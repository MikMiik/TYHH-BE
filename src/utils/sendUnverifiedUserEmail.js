const { generateMailToken } = require("@/services/jwt.service");
const generateClientUrl = require("./generateClientUrl");
const throwError = require("./throwError");
const queue = require("@/utils/queue");

function sendUnverifiedUserEmail(userId, path = "login") {
  try {
    const { token } = generateMailToken(userId);
    const verifyUrl = generateClientUrl(path, { token });
    queue.dispatch("sendVerifyEmailJob", {
      userId,
      token,
      verifyUrl,
    });
  } catch (error) {
    throwError(
      500,
      "Failed to send unverified user email. Please try again later."
    );
  }
}

module.exports = sendUnverifiedUserEmail;
