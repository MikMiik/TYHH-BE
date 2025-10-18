"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Xóa constraint khóa ngoại trước khi đổi kiểu
    await queryInterface.removeConstraint("courses", "courses_ibfk_2");
    await queryInterface.changeColumn("courses", "group", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    // Before changing column type back to INTEGER, ensure current values are numeric
    // Set any non-numeric `group` values to NULL to avoid foreign-key/type conflicts
    try {
      // This raw query uses MySQL REGEXP to find non-digit values and set them to NULL
      await queryInterface.sequelize.query(
        "UPDATE `courses` SET `group` = NULL WHERE `group` IS NOT NULL AND `group` REGEXP '[^0-9]'"
      );
    } catch (err) {
      // If the DB dialect doesn't support REGEXP or query fails, proceed cautiously
      // console.warn('Could not normalize course.group values before down migration:', err.message || err);
    }

    // Now change the column to INTEGER
    await queryInterface.changeColumn("courses", "group", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Re-create foreign key constraint if possible. Wrap in try/catch to avoid failing down
    try {
      // Depending on the dialect and previous constraint removal, re-adding may be optional
      await queryInterface.addConstraint("courses", {
        fields: ["group"],
        type: "foreign key",
        name: "courses_ibfk_2",
        references: {
          table: "socials",
          field: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    } catch (err) {
      // console.warn('Could not add foreign key constraint courses_ibfk_2 during down migration:', err.message || err);
    }
  },
};
