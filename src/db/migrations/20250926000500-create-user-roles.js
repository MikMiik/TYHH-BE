"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_role", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "Trạng thái kích hoạt của role cho user này",
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

    // Thêm unique constraint để tránh duplicate user-role
    await queryInterface.addIndex("user_role", ["userId", "roleId"], {
      unique: true,
      name: "user_role_unique",
    });

    // Thêm các index khác
    await queryInterface.addIndex("user_role", ["userId"]);
    await queryInterface.addIndex("user_role", ["roleId"]);
    await queryInterface.addIndex("user_role", ["isActive"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("user_role");
  },
};
