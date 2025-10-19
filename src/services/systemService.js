const { City, Social, Topic, Notification, Queue, User, Role } = require("../models");
const { createTopic } = require("./topic.service");

class SystemService {
  // Roles methods
  async getRoles() {
    try {
      const roles = await Role.findAll({
        where: { isActive: true },
        attributes: ["id", "name", "displayName", "isActive", "createdAt", "updatedAt"],
        order: [["name", "ASC"]],
      });
      return roles;
    } catch (error) {
      console.error("Error getting roles:", error);
      throw new Error("Failed to get roles");
    }
  }

  // Socials methods
  async getSocials() {
    try {
      const socials = await Social.findAll({
        attributes: ["id", "platform", "url", "createdAt", "updatedAt"],
        order: [["platform", "ASC"]],
      });
      return socials;
    } catch (error) {
      console.error("Error getting socials:", error);
      throw new Error("Failed to get socials");
    }
  }

  async addSocial(data) {
    try {
      const { platform, url } = data;
      const social = await Social.create({ platform, url });
      return social;
    } catch (error) {
      console.error("Error adding social:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Social platform already exists");
      }
      throw new Error("Failed to add social");
    }
  }

  async updateSocial(id, data) {
    try {
      const social = await Social.findByPk(id);
      if (!social) {
        throw new Error("Social not found");
      }

      await social.update(data);
      return social;
    } catch (error) {
      console.error("Error updating social:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Social platform already exists");
      }
      throw new Error("Failed to update social");
    }
  }

  async deleteSocial(id) {
    try {
      const social = await Social.findByPk(id);
      if (!social) {
        throw new Error("Social not found");
      }

      await social.destroy();
      return { message: "Social deleted successfully" };
    } catch (error) {
      console.error("Error deleting social:", error);
      throw new Error("Failed to delete social");
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

  // Topics methods
  async getTopics() {
    try {
      const topics = await Topic.findAll({
        attributes: ["id", "title", "slug", "createdAt", "updatedAt"],
        order: [["title", "ASC"]],
      });
      return topics;
    } catch (error) {
      console.error("Error getting topics:", error);
      throw new Error("Failed to get topics");
    }
  }

  async addTopic(data) {
    const topic = await createTopic(data);
    return topic;
  }

  async updateTopic(id, data) {
    try {
      const topic = await Topic.findByPk(id);
      if (!topic) {
        throw new Error("Topic not found");
      }

      await topic.update(data);
      return topic;
    } catch (error) {
      console.error("Error updating topic:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Topic title already exists");
      }
      throw new Error("Failed to update topic");
    }
  }

  async deleteTopic(id) {
    try {
      const topic = await Topic.findByPk(id);
      if (!topic) {
        throw new Error("Topic not found");
      }

      await topic.destroy();
      return { message: "Topic deleted successfully" };
    } catch (error) {
      console.error("Error deleting topic:", error);
      throw new Error("Failed to delete topic");
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
          "message",
          "teacherId",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: User,
            as: "teacher",
            attributes: ["id", "name"],
          },
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
      const { title, message } = data;
      const notification = await Notification.create({
        title,
        message,
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
