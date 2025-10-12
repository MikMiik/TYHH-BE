"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("comments", "isEdited", {
      type: Sequelize.BOOLEAN,
      after: "likesCount",
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("comments", "isEdited");
  },
};
