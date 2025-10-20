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
  const livestream = await livestreamService.updateLivestream(
    req.params.id,
    livestreamData
  );
  res.success(200, livestream, "Livestream updated successfully");
};

exports.delete = async (req, res) => {
  await livestreamService.deleteLivestreamAdmin(req.params.id);
  res.success(200, null, "Livestream deleted successfully");
};

exports.bulkDelete = async (req, res) => {
  const { ids } = req.body;
  const result = await livestreamService.bulkDeleteLivestreams(ids);
  res.success(200, result, result.message);
};

exports.reorder = async (req, res) => {
  const { courseOutlineId } = req.params;
  const { orders } = req.body;

  console.log("📨 Reorder request received:", {
    courseOutlineId: courseOutlineId,
    courseOutlineIdType: typeof courseOutlineId,
    orders: orders,
    ordersLength: orders?.length,
    body: req.body,
  });

  // Validate input
  if (!courseOutlineId) {
    return res.error(400, null, "Course outline ID is required");
  }

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return res.error(
      400,
      null,
      "Orders array is required and must not be empty"
    );
  }

  // Validate each order item
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    console.log(`📋 Order item ${i}:`, order);

    if (!order.id || typeof order.id !== "number") {
      return res.error(
        400,
        null,
        `Invalid id at position ${i}: must be a number`
      );
    }

    if (typeof order.order !== "number" || order.order < 1) {
      return res.error(
        400,
        null,
        `Invalid order at position ${i}: must be a positive number`
      );
    }
  }

  await livestreamService.reorderLivestreams(parseInt(courseOutlineId), orders);
  res.success(200, null, "Livestreams reordered successfully");
};

exports.getAnalytics = async (req, res) => {
  const analytics = await livestreamService.getLivestreamsAnalytics();
  res.success(200, analytics);
};
