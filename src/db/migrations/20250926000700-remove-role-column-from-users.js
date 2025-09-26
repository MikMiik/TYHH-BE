"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Xóa cột role khỏi bảng users vì đã chuyển sang quan hệ many-to-many
    // thông qua bảng user_role
    await queryInterface.removeColumn("users", "role");

    console.log(
      "Removed 'role' column from users table - now using user_role for many-to-many relationship"
    );
  },

  async down(queryInterface, Sequelize) {
    // Rollback: thêm lại cột role
    await queryInterface.addColumn("users", "role", {
      type: Sequelize.STRING(20),
      defaultValue: "user",
      allowNull: true,
    });

    // Migrate data từ user_role trở lại cột role cho rollback
    const userRoles = await queryInterface.sequelize.query(
      `SELECT ur.userId, r.name as roleName 
       FROM user_role ur 
       JOIN roles r ON ur.roleId = r.id 
       WHERE ur.isActive = true`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Cập nhật role cho từng user (lấy role đầu tiên nếu user có nhiều role)
    for (const userRole of userRoles) {
      await queryInterface.sequelize.query(
        `UPDATE users SET role = ? WHERE id = ?`,
        {
          replacements: [userRole.roleName, userRole.userId],
          type: queryInterface.sequelize.QueryTypes.UPDATE,
        }
      );
    }

    console.log(
      "Rollback: Added role column back and migrated data from user_role"
    );
  },
};
