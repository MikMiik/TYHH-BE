const dashboardService = require("@/services/dashboard.service");

exports.getDashboard = async (req, res) => {
  try {
    const dashboardData = await dashboardService.getDashboardData();
    res.success(200, dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.error(500, "Failed to get dashboard data", error.message);
  }
};

exports.getOverview = async (req, res) => {
  try {
    const overview = await dashboardService.getOverviewStats();
    res.success(200, overview);
  } catch (error) {
    console.error("Overview error:", error);
    res.error(500, "Failed to get overview stats", error.message);
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const { period = "week" } = req.query;
    const userAnalytics = await dashboardService.getUserGrowthStats(period);
    res.success(200, userAnalytics);
  } catch (error) {
    console.error("User analytics error:", error);
    res.error(500, "Failed to get user analytics", error.message);
  }
};

exports.getCourseAnalytics = async (req, res) => {
  try {
    const courseAnalytics = await dashboardService.getCourseEnrollmentStats();
    res.success(200, courseAnalytics);
  } catch (error) {
    console.error("Course analytics error:", error);
    res.error(500, "Failed to get course analytics", error.message);
  }
};

exports.getLivestreamAnalytics = async (req, res) => {
  try {
    const livestreamAnalytics = await dashboardService.getPopularContent();
    res.success(200, { livestreams: livestreamAnalytics.livestreams });
  } catch (error) {
    console.error("Livestream analytics error:", error);
    res.error(500, "Failed to get livestream analytics", error.message);
  }
};
exports.getDocumentAnalytics = async (req, res) => {
  try {
    const documentAnalytics = await dashboardService.getPopularContent();
    res.success(200, { documents: documentAnalytics.documents });
  } catch (error) {
    console.error("Document analytics error:", error);
    res.error(500, "Failed to get document analytics", error.message);
  }
};

exports.getGrowthAnalytics = async (req, res) => {
  try {
    const { period = "week" } = req.query;
    const growthAnalytics = await dashboardService.getUserGrowthStats(period);
    res.success(200, growthAnalytics);
  } catch (error) {
    console.error("Growth analytics error:", error);
    res.error(500, "Failed to get growth analytics", error.message);
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    const systemHealth = await dashboardService.getSystemHealth();
    res.success(200, systemHealth);
  } catch (error) {
    console.error("System health error:", error);
    res.error(500, "Failed to get system health", error.message);
  }
};

exports.getRevenueStats = async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const revenueStats = await dashboardService.getRevenueStats(period);
    res.success(200, revenueStats);
  } catch (error) {
    console.error("Revenue stats error:", error);
    res.error(500, "Failed to get revenue stats", error.message);
  }
};
