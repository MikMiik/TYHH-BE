const { User, Role, Notification, Setting } = require("@/models");
const { hashPassword } = require("@/utils/bcrytp");
const { Op } = require("sequelize");
const { generateMailToken } = require("@/services/jwt.service");
const generateClientUrl = require("@/utils/generateClientUrl");
const queue = require("@/utils/queue");
const sendUnverifiedUserEmail = require("@/utils/sendUnverifiedUserEmail");

class UsersService {
  // API: Get all users (basic)
  async getAll() {
    return await User.findAll({
      attributes: ["id", "name", "username", "avatar", "status"],
    });
  }

  // API: Get user by ID or username
  async getById(id) {
    return await User.findOne({
      where: { [Op.or]: [{ id }, { username: id }] },
      attributes: [
        "id",
        "email",
        "name",
        "username",
        "avatar",
        "status",
        "verifiedAt",
      ],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["id", "name", "displayName"],
          through: { attributes: [] },
        },
      ],
    });
  }

  // API: Get user by username
  async getUserByUsername(username) {
    return await User.findOne({
      where: { username },
      attributes: [
        "id",
        "email",
        "name",
        "username",
        "avatar",
        "status",
        "verifiedAt",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["id", "name", "displayName"],
          through: { attributes: [] },
        },
      ],
    });
  }

  // API: Get user key
  async getUserKey(id) {
    const user = await User.findByPk(id, { attributes: ["key"] });
    return user || null;
  }

  // API: Get user profile
  async getProfile(id) {
    return await User.findOne({
      where: { [Op.or]: [{ id }, { username: id }] },
      attributes: [
        "id",
        "email",
        "name",
        "username",
        "avatar",
        "facebook",
        "phone",
        "yearOfBirth",
        "city",
        "school",
      ],
    });
  }

  // API: Get user by email (for auth)
  async getByEmail(email) {
    return await User.findOne({
      where: { email },
      attributes: ["id", "password", "email", "verifiedAt"],
    });
  }

  // API: Get current user data
  async getMe(id) {
    return await User.findOne({
      where: { [Op.or]: [{ id }, { username: id }] },
      attributes: [
        "id",
        "email",
        "name",
        "username",
        "avatar",
        "activeKey",
        "status",
        "verifiedAt",
      ],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["id", "name", "displayName"],
          through: { attributes: [] },
          required: false,
        },
      ],
    });
  }

  // API: Get user email
  async getUserEmail(id) {
    const user = await User.findByPk(id, { attributes: ["email"], raw: true });
    return user?.email || null;
  }

  // API: Create user
  async create(data) {
    return await User.create(data);
  }

  // API: Update user
  async update(id, data) {
    const updateData = { ...data };
    if (data.newPassword) {
      updateData.password = await hashPassword(data.newPassword);
      delete updateData.newPassword;
    }
    return await User.update(updateData, { where: { id } });
  }

  // API: Upload avatar
  async uploadAvatar(id, avatar) {
    return await User.update({ avatar }, { where: { id } });
  }

  // API: Remove user
  async remove(id) {
    const user = await User.findOne({
      where: { [Op.or]: [{ id }, { username: id }] },
    });
    return await user.destroy();
  }

  // API: Get user's registered courses
  async getMyCourses(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          association: "registeredCourses",
          attributes: [
            "id",
            "title",
            "slug",
            "description",
            "thumbnail",
            "price",
            "discount",
            "isFree",
            "createdAt",
          ],
          through: { attributes: ["createdAt"], as: "registration" },
          include: [
            { association: "teacher", attributes: ["id", "name", "avatar"] },
            {
              association: "topics",
              attributes: ["id", "title", "slug"],
              through: { attributes: [] },
            },
            { association: "livestreams", attributes: ["id", "title", "view"] },
          ],
        },
      ],
    });

    if (!user) throw new Error("User not found");
    return user.registeredCourses || [];
  }

  // ADMIN: Get all users with pagination and search only
  // Role and status filtering handled in frontend
  async getAllUsersAdmin({ page, limit, search }) {
    const offset = (page - 1) * limit;

    // Build where conditions - ONLY for search
    const whereConditions = {};

    // Search filter (only backend filtering needed)
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Always include roles for frontend filtering
    const includeConditions = [
      {
        model: Role,
        as: "roles",
        attributes: ["id", "name", "displayName"],
        through: { attributes: [] },
        required: false,
      },
    ];

    const { count: total, rows: items } = await User.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "email",
        "name",
        "username",
        "avatar",
        "status",
        "verifiedAt",
        "activeKey",
        "createdAt",
        "point",
        "lastLogin",
      ],
      distinct: true, // For accurate count with includes
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

  // ADMIN: Get user by ID (full details)
  async getUserByIdAdmin(id) {
    const user = await User.findByPk(id, {
      attributes: [
        "id",
        "email",
        "name",
        "username",
        "avatar",
        "status",
        "verifiedAt",
        "activeKey",
        "facebook",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["id", "name", "displayName"],
          through: { attributes: [] },
        },
        {
          model: Notification,
          as: "notifications",
          attributes: ["id", "title", "content"],
          limit: 5,
        },
      ],
    });

    if (!user) throw new Error("User not found");
    return user;
  }

  // ADMIN: Get user by username (full details)
  async getUserByUsernameAdmin(username) {
    const user = await User.findOne({
      where: { username },
      attributes: [
        "id",
        "email",
        "name",
        "username",
        "avatar",
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
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["id", "name", "displayName"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) throw new Error("User not found");
    return user;
  }

  // ADMIN: Create user
  async createUserAdmin(userData) {
    const { sequelize } = require("@/models");
    const t = await sequelize.transaction();

    try {
      const {
        name,
        email,
        username,
        password,
        role: roleName = "user",
        ...otherData
      } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: { [Op.or]: [{ email }, { username }] },
      });

      if (existingUser) {
        throw new Error("User with this email or username already exists");
      }

      // Find the role
      const role = await Role.findOne({
        where: { name: roleName, isActive: true },
      });

      if (!role) {
        throw new Error(`Role '${roleName}' not found`);
      }

      // Create user
      const user = await User.create(
        {
          name,
          email,
          username,
          password,
          activeKey: false,
          status: "active",
          ...otherData,
        },
        { transaction: t }
      );

      // Assign role
      await user.addRole(role, {
        through: { isActive: true },
        transaction: t,
      });

      // Send verification email
      await sendUnverifiedUserEmail(user.id, "login", t);

      await t.commit();

      // Return user with roles
      const userWithRoles = await User.findByPk(user.id, {
        include: [
          {
            model: Role,
            as: "roles",
            attributes: ["id", "name", "displayName"],
            through: { attributes: [] },
          },
        ],
      });

      return userWithRoles;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // ADMIN: Update user
  async updateUserAdmin(id, userData) {
    const { sequelize } = require("@/models");
    const t = await sequelize.transaction();

    try {
      const { password, roleIds, ...updateData } = userData;

      // Hash password if provided
      if (password && password.trim() !== "") {
        updateData.password = await hashPassword(password);
      }

      const [updatedRowsCount] = await User.update(updateData, {
        where: { id },
        transaction: t,
      });

      if (updatedRowsCount === 0) {
        throw new Error("User not found");
      }

      const user = await User.findByPk(id, { transaction: t });

      // Update roles if roleIds provided
      if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
        // Find all roles by IDs
        const roles = await Role.findAll({
          where: { id: roleIds, isActive: true },
          transaction: t,
        });

        if (roles.length === 0) {
          throw new Error("No valid roles found");
        }

        // Set the roles (this will replace existing roles)
        await user.setRoles(roles, { transaction: t });
      }

      await t.commit();

      // Return user with roles
      const updatedUser = await User.findByPk(id, {
        include: [
          {
            model: Role,
            as: "roles",
            attributes: ["id", "name", "displayName"],
            through: { attributes: [] },
          },
        ],
      });

      return updatedUser;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // ADMIN: Delete user
  async deleteUserAdmin(id, currentUserId) {
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

  // ADMIN: Bulk delete users
  async bulkDeleteUsersAdmin(ids, currentUserId) {
    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("IDs array is required and must not be empty");
    }

    // Prevent admin from deleting themselves
    if (currentUserId && ids.includes(parseInt(currentUserId))) {
      throw new Error("Cannot delete your own account");
    }

    const deletedRowsCount = await User.destroy({
      where: { id: { [Op.in]: ids } },
    });

    return {
      deletedCount: deletedRowsCount,
      message: `Successfully deleted ${deletedRowsCount} user(s)`,
    };
  }

  // ADMIN: Toggle user status
  async toggleUserStatus(id, activeKey) {
    const [updatedRowsCount] = await User.update(
      { activeKey },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      throw new Error("User not found");
    }

    return await User.findByPk(id);
  }

  // ADMIN: Analytics
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
      User.count({
        include: [
          {
            model: Role,
            as: "roles",
            where: { name: "admin" },
          },
        ],
      }),
      User.count({
        include: [
          {
            model: Role,
            as: "roles",
            where: { name: "teacher" },
          },
        ],
      }),
      User.count({
        include: [
          {
            model: Role,
            as: "roles",
            where: { name: "user" },
          },
        ],
      }),
      User.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
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

  // ADMIN: Set user key
  async setUserKey(userId, key) {
    const userKey = key || Math.random().toString(36).substring(2, 12);

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await user.update({
      key: userKey,
      activeKey: false,
    });

    return { ...updatedUser.toJSON(), key: userKey };
  }

  // ADMIN: Send user verification email
  async sendUserVerificationEmail(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.verifiedAt) {
      throw new Error("User already verified");
    }

    const tokenData = generateMailToken(userId);
    const verificationUrl = generateClientUrl("verify-email", {
      token: tokenData.token,
    });

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
  async getAllStudents() {
    return await User.findAll({
      attributes: [
        "id",
        "name",
        "username",
        "avatar",
        "point",
        "yearOfBirth",
        "city",
        "school",
      ],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["id", "name", "displayName"],
          where: { name: "user" },
          through: { attributes: [] },
        },
      ],
      order: [["point", "DESC"]],
    });
  }
}

module.exports = new UsersService();
