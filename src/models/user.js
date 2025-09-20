"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // 1 user có nhiều course (as teacher)
      User.hasMany(models.Course, {
        foreignKey: "teacherId",
        as: "courses",
      });
      // Many-to-many: User đăng ký nhiều Course
      User.belongsToMany(models.Course, {
        through: models.CourseUser,
        foreignKey: "userId",
        otherKey: "courseId",
        as: "registeredCourses",
      });
    }
  }
  User.init(
    {
      email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: true },
      username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      avatar: { type: DataTypes.STRING(191), allowNull: true },
      yearOfBirth: { type: DataTypes.INTEGER, allowNull: true },
      city: { type: DataTypes.STRING(50), allowNull: true },
      school: { type: DataTypes.STRING(100), allowNull: true },
      phone: { type: DataTypes.STRING(20), allowNull: true, unique: true },
      facebook: { type: DataTypes.STRING(191), allowNull: true, unique: true },
      status: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: "active",
      },
      role: { type: DataTypes.STRING(20), defaultValue: "user" },
      point: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      googleId: { type: DataTypes.STRING(255), allowNull: true },
      key: { type: DataTypes.STRING(255), allowNull: true },
      activeKey: { type: DataTypes.BOOLEAN, defaultValue: false },
      lastLogin: { type: DataTypes.DATE, allowNull: true },
      verifiedAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};
