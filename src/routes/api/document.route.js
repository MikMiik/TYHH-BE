const express = require("express");
const router = express.Router();
const documentController = require("@/controllers/api/document.controller");

// Public document routes - handled by auth middleware automatically
router.get("/", documentController.getAll);
router.get("/:slug", documentController.getOne);

module.exports = router;
