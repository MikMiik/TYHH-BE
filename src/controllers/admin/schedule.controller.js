const scheduleService = require("@/services/schedule.service");

exports.getAll = async (req, res) => {
  const schedules = await scheduleService.getAllSchedules();
  res.success(200, schedules);
};

exports.create = async (req, res) => {
  const scheduleData = req.body;
  const schedule = await scheduleService.createSchedule(scheduleData);
  res.success(201, schedule, "Schedule created successfully");
};

exports.update = async (req, res) => {
  const scheduleData = req.body;
  const schedule = await scheduleService.updateSchedule(
    req.params.id,
    scheduleData
  );
  res.success(200, schedule, "Schedule updated successfully");
};

exports.delete = async (req, res) => {
  await scheduleService.deleteSchedule(req.params.id);
  res.success(200, null, "Schedule deleted successfully");
};
