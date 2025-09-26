"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // Many-to-many: Role có nhiều User thông qua UserRole
      Role.belongsToMany(models.User, {
        through: models.UserRole,
        foreignKey: "roleId",
        otherKey: "userId",
        as: "users",
      });

      // Many-to-many: Role có nhiều Permission thông qua RolePermission
      Role.belongsToMany(models.Permission, {
        through: models.RolePermission,
        foreignKey: "roleId",
        otherKey: "permissionId",
        as: "permissions",
      });

      // Direct association with junction tables
      Role.hasMany(models.UserRole, {
        foreignKey: "roleId",
        as: "userRoles",
      });

      Role.hasMany(models.RolePermission, {
        foreignKey: "roleId",
        as: "rolePermissions",
      });
    }
  }

  Role.init(
    {
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: "Tên role: admin, teacher, user",
      },
      displayName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "Tên hiển thị của role",
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Mô tả chi tiết về role",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "Trạng thái hoạt động của role",
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
      modelName: "Role",
      tableName: "roles",
      timestamps: true,
      paranoid: false,
      indexes: [
        {
          unique: true,
          fields: ["name"],
        },
        {
          fields: ["isActive"],
        },
      ],
    }
  );

  return Role;
};
