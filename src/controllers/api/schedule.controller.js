const { Schedule } = require("@/models");

exports.getAll = async (req, res) => {
  const schedules = await Schedule.findAll({
    attributes: ["id", "target", "url"],
  });
  res.success(200, schedules);
};
