const { User, Notification, Setting } = require("@/models");
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
        "role",
        "status",
        "verifiedAt",
      ],
    });

    return user;
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
      attributes: ["id", "email", "name", "username", "avatar"],
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
    const result = await User.update(
      {
        ...data,
        password: await hashPassword(data.newPassword),
      },
      { where: { id } }
    );
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
}

module.exports = new UsersService();
