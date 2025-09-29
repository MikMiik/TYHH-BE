"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Migrate dữ liệu từ cột role trong users sang bảng user_role

    // Lấy tất cả users có role
    const users = await queryInterface.sequelize.query(
      "SELECT id, role FROM users WHERE role IS NOT NULL",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Lấy danh sách roles
    const roles = await queryInterface.sequelize.query(
      "SELECT id, name FROM roles",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Tạo map role name -> role id
    const roleMap = {};
    roles.forEach((role) => {
      roleMap[role.name] = role.id;
    });

    // Chuẩn bị data để insert vào user_role
    const userRoleData = [];

    users.forEach((user) => {
      let roleId = null;

      // Map role string to role id (chỉ teacher và user)
      if (user.role === "teacher" && roleMap["teacher"]) {
        roleId = roleMap["teacher"];
      } else if (user.role === "user" && roleMap["user"]) {
        roleId = roleMap["user"];
      } else if (user.role === "admin") {
        // Admin users sẽ không được migrate vào database
        // Admin được handle riêng qua middleware isAdmin check
        console.log(
          `Skipping admin user ID ${user.id} - admin roles not stored in DB`
        );
        return; // Skip admin users
      } else {
        // Default to user role nếu role không hợp lệ
        roleId = roleMap["user"];
        console.log(
          `Invalid role '${user.role}' for user ID ${user.id}, defaulting to 'user'`
        );
      }

      if (roleId) {
        userRoleData.push({
          userId: user.id,
          roleId: roleId,
          isActive: true,
          // Bỏ các trường không có trong schema của bảng user_role
          // assignedBy: null, // System migration
          // assignedAt: new Date(),
          // expiresAt: null, // Vô thời hạn
          // note: `Migrated from role field: ${user.role}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });

    // Insert dữ liệu vào user_role (cần khớp với tên bảng trong migration trước)
    if (userRoleData.length > 0) {
      await queryInterface.bulkInsert("user_role", userRoleData);
      console.log(`Migrated ${userRoleData.length} user-role relationships`);
    }

    // Có thể rename cột role thành role_backup để giữ lại
    // await queryInterface.renameColumn("users", "role", "role_backup");

    // Hoặc comment lại để giữ cột role trong quá trình test
    console.log(
      "Role data migrated to user_role table. Original role column will be removed in next migration."
    );
  },

  async down(queryInterface, Sequelize) {
    // Rollback: xóa tất cả data trong user_role được tạo từ migration này
    // Vì không có trường note, ta xóa tất cả records (cẩn thận!)
    await queryInterface.sequelize.query("DELETE FROM user_role");

    console.log("Rollback: Removed all migrated user-role data");
  },
};
