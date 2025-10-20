const express = require("express");
const router = express.Router();
const documentController = require("@/controllers/api/document.controller");
const { requireTeacher } = require("@/middlewares/auth");

// Public document routes - handled by auth middleware automatically
router.get("/", documentController.getAll);
router.get("/:slug", documentController.getOne);
router.post("/", requireTeacher, documentController.create);
router.delete("/:id", requireTeacher, documentController.delete);
// Track document download (public route - optional auth handled by middleware)
router.post("/:slug/download", documentController.incrementDownload);

module.exports = router;
