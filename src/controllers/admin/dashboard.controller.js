const adminDashboardService = require("@/services/admin/dashboard.service");

exports.getDashboard = async (req, res) => {
  try {
    const dashboardData = await adminDashboardService.getDashboardData();
    res.success(200, dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.error(500, "Failed to get dashboard data", error.message);
  }
};

exports.getOverview = async (req, res) => {
  try {
    const overview = await adminDashboardService.getOverviewStats();
    res.success(200, overview);
  } catch (error) {
    console.error("Overview error:", error);
    res.error(500, "Failed to get overview stats", error.message);
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const userAnalytics = await adminDashboardService.getUserAnalytics();
    res.success(200, userAnalytics);
  } catch (error) {
    console.error("User analytics error:", error);
    res.error(500, "Failed to get user analytics", error.message);
  }
};

exports.getCourseAnalytics = async (req, res) => {
  try {
    const courseAnalytics = await adminDashboardService.getCourseAnalytics();
    res.success(200, courseAnalytics);
  } catch (error) {
    console.error("Course analytics error:", error);
    res.error(500, "Failed to get course analytics", error.message);
  }
};

exports.getLivestreamAnalytics = async (req, res) => {
  try {
    const livestreamAnalytics =
      await adminDashboardService.getLivestreamAnalytics();
    res.success(200, livestreamAnalytics);
  } catch (error) {
    console.error("Livestream analytics error:", error);
    res.error(500, "Failed to get livestream analytics", error.message);
  }
};

exports.getDocumentAnalytics = async (req, res) => {
  try {
    const documentAnalytics =
      await adminDashboardService.getDocumentAnalytics();
    res.success(200, documentAnalytics);
  } catch (error) {
    console.error("Document analytics error:", error);
    res.error(500, "Failed to get document analytics", error.message);
  }
};

exports.getGrowthAnalytics = async (req, res) => {
  try {
    const growthAnalytics = await adminDashboardService.getGrowthAnalytics();
    res.success(200, growthAnalytics);
  } catch (error) {
    console.error("Growth analytics error:", error);
    res.error(500, "Failed to get growth analytics", error.message);
  }
};
