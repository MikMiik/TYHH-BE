const express = require("express");
const adminDocumentController = require("@/controllers/admin/document.controller");
const router = express.Router();

// Admin document management routes (admin bypass applies)
router.get("/", adminDocumentController.getAll);
router.get("/analytics", adminDocumentController.getAnalytics);
router.get("/:id", adminDocumentController.getOne);
router.post("/", adminDocumentController.create);
router.put("/:id", adminDocumentController.update);
router.delete("/:id", adminDocumentController.delete);
router.post("/bulk-delete", adminDocumentController.bulkDelete);

module.exports = router;
