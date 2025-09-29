const express = require("express");
const router = express.Router();
const topicController = require("@/controllers/api/topic.controller");

// Public topic routes - handled by auth middleware automatically
router.get("/", topicController.getAll);

module.exports = router;
