const cityService = require("@/services/city.service");

exports.getCities = async (req, res) => {
  const cities = await cityService.getAllCities();
  res.success(200, cities);
};
