module.exports = {
  SERVICE: process.env.MAIL_SERVICE || "gmail",
  AUTH_USER: process.env.MAIL_AUTH_USER,
  AUTH_PASS: process.env.MAIL_AUTH_PASS,
  SENDER_FROM: process.env.MAIL_SENDER_FROM,
  MAIL_JWT_SECRET:
    process.env.MAIL_JWT_SECRET ||
    "4c7377a5c39dd2e68b9c9ed4c805c3c7a312c9dfca0e61d9d5d1ee07a0a64416",
  MAIL_JWT_EXPIRES_IN: parseInt(process.env.MAIL_JWT_EXPIRES_IN) || 300,
  MAIL_TOKEN_TYPE: process.env.MAIL_TOKEN_TYPE || "Bearer",
};
