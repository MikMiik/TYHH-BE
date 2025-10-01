const express = require("express");
const topicController = require("@/controllers/admin/topic.controller");
const topicValidator = require("@/validators/admin/topic.validator");
const router = express.Router();

// Admin topic management routes
router.get("/", topicController.getAll);
router.get("/analytics", topicController.getAnalytics);
router.get("/:id", topicController.getOne);
router.post("/", topicValidator.create, topicController.create);
router.put("/:id", topicValidator.update, topicController.update);
router.delete("/:id", topicController.delete);

module.exports = router;
