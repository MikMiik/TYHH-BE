const { User, Notification, Setting } = require("@/models");
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
        "firstName",
        "lastName",
        "username",
        "name",
        "avatar",
        "role",
        "status",
        "verifiedAt",
      ],
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
        "firstName",
        "lastName",
        "username",
        "name",
        "avatar",
        "role",
        "status",
        "verifiedAt",
      ],
      include: [
        {
          model: Notification,
          as: "notifications",
          attributes: [
            "id",
            "type",
            "notifiableType",
            "notifiableId",
            "content",
            "link",
            "seenAt",
            "createdAt",
            "updatedAt",
          ],
          through: {
            attributes: [],
          },
        },
        {
          model: Setting,
          as: "setting",
          attributes: ["allowComments", "showViewCounts"],
        },
      ],
      // Với many-to-many relationship thông qua junction table,
      // chúng ta cần đặt order ở level chính của query.
      order: [
        [{ model: Notification, as: "notifications" }, "createdAt", "DESC"],
      ],
    });

    return user;
  }
  async getByEmail(email) {
    const user = await User.findOne({
      where: { email },
      hooks: false,
    });
    return user;
  }

  async getUserEmail(id) {
    const user = await User.findByPk(id, {
      attributes: ["email"],
      raw: true,
      hooks: false,
    });
    return user?.email || null;
  }

  async create(data) {
    const user = await User.create(data);
    return user;
  }

  async update(id, data) {
    const result = await User.update(data, { where: { id } });
    return result;
  }

  async remove(id) {
    const user = await User.findOne({
      where: { [Op.or]: [{ id }, { username: id }] },
    });
    const result = await user.destroy();
    return result;
  }
}

module.exports = new UsersService();
