"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("courses", "introVideo", {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: "thumbnail", // optional: place after thumbnail if supported
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("courses", "introVideo");
  },
};
