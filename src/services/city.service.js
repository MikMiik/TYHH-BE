const { City } = require("../models");

class CityService {
  async getAllCities() {
    const cities = await City.findAll({
      order: [["name", "ASC"]],
      attributes: ["id", "name"],
    });
    return cities;
  }
}

module.exports = new CityService();
