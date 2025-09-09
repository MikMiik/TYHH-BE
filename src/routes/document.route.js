const express = require("express");
const router = express.Router();
const documentController = require("@/controllers/api/document.controller");

router.get("/", documentController.getAll);
router.get("/:slug", documentController.getOne);

module.exports = router;
