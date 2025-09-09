const express = require("express");
const router = express.Router();

// const productsRouter = require("./products.route");
const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const cityRouter = require("./city.route");
const imagekitRouter = require("./imagekit.route");
const socialRouter = require("./social.route");
const topicRouter = require("./topic.route");
const scheduleRouter = require("./schedule.route");
const courseRouter = require("./course.route");
const documentRouter = require("./document.route");

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/imagekit", imagekitRouter);
router.use("/socials", socialRouter);
router.use("/cities", cityRouter);
router.use("/topics", topicRouter);
router.use("/schedules", scheduleRouter);
router.use("/courses", courseRouter);
router.use("/documents", documentRouter);

module.exports = router;
