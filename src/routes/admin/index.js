const express = require("express");
const { requireAdmin } = require("@/middlewares/auth");
const router = express.Router();

// Import các route modules
const userRouter = require("./user.route");
const courseRouter = require("./course.route");
const livestreamRouter = require("./livestream.route");
const documentRouter = require("./document.route");
const dashboardRouter = require("./dashboard.route");

// Require admin access for all admin routes
router.use(requireAdmin);

// Mount các route modules
router.use("/users", userRouter);
router.use("/courses", courseRouter);
router.use("/livestreams", livestreamRouter);
router.use("/documents", documentRouter);
router.use("/dashboard", dashboardRouter);

module.exports = router;
