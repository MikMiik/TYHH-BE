const { sequelize } = require("@/models");
const { hasPermission: isValidPermission } = require("@/configs/permissions");

/**
 * Middleware kiểm tra permission của user
 * @param {string|Array} requiredPermissions - Permission cần thiết (có thể là string hoặc array)
 * @param {Object} options - Tùy chọn bổ sung
 * @param {boolean} options.requireAll - Yêu cầu tất cả permissions (default: false - chỉ cần 1)
 * @returns {Function} Middleware function
 */
function requirePermission(requiredPermissions, options = {}) {
  return async (req, res, next) => {
    try {
      // Kiểm tra user đã được authenticate chưa
      if (!req.user || !req.userId) {
        return res.error(401, "Authentication required");
      }

      // Convert single permission to array
      const permissionsArray = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // Validate that all required permissions exist in config
      const invalidPermissions = permissionsArray.filter(
        (permission) => !isValidPermission(permission)
      );

      if (invalidPermissions.length > 0) {
        console.error(
          "Invalid permissions detected:",
          invalidPermissions.join(", ")
        );
        return res.error(
          500,
          "System configuration error: Invalid permissions"
        );
      }

      // Lấy tất cả permissions của user thông qua các roles
      const userPermissions = await sequelize.query(
        `
        SELECT DISTINCT p.name 
        FROM permissions p
        JOIN role_permission rp ON p.id = rp.permissionId
        JOIN user_role ur ON rp.roleId = ur.roleId
        WHERE ur.userId = :userId 
          AND ur.isActive = true
          AND p.isActive = true
      `,
        {
          replacements: { userId: req.userId },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      const userPermissionNames = userPermissions.map((p) => p.name);

      // Kiểm tra permissions
      const { requireAll = false } = options;

      let hasPermission = false;
      if (requireAll) {
        // Yêu cầu có tất cả permissions
        hasPermission = permissionsArray.every((permission) =>
          userPermissionNames.includes(permission)
        );
      } else {
        // Chỉ cần có ít nhất 1 permission
        hasPermission = permissionsArray.some((permission) =>
          userPermissionNames.includes(permission)
        );
      }

      if (!hasPermission) {
        return res.error(
          403,
          `Access denied. Required permission(s): ${permissionsArray.join(
            ", "
          )}`
        );
      }

      // Attach user permissions to request for later use
      req.userPermissions = userPermissionNames;
      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.error(500, "Permission check failed");
    }
  };
}

/**
 * Middleware kiểm tra user có ít nhất 1 role cụ thể
 * @param {string|Array} requiredRoles - Role cần thiết
 * @returns {Function} Middleware function
 */
function requireRole(requiredRoles) {
  return async (req, res, next) => {
    try {
      // Kiểm tra user đã được authenticate chưa
      if (!req.user || !req.userId) {
        return res.error(401, "Authentication required");
      }

      // Convert single role to array
      const rolesArray = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

      // Lấy tất cả roles của user
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

      const userRoleNames = userRoles.map((r) => r.name);

      // Kiểm tra có ít nhất 1 role yêu cầu
      const hasRole = rolesArray.some((role) => userRoleNames.includes(role));

      if (!hasRole) {
        return res.error(
          403,
          `Access denied. Required role(s): ${rolesArray.join(", ")}`
        );
      }

      // Attach user roles to request for later use
      req.userRoles = userRoleNames;
      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.error(500, "Role check failed");
    }
  };
}

/**
 * Helper function để kiểm tra user có permission cụ thể
 * @param {number} userId - ID của user
 * @param {string} permission - Permission cần kiểm tra
 * @returns {boolean} True nếu user có permission
 */
async function userHasPermission(userId, permission) {
  try {
    const result = await sequelize.query(
      `
      SELECT COUNT(*) as count
      FROM permissions p
      JOIN role_permission rp ON p.id = rp.permissionId
      JOIN user_role ur ON rp.roleId = ur.roleId
      WHERE ur.userId = :userId 
        AND p.name = :permission
        AND ur.isActive = true
        AND p.isActive = true
    `,
      {
        replacements: { userId, permission },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return result[0].count > 0;
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
}

/**
 * Helper function để lấy tất cả permissions của user
 * @param {number} userId - ID của user
 * @returns {Array} Danh sách permissions
 */
async function getUserPermissions(userId) {
  try {
    const permissions = await sequelize.query(
      `
      SELECT DISTINCT p.name, p.displayName, p.module, p.action
      FROM permissions p
      JOIN role_permission rp ON p.id = rp.permissionId
      JOIN user_role ur ON rp.roleId = ur.roleId
      WHERE ur.userId = :userId 
        AND ur.isActive = true
        AND p.isActive = true
      ORDER BY p.module, p.action
    `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return permissions;
  } catch (error) {
    console.error("Get user permissions error:", error);
    return [];
  }
}

module.exports = {
  requirePermission,
  requireRole,
  userHasPermission,
  getUserPermissions,
};
