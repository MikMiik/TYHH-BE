const { Livestream, CourseOutline } = require("@/models");
const paymentService = require("@/services/payment.service");

/**
 * Middleware to check if user has access to a course's livestream
 * - Teachers have automatic access
 * - Other users must be enrolled in the course
 */
async function checkCourseAccess(req, res, next) {
  try {
    const { slug } = req.params;

    // Get user info from auth middleware
    const userId = req.userId;
    const isTeacher = req.isTeacher;

    // If user is not authenticated, deny access
    if (!userId) {
      return res.error(401, "Vui lòng đăng nhập để xem livestream");
    }

    // Teachers have automatic access to all courses
    if (isTeacher) {
      return next();
    }

    // Find the livestream with its course information
    const livestream = await Livestream.findOne({
      where: { slug },
      attributes: ["id", "courseOutlineId"],
      include: [
        {
          model: CourseOutline,
          as: "courseOutline",
          attributes: ["id", "courseId"],
          required: true,
        },
      ],
    });

    if (!livestream) {
      return res.error(404, "Không tìm thấy livestream");
    }

    if (!livestream.courseOutline || !livestream.courseOutline.courseId) {
      return res.error(500, "Không thể xác định khóa học của livestream");
    }

    const courseId = livestream.courseOutline.courseId;

    // Check if user is enrolled in the course
    const enrollmentCheck = await paymentService.checkEnrollment(
      userId,
      courseId
    );

    if (!enrollmentCheck.enrolled) {
      return res.error(403, "Bạn cần đăng ký khóa học này để xem livestream");
    }

    // User is enrolled, allow access
    next();
  } catch (error) {
    console.error("Check course access error:", error);
    return res.error(
      500,
      "Có lỗi xảy ra khi kiểm tra quyền truy cập",
      error.message
    );
  }
}

module.exports = checkCourseAccess;
