const { checkSchema } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");
const { User } = require("@/models");

exports.create = [
  checkSchema({
    title: {
      trim: true,
      notEmpty: {
        errorMessage: "Tiêu đề khóa học không được để trống.",
      },
      isLength: {
        options: { min: 3, max: 255 },
        errorMessage: "Tiêu đề khóa học phải có từ 3 đến 255 ký tự.",
      },
    },
    description: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 1000 },
        errorMessage: "Mô tả không được quá 1000 ký tự.",
      },
    },
    teacherId: {
      optional: { nullable: true, checkFalsy: true },
      isInt: {
        options: { min: 1 },
        errorMessage: "ID giáo viên phải là số nguyên dương.",
      },
      custom: {
        options: async (value) => {
          if (value) {
            const teacher = await User.findByPk(value);
            if (!teacher) {
              throw new Error("Giáo viên không tồn tại.");
            }
          }
          return true;
        },
      },
    },
    price: {
      optional: { nullable: true, checkFalsy: true },
      isFloat: {
        options: { min: 0, max: 999999999.99 },
        errorMessage: "Giá khóa học phải là số từ 0 đến 999,999,999.99.",
      },
      custom: {
        options: (value, { req }) => {
          // If course is free, price should not be set
          if (req.body.isFree && value) {
            throw new Error("Khóa học miễn phí không được có giá.");
          }
          return true;
        },
      },
    },
    discount: {
      optional: { nullable: true, checkFalsy: true },
      isFloat: {
        options: { min: 0, max: 999999999.99 },
        errorMessage: "Giá giảm giá phải là số từ 0 đến 999,999,999.99.",
      },
      custom: {
        options: (value, { req }) => {
          if (
            value &&
            req.body.price &&
            parseFloat(value) >= parseFloat(req.body.price)
          ) {
            throw new Error("Giá giảm giá phải nhỏ hơn giá gốc.");
          }
          return true;
        },
      },
    },
    isFree: {
      optional: true,
      isBoolean: {
        errorMessage: "Trường 'miễn phí' phải là true hoặc false.",
      },
    },
    purpose: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 255 },
        errorMessage: "Mục đích khóa học không được quá 255 ký tự.",
      },
    },
    group: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 255 },
        errorMessage: "Nhóm/danh mục khóa học không được quá 255 ký tự.",
      },
      matches: {
        options: /^[a-zA-Z0-9\sÀ-ỹ\-_.,()&]+$/u,
        errorMessage:
          "Nhóm khóa học chỉ được chứa chữ cái, số, khoảng trắng và các ký tự đặc biệt thông thường.",
      },
    },
    content: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 10000 },
        errorMessage: "Nội dung khóa học không được quá 10,000 ký tự.",
      },
    },
    thumbnail: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 255 },
        errorMessage: "Đường dẫn thumbnail không được quá 255 ký tự.",
      },
    },
    introVideo: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 255 },
        errorMessage: "Đường dẫn video giới thiệu không được quá 255 ký tự.",
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
        errorMessage: "Tiêu đề khóa học không được để trống.",
      },
      isLength: {
        options: { min: 3, max: 255 },
        errorMessage: "Tiêu đề khóa học phải có từ 3 đến 255 ký tự.",
      },
    },
    description: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 1000 },
        errorMessage: "Mô tả không được quá 1000 ký tự.",
      },
    },
    teacherId: {
      optional: { nullable: true, checkFalsy: true },
      isInt: {
        options: { min: 1 },
        errorMessage: "ID giáo viên phải là số nguyên dương.",
      },
      custom: {
        options: async (value) => {
          if (value) {
            const teacher = await User.findByPk(value);
            if (!teacher) {
              throw new Error("Giáo viên không tồn tại.");
            }
          }
          return true;
        },
      },
    },
    price: {
      optional: { nullable: true, checkFalsy: true },
      isFloat: {
        options: { min: 0, max: 999999999.99 },
        errorMessage: "Giá khóa học phải là số từ 0 đến 999,999,999.99.",
      },
      custom: {
        options: (value, { req }) => {
          // If course is free, price should not be set
          if (req.body.isFree && value) {
            throw new Error("Khóa học miễn phí không được có giá.");
          }
          return true;
        },
      },
    },
    discount: {
      optional: { nullable: true, checkFalsy: true },
      isFloat: {
        options: { min: 0, max: 999999999.99 },
        errorMessage: "Giá giảm giá phải là số từ 0 đến 999,999,999.99.",
      },
      custom: {
        options: (value, { req }) => {
          if (
            value &&
            req.body.price &&
            parseFloat(value) >= parseFloat(req.body.price)
          ) {
            throw new Error("Giá giảm giá phải nhỏ hơn giá gốc.");
          }
          return true;
        },
      },
    },
    isFree: {
      optional: true,
      isBoolean: {
        errorMessage: "Trường 'miễn phí' phải là true hoặc false.",
      },
    },
    purpose: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 255 },
        errorMessage: "Mục đích khóa học không được quá 255 ký tự.",
      },
    },
    group: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 255 },
        errorMessage: "Nhóm/danh mục khóa học không được quá 255 ký tự.",
      },
      matches: {
        options: /^[a-zA-Z0-9\sÀ-ỹ\-_.,()&]+$/u,
        errorMessage:
          "Nhóm khóa học chỉ được chứa chữ cái, số, khoảng trắng và các ký tự đặc biệt thông thường.",
      },
    },
    content: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 10000 },
        errorMessage: "Nội dung khóa học không được quá 10,000 ký tự.",
      },
    },
    thumbnail: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 255 },
        errorMessage: "Đường dẫn thumbnail không được quá 255 ký tự.",
      },
    },
    introVideo: {
      optional: { nullable: true, checkFalsy: true },
      trim: true,
      isLength: {
        options: { max: 255 },
        errorMessage: "Đường dẫn video giới thiệu không được quá 255 ký tự.",
      },
    },
  }),
  handleValidationErrors,
];
