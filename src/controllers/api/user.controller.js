const userService = require("@/services/user.service");

exports.getProfile = async (req, res) => {
  const user = await userService.getProfile(req.params.id);
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
