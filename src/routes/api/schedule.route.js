const express = require("express");
const scheduleController = require("@/controllers/admin/schedule.controller");
const router = express.Router();
const { requireAdminOrTeacher } = require("@/middlewares/auth");

router.get("/", scheduleController.getAll);
router.post("/", requireAdminOrTeacher, scheduleController.create);
router.put("/:id", requireAdminOrTeacher, scheduleController.update);
router.delete("/:id", requireAdminOrTeacher, scheduleController.delete);

module.exports = router;
