const adminDocumentService = require("@/services/admin/document.service");

exports.getAll = async (req, res) => {
  const { page = 1, limit = 10, search, livestreamId, vip } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;

  // Parse boolean parameter properly
  let vipParam = undefined;
  if (vip === "true") vipParam = true;
  else if (vip === "false") vipParam = false;

  const data = await adminDocumentService.getAllDocuments({
    page: pageNum,
    limit: limitNum,
    search,
    livestreamId: livestreamId ? parseInt(livestreamId) : undefined,
    vip: vipParam,
  });

  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const document = await adminDocumentService.getDocumentById(req.params.id);
  res.success(200, document);
};

exports.create = async (req, res) => {
  const documentData = req.body;
  const document = await adminDocumentService.createDocument(documentData);
  res.success(201, document, "Document created successfully");
};

exports.update = async (req, res) => {
  const documentData = req.body;
  const document = await adminDocumentService.updateDocument(
    req.params.id,
    documentData
  );
  res.success(200, document, "Document updated successfully");
};

exports.delete = async (req, res) => {
  await adminDocumentService.deleteDocument(req.params.id);
  res.success(200, null, "Document deleted successfully");
};

exports.getAnalytics = async (req, res) => {
  const analytics = await adminDocumentService.getDocumentsAnalytics();
  res.success(200, analytics);
};
