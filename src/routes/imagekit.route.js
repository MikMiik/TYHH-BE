const express = require("express");
const router = express.Router();
const imageController = require("@/controllers/api/imagekit.controller");

router.get("/auth", imageController.getAuth);

module.exports = router;
