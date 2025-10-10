const { checkSchema } = require("express-validator");
const { User } = require("@/models");
const handleValidationErrors = require("./handleValidationErrors");

// Create notification validation
exports.create = [
  checkSchema({
    title: {
      title: {
        trim: true,
        notEmpty: {
          errorMessage: "Title is required.",
        },
        isLength: {
          options: { min: 1, max: 191 },
          errorMessage: "Title must be between 1 and 191 characters.",
        },
      },
      message: {
        optional: true,
        isLength: {
          options: { max: 5000 },
          errorMessage: "Message must not exceed 5000 characters.",
        },
      },
      teacherId: {
        notEmpty: {
          errorMessage: "Teacher ID is required.",
        },
        isInt: {
          options: { min: 1 },
          errorMessage: "Teacher ID must be a positive integer.",
        },
        custom: {
          options: async (value) => {
            const teacher = await User.findByPk(value);
            if (!teacher) {
              throw new Error("Teacher not found.");
            }
            return true;
          },
        },
      },
    },
  }),
  handleValidationErrors,
];

// Get notifications by teacher validation
exports.getByTeacher = [
  checkSchema({
    teacherId: {
      in: ["params"],
      notEmpty: {
        errorMessage: "Teacher ID is required.",
      },
      isInt: {
        options: { min: 1 },
        errorMessage: "Teacher ID must be a positive integer.",
      },
      custom: {
        options: async (value) => {
          const teacher = await User.findByPk(value);
          if (!teacher) {
            throw new Error("Teacher not found.");
          }
          return true;
        },
      },
    },
  }),
  handleValidationErrors,
];

// Delete notification validation
exports.delete = [
  checkSchema({
    id: {
      in: ["params"],
      notEmpty: {
        errorMessage: "Notification ID is required.",
      },
      isInt: {
        options: { min: 1 },
        errorMessage: "Notification ID must be a positive integer.",
      },
    },
  }),
  handleValidationErrors,
];

// Mark notification as read validation
exports.markAsRead = [
  checkSchema({
    id: {
      in: ["params"],
      notEmpty: {
        errorMessage: "Notification ID is required.",
      },
      isInt: {
        options: { min: 1 },
        errorMessage: "Notification ID must be a positive integer.",
      },
    },
  }),
  handleValidationErrors,
];
