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
        "name",
        "username",
        "avatar",
        "role",
        "status",
        "verifiedAt",
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
        "role",
        "status",
        "verifiedAt",
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
