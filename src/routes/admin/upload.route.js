const express = require("express");
const handleUpload = require("@/middlewares/handleUpload");
const uploadController = require("@/controllers/api/upload.controller");
const ensureAsyncContext = require("@/utils/asyncHooks");
const router = express.Router();

// Upload route using middleware and controller pattern
router.post(
  "/",
  ensureAsyncContext(handleUpload.single("file")),
  uploadController.upload
);

module.exports = router;
