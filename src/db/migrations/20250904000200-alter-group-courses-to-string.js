"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Xóa constraint khóa ngoại trước khi đổi kiểu
    await queryInterface.removeConstraint("courses", "courses_ibfk_2");
    await queryInterface.changeColumn("courses", "group", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    // Revert group column to INTEGER with references
    await queryInterface.changeColumn("courses", "group", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "socials", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
