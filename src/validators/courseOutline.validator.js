const { checkSchema } = require("express-validator");
const { Course } = require("@/models");
const handleValidationErrors = require("./handleValidationErrors");

// Create course outline validation
exports.create = [
  checkSchema({
    title: {
      trim: true,
      notEmpty: {
        errorMessage: "Title is required.",
      },
      isLength: {
        options: { min: 3, max: 255 },
        errorMessage: "Title must be between 3 and 255 characters.",
      },
    },
    courseId: {
      notEmpty: {
        errorMessage: "Course ID is required.",
      },
      isInt: {
        errorMessage: "Course ID must be a valid integer.",
      },
      custom: {
        options: async (value) => {
          const course = await Course.findByPk(value);
          if (!course) {
            throw new Error("Course not found.");
          }
          return true;
        },
      },
    },
  }),
  handleValidationErrors,
];

// Update course outline validation
exports.update = [
  checkSchema({
    title: {
      optional: { nullable: false, checkFalsy: false },
      trim: true,
      notEmpty: {
        errorMessage: "Title is required.",
      },
      isLength: {
        options: { min: 3, max: 255 },
        errorMessage: "Title must be between 3 and 255 characters.",
      },
    },
  }),
  handleValidationErrors,
];

// Reorder outlines validation
exports.reorder = [
  checkSchema({
    orders: {
      isArray: {
        errorMessage: "Orders must be an array.",
      },
      custom: {
        options: (value) => {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("Orders array cannot be empty.");
          }

          // Validate each order item
          for (const order of value) {
            if (!order.id || !Number.isInteger(order.id)) {
              throw new Error("Each order item must have a valid id.");
            }
            if (!Number.isInteger(order.order) || order.order < 1) {
              throw new Error(
                "Each order item must have a valid order number."
              );
            }
          }

          return true;
        },
      },
    },
  }),
  handleValidationErrors,
];
