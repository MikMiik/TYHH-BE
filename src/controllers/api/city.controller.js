const cityService = require("@/services/city.service");
const throw404 = require("@/utils/throw404");

exports.getCities = async (req, res) => {
  const cities = await cityService.getAllCities();
  if (!cities) throw404("Cities not found");
  res.success(200, cities);
};
