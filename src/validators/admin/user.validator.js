const { checkSchema } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");
const { User } = require("@/models");

exports.register = [
  checkSchema({
    name: {
      trim: true,
      notEmpty: {
        errorMessage: "Vui lòng nhập họ tên.",
      },
      isLength: {
        options: { min: 2, max: 100 },
        errorMessage: "Họ tên phải có từ 2 đến 100 ký tự.",
      },
    },
    username: {
      trim: true,
      notEmpty: {
        errorMessage: "Vui lòng nhập tên đăng nhập.",
      },
      isLength: {
        options: { min: 3, max: 50 },
        errorMessage: "Tên đăng nhập phải có từ 3 đến 50 ký tự.",
      },
      matches: {
        options: /^[a-zA-Z0-9_]+$/,
        errorMessage:
          "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới.",
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
      normalizeEmail: true,
      custom: {
        options: async (value, { req }) => {
          const count = await User.count({ where: { email: value } });
          if (count > 0) {
            throw new Error("Email đã tồn tại.");
          }
        },
      },
    },
    password: {
      notEmpty: {
        errorMessage: "Vui lòng nhập mật khẩu.",
      },
      isLength: {
        options: { min: 8, max: 128 },
        errorMessage: "Mật khẩu phải có từ 8 đến 128 ký tự.",
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        },
        errorMessage:
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
      },
    },
    role: {
      notEmpty: {
        errorMessage: "Vui lòng chọn vai trò.",
      },
      isIn: {
        options: [["admin", "teacher", "user"]],
        errorMessage:
          "Vai trò không hợp lệ. Chỉ được chọn: admin, teacher, user.",
      },
    },
    // Optional fields for admin creation
    phone: {
      optional: { nullable: true, checkFalsy: true },
      isMobilePhone: {
        options: ["vi-VN"],
        errorMessage: "Số điện thoại không hợp lệ.",
      },
      custom: {
        options: async (value, { req }) => {
          if (value) {
            const count = await User.count({ where: { phone: value } });
            if (count > 0) {
              throw new Error("Số điện thoại đã được sử dụng.");
            }
          }
          return true;
        },
      },
    },
    yearOfBirth: {
      optional: { nullable: true, checkFalsy: true },
      isInt: {
        options: { min: 1900, max: new Date().getFullYear() },
        errorMessage: `Năm sinh phải là số từ 1900 đến ${new Date().getFullYear()}.`,
      },
    },
    city: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 100 },
        errorMessage: "Tên thành phố không được quá 100 ký tự.",
      },
    },
    school: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 200 },
        errorMessage: "Tên trường học không được quá 200 ký tự.",
      },
    },
    facebook: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isURL: {
        options: { protocols: ["http", "https"] },
        errorMessage: "Link Facebook không hợp lệ.",
      },
    },
    avatar: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
    },
  }),
  handleValidationErrors,
];

exports.update = [
  checkSchema({
    name: {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: "Họ tên không được để trống.",
      },
      isLength: {
        options: { min: 2, max: 100 },
        errorMessage: "Họ tên phải có từ 2 đến 100 ký tự.",
      },
    },
    username: {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: "Tên đăng nhập không được để trống.",
      },
      isLength: {
        options: { min: 3, max: 50 },
        errorMessage: "Tên đăng nhập phải có từ 3 đến 50 ký tự.",
      },
      matches: {
        options: /^[a-zA-Z0-9_]+$/,
        errorMessage:
          "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới.",
      },
      custom: {
        options: async (value, { req }) => {
          const userId = req.params.id;
          const count = await User.count({
            where: {
              username: value,
              id: { [require("sequelize").Op.ne]: userId },
            },
          });
          if (count > 0) {
            throw new Error("Tên đăng nhập đã tồn tại.");
          }
        },
      },
    },
    email: {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: "Email không được để trống.",
      },
      isEmail: {
        errorMessage: "Email không hợp lệ.",
      },
      normalizeEmail: true,
      custom: {
        options: async (value, { req }) => {
          const userId = req.params.id;
          const count = await User.count({
            where: {
              email: value,
              id: { [require("sequelize").Op.ne]: userId },
            },
          });
          if (count > 0) {
            throw new Error("Email đã tồn tại.");
          }
        },
      },
    },
    password: {
      optional: true,
      isLength: {
        options: { min: 8, max: 128 },
        errorMessage: "Mật khẩu phải có từ 8 đến 128 ký tự.",
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        },
        errorMessage:
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
      },
    },
    status: {
      optional: true,
      isIn: {
        options: [["active", "inactive", "suspended", "pending"]],
        errorMessage: "Trạng thái không hợp lệ.",
      },
    },
    activeKey: {
      optional: true,
      isBoolean: {
        errorMessage: "ActiveKey phải là boolean.",
      },
    },
    phone: {
      optional: { nullable: true, checkFalsy: true },
      isMobilePhone: {
        options: ["vi-VN"],
        errorMessage: "Số điện thoại không hợp lệ.",
      },
      custom: {
        options: async (value, { req }) => {
          if (value) {
            const userId = req.params.id;
            const count = await User.count({
              where: {
                phone: value,
                id: { [require("sequelize").Op.ne]: userId },
              },
            });
            if (count > 0) {
              throw new Error("Số điện thoại đã được sử dụng.");
            }
          }
          return true;
        },
      },
    },
    yearOfBirth: {
      optional: { nullable: true, checkFalsy: true },
      isInt: {
        options: { min: 1900, max: new Date().getFullYear() },
        errorMessage: `Năm sinh phải là số từ 1900 đến ${new Date().getFullYear()}.`,
      },
    },
    city: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 100 },
        errorMessage: "Tên thành phố không được quá 100 ký tự.",
      },
    },
    school: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 200 },
        errorMessage: "Tên trường học không được quá 200 ký tự.",
      },
    },
    facebook: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isURL: {
        options: { protocols: ["http", "https"] },
        errorMessage: "Link Facebook không hợp lệ.",
      },
    },
  }),
  handleValidationErrors,
];

exports.validateId = [
  checkSchema({
    id: {
      in: ["params"],
      isInt: {
        options: { min: 1 },
        errorMessage: "ID không hợp lệ.",
      },
    },
  }),
  handleValidationErrors,
];
