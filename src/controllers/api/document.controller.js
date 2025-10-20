const documentService = require("@/services/document.service");

exports.getAll = async (req, res) => {
  const {
    limit = 10,
    page = 1,
    topic = "",
    vip = false,
    sort = "newest",
    search = "",
  } = req.query;

  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;
  const data = await documentService.getAllDocuments({
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
    vip,
    sort,
    topic,
    search,
  });
  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const document = await documentService.getDocumentBySlug(req.params.slug);
  res.success(200, document);
};

exports.create = async (req, res) => {
  const documentData = req.body;
  const document = await documentService.createDocument(documentData);
  res.success(201, document, "Document created successfully");
};

exports.delete = async (req, res) => {
  await documentService.deleteDocument(req.params.id);
  res.success(200, null, "Document deleted successfully");
};

// Increment download count for a document (by slug or id)
exports.incrementDownload = async (req, res) => {
  try {
    const identifier = req.params.slug || req.params.id;
    // Resolve to document to ensure it exists
    const document = await documentService.getDocumentByIdOrSlug(identifier);
    if (!document) return res.error(404, "Document not found");

    await documentService.incrementDownloadCount(document.id);
    res.success(200, { message: "Download counted" });
  } catch (error) {
    console.error("Error incrementing download count:", error);
    res.error(400, error.message || "Failed to increment download count");
  }
};
