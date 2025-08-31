"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("documents", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      livestreamId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "livestreams", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      vip: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      thumbnail: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
    await queryInterface.addIndex("documents", ["livestreamId"]);
    await queryInterface.addIndex("documents", ["vip"]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("documents");
  },
};
