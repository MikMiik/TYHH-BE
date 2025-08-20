const { checkSchema } = require("express-validator");
const { comparePassword, hashPassword } = require("@/utils/bcrytp");
const sendUnverifiedUserEmail = require("@/utils/sendUnverifiedUserEmail");
const handleValidationErrors = require("./handleValidationErrors");
const userService = require("@/services/user.service");
const { findValidRefreshToken } = require("@/services/refreshToken.service");
const { User } = require("@/models");

exports.register = [
  checkSchema({
    firstName: {
      trim: true,
      notEmpty: {
        errorMessage: "Registration failed: Please enter your first name.",
      },
    },
    lastName: {
      trim: true,
      notEmpty: {
        errorMessage: "Registration failed: Please enter your last name.",
      },
    },
    email: {
      trim: true,
      notEmpty: {
        errorMessage: "Registration failed: Please enter your email.",
      },
      isEmail: {
        errorMessage: "Registration failed: Not a valid e-mail address.",
      },
      custom: {
        options: async (value, { req }) => {
          const user = await userService.getByEmail(value);
          if (user) {
            throw new Error(
              "Registration failed: This email has already existed."
            );
          }
        },
      },
    },

    password: {
      notEmpty: {
        errorMessage: "Registration failed: Please enter your password.",
      },
      isStrongPassword: {
        errorMessage:
          "Registration failed: Password must contain at least 8 characters, including uppercase, lowercase, number, and symbol.",
      },
    },

    confirmPassword: {
      notEmpty: {
        errorMessage:
          "Registration failed: Please enter your confirm password.",
      },
      custom: {
        options: async (value, { req }) => value === req.body.password,
        errorMessage: "Registration failed: Passwords do not match.",
      },
    },

    agreeToTerms: {
      custom: {
        options: (value) => {
          return value === true || value === "true";
        },
        errorMessage: "Registration failed: You must agree to the terms.",
      },
    },
  }),

  handleValidationErrors,
];

exports.login = [
  checkSchema({
    validation: {
      custom: {
        options: async (value, { req }) => {
          const { email, password } = req.body;
          if (!email || !password) {
            throw new Error("Please enter your email and password to login");
          }
          const user = await userService.getByEmail(email);
          if (!user || !(await comparePassword(password, user.password))) {
            throw new Error("Login failed: Invalid login information");
          }
          if (!user.verifiedAt) {
            sendUnverifiedUserEmail(user.id);
            throw new Error(
              "Your account is not verified. Please check the link we sent to your email to verify."
            );
          }
        },
      },
    },
  }),
  handleValidationErrors,
];

exports.refreshToken = [
  checkSchema({
    refreshToken: {
      custom: {
        options: async (value) => {
          const result = await findValidRefreshToken(value);
          if (!result) {
            throw new Error("Refresh token invalid");
          }
        },
      },
    },
  }),
  handleValidationErrors,
];

exports.changeEmail = [
  checkSchema({
    newEmail: {
      trim: true,
      notEmpty: {
        errorMessage: "Please enter your new email.",
      },
      isEmail: {
        errorMessage: "Not a valid e-mail address.",
      },
      custom: {
        options: async (value, { req }) => {
          const user = await userService.getByEmail(value);
          if (user) {
            throw new Error(
              "Registration error: This email has already existed"
            );
          }
        },
      },
    },
  }),
  handleValidationErrors,
];

exports.changePassword = [
  checkSchema({
    currentPassword: {
      notEmpty: {
        errorMessage: "Current password is required",
      },
    },
    newPassword: {
      notEmpty: {
        errorMessage: "New password is required",
      },
      isStrongPassword: {
        errorMessage:
          "New password must contain at least 8 characters, including uppercase, lowercase, number, and symbol.",
      },
    },
    confirmPassword: {
      notEmpty: {
        errorMessage: "Confirm password is required",
      },
      custom: {
        options: async (value, { req }) => value === req.body.newPassword,
        errorMessage: "Passwords do not match",
      },
    },
  }),
  handleValidationErrors,
];
