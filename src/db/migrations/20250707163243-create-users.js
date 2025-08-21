"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      email: { type: Sequelize.STRING(191), unique: true, allowNull: false },

      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      username: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: false,
      },

      birthday: { type: Sequelize.DATE, allowNull: true },

      phone: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
      },

      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      school: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      role: {
        type: Sequelize.STRING(191),
        defaultValue: "user",
      },
      lastLogin: { type: Sequelize.DATE, allowNull: true },

      verifiedAt: { type: Sequelize.DATE, allowNull: true },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
