const userService = require("@/services/user.service");
const throw404 = require("@/utils/throw404");

exports.getProfile = async (req, res) => {
  const user = await userService.getProfile(req.params.id);
  if (!user) throw404("User not found");
  res.success(200, user);
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
