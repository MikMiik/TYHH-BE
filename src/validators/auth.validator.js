const { checkSchema } = require("express-validator");
const { comparePassword, hashPassword } = require("@/utils/bcrytp");
const sendUnverifiedUserEmail = require("@/utils/sendUnverifiedUserEmail");
const handleValidationErrors = require("./handleValidationErrors");
const userService = require("@/services/user.service");
const { findValidRefreshToken } = require("@/services/refreshToken.service");
const { User } = require("@/models");

exports.register = [
  checkSchema({
    name: {
      trim: true,
      notEmpty: {
        errorMessage: "Vui lòng nhập họ tên.",
      },
    },
    username: {
      trim: true,
      notEmpty: {
        errorMessage: "Vui lòng nhập tên đăng nhập.",
      },
      isLength: {
        options: { min: 3 },
        errorMessage: "Tên đăng nhập phải có ít nhất 3 ký tự.",
      },
      custom: {
        options: async (value, { req }) => {
          const count = await User.count({ where: { username: value } });
          if (count > 0) {
            throw new Error("Tên đăng nhập đã tồn tại.");
          }
        },
      },
    },
    email: {
      trim: true,
      notEmpty: {
        errorMessage: "Vui lòng nhập email.",
      },
      isEmail: {
        errorMessage: "Email không hợp lệ.",
      },
      custom: {
        options: async (value, { req }) => {
          const count = await User.count({ where: { email: value } });
          if (count > 0) {
            throw new Error("Email đã tồn tại.");
          }
        },
      },
    },
    phone: {
      notEmpty: { errorMessage: "Vui lòng nhập số điện thoại." },
      isMobilePhone: {
        options: ["vi-VN"],
        errorMessage: "Số điện thoại không hợp lệ.",
      },
      custom: {
        options: async (value, { req }) => {
          const count = await User.count({ where: { phone: value } });
          if (count > 0) {
            throw new Error("Số điện thoại đã được sử dụng.");
          }
          return true;
        },
      },
    },
    password: {
      notEmpty: {
        errorMessage: "Vui lòng nhập mật khẩu.",
      },
      isStrongPassword: {
        errorMessage:
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
      },
    },

    confirmPassword: {
      notEmpty: {
        errorMessage: "Vui lòng nhập xác nhận mật khẩu.",
      },
      custom: {
        options: async (value, { req }) => value === req.body.password,
        errorMessage: "Mật khẩu xác nhận không khớp.",
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
            throw new Error("Vui lòng nhập email và mật khẩu để đăng nhập");
          }
          const user = await userService.getByEmail(email);
          if (!user || !(await comparePassword(password, user.password))) {
            throw new Error(
              "Đăng nhập thất bại: Thông tin đăng nhập không đúng"
            );
          }
          if (!user.verifiedAt) {
            sendUnverifiedUserEmail(user.id);
            throw new Error(
              "Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản."
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
            throw new Error("Refresh token không hợp lệ");
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
            throw new Error("Email này đã được sử dụng.");
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
        errorMessage: "Vui lòng nhập mật khẩu hiện tại.",
      },
    },
    newPassword: {
      notEmpty: {
        errorMessage: "Vui lòng nhập mật khẩu mới.",
      },
      isStrongPassword: {
        errorMessage:
          "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
      },
    },
    confirmPassword: {
      notEmpty: {
        errorMessage: "Vui lòng nhập xác nhận mật khẩu.",
      },
      custom: {
        options: async (value, { req }) => value === req.body.newPassword,
        errorMessage: "Mật khẩu xác nhận không khớp.",
      },
    },
  }),
  handleValidationErrors,
];
