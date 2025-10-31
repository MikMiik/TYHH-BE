const express = require("express");
const router = express.Router();

// const productsRouter = require("./products.route");
const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const cityRouter = require("./city.route");
const imagekitRouter = require("./imagekit.route");
const uploadRouter = require("./upload.route");
const socialRouter = require("./social.route");
const topicRouter = require("./topic.route");
const scheduleRouter = require("./schedule.route");
const courseRouter = require("./course.route");
const documentRouter = require("./document.route");
const livestreamRouter = require("./livestream.route");
const courseOutlineRouter = require("./courseOutline.route");
const notificationRouter = require("./notification.route");
const commentRouter = require("./comments.route");
const paymentRouter = require("./payment.route");
const playgroundRouter = require("./playground.route");

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/imagekit", imagekitRouter);
router.use("/upload", uploadRouter);
router.use("/socials", socialRouter);
router.use("/cities", cityRouter);
router.use("/topics", topicRouter);
router.use("/schedules", scheduleRouter);
router.use("/courses", courseRouter);
router.use("/documents", documentRouter);
router.use("/livestreams", livestreamRouter);
router.use("/course-outlines", courseOutlineRouter);
router.use("/notifications", notificationRouter);
router.use("/comments", commentRouter);
router.use("/payments", paymentRouter);
router.use("/playground", playgroundRouter);

module.exports = router;
