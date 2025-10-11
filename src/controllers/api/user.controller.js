const userService = require("@/services/user.service");

exports.getProfile = async (req, res) => {
  const user = await userService.getProfile(req.params.id);
  res.success(200, user);
};

exports.getUserByUsername = async (req, res) => {
  const user = await userService.getUserByUsername(req.params.username);
  if (!user) {
    return res.error(404, "User not found");
  }
  res.success(200, user);
};

exports.getAllStudents = async (req, res) => {
  const users = await userService.getAllStudents();
  res.success(200, users);
};

exports.updateProfile = async (req, res) => {
  const { confirmPassword, oldPassword, ...data } = req.body;
  const user = await userService.update(req.params.id, data);
  res.success(200, user);
};

exports.uploadAvatar = async (req, res) => {
  const user = await userService.uploadAvatar(req.params.id, req.body.avatar);
  res.success(200, user);
};

exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.userId; // Từ middleware checkAuth
    const courses = await userService.getMyCourses(userId);
    res.success(200, courses);
  } catch (error) {
    res.error(400, error.message);
  }
};
