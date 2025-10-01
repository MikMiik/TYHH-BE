const { checkSchema } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");
const { Course, CourseOutline } = require("@/models");

exports.create = [
  checkSchema({
    title: {
      trim: true,
      notEmpty: {
        errorMessage: "Title is required",
      },
      isLength: {
        options: { min: 3, max: 255 },
        errorMessage: "Title must be between 3 and 255 characters",
      },
    },
    courseId: {
      notEmpty: {
        errorMessage: "Course ID is required",
      },
      isInt: {
        options: { min: 1 },
        errorMessage: "Course ID must be a positive integer",
      },
      custom: {
        options: async (value) => {
          if (value) {
            const course = await Course.findByPk(value);
            if (!course) {
              throw new Error("Course not found");
            }
          }
          return true;
        },
      },
    },
    courseOutlineId: {
      notEmpty: {
        errorMessage: "Course Outline ID is required",
      },
      isInt: {
        options: { min: 1 },
        errorMessage: "Course Outline ID must be a positive integer",
      },
      custom: {
        options: async (value) => {
          if (value) {
            const courseOutline = await CourseOutline.findByPk(value);
            if (!courseOutline) {
              throw new Error("Course Outline not found");
            }
          }
          return true;
        },
      },
    },
  }),
  handleValidationErrors,
];

exports.update = [
  checkSchema({
    title: {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: "Title cannot be empty",
      },
      isLength: {
        options: { min: 3, max: 255 },
        errorMessage: "Title must be between 3 and 255 characters",
      },
    },
    courseId: {
      optional: true,
      isInt: {
        options: { min: 1 },
        errorMessage: "Course ID must be a positive integer",
      },
      custom: {
        options: async (value) => {
          if (value) {
            const course = await Course.findByPk(value);
            if (!course) {
              throw new Error("Course not found");
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
        errorMessage: "Course Outline ID must be a positive integer",
      },
      custom: {
        options: async (value, { req }) => {
          if (value) {
            const courseOutline = await CourseOutline.findByPk(value);
            if (!courseOutline) {
              throw new Error("Course Outline not found");
            }

            // If courseId is also being updated, validate relationship
            if (req.body.courseId) {
              if (courseOutline.courseId !== parseInt(req.body.courseId)) {
                throw new Error(
                  "Course Outline does not belong to the specified course"
                );
              }
            }
          }
          return true;
        },
      },
    },
  }),
  handleValidationErrors,
];
