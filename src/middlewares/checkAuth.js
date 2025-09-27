const jwtService = require("@/services/jwt.service");
const cookieManager = require("@/configs/cookie");
const isPublicRoute = require("../configs/publicPaths");
const userService = require("@/services/user.service");
const { getUserPermissions } = require("@/middlewares/checkPermission");
const { sequelize } = require("@/models");

async function checkAuth(req, res, next) {
  try {
    const isPublic = isPublicRoute(req.path, req.method);

    if (isPublic) {
      // Optional authentication: Nếu có token, thử verify nhưng không bắt buộc
      const token = cookieManager.getAccessToken(req);
      if (token) {
        try {
          const payload = jwtService.verifyAccessToken(token);
          req.userId = payload.userId; // Set userId nếu token hợp lệ

          // Load user info and permissions for public routes (optional)
          const user = await userService.getMe(req.userId);
          req.user = user;

          // Load user roles
          await loadUserRoles(req);
        } catch (error) {
          // Token không hợp lệ, bỏ qua và tiếp tục như user không đăng nhập
        }
      }
      return next();
    }

    // Với private route, token bắt buộc phải có và hợp lệ
    const token = cookieManager.getAccessToken(req);
    if (!token) {
      return res.error(401, "Access token is required");
    }

    const payload = jwtService.verifyAccessToken(token);
    req.userId = payload.userId;
    const user = await userService.getMe(req.userId);
    req.user = user;

    // Load user roles and permissions for private routes
    await loadUserRoles(req);

    next();
  } catch (error) {
    return res.error(401, error.message);
  }
}

/**
 * Helper function để load user roles
 * @param {Object} req - Request object
 */
async function loadUserRoles(req) {
  try {
    if (!req.userId) return;

    // Load user roles
    const userRoles = await sequelize.query(
      `
      SELECT DISTINCT r.name 
      FROM roles r
      JOIN user_role ur ON r.id = ur.roleId
      WHERE ur.userId = :userId 
        AND ur.isActive = true
        AND r.isActive = true
    `,
      {
        replacements: { userId: req.userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    req.userRoles = userRoles.map((r) => r.name);

    // Also load permissions for convenience
    req.userPermissions = await getUserPermissions(req.userId);
  } catch (error) {
    console.error("Load user roles error:", error);
    req.userRoles = [];
    req.userPermissions = [];
  }
}

module.exports = checkAuth;
