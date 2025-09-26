"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      // Many-to-many: Permission thuộc về nhiều Role thông qua RolePermission
      Permission.belongsToMany(models.Role, {
        through: models.RolePermission,
        foreignKey: "permissionId",
        otherKey: "roleId",
        as: "roles",
      });

      // Direct association with junction table
      Permission.hasMany(models.RolePermission, {
        foreignKey: "permissionId",
        as: "rolePermissions",
      });
    }
  }

  Permission.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment:
          "Tên permission: admin.users.create, teacher.courses.update...",
      },
      displayName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: "Tên hiển thị của permission",
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Mô tả chi tiết về permission",
      },
      module: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment:
          "Module/nhóm chức năng: admin_users, teacher_courses, public_courses...",
      },
      action: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Hành động: list, view, create, update, delete, manage...",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "Trạng thái hoạt động của permission",
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
      modelName: "Permission",
      tableName: "permissions",
      timestamps: true,
      paranoid: false,
      indexes: [
        {
          unique: true,
          fields: ["name"],
        },
        {
          fields: ["module"],
        },
        {
          fields: ["action"],
        },
        {
          fields: ["isActive"],
        },
      ],
    }
  );

  return Permission;
};
