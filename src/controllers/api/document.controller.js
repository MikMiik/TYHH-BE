const documentService = require("@/services/document.service");

exports.getAll = async (req, res) => {
  const {
    limit = 10,
    page = 1,
    topic = "",
    vip = false,
    sort = "newest",
  } = req.query;

  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;
  const data = await documentService.getAllDocuments({
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
    vip,
    sort,
    topic,
  });
  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const document = await documentService.getDocumentBySlug(req.params.slug);
  res.success(200, document);
};
