const livestreamService = require("@/services/livestream.service");

exports.getAll = async (req, res) => {
  const { page = 1, limit = 10, search, courseId, courseOutlineId } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;

  const data = await livestreamService.getAllLivestreamsAdmin({
    page: pageNum,
    limit: limitNum,
    search,
    courseId: courseId ? parseInt(courseId) : undefined,
    courseOutlineId: courseOutlineId ? parseInt(courseOutlineId) : undefined,
  });

  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const livestream = await livestreamService.getLivestreamByIdAdmin(
    req.params.id
  );
  res.success(200, livestream);
};

exports.create = async (req, res) => {
  const livestreamData = req.body;
  const livestream = await livestreamService.createLivestreamAdmin(
    livestreamData
  );
  res.success(201, livestream, "Livestream created successfully");
};

exports.update = async (req, res) => {
  const livestreamData = req.body;
  const livestream = await livestreamService.updateLivestreamAdmin(
    req.params.id,
    livestreamData
  );
  res.success(200, livestream, "Livestream updated successfully");
};

exports.delete = async (req, res) => {
  await livestreamService.deleteLivestreamAdmin(req.params.id);
  res.success(200, null, "Livestream deleted successfully");
};

exports.getAnalytics = async (req, res) => {
  const analytics = await livestreamService.getLivestreamsAnalytics();
  res.success(200, analytics);
};
