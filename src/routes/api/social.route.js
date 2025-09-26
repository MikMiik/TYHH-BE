const express = require("express");
const router = express.Router();
const socialController = require("@/controllers/api/social.controller");

router.get("/", socialController.getAll);

module.exports = router;
