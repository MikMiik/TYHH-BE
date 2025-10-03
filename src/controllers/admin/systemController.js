const systemService = require("@/services/systemService");

// Site Info Controllers
exports.getSiteInfo = async (req, res) => {
  try {
    const siteInfo = await systemService.getSiteInfo();
    res.success(200, siteInfo);
  } catch (error) {
    console.error("Get site info error:", error);
    res.error(500, "Failed to get site info", error.message);
  }
};

exports.updateSiteInfo = async (req, res) => {
  try {
    const { siteName, companyName, email, taxCode, phone, address } = req.body;

    // Basic validation
    if (!siteName || !companyName) {
      return res.error(400, "Site name and company name are required");
    }

    const siteInfo = await systemService.updateSiteInfo({
      siteName,
      companyName,
      email,
      taxCode,
      phone,
      address,
    });

    res.success(200, siteInfo);
  } catch (error) {
    console.error("Update site info error:", error);
    res.error(500, "Failed to update site info", error.message);
  }
};

// Cities Controllers
exports.getCities = async (req, res) => {
  try {
    const cities = await systemService.getCities();
    res.success(200, cities);
  } catch (error) {
    console.error("Get cities error:", error);
    res.error(500, "Failed to get cities", error.message);
  }
};

exports.addCity = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.error(400, "City name is required");
    }

    const city = await systemService.addCity(name.trim());
    res.success(201, city);
  } catch (error) {
    console.error("Add city error:", error);
    res.error(500, "Failed to add city", error.message);
  }
};

exports.updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.error(400, "City name is required");
    }

    const city = await systemService.updateCity(id, { name: name.trim() });
    res.success(200, city);
  } catch (error) {
    console.error("Update city error:", error);
    res.error(500, "Failed to update city", error.message);
  }
};

exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await systemService.deleteCity(id);
    res.success(200, result);
  } catch (error) {
    console.error("Delete city error:", error);
    res.error(500, "Failed to delete city", error.message);
  }
};

// Schools Controllers
exports.getSchools = async (req, res) => {
  try {
    const schools = await systemService.getSchools();
    res.success(200, schools);
  } catch (error) {
    console.error("Get schools error:", error);
    res.error(500, "Failed to get schools", error.message);
  }
};

exports.addSchool = async (req, res) => {
  try {
    const { name, cityId } = req.body;

    if (!name || !name.trim()) {
      return res.error(400, "School name is required");
    }

    const school = await systemService.addSchool({
      name: name.trim(),
      cityId: cityId || null,
    });

    res.success(201, school);
  } catch (error) {
    console.error("Add school error:", error);
    res.error(500, "Failed to add school", error.message);
  }
};

exports.updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cityId } = req.body;

    if (!name || !name.trim()) {
      return res.error(400, "School name is required");
    }

    const school = await systemService.updateSchool(id, {
      name: name.trim(),
      cityId: cityId || null,
    });

    res.success(200, school);
  } catch (error) {
    console.error("Update school error:", error);
    res.error(500, "Failed to update school", error.message);
  }
};

exports.deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await systemService.deleteSchool(id);
    res.success(200, result);
  } catch (error) {
    console.error("Delete school error:", error);
    res.error(500, "Failed to delete school", error.message);
  }
};

// Notifications Controllers
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const notifications = await systemService.getNotifications({
      page,
      limit,
      type,
    });
    res.success(200, notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.error(500, "Failed to get notifications", error.message);
  }
};

exports.addNotification = async (req, res) => {
  try {
    const { title, content, type } = req.body;

    if (!title || !title.trim()) {
      return res.error(400, "Notification title is required");
    }

    const notification = await systemService.addNotification({
      title: title.trim(),
      content: content || "",
      type: type || "general",
    });

    res.success(201, notification);
  } catch (error) {
    console.error("Add notification error:", error);
    res.error(500, "Failed to add notification", error.message);
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type } = req.body;

    if (!title || !title.trim()) {
      return res.error(400, "Notification title is required");
    }

    const notification = await systemService.updateNotification(id, {
      title: title.trim(),
      content: content || "",
      type: type || "general",
    });

    res.success(200, notification);
  } catch (error) {
    console.error("Update notification error:", error);
    res.error(500, "Failed to update notification", error.message);
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await systemService.deleteNotification(id);
    res.success(200, result);
  } catch (error) {
    console.error("Delete notification error:", error);
    res.error(500, "Failed to delete notification", error.message);
  }
};

// Queue Controllers
exports.getQueue = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const queueData = await systemService.getQueue({
      page,
      limit,
      status,
      type,
    });
    res.success(200, queueData);
  } catch (error) {
    console.error("Get queue error:", error);
    res.error(500, "Failed to get queue", error.message);
  }
};

exports.getQueueStats = async (req, res) => {
  try {
    const stats = await systemService.getQueueStats();
    res.success(200, stats);
  } catch (error) {
    console.error("Get queue stats error:", error);
    res.error(500, "Failed to get queue stats", error.message);
  }
};

exports.retryQueueJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await systemService.retryQueueJob(id);
    res.success(200, job);
  } catch (error) {
    console.error("Retry queue job error:", error);
    res.error(500, "Failed to retry queue job", error.message);
  }
};

exports.deleteQueueJob = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await systemService.deleteQueueJob(id);
    res.success(200, result);
  } catch (error) {
    console.error("Delete queue job error:", error);
    res.error(500, "Failed to delete queue job", error.message);
  }
};
