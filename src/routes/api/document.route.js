const express = require("express");
const router = express.Router();
const documentController = require("@/controllers/api/document.controller");
const { requireAdminOrTeacher } = require("@/middlewares/auth");

// Public document routes - handled by auth middleware automatically
router.get("/", documentController.getAll);
router.get("/:slug", documentController.getOne);
router.post("/", requireAdminOrTeacher, documentController.create);
router.delete("/:id", requireAdminOrTeacher, documentController.delete);

module.exports = router;
