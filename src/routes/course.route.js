const express = require("express");
const router = express.Router();
const courseController = require("@/controllers/api/course.controller");

router.get("/", courseController.getAll);
router.get("/:slug", courseController.getOne);

module.exports = router;
