"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {
      // Association with Role
      RolePermission.belongsTo(models.Role, {
        foreignKey: "roleId",
        as: "role",
      });

      // Association with Permission
      RolePermission.belongsTo(models.Permission, {
        foreignKey: "permissionId",
        as: "permission",
      });
    }
  }

  RolePermission.init(
    {
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID của role",
      },
      permissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID của permission",
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
      modelName: "RolePermission",
      tableName: "role_permission",
      timestamps: true,
      paranoid: false,
      indexes: [
        {
          unique: true,
          fields: ["roleId", "permissionId"],
          name: "role_permission_unique",
        },
        {
          fields: ["roleId"],
        },
        {
          fields: ["permissionId"],
        },
      ],
    }
  );

  return RolePermission;
};
