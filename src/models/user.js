"use strict";
const getCurrentUser = require("@/utils/getCurrentUser");
const { Model } = require("sequelize");
const { default: slugify } = require("slugify");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {}
  }
  User.init(
    {
      email: { type: DataTypes.STRING, allowNull: false, unique: true },

      password: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },

      firstName: DataTypes.STRING(191),

      lastName: DataTypes.STRING(191),

      name: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.getDataValue("firstName")} ${this.getDataValue("lastName")}`;
        },
      },

      username: { type: DataTypes.STRING(191), unique: true },

      googleId: {
        type: DataTypes.STRING(255),
      },

      githubId: {
        type: DataTypes.STRING(255),
      },

      birthday: DataTypes.DATE,

      introduction: DataTypes.STRING(255),

      website: DataTypes.STRING(255),

      twoFactorAuth: DataTypes.BOOLEAN,

      twoFactorSecret: DataTypes.STRING(50),

      avatar: {
        type: DataTypes.STRING(255),
        get() {
          const raw = this.getDataValue("avatar");
          if (!raw) return null;
          return raw.startsWith("http")
            ? raw
            : `${process.env.BASE_URL}/${raw}`;
        },
      },

      coverImage: {
        type: DataTypes.STRING(255),
        get() {
          const raw = this.getDataValue("coverImage");
          if (!raw) return null;
          return raw.startsWith("http")
            ? raw
            : `${process.env.BASE_URL}/${raw}`;
        },
      },

      skills: DataTypes.JSON,

      phone: { type: DataTypes.STRING(191), unique: true },

      role: { type: DataTypes.STRING(191), defaultValue: "User" },

      socials: DataTypes.JSON,

      isFollowed: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("isFollowed");
        },
        set(value) {
          this.setDataValue("isFollowed", value);
        },
      },

      canViewProfile: {
        type: DataTypes.VIRTUAL,
      },

      postsCount: DataTypes.INTEGER,

      followersCount: DataTypes.INTEGER,

      followingCount: DataTypes.INTEGER,

      likesCount: DataTypes.INTEGER,

      status: DataTypes.STRING(191),

      lastLogin: DataTypes.DATE,

      verifiedAt: DataTypes.DATE,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
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
