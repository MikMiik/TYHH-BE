const adminUserService = require("@/services/admin/user.service");

exports.getAll = async (req, res) => {
  const { page = 1, limit = 10, search, role, status } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;

  const data = await adminUserService.getAllUsers({
    page: pageNum,
    limit: limitNum,
    search,
    role,
    status,
  });

  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const user = await adminUserService.getUserById(req.params.id);
  res.success(200, user);
};

exports.getByUsername = async (req, res) => {
  const user = await adminUserService.getUserByUsername(req.params.username);
  if (!user) {
    return res.error(404, "User not found");
  }
  res.success(200, user);
};

exports.create = async (req, res) => {
  const userData = req.body;
  const user = await adminUserService.createUser(userData);
  res.success(201, user, "User created successfully");
};

exports.update = async (req, res) => {
  const userData = req.body;
  const user = await adminUserService.updateUser(req.params.id, userData);
  res.success(200, user, "User updated successfully");
};

exports.delete = async (req, res) => {
  await adminUserService.deleteUser(req.params.id, req.userId);
  res.success(200, null, "User deleted successfully");
};

exports.toggleStatus = async (req, res) => {
  const { activeKey } = req.body;
  const user = await adminUserService.toggleUserStatus(
    req.params.id,
    activeKey
  );
  res.success(
    200,
    user,
    `User ${activeKey ? "activated" : "deactivated"} successfully`
  );
};

exports.getAnalytics = async (req, res) => {
  const analytics = await adminUserService.getUsersAnalytics();
  res.success(200, analytics);
};
