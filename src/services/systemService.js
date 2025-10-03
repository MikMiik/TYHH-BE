const { SiteInfo, City, School, Notification, Queue } = require("../models");
const { Op } = require("sequelize");

class SystemService {
  // Site Info methods
  async getSiteInfo() {
    try {
      // Get the first (and should be only) site info record
      const siteInfo = await SiteInfo.findOne({
        attributes: [
          "id",
          "siteName",
          "companyName",
          "email",
          "taxCode",
          "phone",
          "address",
          "createdAt",
          "updatedAt",
        ],
      });

      // If no site info exists, return default structure
      if (!siteInfo) {
        return {
          id: null,
          siteName: "",
          companyName: "",
          email: "",
          taxCode: "",
          phone: "",
          address: "",
          createdAt: null,
          updatedAt: null,
        };
      }

      return siteInfo;
    } catch (error) {
      console.error("Error getting site info:", error);
      throw new Error("Failed to get site info");
    }
  }

  async updateSiteInfo(data) {
    try {
      const { siteName, companyName, email, taxCode, phone, address } = data;

      // Check if site info exists
      let siteInfo = await SiteInfo.findOne();

      if (siteInfo) {
        // Update existing record
        await siteInfo.update({
          siteName,
          companyName,
          email,
          taxCode,
          phone,
          address,
        });
      } else {
        // Create new record
        siteInfo = await SiteInfo.create({
          siteName,
          companyName,
          email,
          taxCode,
          phone,
          address,
        });
      }

      return siteInfo;
    } catch (error) {
      console.error("Error updating site info:", error);
      throw new Error("Failed to update site info");
    }
  }

  // Cities methods
  async getCities() {
    try {
      const cities = await City.findAll({
        attributes: ["id", "name", "createdAt", "updatedAt"],
        order: [["name", "ASC"]],
      });
      return cities;
    } catch (error) {
      console.error("Error getting cities:", error);
      throw new Error("Failed to get cities");
    }
  }

  async addCity(name) {
    try {
      const city = await City.create({ name });
      return city;
    } catch (error) {
      console.error("Error adding city:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("City name already exists");
      }
      throw new Error("Failed to add city");
    }
  }

  async updateCity(id, data) {
    try {
      const city = await City.findByPk(id);
      if (!city) {
        throw new Error("City not found");
      }

      await city.update(data);
      return city;
    } catch (error) {
      console.error("Error updating city:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("City name already exists");
      }
      throw new Error("Failed to update city");
    }
  }

  async deleteCity(id) {
    try {
      const city = await City.findByPk(id);
      if (!city) {
        throw new Error("City not found");
      }

      await city.destroy();
      return { message: "City deleted successfully" };
    } catch (error) {
      console.error("Error deleting city:", error);
      throw new Error("Failed to delete city");
    }
  }

  // Schools methods
  async getSchools() {
    try {
      const schools = await School.findAll({
        attributes: ["id", "name", "cityId", "createdAt", "updatedAt"],
        include: [
          {
            model: City,
            as: "city", // Make sure this alias matches your model association
            attributes: ["id", "name"],
            required: false,
          },
        ],
        order: [["name", "ASC"]],
      });
      return schools;
    } catch (error) {
      console.error("Error getting schools:", error);
      throw new Error("Failed to get schools");
    }
  }

  async addSchool(data) {
    try {
      const { name, cityId } = data;
      const school = await School.create({ name, cityId });
      return school;
    } catch (error) {
      console.error("Error adding school:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("School name already exists");
      }
      throw new Error("Failed to add school");
    }
  }

  async updateSchool(id, data) {
    try {
      const school = await School.findByPk(id);
      if (!school) {
        throw new Error("School not found");
      }

      await school.update(data);
      return school;
    } catch (error) {
      console.error("Error updating school:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("School name already exists");
      }
      throw new Error("Failed to update school");
    }
  }

  async deleteSchool(id) {
    try {
      const school = await School.findByPk(id);
      if (!school) {
        throw new Error("School not found");
      }

      await school.destroy();
      return { message: "School deleted successfully" };
    } catch (error) {
      console.error("Error deleting school:", error);
      throw new Error("Failed to delete school");
    }
  }

  // Notifications methods
  async getNotifications(options = {}) {
    try {
      const { page = 1, limit = 10, type } = options;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (type) {
        whereClause.type = type;
      }

      const { count, rows } = await Notification.findAndCountAll({
        where: whereClause,
        attributes: [
          "id",
          "title",
          "content",
          "type",
          "createdAt",
          "updatedAt",
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        notifications: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      console.error("Error getting notifications:", error);
      throw new Error("Failed to get notifications");
    }
  }

  async addNotification(data) {
    try {
      const { title, content, type } = data;
      const notification = await Notification.create({
        title,
        content,
        type,
      });
      return notification;
    } catch (error) {
      console.error("Error adding notification:", error);
      throw new Error("Failed to add notification");
    }
  }

  async updateNotification(id, data) {
    try {
      const notification = await Notification.findByPk(id);
      if (!notification) {
        throw new Error("Notification not found");
      }

      await notification.update(data);
      return notification;
    } catch (error) {
      console.error("Error updating notification:", error);
      throw new Error("Failed to update notification");
    }
  }

  async deleteNotification(id) {
    try {
      const notification = await Notification.findByPk(id);
      if (!notification) {
        throw new Error("Notification not found");
      }

      await notification.destroy();
      return { message: "Notification deleted successfully" };
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw new Error("Failed to delete notification");
    }
  }

  // Queue methods
  async getQueue(options = {}) {
    try {
      const { page = 1, limit = 20, status, type } = options;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) {
        whereClause.status = status;
      }
      if (type) {
        whereClause.type = type;
      }

      const { count, rows } = await Queue.findAndCountAll({
        where: whereClause,
        attributes: [
          "id",
          "status",
          "type",
          "payload",
          "maxRetries",
          "retriesCount",
          "createdAt",
          "updatedAt",
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        jobs: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      console.error("Error getting queue:", error);
      throw new Error("Failed to get queue");
    }
  }

  async retryQueueJob(id) {
    try {
      const job = await Queue.findByPk(id);
      if (!job) {
        throw new Error("Queue job not found");
      }

      if (job.retriesCount >= job.maxRetries) {
        throw new Error("Maximum retries exceeded");
      }

      await job.update({
        status: "pending",
        retriesCount: job.retriesCount + 1,
      });

      return job;
    } catch (error) {
      console.error("Error retrying queue job:", error);
      throw new Error("Failed to retry queue job");
    }
  }

  async deleteQueueJob(id) {
    try {
      const job = await Queue.findByPk(id);
      if (!job) {
        throw new Error("Queue job not found");
      }

      await job.destroy();
      return { message: "Queue job deleted successfully" };
    } catch (error) {
      console.error("Error deleting queue job:", error);
      throw new Error("Failed to delete queue job");
    }
  }

  async getQueueStats() {
    try {
      const stats = await Queue.findAll({
        attributes: [
          "status",
          [require("sequelize").fn("COUNT", "*"), "count"],
        ],
        group: ["status"],
        raw: true,
      });

      const formattedStats = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
      };

      stats.forEach((stat) => {
        formattedStats[stat.status] = parseInt(stat.count);
      });

      return formattedStats;
    } catch (error) {
      console.error("Error getting queue stats:", error);
      throw new Error("Failed to get queue stats");
    }
  }
}

module.exports = new SystemService();
