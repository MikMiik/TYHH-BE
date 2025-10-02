"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the problematic constraints that might not work with MySQL
    try {
      await queryInterface.removeIndex(
        "course-outline",
        "unique_order_per_course"
      );
    } catch (error) {
      // Index doesn't exist, ignore error
    }

    try {
      await queryInterface.removeIndex(
        "livestreams",
        "unique_order_per_outline"
      );
    } catch (error) {
      // Index doesn't exist, ignore error
    }

    // First, clean up any duplicate order values and set them to NULL
    await queryInterface.sequelize.query(`
      UPDATE \`course-outline\` co1 
      SET \`order\` = NULL 
      WHERE co1.id NOT IN (
        SELECT * FROM (
          SELECT MIN(co2.id) 
          FROM \`course-outline\` co2 
          WHERE co2.\`order\` IS NOT NULL 
          GROUP BY co2.\`order\`, co2.courseId
        ) AS temp
      ) AND co1.\`order\` IS NOT NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE livestreams l1 
      SET \`order\` = NULL 
      WHERE l1.id NOT IN (
        SELECT * FROM (
          SELECT MIN(l2.id) 
          FROM livestreams l2 
          WHERE l2.\`order\` IS NOT NULL 
          GROUP BY l2.\`order\`, l2.courseOutlineId
        ) AS temp
      ) AND l1.\`order\` IS NOT NULL
    `);

    // For MySQL, we'll create a simpler approach using triggers or application-level validation
    // For now, just add regular indexes to improve performance
    await queryInterface.addIndex("course-outline", {
      fields: ["order", "courseId"],
      name: "idx_order_course",
    });

    await queryInterface.addIndex("livestreams", {
      fields: ["order", "courseOutlineId"],
      name: "idx_order_outline",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("course-outline", "idx_order_course");
    await queryInterface.removeIndex("livestreams", "idx_order_outline");
  },
};
