// Middleware kiểm tra quyền sở hữu - sử dụng sau requirePermission()

function validateUserOwnership(paramName = "id") {
  return (req, res, next) => {
    try {
      if (req.isAdmin) return next();

      const resourceId = parseInt(req.params[paramName], 10);
      const userId = parseInt(req.userId, 10);

      if (isNaN(resourceId) || isNaN(userId)) {
        return res.error(400, "Invalid ID format");
      }

      if (resourceId !== userId) {
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

module.exports = {
  validateUserOwnership,
};
