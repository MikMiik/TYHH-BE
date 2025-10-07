"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add status column to livestreams table
    await queryInterface.addColumn("livestreams", "status", {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: "draft",
      after: "view", // Place after view column
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove status column from livestreams table
    await queryInterface.removeColumn("livestreams", "status");
  },
};
