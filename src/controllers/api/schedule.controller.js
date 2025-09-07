const { Schedule } = require("@/models");
const throw404 = require("@/utils/throw404");

exports.getAll = async (req, res) => {
  const schedules = await Schedule.findAll({
    attributes: ["id", "target", "url"],
  });
  if (!schedules) throw404("Schedules not found");
  res.success(200, schedules);
};
