const express = require("express");
const router = express.Router();
const livestreamController = require("@/controllers/api/livestream.controller");

router.get("/:slug", livestreamController.getOne);

module.exports = router;
