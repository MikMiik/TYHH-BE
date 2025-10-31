"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("entity_combinations", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      element1: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "First element symbol or entity name in the combination",
      },
      element2: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "Second element symbol or entity name in the combination",
      },
      resultEntityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "entities",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "The resulting entity from the combination",
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("entity_combinations");
  },
};

