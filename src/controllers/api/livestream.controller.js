const livestreamService = require("@/services/livestream.service");

exports.getOne = async (req, res) => {
  const { slug } = req.params;
  const data = await livestreamService.getLivestreamBySlug(slug);
  res.success(200, data);
};

exports.create = async (req, res) => {
  const livestreamData = req.body;
  const livestream = await livestreamService.createLivestreamAdmin(
    livestreamData
  );
  res.success(201, livestream);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const livestreamData = req.body;
  const livestream = await livestreamService.updateLivestreamAdmin(
    id,
    livestreamData
  );
  res.success(200, livestream);
};

exports.trackView = async (req, res) => {
  const { isNewView } = req; // Set by trackLivestreamView middleware

  // Middleware đã xử lý việc track view, chỉ cần trả về thông báo
  if (isNewView) {
    res.success(200, {
      message: "View tracked successfully",
      tracked: true,
    });
  } else {
    res.success(200, {
      message: "View already tracked",
      tracked: false,
    });
  }
};
