const { body } = require("express-validator");

exports.create = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("Title must be between 2 and 255 characters"),
];

exports.update = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("Title must be between 2 and 255 characters"),
];
