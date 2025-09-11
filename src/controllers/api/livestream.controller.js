const livestreamService = require("@/services/livestream.service");

exports.getOne = async (req, res) => {
  const { slug } = req.params;
  const data = await livestreamService.getLivestreamBySlug(slug);
  res.success(200, data);
};
