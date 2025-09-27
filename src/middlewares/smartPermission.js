const { requirePermission } = require("./checkPermission");
const isPublicRoute = require("../configs/publicPaths");

/**
 * Smart Permission Middleware - Hybrid approach
 * Tự động detect public/private routes và apply permission phù hợp
 *
 * Luồng hoạt động:
 * 1. Check publicPaths để determine public/private
 * 2. Nếu public + no user → allow access (no permission check)
 * 3. Nếu public + có user → check permission (for analytics/tracking)
 * 4. Nếu private → check permission (required)
 *
 * @param {string|Array} permission - Permission cần thiết
 * @param {Object} options - Tùy chọn bổ sung
 * @returns {Function} Middleware function
 */
function smartPermission(permission, options = {}) {
  return async (req, res, next) => {
    try {
      // Sử dụng publicPaths để determine route type
      const isPublic = isPublicRoute(req.path, req.method);

      if (isPublic) {
        // PUBLIC ROUTE
        if (!req.user || !req.userId) {
          // No user authentication → Allow public access
          console.log(
            `🌍 Public access: ${req.method} ${req.path} (${permission})`
          );

          // Optional: Track public access for analytics
          if (options.trackPublicAccess) {
            console.log(`📊 Tracking public access to ${permission}`);
          }

          return next();
        } else {
          // User authenticated on public route → Check permission for enhanced experience
          console.log(
            `👤 Authenticated user on public route: ${req.method} ${req.path} (${permission})`
          );
          return requirePermission(permission, options)(req, res, next);
        }
      } else {
        // PRIVATE ROUTE - Always require permission
        console.log(
          `🔒 Private route: ${req.method} ${req.path} (${permission})`
        );

        if (!req.user || !req.userId) {
          return res.error(401, "Authentication required for private route");
        }

        return requirePermission(permission, options)(req, res, next);
      }
    } catch (error) {
      console.error("Smart permission error:", error);
      return res.error(500, "Permission check failed");
    }
  };
}

/**
 * Public-only permission middleware
 * Chỉ áp dụng cho routes được định nghĩa là public trong publicPaths
 * Sẽ error nếu route không phải public
 *
 * @param {string} permission - Permission cho public access
 * @param {Object} options - Tùy chọn
 * @returns {Function} Middleware function
 */
function publicOnlyPermission(permission, options = {}) {
  return async (req, res, next) => {
    try {
      const isPublic = isPublicRoute(req.path, req.method);

      if (!isPublic) {
        return res.error(500, "publicOnlyPermission used on non-public route");
      }

      // Public route - optional permission check
      if (req.user && req.userId) {
        console.log(`👤 Authenticated access on public route: ${permission}`);
        return requirePermission(permission, options)(req, res, next);
      } else {
        console.log(`🌍 Public access: ${permission}`);
        return next();
      }
    } catch (error) {
      console.error("Public-only permission error:", error);
      return res.error(500, "Permission check failed");
    }
  };
}

/**
 * Private-only permission middleware
 * Chỉ áp dụng cho routes private, luôn require authentication
 *
 * @param {string} permission - Permission required
 * @param {Object} options - Tùy chọn
 * @returns {Function} Middleware function
 */
function privateOnlyPermission(permission, options = {}) {
  return async (req, res, next) => {
    try {
      const isPublic = isPublicRoute(req.path, req.method);

      if (isPublic) {
        return res.error(500, "privateOnlyPermission used on public route");
      }

      // Private route - always require auth + permission
      if (!req.user || !req.userId) {
        return res.error(401, "Authentication required");
      }

      console.log(`🔒 Private access: ${permission}`);
      return requirePermission(permission, options)(req, res, next);
    } catch (error) {
      console.error("Private-only permission error:", error);
      return res.error(500, "Permission check failed");
    }
  };
}

module.exports = {
  smartPermission,
  publicOnlyPermission,
  privateOnlyPermission,
};
