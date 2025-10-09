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
