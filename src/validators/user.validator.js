const { checkSchema } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");
const { User } = require("@/models");
const { Op } = require("sequelize");
const { comparePassword } = require("@/utils/bcrytp");

exports.updateProfile = [
  checkSchema({
    username: {
      trim: true,
      notEmpty: { errorMessage: "Vui lòng nhập tên đăng nhập." },
      isLength: {
        options: { min: 3 },
        errorMessage: "Tên đăng nhập phải có ít nhất 3 ký tự.",
      },
      custom: {
        options: async (value, { req }) => {
          if (!value) return true;
          const count = await User.count({
            where: { username: value, id: { [Op.ne]: req.params.id } },
          });
          if (count > 0) throw new Error("Tên đăng nhập đã tồn tại.");
        },
      },
    },
    email: {
      trim: true,
      notEmpty: { errorMessage: "Vui lòng nhập email." },
      isEmail: { errorMessage: "Email không hợp lệ." },
      custom: {
        options: async (value, { req }) => {
          if (!value) return true;
          const count = await User.count({
            where: { email: value, id: { [Op.ne]: req.params.id } },
          });
          if (count > 0) throw new Error("Email đã tồn tại.");
        },
      },
    },
    name: {
      trim: true,
      notEmpty: { errorMessage: "Vui lòng nhập họ tên." },
    },
    phone: {
      optional: true,
      isMobilePhone: {
        options: ["vi-VN"],
        errorMessage: "Số điện thoại không hợp lệ.",
      },
      custom: {
        options: async (value, { req }) => {
          if (!value) return true;
          const count = await User.count({
            where: { phone: value, id: { [Op.ne]: req.params.id } },
          });
          if (count > 0) throw new Error("Số điện thoại đã được sử dụng.");
          return true;
        },
      },
    },
    facebook: {
      optional: true,
      custom: {
        options: (value) => {
          if (value == null || value === "") return true;
          try {
            new URL(value);
          } catch {
            throw new Error("Link Facebook không hợp lệ.");
          }
          return true;
        },
      },
    },
    yearOfBirth: {
      optional: true,
      custom: {
        options: (value) => {
          if (value == null || value === "") return true;
          if (!/^[0-9]{4}$/.test(value))
            throw new Error("Năm sinh phải có 4 chữ số.");
          return true;
        },
      },
    },
    city: {
      optional: true,
      custom: {
        options: (value) => {
          if (value == null || value === "") return true;
          if (typeof value !== "string")
            throw new Error("Tỉnh/thành không hợp lệ.");
          return true;
        },
      },
    },
    school: {
      optional: true,
      custom: {
        options: (value) => {
          if (value == null || value === "") return true;
          if (typeof value !== "string")
            throw new Error("Trường học không hợp lệ.");
          return true;
        },
      },
    },

    // Password fields: only required/validated when any password field is present
    oldPassword: {
      custom: {
        options: async (value, { req }) => {
          const pwdPresent =
            req.body.oldPassword ||
            req.body.newPassword ||
            req.body.confirmPassword;
          if (pwdPresent && !value)
            throw new Error("Vui lòng nhập mật khẩu cũ.");

          // If password change is requested, verify oldPassword matches stored password
          if (pwdPresent && value) {
            const userId = req.params.id;
            const user = await User.findByPk(userId, {
              attributes: ["password"],
            });
            if (!user) throw new Error("Người dùng không tồn tại.");
            const match = await comparePassword(value, user.password);
            if (!match) throw new Error("Mật khẩu hiện tại không đúng.");
          }

          return true;
        },
      },
    },
    newPassword: {
      custom: {
        options: async (value, { req }) => {
          const pwdPresent =
            req.body.oldPassword ||
            req.body.newPassword ||
            req.body.confirmPassword;

          // If no password fields present, skip validation
          if (!pwdPresent) return true;

          // Require newPassword when a password change is requested
          if (!value) throw new Error("Vui lòng nhập mật khẩu mới.");

          // Strength checks (mirror isStrongPassword requirements)
          const errors = [];
          if (value.length < 8) errors.push("ít nhất 8 ký tự");
          if (!/[0-9]/.test(value)) errors.push("một số");
          if (!/[a-z]/.test(value)) errors.push("một chữ cái thường");
          if (!/[A-Z]/.test(value)) errors.push("một chữ cái hoa");
          if (!/[^\w]/.test(value)) errors.push("một ký tự đặc biệt");

          if (errors.length > 0) {
            throw new Error(`Mật khẩu mới phải có: ${errors.join(", ")}`);
          }

          return true;
        },
      },
    },
    confirmPassword: {
      custom: {
        options: async (value, { req }) => {
          const pwdPresent =
            req.body.oldPassword ||
            req.body.newPassword ||
            req.body.confirmPassword;
          if (pwdPresent && value !== req.body.newPassword)
            throw new Error("Mật khẩu xác nhận không khớp.");
          return true;
        },
      },
    },
  }),

  handleValidationErrors,
];
