const { checkSchema } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");
const { Course } = require("@/models");

exports.create = [
  checkSchema({
    title: {
      trim: true,
      notEmpty: {
        errorMessage: "Tiêu đề outline không được để trống.",
      },
      isLength: {
        options: { min: 3, max: 255 },
        errorMessage: "Tiêu đề outline phải có từ 3 đến 255 ký tự.",
      },
    },
  }),
  handleValidationErrors,
];

exports.update = [
  checkSchema({
    title: {
      optional: { nullable: false, checkFalsy: false },
      trim: true,
      notEmpty: {
        errorMessage: "Tiêu đề outline không được để trống.",
      },
      isLength: {
        options: { min: 3, max: 255 },
        errorMessage: "Tiêu đề outline phải có từ 3 đến 255 ký tự.",
      },
    },
  }),
  handleValidationErrors,
];
