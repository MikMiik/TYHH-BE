const { checkSchema } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");

exports.content = [
  checkSchema({
    content: {
      trim: true,
      notEmpty: {
        errorMessage: "Content is required.",
      },
    },
  }),
  handleValidationErrors,
];
