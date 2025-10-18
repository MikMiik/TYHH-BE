"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, clean up any existing duplicate order values

    // For course-outline table: Set order = NULL for duplicates
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

    // For livestreams table: Set order = NULL for duplicates
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

    // Add unique constraint for (order, courseId) in course-outline table
    await queryInterface.addIndex("course-outline", {
      fields: ["order", "courseId"],
      unique: true,
      name: "unique_order_per_course",
      where: {
        order: {
          [Sequelize.Op.ne]: null,
        },
      },
    });

    // Add unique constraint for (order, courseOutlineId) in livestreams table
    await queryInterface.addIndex("livestreams", {
      fields: ["order", "courseOutlineId"],
      unique: true,
      name: "unique_order_per_outline",
      where: {
        order: {
          [Sequelize.Op.ne]: null,
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove unique constraints if they exist (defensive: avoid errors when index missing)
    try {
      const courseOutlineIndexes = await queryInterface.showIndex(
        "course-outline"
      );
      const hasCourseIndex = courseOutlineIndexes.some(
        (i) => i && i.name === "unique_order_per_course"
      );
      if (hasCourseIndex) {
        await queryInterface.removeIndex(
          "course-outline",
          "unique_order_per_course"
        );
      }
    } catch (err) {
      // swallow/show error for debugging but don't fail migration down
      // console.warn('Could not check/remove index unique_order_per_course:', err.message || err);
    }

    try {
      const livestreamIndexes = await queryInterface.showIndex("livestreams");
      const hasLivestreamIndex = livestreamIndexes.some(
        (i) => i && i.name === "unique_order_per_outline"
      );
      if (hasLivestreamIndex) {
        await queryInterface.removeIndex(
          "livestreams",
          "unique_order_per_outline"
        );
      }
    } catch (err) {
      // console.warn('Could not check/remove index unique_order_per_outline:', err.message || err);
    }
  },
};
