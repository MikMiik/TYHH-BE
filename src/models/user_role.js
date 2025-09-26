"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    static associate(models) {
      // Association with User
      UserRole.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      // Association with Role
      UserRole.belongsTo(models.Role, {
        foreignKey: "roleId",
        as: "role",
      });
    }
  }

  UserRole.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID của user",
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID của role",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "Trạng thái kích hoạt của role cho user này",
      },
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
    },
    {
      sequelize,
      modelName: "UserRole",
      tableName: "user_role",
      timestamps: true,
      paranoid: false,
      indexes: [
        {
          unique: true,
          fields: ["userId", "roleId"],
          name: "user_role_unique",
        },
        {
          fields: ["userId"],
        },
        {
          fields: ["roleId"],
        },
        {
          fields: ["isActive"],
        },
      ],
    }
  );

  return UserRole;
};
