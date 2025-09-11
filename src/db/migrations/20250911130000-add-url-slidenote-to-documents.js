"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("documents", "url", {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: "downloadCount", // vị trí sau downloadCount nếu DB hỗ trợ
    });
    await queryInterface.addColumn("documents", "slidenote", {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: "url", // vị trí sau url nếu DB hỗ trợ
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("documents", "url");
    await queryInterface.removeColumn("documents", "slidenote");
  },
};
