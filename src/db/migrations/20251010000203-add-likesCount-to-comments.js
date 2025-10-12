"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("comments", "likesCount", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      after: "commentableType",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("comments", "likesCount");
  },
};
