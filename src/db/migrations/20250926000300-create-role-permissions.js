"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("role_permission", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      permissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "permissions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Thêm unique constraint để tránh duplicate
    await queryInterface.addIndex(
      "role_permission",
      ["roleId", "permissionId"],
      {
        unique: true,
        name: "role_permission_unique",
      }
    );

    // Thêm index riêng lẻ
    await queryInterface.addIndex("role_permission", ["roleId"]);
    await queryInterface.addIndex("role_permission", ["permissionId"]);

    // Gán quyền mặc định cho các role
    // Lấy ID của các role và permission để gán quyền
    const roleAdmin = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'admin'",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const roleTeacher = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'teacher'",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const roleUser = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'user'",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const allPermissions = await queryInterface.sequelize.query(
      "SELECT id, name FROM permissions",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (roleAdmin.length > 0 && roleTeacher.length > 0 && roleUser.length > 0) {
      const adminId = roleAdmin[0].id;
      const teacherId = roleTeacher[0].id;
      const userId = roleUser[0].id;

      // Admin có tất cả quyền
      const adminPermissions = allPermissions.map((permission) => ({
        roleId: adminId,
        permissionId: permission.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Teacher có quyền liên quan đến course và livestream
      const teacherPermissionNames = [
        "course.create",
        "course.read",
        "course.update",
        "course.manage_outline",
        "livestream.create",
        "livestream.manage",
        "livestream.view",
        "document.upload",
        "document.download",
        "document.manage",
        "user.read", // Teacher có thể xem thông tin học viên
      ];
      const teacherPermissions = allPermissions
        .filter((p) => teacherPermissionNames.includes(p.name))
        .map((permission) => ({
          roleId: teacherId,
          permissionId: permission.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

      // User chỉ có quyền cơ bản
      const userPermissionNames = [
        "course.read",
        "livestream.view",
        "document.download",
      ];
      const userPermissions = allPermissions
        .filter((p) => userPermissionNames.includes(p.name))
        .map((permission) => ({
          roleId: userId,
          permissionId: permission.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

      // Insert tất cả quyền
      await queryInterface.bulkInsert("role_permission", [
        ...adminPermissions,
        ...teacherPermissions,
        ...userPermissions,
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("role_permission");
  },
};
