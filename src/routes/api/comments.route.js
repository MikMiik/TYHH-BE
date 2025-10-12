const express = require("express");
const router = express.Router();

const commentController = require("@/controllers/api/comment.controller");
const commentValidator = require("@/validators/comment.validator");

// Comments
router.get("/", commentController.getList);
router.post("/:id/like", commentController.likeOne);
router.delete("/:id/unlike", commentController.unlikeOne);
router.get("/:id", commentController.getOne);
router.post("/", commentValidator.content, commentController.create);
router.put("/:id", commentValidator.content, commentController.update);
router.patch("/:id", commentController.update);
router.delete("/:id", commentController.remove);

module.exports = router;
