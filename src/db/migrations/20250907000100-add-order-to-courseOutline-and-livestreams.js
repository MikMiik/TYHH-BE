"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("course-outline", "order", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      after: "id", // vị trí sau id nếu DB hỗ trợ
    });
    await queryInterface.addColumn("livestreams", "order", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      after: "id",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("course-outline", "order");
    await queryInterface.removeColumn("livestreams", "order");
  },
};
