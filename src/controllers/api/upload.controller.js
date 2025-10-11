const path = require("path");
const fs = require("fs").promises;

exports.upload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.error(400, "No file uploaded");
    }

    const baseURL = process.env.BASE_URL;

    // Simple path like BlogkApi - just uploads/filename
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
    res.error(500, error.message || "File upload failed");
  }
};
