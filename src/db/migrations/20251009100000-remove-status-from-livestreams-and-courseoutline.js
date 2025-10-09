"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Xóa trường status khỏi livestreams
    await queryInterface.removeColumn("livestreams", "status");
    // Xóa trường status khỏi course-outline
    await queryInterface.removeColumn("course-outline", "status");
  },

  async down(queryInterface, Sequelize) {
    // Thêm lại trường status cho livestreams
    await queryInterface.addColumn("livestreams", "status", {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: "draft",
      after: "view", // vị trí sau view nếu DB hỗ trợ
    });
    // Thêm lại trường status cho course-outline
    await queryInterface.addColumn("course-outline", "status", {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: "draft",
      after: "title", // vị trí sau title nếu DB hỗ trợ
    });
  },
};
