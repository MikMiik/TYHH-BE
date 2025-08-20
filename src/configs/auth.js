module.exports = {
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "264fcccfa34b16241f8b176b45fdfde7f907e63d394f10a788f25b242ea9e15a",
  JWT_EXPIRES_IN: parseInt(process.env.JWT_EXPIRES_IN) || 3600,
  REFRESH_TOKEN_EXPIRES_IN:
    parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) || 30 * 24 * 60 * 60,
  TOKEN_TYPE: process.env.TOKEN_TYPE || "Bearer",
};
