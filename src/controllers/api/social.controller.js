const { Social } = require("@/models");
const throw404 = require("@/utils/throw404");

exports.getAll = async (req, res) => {
  const socials = await Social.findAll();
  if (!socials) throw404("Socials not found");
  res.success(200, socials);
};
