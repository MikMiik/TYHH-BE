const userService = require("@/services/user.service");

exports.getAll = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;

  const data = await userService.getAllUsersAdmin({
    page: pageNum,
    limit: limitNum,
    search, // Only pass search - frontend handles role/status filtering
  });

  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const user = await userService.getUserByIdAdmin(req.params.id);
  res.success(200, user);
};

exports.getByUsername = async (req, res) => {
  const user = await userService.getUserByUsernameAdmin(req.params.username);
  if (!user) {
    return res.error(404, "User not found");
  }
  res.success(200, user);
};

exports.create = async (req, res) => {
  const userData = req.body;
  const user = await userService.createUserAdmin(userData);
  res.success(201, user, "User created successfully");
};

exports.update = async (req, res) => {
  const userData = req.body;
  const user = await userService.updateUserAdmin(req.params.id, userData);
  res.success(200, user, "User updated successfully");
};

exports.delete = async (req, res) => {
  await userService.deleteUserAdmin(req.params.id, req.userId);
  res.success(200, null, "User deleted successfully");
};

exports.bulkDelete = async (req, res) => {
  const { ids } = req.body;
  const result = await userService.bulkDeleteUsersAdmin(ids, req.userId);
  res.success(200, result, result.message);
};

exports.toggleStatus = async (req, res) => {
  const { activeKey } = req.body;
  const user = await userService.toggleUserStatus(req.params.id, activeKey, {
    isAdmin: true,
  });
  res.success(
    200,
    user,
    `User ${activeKey ? "activated" : "deactivated"} successfully`
  );
};

exports.getAnalytics = async (req, res) => {
  const analytics = await userService.getUsersAnalytics();
  res.success(200, analytics);
};

exports.setKey = async (req, res) => {
  const { key } = req.body;
  const user = await userService.setUserKey(req.params.id, key);
  res.success(200, user, "User key set successfully");
};

exports.sendVerificationEmail = async (req, res) => {
  const result = await userService.sendUserVerificationEmail(req.params.id);
  res.success(200, result, "Verification email sent successfully");
};
