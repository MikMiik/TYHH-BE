"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("comments", {
      fields: ["parentId"],
      type: "foreign key",
      name: "fk_comments_parentId",
      references: {
        table: "comments",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("comments", "fk_comments_parentId");
  },
};
