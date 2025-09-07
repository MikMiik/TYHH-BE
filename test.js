const axios = require("axios");
const { City, sequelize } = require("./src/models");
const { Course } = require("./src/models");

async function fetchAndSaveProvinces() {
  try {
    const res = await axios.get("https://api.vnappmob.com/api/v2/province/");
    const provinces = res.data && res.data.results ? res.data.results : [];
    if (!Array.isArray(provinces)) throw new Error("API response invalid");

    await sequelize.transaction(async (t) => {
      for (const province of provinces) {
        if (province.province_name) {
          await City.findOrCreate({
            where: { name: province.province_name },
            defaults: { name: province.province_name },
            transaction: t,
          });
        }
      }
    });
    console.log("Đã lưu xong danh sách tỉnh/thành phố!");
  } catch (err) {
    console.error("Lỗi:", err.message);
  } finally {
    await sequelize.close();
  }
}

// Hàm lưu content vào trường content của bảng courses
async function saveCourseContent(courseId) {
  // Thay thế đoạn này bằng nội dung bạn muốn lưu
  const content = `Chào mừng em đến với Khóa Vận Dụng Cao 9+ (VDC9+ năm 2026 dành cho LOVEVIP2K8)! Để học tốt khóa này, yêu cầu các em phải học chắc kiến thức nền tảng trong khóa chuyên đề LIVE T trước. Khóa VDC9+ sẽ tập trung vào các dạng bài Lý thuyết + Bài tập có thể xuất hiện trong các kỳ thi tốt nghiệp THPT + ĐGNL + ĐGTD! Thầy chúc các em học tốt nhé! Tự Học - TỰ LẬP - Tự Do!`;
  try {
    const course = await Course.findByPk(courseId);
    if (!course) throw new Error("Không tìm thấy course với id: " + courseId);
    course.content = content;
    await course.save();
    console.log("Đã lưu content cho course id:", courseId);
  } catch (err) {
    console.error("Lỗi:", err.message);
  }
}

saveCourseContent(1);
