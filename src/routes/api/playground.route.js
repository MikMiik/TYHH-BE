const express = require("express");
const router = express.Router();
const PlaygroundController = require("@/controllers/api/playground.controller");
const { requireAuth } = require("@/middlewares/auth");

// Public route - get all elements
router.get("/elements", PlaygroundController.getAllElements);

// Protected routes - require authentication
router.get("/entities", requireAuth, PlaygroundController.getUserEntities);
router.post("/combine", requireAuth, PlaygroundController.combineElements);
router.delete("/entities/:entityId", requireAuth, PlaygroundController.removeUserEntity);

module.exports = router;
