const documentService = require("@/services/document.service");

exports.getAll = async (req, res) => {
  const { page = 1, limit = 10, search, livestreamId, vip } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;

  // Parse boolean parameter properly
  let vipParam = undefined;
  if (vip === "true") vipParam = true;
  else if (vip === "false") vipParam = false;

  const data = await documentService.getAllDocumentsAdmin({
    page: pageNum,
    limit: limitNum,
    search,
    livestreamId: livestreamId ? parseInt(livestreamId) : undefined,
    vip: vipParam,
  });

  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const document = await documentService.getDocumentByIdOrSlug(req.params.id);
  res.success(200, document);
};

exports.create = async (req, res) => {
  const documentData = req.body;
  const document = await documentService.createDocument(documentData);
  res.success(201, document, "Document created successfully");
};

exports.update = async (req, res) => {
  const documentData = req.body;
  const document = await documentService.updateDocument(
    req.params.id,
    documentData
  );
  res.success(200, document, "Document updated successfully");
};

exports.delete = async (req, res) => {
  await documentService.deleteDocument(req.params.id);
  res.success(200, null, "Document deleted successfully");
};

exports.bulkDelete = async (req, res) => {
  const { ids } = req.body;
  const result = await documentService.bulkDeleteDocuments(ids);
  res.success(200, result, result.message);
};

exports.getAnalytics = async (req, res) => {
  const analytics = await documentService.getDocumentsAnalytics();
  res.success(200, analytics);
};
