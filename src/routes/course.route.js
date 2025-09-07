const express = require("express");
const router = express.Router();
const courseController = require("@/controllers/api/course.controller");

router.get("/:id", courseController.getOne);

module.exports = router;
