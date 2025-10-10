"use strict";

/**
 * Migration: Remove user_notification table, drop data/type columns from notifications, add teacherId to notifications
 *
 * - Drops user_notification table
 * - Removes 'data' and 'type' columns from notifications
 * - Adds 'teacherId' column to notifications, references users(id)
 *
 * Naming conventions follow existing migrations.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Drop user_notification table if exists
    await queryInterface.dropTable("user_notification");

    // 2. Remove 'data' and 'type' columns from notifications
    await queryInterface.removeColumn("notifications", "data");
    await queryInterface.removeColumn("notifications", "type");

    // 3. Add 'teacherId' column to notifications, references users(id)
    await queryInterface.addColumn("notifications", "teacherId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. Remove teacherId column
    await queryInterface.removeColumn("notifications", "teacherId");

    // 2. Add back 'data' and 'type' columns
    await queryInterface.addColumn("notifications", "data", {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn("notifications", "type", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 3. Recreate user_notification table (structure must match original)
    await queryInterface.createTable("user_notification", {
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
      notificationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "notifications",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
};
