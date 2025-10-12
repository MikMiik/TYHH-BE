"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove livestreamId column
    await queryInterface.removeColumn("comments", "livestreamId");

    // Set default value for createdAt and updatedAt
    await queryInterface.changeColumn("comments", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.changeColumn("comments", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
  },

  async down(queryInterface, Sequelize) {
    // Add livestreamId column back
    await queryInterface.addColumn("comments", "livestreamId", {
      type: Sequelize.INTEGER,
      references: {
        model: "livestreams",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Remove default value for createdAt and updatedAt
    await queryInterface.changeColumn("comments", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn("comments", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },
};
