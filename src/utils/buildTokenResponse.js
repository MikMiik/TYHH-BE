const { generateAccessToken } = require("@/services/jwt.service");
const { createRefreshToken } = require("@/services/refreshToken.service");

const buildTokenResponse = async ({
  userId,
  rememberMe = null,
  hasRefreshToken = false,
}) => {
  const tokenData = generateAccessToken(userId);
  const result = { ...tokenData };

  if (rememberMe || hasRefreshToken) {
    const refreshToken = await createRefreshToken(userId);
    result.refreshToken = refreshToken.token;
  }
  return result;
};

module.exports = buildTokenResponse;
