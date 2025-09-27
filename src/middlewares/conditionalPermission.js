const { requirePermission } = require("./checkPermission");

/**
 * Conditional permission middleware
 * Nếu user không có authentication (public access) thì skip permission check
 * Nếu user đã authenticate thì check permission như bình thường
 *
 * @param {string|Array} requiredPermissions - Permission cần thiết
 * @param {Object} options - Tùy chọn bổ sung
 * @returns {Function} Middleware function
 */
function conditionalRequirePermission(requiredPermissions, options = {}) {
  return async (req, res, next) => {
    try {
      // Nếu không có user (public access), skip permission check
      if (!req.user || !req.userId) {
        // Log for analytics/tracking purposes
        const permissions = Array.isArray(requiredPermissions)
          ? requiredPermissions.join(", ")
          : requiredPermissions;
        console.log(`🌍 Public access to endpoint requiring: ${permissions}`);

        // Optional: Track public access for analytics
        if (options.trackPublicAccess) {
          // TODO: Implement analytics tracking
          console.log(`📊 Tracking public access: ${req.method} ${req.path}`);
        }

        return next();
      }

      // Nếu có user, check permission như bình thường
      console.log(
        `🔒 Authenticated access - checking permission: ${requiredPermissions}`
      );
      return requirePermission(requiredPermissions, options)(req, res, next);
    } catch (error) {
      console.error("Conditional permission check error:", error);
      return res.error(500, "Permission check failed");
    }
  };
}

/**
 * Hybrid middleware: Optional auth + conditional permission
 * Useful for endpoints that can work with both public and authenticated users
 * but want different behavior based on auth status
 *
 * @param {string} permission - Permission required for authenticated users
 * @param {Object} options - Options including handlers for different states
 * @returns {Function} Middleware function
 */
function optionalAuthWithPermission(permission, options = {}) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.userId) {
        // Public access - call onPublicAccess handler if provided
        if (options.onPublicAccess) {
          options.onPublicAccess(req, res);
        }
        console.log(`🌍 Public access to ${permission}-protected endpoint`);
        return next();
      }

      // Authenticated access - check permission and call handler if provided
      if (options.onAuthenticatedAccess) {
        options.onAuthenticatedAccess(req, res);
      }

      console.log(`🔒 Authenticated access - checking ${permission}`);
      return requirePermission(permission, options)(req, res, next);
    } catch (error) {
      console.error("Optional auth with permission error:", error);
      return res.error(500, "Permission check failed");
    }
  };
}

/**
 * Permission middleware cho public endpoints với optional user enhancement
 * Cho phép public access nhưng enhance experience nếu user đã login
 *
 * @param {string} publicPermission - Permission để track public access
 * @param {string} userPermission - Permission cho authenticated users (nếu khác)
 * @returns {Function} Middleware function
 */
function publicWithUserEnhancement(publicPermission, userPermission = null) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.userId) {
        // Public access
        console.log(`🌍 Public access tracked: ${publicPermission}`);
        req.accessType = "public";
        req.trackedPermission = publicPermission;
        return next();
      }

      // Authenticated user - use user permission or fall back to public
      const permissionToCheck = userPermission || publicPermission;
      console.log(`👤 User access with permission: ${permissionToCheck}`);
      req.accessType = "authenticated";
      req.trackedPermission = permissionToCheck;

      return requirePermission(permissionToCheck)(req, res, next);
    } catch (error) {
      console.error("Public with user enhancement error:", error);
      return res.error(500, "Permission check failed");
    }
  };
}

module.exports = {
  conditionalRequirePermission,
  optionalAuthWithPermission,
  publicWithUserEnhancement,
};
