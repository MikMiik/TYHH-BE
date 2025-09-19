const { User } = require("@/models");
const { hashPassword } = require("@/utils/bcrytp");
const { Op } = require("sequelize");

class AdminUserService {
  async getAllUsers({ page, limit, search, role, status }) {
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (role) {
      whereConditions.role = role;
    }

    if (status) {
      if (status === "active") {
        whereConditions.activeKey = true;
      } else if (status === "inactive") {
        whereConditions.activeKey = false;
      }
    }

    const { count: total, rows: items } = await User.findAndCountAll({
      where: whereConditions,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password", "key"] },
    });

    return {
      items,
      pagination: {
        currentPage: page,
        perPage: limit,
        total,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password", "key"] },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async getUserByUsername(username) {
    const user = await User.findOne({
      where: { username },
      attributes: [
        "id",
        "email",
        "name",
        "username",
        "avatar",
        "role",
        "activeKey",
        "verifiedAt",
        "facebook",
        "phone",
        "yearOfBirth",
        "city",
        "school",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async createUser(userData) {
    const { name, email, username, password, role = "user" } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new Error("User with this email or username already exists");
    }

    const user = await User.create({
      name,
      email,
      username,
      password, // Will be hashed by model hook
      role,
      activeKey: true,
    });

    // Return user without sensitive data
    const { password: _, key: __, ...userWithoutSensitiveData } = user.toJSON();
    return userWithoutSensitiveData;
  }

  async updateUser(id, userData) {
    const { password, ...updateData } = userData;

    // Hash password if provided
    if (password && password.trim() !== "") {
      updateData.password = await hashPassword(password);
    }

    const [updatedRowsCount] = await User.update(updateData, {
      where: { id },
    });

    if (updatedRowsCount === 0) {
      throw new Error("User not found");
    }

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password", "key"] },
    });

    return updatedUser;
  }

  async deleteUser(id, currentUserId) {
    // Prevent admin from deleting themselves
    if (currentUserId && parseInt(currentUserId) === parseInt(id)) {
      throw new Error("Cannot delete your own account");
    }

    const deletedRowsCount = await User.destroy({
      where: { id },
    });

    if (deletedRowsCount === 0) {
      throw new Error("User not found");
    }

    return true;
  }

  async toggleUserStatus(id, activeKey) {
    const [updatedRowsCount] = await User.update(
      { activeKey },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      throw new Error("User not found");
    }

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password", "key"] },
    });

    return updatedUser;
  }

  async getUsersAnalytics() {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      teacherUsers,
      regularUsers,
      recentRegistrations,
      monthlyRegistrations,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { activeKey: true } }),
      User.count({ where: { activeKey: false } }),
      User.count({ where: { role: "admin" } }),
      User.count({ where: { role: "teacher" } }),
      User.count({ where: { role: "user" } }),
      // Recent registrations (last 7 days)
      User.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Monthly registrations (last 30 days)
      User.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      admins: adminUsers,
      teachers: teacherUsers,
      users: regularUsers,
      recentRegistrations,
      monthlyRegistrations,
    };
  }
}

module.exports = new AdminUserService();
