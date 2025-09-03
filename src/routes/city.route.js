const express = require("express");
const router = express.Router();
const cityController = require("../controllers/api/city.controller");

router.get("/cities", cityController.getCities);

module.exports = router;
