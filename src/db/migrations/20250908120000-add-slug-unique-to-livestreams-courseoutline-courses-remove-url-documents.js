"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add slug (unique) to livestreams
    await queryInterface.addColumn("livestreams", "slug", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      after: "title",
    });
    // Add slug (unique) to course_outline
    await queryInterface.addColumn("course-outline", "slug", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      after: "title",
    });
    // Add slug (unique) to courses
    await queryInterface.addColumn("courses", "slug", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      after: "title",
    });
    // Remove url from documents
    await queryInterface.removeColumn("documents", "url");
  },

  async down(queryInterface, Sequelize) {
    // Remove slug from livestreams
    await queryInterface.removeColumn("livestreams", "slug");
    // Remove slug from course-outline
    await queryInterface.removeColumn("course-outline", "slug");
    // Remove slug from courses
    await queryInterface.removeColumn("courses", "slug");
    // Add url back to documents
    await queryInterface.addColumn("documents", "url", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
