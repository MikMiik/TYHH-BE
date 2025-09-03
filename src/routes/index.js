const express = require("express");
const router = express.Router();

// const productsRouter = require("./products.route");
const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const cityRouter = require("./city.route");
const imagekitRouter = require("./imagekit.route");

// router.use("/products", productsRouter);
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/imagekit", imagekitRouter);
router.use("/", cityRouter);

module.exports = router;
