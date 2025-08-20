const express = require("express");
const router = express.Router();

// const productsRouter = require("./products.route");
const authRouter = require("./auth.route");

// router.use("/products", productsRouter);
router.use("/auth", authRouter);

module.exports = router;
