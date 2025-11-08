const { Notification, User, UserNotification } = require("@/models");
const { Op } = require("sequelize");
const getCurrentUserId = require("@/utils/getCurrentUserId");
const pusher = require("@/configs/pusher");

class NotificationService {
  // Get current user ID
  get userId() {
    return getCurrentUserId();
  }

  // Get all notifications for students/users
  async getAllNotifications({ limit, offset, search, userId = null }) {
    try {
      let whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { message: { [Op.like]: `%${search}%` } },
        ];
      }

      const includeArray = [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "avatar"],
        },
      ];

      // Include UserNotification to check read status if userId is provided
      if (userId) {
        includeArray.push({
          model: UserNotification,
          as: "readRecords",
          where: { userId },
          required: false,
          attributes: ["userId", "createdAt"],
        });
      }

      const { count, rows: notifications } = await Notification.findAndCountAll(
        {
          limit,
          offset,
          where: whereClause,
          include: includeArray,
          order: [["createdAt", "DESC"]],
        }
      );

      // Add isRead field based on readRecords
      const notificationsWithReadStatus = notifications.map((notification) => {
        const notificationData = notification.toJSON();
        notificationData.isRead = userId
          ? notificationData.readRecords &&
            notificationData.readRecords.length > 0
          : false;
        // Remove readRecords from response to keep it clean
        delete notificationData.readRecords;
        return notificationData;
      });

      const totalPages = Math.ceil(count / limit);
      return {
        notifications: notificationsWithReadStatus,
        totalPages,
        total: count,
      };
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
      await pusher.trigger(`notifications`, "new-notification", notification);
      return createdNotification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Get notifications by teacher ID
  async getNotificationsByTeacher(teacherId, { limit, offset, search }) {
    try {
      let whereClause = { teacherId };
      if (search) {
        whereClause[Op.and] = [
          { teacherId },
          {
            [Op.or]: [
              { title: { [Op.like]: `%${search}%` } },
              { message: { [Op.like]: `%${search}%` } },
            ],
          },
        ];
      }

      const { count, rows: notifications } = await Notification.findAndCountAll(
        {
          limit,
          offset,
          where: whereClause,
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "avatar"],
            },
          ],
          order: [["createdAt", "DESC"]],
        }
      );

      const totalPages = Math.ceil(count / limit);
      return { notifications, totalPages, total: count };
    } catch (error) {
      console.error("Error getting teacher notifications:", error);
      throw error;
    }
  }

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

  // Mark notification as read
  async markNotificationAsRead(notificationId, userId) {
    try {
      // Check if notification exists
      const notification = await Notification.findByPk(notificationId);
      if (!notification) {
        throw new Error("Notification not found");
      }

      // Check if already marked as read
      const existingRead = await UserNotification.findOne({
        where: {
          userId,
          notificationId,
        },
      });

      if (existingRead) {
        return { message: "Notification already marked as read" };
      }

      // Create new read record
      await UserNotification.create({
        userId,
        notificationId,
      });

      return { message: "Notification marked as read successfully" };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(userId) {
    try {
      // Get all notifications
      const notifications = await Notification.findAll({
        attributes: ["id"],
      });

      if (notifications.length === 0) {
        return { message: "No notifications found" };
      }

      // Get notification IDs that are already marked as read
      const existingReads = await UserNotification.findAll({
        where: {
          userId,
          notificationId: notifications.map((n) => n.id),
        },
        attributes: ["notificationId"],
      });

      const readNotificationIds = existingReads.map(
        (read) => read.notificationId
      );

      // Filter out notifications that are already marked as read
      const unreadNotifications = notifications.filter(
        (notification) => !readNotificationIds.includes(notification.id)
      );

      if (unreadNotifications.length === 0) {
        return { message: "All notifications already marked as read" };
      }

      // Create read records for unread notifications
      const readRecords = unreadNotifications.map((notification) => ({
        userId,
        notificationId: notification.id,
      }));

      await UserNotification.bulkCreate(readRecords);

      return {
        message: `${unreadNotifications.length} notifications marked as read successfully`,
        markedCount: unreadNotifications.length,
      };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
