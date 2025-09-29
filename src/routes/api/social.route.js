const express = require("express");
const router = express.Router();
const socialController = require("@/controllers/api/social.controller");

// Public social routes - handled by auth middleware automatically
router.get("/", socialController.getAll);

module.exports = router;
