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
    // Chỉ lấy teacher và user roles (admin không cần trong DB)
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

    if (roleTeacher.length > 0 && roleUser.length > 0) {
      const teacherId = roleTeacher[0].id;
      const userId = roleUser[0].id;

      // Teacher có tất cả teacher.* permissions
      const teacherPermissionNames = [
        "teacher.courses.create",
        "teacher.courses.manage_own",
        "teacher.courses.view_own",
        "teacher.courses.update_own",
        "teacher.courses.delete_own",
        "teacher.livestreams.create",
        "teacher.livestreams.manage_own",
        "teacher.livestreams.view_own",
        "teacher.livestreams.update_own",
        "teacher.livestreams.delete_own",
        "teacher.documents.create",
        "teacher.documents.manage_own",
        "teacher.documents.view_own",
        "teacher.documents.update_own",
        "teacher.documents.delete_own",
        "teacher.students.view",
        "teacher.students.manage",
      ];

      const teacherPermissions = allPermissions
        .filter((p) => teacherPermissionNames.includes(p.name))
        .map((permission) => ({
          roleId: teacherId,
          permissionId: permission.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

      // User có tất cả user.* permissions
      const userPermissionNames = [
        "user.profile.view",
        "user.profile.update",
        "user.profile.upload_avatar",
        "user.courses.view_enrolled",
        "user.courses.enroll",
        "user.courses.unenroll",
        "user.livestreams.view_enrolled",
        "user.livestreams.join",
        "user.documents.download_allowed",
        "user.documents.view_allowed",
      ];

      const userPermissions = allPermissions
        .filter((p) => userPermissionNames.includes(p.name))
        .map((permission) => ({
          roleId: userId,
          permissionId: permission.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

      // Insert permissions (chỉ teacher và user, không có admin)
      const allRolePermissions = [...teacherPermissions, ...userPermissions];

      if (allRolePermissions.length > 0) {
        await queryInterface.bulkInsert("role_permission", allRolePermissions);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("role_permission");
  },
};
