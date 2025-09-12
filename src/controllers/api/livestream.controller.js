const livestreamService = require("@/services/livestream.service");

exports.getOne = async (req, res) => {
  const { slug } = req.params;
  const data = await livestreamService.getLivestreamBySlug(slug);
  res.success(200, data);
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
