const livestreamService = require("@/services/livestream.service");
const { User } = require("@/models");

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
  const livestream = await livestreamService.updateLivestream(
    id,
    livestreamData
  );
  res.success(200, livestream);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  await livestreamService.deleteLivestreamAdmin(id);
  res.success(200, { message: "Livestream deleted successfully" });
};

exports.reorder = async (req, res) => {
  const { courseOutlineId, orders } = req.body;
  await livestreamService.reorderLivestreams(courseOutlineId, orders);
  res.success(200, { message: "Livestreams reordered successfully" });
};

exports.trackView = async (req, res) => {
  const { isNewView } = req; // Set by trackLivestreamView middleware

  // Middleware đã xử lý việc track view, chỉ cần trả về thông báo
  try {
    if (isNewView) {
      // If authenticated user, increment their point by 1
      try {
        const userId = req.userId;
        if (userId) {
          await User.increment("point", { by: 1, where: { id: userId } });
          console.log(`➕ Added 1 point to user ${userId} for livestream view`);
        }
      } catch (err) {
        console.error("Error incrementing user point:", err);
        // don't block response on point increment failure
      }

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
  } catch (error) {
    console.error("Error in trackView controller:", error);
    // Still return success to caller for view tracking; it's non-critical
    res.success(200, {
      message: "View tracked (with warnings)",
      tracked: Boolean(isNewView),
    });
  }
};
