const express = require("express");
const scheduleController = require("@/controllers/admin/schedule.controller");
const router = express.Router();
const { requireTeacher } = require("@/middlewares/auth");

router.get("/", scheduleController.getAll);
router.post("/", requireTeacher, scheduleController.create);
router.put("/:id", requireTeacher, scheduleController.update);
router.delete("/:id", requireTeacher, scheduleController.delete);

module.exports = router;
