/**
 * Middleware kiểm tra quyền sở hữu (ownership) của user
 * Đảm bảo user chỉ có thể thao tác với dữ liệu của chính mình
 */

/**
 * Kiểm tra user chỉ có thể thao tác với profile của chính mình
 * @param {string} paramName - Tên parameter chứa ID cần kiểm tra (mặc định: 'id')
 * @returns {Function} Middleware function
 */
function validateUserOwnership(paramName = "id") {
  return (req, res, next) => {
    try {
      // Kiểm tra user đã được authenticate chưa
      if (!req.user || !req.userId) {
        return res.error(401, "Authentication required");
      }

      // Lấy ID từ params
      const resourceId = req.params[paramName];

      if (!resourceId) {
        return res.error(400, `Missing parameter: ${paramName}`);
      }

      // Chuyển đổi sang number để so sánh (nếu cần)
      const resourceIdNum = parseInt(resourceId, 10);
      const userIdNum = parseInt(req.userId, 10);

      // Kiểm tra ownership
      if (resourceIdNum !== userIdNum) {
        return res.error(
          403,
          "Access denied. You can only access your own resources"
        );
      }

      next();
    } catch (error) {
      console.error("Ownership validation error:", error);
      return res.error(500, "Ownership validation failed");
    }
  };
}

/**
 * Kiểm tra user có quyền thao tác với course
 * (Sử dụng khi có enrollment system)
 * @param {string} paramName - Tên parameter chứa course ID
 * @returns {Function} Middleware function
 */
function validateCourseAccess(paramName = "id") {
  return async (req, res, next) => {
    try {
      // Kiểm tra authentication
      if (!req.user || !req.userId) {
        return res.error(401, "Authentication required");
      }

      const courseId = req.params[paramName];

      if (!courseId) {
        return res.error(400, `Missing parameter: ${paramName}`);
      }

      // TODO: Implement course enrollment check
      // const hasAccess = await checkCourseEnrollment(req.userId, courseId);
      // if (!hasAccess) {
      //   return res.error(403, "Access denied. You must be enrolled in this course");
      // }

      next();
    } catch (error) {
      console.error("Course access validation error:", error);
      return res.error(500, "Course access validation failed");
    }
  };
}

/**
 * Kiểm tra user có quyền thao tác với livestream
 * (Sử dụng khi có enrollment system)
 * @param {string} paramName - Tên parameter chứa livestream ID
 * @returns {Function} Middleware function
 */
function validateLivestreamAccess(paramName = "id") {
  return async (req, res, next) => {
    try {
      // Kiểm tra authentication
      if (!req.user || !req.userId) {
        return res.error(401, "Authentication required");
      }

      const livestreamId = req.params[paramName];

      if (!livestreamId) {
        return res.error(400, `Missing parameter: ${paramName}`);
      }

      // TODO: Implement livestream access check
      // const hasAccess = await checkLivestreamAccess(req.userId, livestreamId);
      // if (!hasAccess) {
      //   return res.error(403, "Access denied. You don't have access to this livestream");
      // }

      next();
    } catch (error) {
      console.error("Livestream access validation error:", error);
      return res.error(500, "Livestream access validation failed");
    }
  };
}

/**
 * Flexible ownership validator - có thể custom logic kiểm tra
 * @param {Function} validatorFn - Function nhận (req, resourceId, userId) và return boolean
 * @param {string} paramName - Tên parameter chứa resource ID
 * @returns {Function} Middleware function
 */
function validateOwnership(validatorFn, paramName = "id") {
  return async (req, res, next) => {
    try {
      // Kiểm tra authentication
      if (!req.user || !req.userId) {
        return res.error(401, "Authentication required");
      }

      const resourceId = req.params[paramName];

      if (!resourceId) {
        return res.error(400, `Missing parameter: ${paramName}`);
      }

      // Gọi custom validator function
      const hasAccess = await validatorFn(req, resourceId, req.userId);

      if (!hasAccess) {
        return res.error(
          403,
          "Access denied. You don't have permission to access this resource"
        );
      }

      next();
    } catch (error) {
      console.error("Custom ownership validation error:", error);
      return res.error(500, "Ownership validation failed");
    }
  };
}

module.exports = {
  validateUserOwnership,
  validateCourseAccess,
  validateLivestreamAccess,
  validateOwnership,
};
