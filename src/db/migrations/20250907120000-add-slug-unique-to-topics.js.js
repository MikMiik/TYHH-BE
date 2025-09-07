"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("topics", "slug", {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
      after: "title",
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("topics", "slug");
  },
};
