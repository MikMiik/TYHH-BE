const { checkSchema } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");

exports.createCourse = [
  checkSchema({
    title: {
      trim: true,
      notEmpty: {
        errorMessage: "Tên khóa học không được để trống.",
      },
      isLength: {
        options: { min: 5, max: 100 },
        errorMessage: "Tên khóa học phải có từ 5 đến 100 ký tự.",
      },
    },
    description: {
      optional: { options: { nullable: true } },
      isLength: {
        options: { max: 500 },
        errorMessage: "Mô tả không được vượt quá 500 ký tự.",
      },
    },
    purpose: {
      optional: { options: { nullable: true } },
      isLength: {
        options: { max: 300 },
        errorMessage: "Mục đích khóa học không được vượt quá 300 ký tự.",
      },
    },
    content: {
      optional: { options: { nullable: true } },
      isLength: {
        options: { max: 1000 },
        errorMessage: "Nội dung chi tiết không được vượt quá 1000 ký tự.",
      },
    },
    group: {
      optional: { options: { nullable: true } },
      isLength: {
        options: { max: 50 },
        errorMessage: "Nhóm khóa học không được vượt quá 50 ký tự.",
      },
    },
    price: {
      optional: { options: { nullable: true } },
      isNumeric: {
        errorMessage: "Giá khóa học phải là số.",
      },
      custom: {
        options: (value, { req }) => {
          if (req.body.isFree === false || req.body.isFree === "false") {
            if (!value && value !== 0) {
              throw new Error(
                "Giá khóa học không được để trống khi không miễn phí."
              );
            }
            if (value < 0) {
              throw new Error("Giá khóa học không được âm.");
            }
            if (value > 50000000) {
              throw new Error(
                "Giá khóa học không được vượt quá 50,000,000 VNĐ."
              );
            }
          }
          return true;
        },
      },
    },
    discount: {
      optional: { options: { nullable: true } },
      isNumeric: {
        errorMessage: "Giảm giá phải là số.",
      },
      custom: {
        options: (value, { req }) => {
          if (req.body.isFree === false || req.body.isFree === "false") {
            if (value && value < 0) {
              throw new Error("Giảm giá không được âm.");
            }
            if (value && req.body.price && value > req.body.price) {
              throw new Error("Giảm giá không được lớn hơn giá gốc.");
            }
          }
          return true;
        },
      },
    },
    isFree: {
      optional: true,
      isBoolean: {
        errorMessage: "Trường miễn phí phải là boolean.",
      },
    },
    topicIds: {
      optional: { options: { nullable: true } },
      custom: {
        options: (value) => {
          if (value) {
            if (!Array.isArray(value)) {
              throw new Error("Danh sách chủ đề phải là mảng.");
            }
            if (value.length === 0) {
              throw new Error("Vui lòng chọn ít nhất một chủ đề.");
            }
            if (value.length > 5) {
              throw new Error("Không được chọn quá 5 chủ đề.");
            }
            for (const id of value) {
              if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
                throw new Error("ID chủ đề không hợp lệ.");
              }
            }
          }
          return true;
        },
      },
    },
    thumbnail: {
      optional: { options: { nullable: true } },
      isString: {
        errorMessage: "Ảnh thumbnail phải là chuỗi.",
      },
    },
  }),
  handleValidationErrors,
];

exports.editCourse = [
  checkSchema({
    title: {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: "Tên khóa học không được để trống.",
      },
      isLength: {
        options: { min: 5, max: 100 },
        errorMessage: "Tên khóa học phải có từ 5 đến 100 ký tự.",
      },
    },
    description: {
      optional: { options: { nullable: true } },
      isLength: {
        options: { max: 500 },
        errorMessage: "Mô tả không được vượt quá 500 ký tự.",
      },
    },
    purpose: {
      optional: { options: { nullable: true } },
      isLength: {
        options: { max: 300 },
        errorMessage: "Mục đích khóa học không được vượt quá 300 ký tự.",
      },
    },
    content: {
      optional: { options: { nullable: true } },
      isLength: {
        options: { max: 1000 },
        errorMessage: "Nội dung chi tiết không được vượt quá 1000 ký tự.",
      },
    },
    group: {
      optional: { options: { nullable: true } },
      isLength: {
        options: { max: 50 },
        errorMessage: "Nhóm khóa học không được vượt quá 50 ký tự.",
      },
    },
    price: {
      optional: { options: { nullable: true } },
      isNumeric: {
        errorMessage: "Giá khóa học phải là số.",
      },
      custom: {
        options: (value, { req }) => {
          if (req.body.isFree === false || req.body.isFree === "false") {
            if (!value && value !== 0) {
              throw new Error(
                "Giá khóa học không được để trống khi không miễn phí."
              );
            }
            if (value < 0) {
              throw new Error("Giá khóa học không được âm.");
            }
            if (value > 50000000) {
              throw new Error(
                "Giá khóa học không được vượt quá 50,000,000 VNĐ."
              );
            }
          }
          return true;
        },
      },
    },
    discount: {
      optional: { options: { nullable: true } },
      isNumeric: {
        errorMessage: "Giảm giá phải là số.",
      },
      custom: {
        options: (value, { req }) => {
          if (req.body.isFree === false || req.body.isFree === "false") {
            if (value && value < 0) {
              throw new Error("Giảm giá không được âm.");
            }
            if (value && req.body.price && value > req.body.price) {
              throw new Error("Giảm giá không được lớn hơn giá gốc.");
            }
          }
          return true;
        },
      },
    },
    isFree: {
      optional: true,
      isBoolean: {
        errorMessage: "Trường miễn phí phải là boolean.",
      },
    },
    status: {
      optional: true,
      isIn: {
        options: [["draft", "published"]],
        errorMessage:
          "Trạng thái không hợp lệ. Chỉ chấp nhận 'draft' hoặc 'published'.",
      },
    },
    topicIds: {
      optional: { options: { nullable: true } },
      custom: {
        options: (value) => {
          if (value) {
            if (!Array.isArray(value)) {
              throw new Error("Danh sách chủ đề phải là mảng.");
            }
            if (value.length === 0) {
              throw new Error("Vui lòng chọn ít nhất một chủ đề.");
            }
            if (value.length > 5) {
              throw new Error("Không được chọn quá 5 chủ đề.");
            }
            for (const id of value) {
              if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
                throw new Error("ID chủ đề không hợp lệ.");
              }
            }
          }
          return true;
        },
      },
    },
    thumbnail: {
      optional: { options: { nullable: true } },
      isString: {
        errorMessage: "Ảnh thumbnail phải là chuỗi.",
      },
    },
  }),
  handleValidationErrors,
];
