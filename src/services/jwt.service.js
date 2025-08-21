const jwt = require("jsonwebtoken");
const mail = require("@/configs/mail");
const auth = require("@/configs/auth");

const generateAccessToken = (userId) => {
  const token = jwt.sign({ userId }, auth.JWT_SECRET, {
    expiresIn: auth.JWT_EXPIRES_IN,
  });

  return {
    accessToken: token,
    tokenType: auth.TOKEN_TYPE,
    expiresIn: auth.JWT_EXPIRES_IN,
  };
};

const generateMailToken = (userId) => {
  const token = jwt.sign({ userId }, mail.MAIL_JWT_SECRET, {
    expiresIn: mail.MAIL_JWT_EXPIRES_IN,
  });

  return {
    token,
    tokenType: mail.MAIL_TOKEN_TYPE,
    expiresIn: mail.MAIL_JWT_EXPIRES_IN,
  };
};

const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, auth.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error(`${err.name} ${err.message}`);
  }
};

const verifyMailToken = (token) => {
  try {
    const decoded = jwt.verify(token, mail.MAIL_JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error(`${err.name} ${err.message}`);
  }
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  verifyMailToken,
  generateMailToken,
};
