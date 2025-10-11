const express = require("express");
const handleUpload = require("@/middlewares/handleUpload");
const uploadController = require("@/controllers/api/upload.controller");
const router = express.Router();

// Upload route using middleware and controller pattern
router.post("/", handleUpload.single("file"), uploadController.upload);

module.exports = router;
