const express = require("express");
const scheduleController = require("@/controllers/admin/schedule.controller");
const router = express.Router();

router.get("/", scheduleController.getAll);
router.post("/", scheduleController.create);
router.put("/:id", scheduleController.update);
router.delete("/:id", scheduleController.delete);

module.exports = router;
