const { checkSchema } = require("express-validator");
const { Course, CourseOutline } = require("@/models");
const handleValidationErrors = require("./handleValidationErrors");

// Create livestream validation for public API
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
        options: { min: 1 },
        errorMessage: "Course ID must be a positive integer.",
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
    courseOutlineId: {
      notEmpty: {
        errorMessage: "Course Outline ID is required.",
      },
      isInt: {
        options: { min: 1 },
        errorMessage: "Course Outline ID must be a positive integer.",
      },
      custom: {
        options: async (value, { req }) => {
          const courseOutline = await CourseOutline.findByPk(value);
          if (!courseOutline) {
            throw new Error("Course Outline not found.");
          }

          // Validate that courseOutline belongs to the course
          if (
            req.body.courseId &&
            courseOutline.courseId !== parseInt(req.body.courseId)
          ) {
            throw new Error(
              "Course Outline does not belong to the specified course."
            );
          }

          return true;
        },
      },
    },
    url: {
      optional: true,
      custom: {
        options: (value) => {
          if (!value) return true;

          // Allow relative paths (starts with /) or full URLs
          if (
            typeof value === "string" &&
            (value.startsWith("/") || value.match(/^https?:\/\//))
          ) {
            return true;
          }

          throw new Error(
            "URL must be a valid URL or relative path starting with '/'."
          );
        },
      },
    },
  }),
  handleValidationErrors,
];

// Update livestream validation for public API
exports.update = [
  checkSchema({
    title: {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: "Title cannot be empty.",
      },
      isLength: {
        options: { min: 3, max: 255 },
        errorMessage: "Title must be between 3 and 255 characters.",
      },
    },
    courseId: {
      optional: true,
      isInt: {
        options: { min: 1 },
        errorMessage: "Course ID must be a positive integer.",
      },
      custom: {
        options: async (value) => {
          if (value) {
            const course = await Course.findByPk(value);
            if (!course) {
              throw new Error("Course not found.");
            }
          }
          return true;
        },
      },
    },
    courseOutlineId: {
      optional: true,
      isInt: {
        options: { min: 1 },
        errorMessage: "Course Outline ID must be a positive integer.",
      },
      custom: {
        options: async (value, { req }) => {
          if (value) {
            const courseOutline = await CourseOutline.findByPk(value);
            if (!courseOutline) {
              throw new Error("Course Outline not found.");
            }

            // Validate that courseOutline belongs to the course
            if (
              req.body.courseId &&
              courseOutline.courseId !== parseInt(req.body.courseId)
            ) {
              throw new Error(
                "Course Outline does not belong to the specified course."
              );
            }
          }
          return true;
        },
      },
    },
    order: {
      optional: true,
      isInt: {
        options: { min: 1 },
        errorMessage: "Order must be a positive integer.",
      },
    },
  }),
  handleValidationErrors,
];

// Delete livestream validation (for ID parameter)
exports.delete = [
  checkSchema({
    id: {
      in: ["params"],
      isInt: {
        options: { min: 1 },
        errorMessage: "Livestream ID must be a positive integer.",
      },
    },
  }),
  handleValidationErrors,
];

// Reorder livestreams validation
exports.reorder = [
  checkSchema({
    courseOutlineId: {
      notEmpty: {
        errorMessage: "Course Outline ID is required.",
      },
      isInt: {
        options: { min: 1 },
        errorMessage: "Course Outline ID must be a positive integer.",
      },
      custom: {
        options: async (value) => {
          const courseOutline = await CourseOutline.findByPk(value);
          if (!courseOutline) {
            throw new Error("Course Outline not found.");
          }
          return true;
        },
      },
    },
    orders: {
      isArray: {
        errorMessage: "Orders must be an array.",
      },
      custom: {
        options: (value) => {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("Orders array cannot be empty.");
          }

          for (const item of value) {
            if (!item.id || !Number.isInteger(item.id) || item.id <= 0) {
              throw new Error(
                "Each order item must have a valid positive integer ID."
              );
            }
            if (
              !item.order ||
              !Number.isInteger(item.order) ||
              item.order <= 0
            ) {
              throw new Error(
                "Each order item must have a valid positive integer order."
              );
            }
          }

          // Check for duplicate IDs
          const ids = value.map((item) => item.id);
          if (new Set(ids).size !== ids.length) {
            throw new Error("Duplicate livestream IDs are not allowed.");
          }

          // Check for duplicate orders
          const orders = value.map((item) => item.order);
          if (new Set(orders).size !== orders.length) {
            throw new Error("Duplicate order values are not allowed.");
          }

          return true;
        },
      },
    },
  }),
  handleValidationErrors,
];

// Get livestream validation (for slug parameter)
exports.getBySlug = [
  checkSchema({
    slug: {
      in: ["params"],
      trim: true,
      notEmpty: {
        errorMessage: "Slug is required.",
      },
      isLength: {
        options: { min: 1, max: 255 },
        errorMessage: "Slug must be between 1 and 255 characters.",
      },
    },
  }),
  handleValidationErrors,
];
