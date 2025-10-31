"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("entities", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      icon: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: "Emoji or icon representation of the entity",
      },
      formula: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: "Chemical formula if applicable",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Description returned by OpenAI",
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
    await queryInterface.dropTable("entities");
  },
};

