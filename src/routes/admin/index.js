const express = require("express");
const router = express.Router();
const { auth, requireAdmin } = require("@/middlewares/auth");

// Import các route modules
const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const courseRouter = require("./course.route");
const courseOutlineRouter = require("./courseOutline.route");
const topicRouter = require("./topic.route");
const livestreamRouter = require("./livestream.route");
const documentRouter = require("./document.route");
const dashboardRouter = require("./dashboard.route");
const imagekitRouter = require("./imagekit.route");

// Mount auth routes first (auth.route tự handle middleware cho từng endpoint)
router.use("/auth", authRouter);

// Apply auth + requireAdmin middleware for all other routes
router.use(auth, requireAdmin);

// Mount protected admin route modules
router.use("/users", userRouter);
router.use("/courses", courseRouter);
router.use("/course-outlines", courseOutlineRouter);
router.use("/topics", topicRouter);
router.use("/livestreams", livestreamRouter);
router.use("/documents", documentRouter);
router.use("/dashboard", dashboardRouter);
router.use("/imagekit", imagekitRouter);

module.exports = router;
