const adminLivestreamService = require("@/services/admin/livestream.service");

exports.getAll = async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;

  const data = await adminLivestreamService.getAllLivestreams({
    page: pageNum,
    limit: limitNum,
    search,
    status,
  });

  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const livestream = await adminLivestreamService.getLivestreamById(
    req.params.id
  );
  res.success(200, livestream);
};

exports.create = async (req, res) => {
  const livestreamData = req.body;
  const livestream = await adminLivestreamService.createLivestream(
    livestreamData
  );
  res.success(201, livestream, "Livestream created successfully");
};

exports.update = async (req, res) => {
  const livestreamData = req.body;
  const livestream = await adminLivestreamService.updateLivestream(
    req.params.id,
    livestreamData
  );
  res.success(200, livestream, "Livestream updated successfully");
};

exports.delete = async (req, res) => {
  await adminLivestreamService.deleteLivestream(req.params.id);
  res.success(200, null, "Livestream deleted successfully");
};

exports.getAnalytics = async (req, res) => {
  const analytics = await adminLivestreamService.getLivestreamsAnalytics();
  res.success(200, analytics);
};
