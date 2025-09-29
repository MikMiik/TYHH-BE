const { User, Role, Notification, Setting } = require("@/models");
const { hashPassword } = require("@/utils/bcrytp");
const { Op } = require("sequelize");
class UsersService {
  async getAll() {
    const users = await User.findAll();
    return users;
  }

  async getById(id) {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ id }, { username: id }],
      },
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
          through: {
            attributes: ["isActive"],
            where: { isActive: true },
          },
        },
      ],
    });

    return user;
  }

  async getUserByUsername(username) {
    const user = await User.findOne({
      where: {
        username,
      },
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
          through: {
            attributes: ["isActive"],
            where: { isActive: true },
          },
        },
      ],
    });

    return user;
  }

  async getUserKey(id) {
    const user = await User.findByPk(id, {
      attributes: ["key"],
    });

    return user || null;
  }

  async getProfile(id) {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ id }, { username: id }],
      },
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

    return user;
  }

  async getByEmail(email) {
    const user = await User.findOne({
      where: {
        email,
      },
      attributes: ["id", "password", "email", "verifiedAt"],
    });

    return user;
  }

  async getMe(id) {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ id }, { username: id }],
      },
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
          through: {
            attributes: ["isActive"],
            where: { isActive: true },
          },
          required: false, // LEFT JOIN to include users without roles
        },
      ],
    });

    return user;
  }

  async getUserEmail(id) {
    const user = await User.findByPk(id, {
      attributes: ["email"],
      raw: true,
    });
    return user?.email || null;
  }

  async create(data, options = {}) {
    const user = await User.create(data, options);
    return user;
  }

  async update(id, data) {
    const updateData = { ...data };

    // Only hash password if newPassword is provided
    if (data.newPassword) {
      updateData.password = await hashPassword(data.newPassword);
      // Remove newPassword from updateData to avoid saving it
      delete updateData.newPassword;
    }

    const result = await User.update(updateData, { where: { id } });
    return result;
  }

  async uploadAvatar(id, avatar) {
    const result = await User.update(
      {
        avatar,
      },
      { where: { id } }
    );

    return result;
  }

  async remove(id) {
    const user = await User.findOne({
      where: { [Op.or]: [{ id }, { username: id }] },
    });
    const result = await user.destroy();
    return result;
  }

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
          through: {
            attributes: ["createdAt"],
            as: "registration",
          },
          include: [
            {
              association: "teacher",
              attributes: ["id", "name", "avatar"],
            },
            {
              association: "topics",
              attributes: ["id", "title", "slug"],
              through: { attributes: [] },
            },
            {
              association: "livestreams",
              attributes: ["id", "title", "view"],
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user.registeredCourses || [];
  }
}

module.exports = new UsersService();
