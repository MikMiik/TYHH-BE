const { Notification, User } = require("@/models");

const getCurrentUserId = require("@/utils/getCurrentUserId");

class NotificationService {
  // Get current user ID
  get userId() {
    return getCurrentUserId();
  }

  // Get all notifications for students/users
  async getAllNotifications() {
    try {
      const notifications = await Notification.findAll({
        include: [
          {
            model: User,
            as: "teacher",
            attributes: ["id", "name", "avatar"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return notifications;
    } catch (error) {
      console.error("Error getting notifications:", error);
      throw error;
    }
  }

  // Create notification (only for teachers)
  async createNotification({ title, message, teacherId }) {
    try {
      const notification = await Notification.create({
        title,
        message,
        teacherId,
      });

      // Get notification with teacher info
      const createdNotification = await Notification.findByPk(notification.id, {
        include: [
          {
            model: User,
            as: "teacher",
            attributes: ["id", "name", "avatar"],
          },
        ],
      });

      return createdNotification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Get notifications by teacher ID
  async getNotificationsByTeacher(teacherId) {
    try {
      const notifications = await Notification.findAll({
        where: { teacherId },
        include: [
          {
            model: User,
            as: "teacher",
            attributes: ["id", "name", "avatar"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return notifications;
    } catch (error) {
      console.error("Error getting teacher notifications:", error);
      throw error;
    }
  }

  // Delete notification (only by teacher who created it)
  async deleteNotification(notificationId, teacherId) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: notificationId,
          teacherId: teacherId,
        },
      });

      if (!notification) {
        throw new Error(
          "Notification not found or you don't have permission to delete it"
        );
      }

      await notification.destroy();
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
