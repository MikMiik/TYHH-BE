const { User } = require("@/models");
const { hashPassword } = require("@/utils/bcrytp");
const { Op } = require("sequelize");
const { generateMailToken } = require("@/services/jwt.service");
const generateClientUrl = require("@/utils/generateClientUrl");
const queue = require("@/utils/queue");
const sendUnverifiedUserEmail = require("@/utils/sendUnverifiedUserEmail");

class AdminUserService {
  async getAllUsers({ page, limit }) {
    const offset = (page - 1) * limit;

    // Không filter gì, chỉ phân trang
    const { count: total, rows: items } = await User.findAndCountAll({
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
        "key",
        "status",
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
    const { sequelize } = require("@/models");
    const t = await sequelize.transaction();

    try {
      const {
        name,
        email,
        username,
        password,
        role = "user",
        ...otherData
      } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
        },
      });

      if (existingUser) {
        throw new Error("User with this email or username already exists");
      }

      // Create user with hashed password (model hook will handle hashing)
      const user = await User.create(
        {
          name,
          email,
          username,
          password, // Will be hashed by model hook
          role,
          activeKey: false,
          status: "active", // Default status for admin-created users
          ...otherData, // Include additional fields like phone, yearOfBirth, etc.
        },
        { transaction: t }
      );

      // Send verification email using the same logic as auth service
      await sendUnverifiedUserEmail(user.id, "login", t);

      await t.commit();

      // Return user without sensitive data
      const {
        password: _,
        key: __,
        ...userWithoutSensitiveData
      } = user.toJSON();
      return userWithoutSensitiveData;
    } catch (error) {
      await t.rollback();
      throw error;
    }
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

  async setUserKey(userId, key) {
    // Generate random key if not provided
    const userKey = key || Math.random().toString(36).substring(2, 12);

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await user.update({
      key: userKey,
      activeKey: false, // Reset activeKey when setting new key
    });

    // Return user without sensitive data
    const { password, ...userData } = updatedUser.toJSON();
    return { ...userData, key: userKey };
  }

  async sendUserVerificationEmail(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.verifiedAt) {
      throw new Error("User already verified");
    }

    // Generate verification token
    const tokenData = generateMailToken(userId);
    const verificationUrl = generateClientUrl("verify-email", {
      token: tokenData.token,
    });

    // Send verification email via queue
    queue.dispatch("sendVerifyEmailJob", {
      userId: user.id,
      email: user.email,
      token: tokenData.token,
      verificationUrl,
    });

    return {
      message: "Verification email sent successfully",
      email: user.email,
    };
  }
}

module.exports = new AdminUserService();
