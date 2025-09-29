"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("roles", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: "Tên role: admin, teacher, user",
      },
      displayName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Tên hiển thị của role",
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: "Mô tả chi tiết về role",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "Trạng thái hoạt động của role",
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

    // Thêm index cho name
    await queryInterface.addIndex("roles", ["name"]);
    await queryInterface.addIndex("roles", ["isActive"]);

    // Thêm data mặc định cho các role (chỉ teacher và user, admin không cần trong DB)
    await queryInterface.bulkInsert("roles", [
      {
        name: "teacher",
        displayName: "Giáo viên",
        description: "Có thể tạo và quản lý khóa học, livestream của mình",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "user",
        displayName: "Học viên",
        description: "Có thể đăng ký và tham gia khóa học",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin",
        displayName: "Quản trị viên",
        description: "Có thể quản lý tất cả các khía cạnh của hệ thống",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("roles");
  },
};
