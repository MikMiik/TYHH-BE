const { validationResult } = require("express-validator");

const handleValidationErrors = async (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formatted = errors.array({
    onlyFirstError: true,
  })[0]?.msg;
  return res.error(401, formatted);
};

module.exports = handleValidationErrors;
