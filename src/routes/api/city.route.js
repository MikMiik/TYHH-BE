const express = require("express");
const router = express.Router();
const cityController = require("../../controllers/api/city.controller");

// Public city routes - handled automatically by auth middleware
router.get("/", cityController.getCities);

module.exports = router;
