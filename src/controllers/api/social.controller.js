const { Social } = require("@/models");

exports.getAll = async (req, res) => {
  const socials = await Social.findAll();
  res.success(200, socials);
};
