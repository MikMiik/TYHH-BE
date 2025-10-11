const { Schedule } = require("../models");

exports.getAllSchedules = async () => {
  return await Schedule.findAll({
    attribute: [["id", "url", "target"]],
  });
};

exports.createSchedule = async (scheduleData) => {
  return await Schedule.create(scheduleData);
};

exports.updateSchedule = async (id, scheduleData) => {
  const schedule = await Schedule.findByPk(id);
  if (!schedule) {
    throw new Error("Schedule not found");
  }
  return await schedule.update(scheduleData);
};

exports.deleteSchedule = async (id) => {
  const schedule = await Schedule.findByPk(id);
  if (!schedule) {
    throw new Error("Schedule not found");
  }
  await schedule.destroy();
  return true;
};
