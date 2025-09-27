"use strict";

const { getAllPermissionNames } = require("../../utils/permissionHelper");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Lấy tất cả permission names từ config
    const configPermissions = getAllPermissionNames();

    // Lấy permissions hiện tại trong database
    const existingPermissions = await queryInterface.sequelize.query(
      "SELECT name FROM permissions",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const existingNames = existingPermissions.map((p) => p.name);

    // Tìm permissions mới cần thêm
    const newPermissions = configPermissions.filter(
      (name) => !existingNames.includes(name)
    );

    // Tìm permissions cũ cần xóa (không có trong config)
    const obsoletePermissions = existingNames.filter(
      (name) => !configPermissions.includes(name)
    );

    console.log(`Found ${newPermissions.length} new permissions to add`);
    console.log(
      `Found ${obsoletePermissions.length} obsolete permissions to remove`
    );

    // Thêm permissions mới
    if (newPermissions.length > 0) {
      const newPermissionData = newPermissions.map((name) => {
        const parts = name.split(".");
        return {
          name,
          displayName: name.replace(/\./g, " ").replace(/_/g, " "),
          description: `Permission: ${name}`,
          module: parts.slice(0, -1).join("_"),
          action: parts[parts.length - 1],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      await queryInterface.bulkInsert("permissions", newPermissionData);
      console.log(`Added ${newPermissions.length} new permissions`);
    }

    // Vô hiệu hóa permissions cũ thay vì xóa (để tránh mất dữ liệu)
    if (obsoletePermissions.length > 0) {
      await queryInterface.sequelize.query(
        `UPDATE permissions SET isActive = false WHERE name IN (:names)`,
        {
          replacements: { names: obsoletePermissions },
          type: queryInterface.sequelize.QueryTypes.UPDATE,
        }
      );
      console.log(
        `Deactivated ${obsoletePermissions.length} obsolete permissions`
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Trong rollback, chúng ta sẽ khôi phục lại trạng thái trước đó
    console.log("Rolling back permission sync...");

    // Có thể thêm logic rollback ở đây nếu cần
    // Tuy nhiên, việc rollback permissions có thể phức tạp vì có thể ảnh hưởng đến role_permission
  },
};
