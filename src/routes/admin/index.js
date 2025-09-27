const express = require("express");
const checkAuth = require("@/middlewares/checkAuth");
const router = express.Router();

// Import các route modules
const userRouter = require("./user.route");
const courseRouter = require("./course.route");
const livestreamRouter = require("./livestream.route");
const documentRouter = require("./document.route");
const dashboardRouter = require("./dashboard.route");

// Permission-based access control - chỉ admin mới có thể truy cập admin routes
// Temporary: sử dụng role check, sau này có thể chuyển sang permission cụ thể
router.use((req, res, next) => {
  // Check if user has admin role through new role system
  if (req.userRoles && req.userRoles.includes("admin")) {
    return next();
  }

  // Fallback: check legacy role field (for backward compatibility during transition)
  if (req.user?.role === "admin") {
    return next();
  }

  return res.error(403, "Access denied. Admin role required.");
});

// Mount các route modules
router.use("/users", userRouter);
router.use("/courses", courseRouter);
router.use("/livestreams", livestreamRouter);
router.use("/documents", documentRouter);
router.use("/dashboard", dashboardRouter);

module.exports = router;
