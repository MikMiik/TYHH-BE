const systemService = require("@/services/systemService");

// Roles Controllers
exports.getRoles = async (req, res) => {
  try {
    const roles = await systemService.getRoles();
    res.success(200, roles);
  } catch (error) {
    console.error("Get roles error:", error);
    res.error(500, "Failed to get roles", error.message);
  }
};

// Socials Controllers
exports.getSocials = async (req, res) => {
  try {
    const socials = await systemService.getSocials();
    res.success(200, socials);
  } catch (error) {
    console.error("Get socials error:", error);
    res.error(500, "Failed to get socials", error.message);
  }
};

exports.addSocial = async (req, res) => {
  try {
    const { platform, url } = req.body;

    if (!platform || !platform.trim()) {
      return res.error(400, "Platform is required");
    }
    if (!url || !url.trim()) {
      return res.error(400, "URL is required");
    }

    const social = await systemService.addSocial({
      platform: platform.trim(),
      url: url.trim(),
    });
    res.success(201, social);
  } catch (error) {
    console.error("Add social error:", error);
    res.error(500, "Failed to add social", error.message);
  }
};

exports.updateSocial = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, url } = req.body;

    if (!platform || !platform.trim()) {
      return res.error(400, "Platform is required");
    }
    if (!url || !url.trim()) {
      return res.error(400, "URL is required");
    }

    const social = await systemService.updateSocial(id, {
      platform: platform.trim(),
      url: url.trim(),
    });
    res.success(200, social);
  } catch (error) {
    console.error("Update social error:", error);
    res.error(500, "Failed to update social", error.message);
  }
};

exports.deleteSocial = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await systemService.deleteSocial(id);
    res.success(200, result);
  } catch (error) {
    console.error("Delete social error:", error);
    res.error(500, "Failed to delete social", error.message);
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

// Topics Controllers
exports.getTopics = async (req, res) => {
  try {
    const topics = await systemService.getTopics();
    res.success(200, topics);
  } catch (error) {
    console.error("Get topics error:", error);
    res.error(500, "Failed to get topics", error.message);
  }
};

exports.addTopic = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.error(400, "Topic title is required");
    }

    const topic = await systemService.addTopic({
      title: title.trim(),
    });

    res.success(201, topic);
  } catch (error) {
    console.error("Add topic error:", error);
    res.error(500, "Failed to add topic", error.message);
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.error(400, "Topic title is required");
    }

    const topic = await systemService.updateTopic(id, {
      title: title.trim(),
    });

    res.success(200, topic);
  } catch (error) {
    console.error("Update topic error:", error);
    res.error(500, "Failed to update topic", error.message);
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await systemService.deleteTopic(id);
    res.success(200, result);
  } catch (error) {
    console.error("Delete topic error:", error);
    res.error(500, "Failed to delete topic", error.message);
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
    const { title, message } = req.body;

    if (!title || !title.trim()) {
      return res.error(400, "Notification title is required");
    }

    const notification = await systemService.addNotification({
      title: title.trim(),
      message: message || "",
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
