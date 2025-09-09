"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("documents", "downloadCount", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: "slug",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("documents", "downloadCount");
  },
};
