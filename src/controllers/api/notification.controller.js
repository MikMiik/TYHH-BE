const notificationService = require("@/services/notification.service");

exports.getAll = async (req, res) => {
  const { limit = 10, page = 1, search = "" } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;
  const userId = req.user?.id; // Get current user ID if authenticated

  const data = await notificationService.getAllNotifications({
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
    search,
    userId,
  });
  res.success(200, data);
};

exports.create = async (req, res) => {
  const { title, message, teacherId } = req.body;
  const notification = await notificationService.createNotification({
    title,
    message,
    teacherId,
  });
  res.success(201, notification);
};

exports.getByTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const { limit = 10, page = 1, search = "" } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;

  const data = await notificationService.getNotificationsByTeacher(
    parseInt(teacherId),
    {
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
      search,
    }
  );
  res.success(200, data);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const teacherId = req.user?.id; // Assuming auth middleware sets req.user

  await notificationService.deleteNotification(parseInt(id), teacherId);
  res.success(200, { message: "Notification deleted successfully" });
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id; // Assuming auth middleware sets req.user

  const result = await notificationService.markNotificationAsRead(
    parseInt(id),
    userId
  );
  res.success(200, result);
};

exports.markAllAsRead = async (req, res) => {
  const userId = req.user?.id; // Assuming auth middleware sets req.user

  const result = await notificationService.markAllNotificationsAsRead(userId);
  res.success(200, result);
};
