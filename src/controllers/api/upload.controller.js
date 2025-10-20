const fs = require("fs").promises;
const fsSync = require("fs"); // Dùng fs sync cho một vài thao tác đơn giản
const ffmpeg = require("fluent-ffmpeg");

exports.upload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.error(400, "No file uploaded");
    }

    // --- BẮT ĐẦU LOGIC TỐI ƯU HÓA VIDEO ---

    // Chỉ xử lý nếu file được upload là video
    if (file.mimetype.startsWith("video/")) {
      console.log(`Phát hiện file video. Bắt đầu tối ưu hóa: ${file.path}`);

      const originalPath = file.path;
      const tempFixedPath = `${originalPath}-fixed.mp4`;

      // 1. Dùng Promise để bao bọc tiến trình ffmpeg cho tương thích với async/await
      await new Promise((resolve, reject) => {
        ffmpeg(originalPath)
          .outputOptions([
            "-movflags +faststart",
            "-acodec copy",
            "-vcodec copy",
          ])
          .on("end", () => {
            console.log("Tối ưu hóa video thành công!");
            resolve(); // Báo cho Promise là đã thành công
          })
          .on("error", (err) => {
            console.error("Lỗi khi xử lý ffmpeg:", err.message);
            reject(err); // Báo cho Promise là đã thất bại
          })
          .save(tempFixedPath);
      });

      // 2. Dọn dẹp: Thay thế file gốc bằng file đã tối ưu
      await fs.unlink(originalPath); // Xóa file gốc
      await fs.rename(tempFixedPath, originalPath); // Đổi tên file đã sửa thành tên gốc
      console.log(`Đã thay thế file gốc bằng file đã tối ưu hóa.`);
    }

    // --- KẾT THÚC LOGIC TỐI ƯU HÓA ---

    // Trả về thông tin file như bình thường
    const baseURL = process.env.BASE_URL;
    const fileUrl = `${baseURL}/uploads/${req.file.filename}`;

    res.success(200, {
      url: fileUrl,
      filePath: `uploads/${req.file.filename}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error("Upload error:", error);
    // Dọn dẹp file đã upload nếu có lỗi xảy ra trong quá trình xử lý
    if (req.file && fsSync.existsSync(req.file.path)) {
      fsSync.unlinkSync(req.file.path);
    }
    res.error(500, error.message || "File upload failed");
  }
};
