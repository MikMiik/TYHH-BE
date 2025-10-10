const notificationService = require("@/services/notification.service");

exports.getAll = async (req, res) => {
  const notifications = await notificationService.getAllNotifications();
  res.success(200, notifications);
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
  const notifications = await notificationService.getNotificationsByTeacher(
    parseInt(teacherId)
  );
  res.success(200, notifications);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const teacherId = req.user?.id; // Assuming auth middleware sets req.user

  await notificationService.deleteNotification(parseInt(id), teacherId);
  res.success(200, { message: "Notification deleted successfully" });
};
