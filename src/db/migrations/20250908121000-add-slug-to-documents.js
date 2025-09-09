"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("documents", "slug", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      after: "title",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("documents", "slug");
  },
};
