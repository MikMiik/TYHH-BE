const { RefreshToken } = require("@/models");
const auth = require("@/configs/auth");
const { Op } = require("sequelize");
const generateToken = require("@/utils/generateToken");

const generateUniqueToken = async () => {
  let randToken = null;
  do {
    randToken = generateToken();
  } while (
    await RefreshToken.findOne({
      where: {
        token: randToken,
      },
    })
  );
  return randToken;
};

const createRefreshToken = async (userId) => {
  const token = await generateUniqueToken();

  const current = new Date();
  const expiredAt = new Date(
    current.getTime() + auth.REFRESH_TOKEN_EXPIRES_IN * 1000
  );

  return await RefreshToken.create({
    userId,
    token,
    expiredAt,
  });
};

const findValidRefreshToken = async (token) => {
  return await RefreshToken.findOne({
    where: {
      token: token,
      expiredAt: {
        [Op.gte]: Date.now(),
      },
    },
  });
};

const deleteRefreshToken = async (refreshToken) => {
  await RefreshToken.destroy({
    where: {
      token: refreshToken,
    },
  });
};

module.exports = {
  createRefreshToken,
  findValidRefreshToken,
  deleteRefreshToken,
};
