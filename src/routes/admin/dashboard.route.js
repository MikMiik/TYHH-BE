const express = require("express");
const adminDashboardController = require("@/controllers/admin/dashboard.controller");
const router = express.Router();

// Dashboard analytics routes (admin bypass applies)
router.get("/", adminDashboardController.getDashboard);
router.get("/overview", adminDashboardController.getOverview);
router.get("/users", adminDashboardController.getUserAnalytics);
router.get("/courses", adminDashboardController.getCourseAnalytics);
router.get("/livestreams", adminDashboardController.getLivestreamAnalytics);
router.get("/documents", adminDashboardController.getDocumentAnalytics);
router.get("/growth", adminDashboardController.getGrowthAnalytics);

module.exports = router;
