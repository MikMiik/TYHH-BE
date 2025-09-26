const express = require("express");
const router = express.Router();
const topicController = require("@/controllers/api/topic.controller");

router.get("/", topicController.getAll);

module.exports = router;
