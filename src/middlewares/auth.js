const jwtService = require("@/services/jwt.service");
const cookieManager = require("@/configs/cookie");
const isPublicRoute = require("@/configs/publicPaths");
const userService = require("@/services/user.service");
const {
  hasPermission: isValidPermission,
  getAllPermissions,
} = require("@/configs/permissions");
const { sequelize } = require("@/models");

// Authentication middleware - handles both public and private routes
async function auth(req, res, next) {
  try {
    const isPublic = isPublicRoute(req.path, req.method);

    if (isPublic) {
      const token = cookieManager.getAccessToken(req);
      if (token) {
        try {
          const payload = jwtService.verifyAccessToken(token);
          req.userId = payload.userId;
          const user = await userService.getMe(req.userId);
          req.user = user;
          await loadUserData(req);
        } catch (error) {
          // Invalid token on public route - continue as unauthenticated
        }
      }
      return next();
    }

    const token = cookieManager.getAccessToken(req);
    if (!token) {
      return res.error(401, "Access token required");
    }

    const payload = jwtService.verifyAccessToken(token);
    req.userId = payload.userId;
    const user = await userService.getMe(req.userId);
    req.user = user;

    await loadUserData(req);
    next();
  } catch (error) {
    return res.error(401, error.message);
  }
}

// Load user roles, permissions, and admin status
async function loadUserData(req) {
  try {
    if (!req.userId || !req.user) return;

    // Check if user is admin
    req.isAdmin = checkIsAdmin(req.user);

    // Check if user is teacher
    req.isTeacher = checkIsTeacher(req.user);

    if (req.isAdmin) {
      // Admin gets all permissions
      req.userRoles = ["admin"];
      req.userPermissions = getAllPermissions();

      return;
    }

    // Load roles for non-admin users
    const userRoles = await sequelize.query(
      `
      SELECT DISTINCT r.name 
      FROM roles r
      JOIN user_role ur ON r.id = ur.roleId
      WHERE ur.userId = :userId AND ur.isActive = true AND r.isActive = true
    `,
      {
        replacements: { userId: req.userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    req.userRoles = userRoles.map((r) => r.name);

    // Load permissions for non-admin users
    const userPermissions = await sequelize.query(
      `
      SELECT DISTINCT p.name
      FROM permissions p
      JOIN role_permission rp ON p.id = rp.permissionId
      JOIN user_role ur ON rp.roleId = ur.roleId
      WHERE ur.userId = :userId AND ur.isActive = true AND p.isActive = true
    `,
      {
        replacements: { userId: req.userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    req.userPermissions = userPermissions.map((p) => p.name);
  } catch (error) {
    console.error("Load user data error:", error);
    req.userRoles = [];
    req.userPermissions = [];
    req.isAdmin = false;
    req.isTeacher = false;
  }
}

// Check if user is admin (centralized logic)
function checkIsAdmin(user) {
  if (!user) return false;

  // Method 1: Check roles array for admin role
  if (user.roles && Array.isArray(user.roles)) {
    const hasAdminRole = user.roles.some((role) => role.name === "admin");
    if (hasAdminRole) return true;
  }

  // Method 2: Check legacy role field (fallback)
  if (user.role === "admin") return true;

  // Method 3: Environment admin usernames
  const adminUsernames = process.env.ADMIN_USERNAMES?.split(",") || ["admin"];
  if (user.username && adminUsernames.includes(user.username)) return true;

  // Method 4: Email domain check
  const adminEmailDomain = process.env.ADMIN_EMAIL_DOMAIN;
  if (adminEmailDomain && user.email?.endsWith(adminEmailDomain)) return true;

  return false;
}

// Check if user is teacher (centralized logic)
function checkIsTeacher(user) {
  if (!user) return false;

  // Method 1: Check roles array for teacher role
  if (user.roles && Array.isArray(user.roles)) {
    const hasTeacherRole = user.roles.some((role) => role.name === "teacher");
    if (hasTeacherRole) return true;
  }

  // Method 2: Check legacy role field (fallback)
  if (user.role === "teacher") return true;

  return false;
}

// Require authentication
function requireAuth(req, res, next) {
  if (!req.userId || !req.user) {
    return res.error(401, "Authentication required");
  }
  next();
}

// Require admin role
function requireAdmin(req, res, next) {
  if (!req.userId || !req.user) {
    return res.error(401, "Authentication required");
  }

  if (!req.isAdmin) {
    return res.error(403, "Admin access required");
  }

  next();
}

// Require teacher role
function requireTeacher(req, res, next) {
  if (!req.userId || !req.user) {
    return res.error(401, "Authentication required");
  }

  if (!req.isTeacher) {
    return res.error(403, "Teacher access required");
  }

  next();
}

// Require specific permission(s)
function requirePermission(permissions, options = {}) {
  return (req, res, next) => {
    if (!req.userId || !req.user) {
      return res.error(401, "Authentication required");
    }

    // Admin bypass
    if (req.isAdmin) {
      return next();
    }

    const permissionsArray = Array.isArray(permissions)
      ? permissions
      : [permissions];

    // Validate permissions exist in config
    const invalidPermissions = permissionsArray.filter(
      (p) => !isValidPermission(p)
    );
    if (invalidPermissions.length > 0) {
      console.error("Invalid permissions:", invalidPermissions);
      return res.error(500, "Invalid permission configuration");
    }

    const { requireAll = false } = options;
    const userPerms = req.userPermissions || [];

    let hasPermission = false;
    if (requireAll) {
      hasPermission = permissionsArray.every((p) => userPerms.includes(p));
    } else {
      hasPermission = permissionsArray.some((p) => userPerms.includes(p));
    }

    if (!hasPermission) {
      return res.error(
        403,
        `Access denied. Required: ${permissionsArray.join(", ")}`
      );
    }

    next();
  };
}

// Require specific role(s)
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.userId || !req.user) {
      return res.error(401, "Authentication required");
    }

    // Admin bypass
    if (req.isAdmin) {
      return next();
    }

    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const userRoles = req.userRoles || [];

    const hasRole = rolesArray.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return res.error(
        403,
        `Access denied. Required role: ${rolesArray.join(", ")}`
      );
    }

    next();
  };
}

// Optional permission check - skips if user not authenticated
function optionalPermission(permissions, options = {}) {
  return (req, res, next) => {
    // Skip if no user (public access)
    if (!req.userId || !req.user) {
      return next();
    }

    // Use regular permission check for authenticated users
    return requirePermission(permissions, options)(req, res, next);
  };
}

// Helper function to get user permissions (for API endpoints)
async function getUserPermissions(userId) {
  try {
    const user = await userService.getById(userId);
    if (!user) return [];

    if (checkIsAdmin(user)) {
      return getAllPermissions().map((name) => ({
        name,
        displayName: name.replace(/\./g, " ").replace(/_/g, " "),
        module: name.split(".").slice(0, -1).join("_"),
        action: name.split(".").pop(),
      }));
    }

    const permissions = await sequelize.query(
      `
      SELECT DISTINCT p.name, p.displayName, p.module, p.action
      FROM permissions p
      JOIN role_permission rp ON p.id = rp.permissionId
      JOIN user_role ur ON rp.roleId = ur.roleId
      WHERE ur.userId = :userId AND ur.isActive = true AND p.isActive = true
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

// Check if user has specific permission
async function userHasPermission(userId, permission) {
  try {
    const user = await userService.getById(userId);
    if (!user) return false;

    if (checkIsAdmin(user)) return true;

    const result = await sequelize.query(
      `
      SELECT COUNT(*) as count
      FROM permissions p
      JOIN role_permission rp ON p.id = rp.permissionId
      JOIN user_role ur ON rp.roleId = ur.roleId
      WHERE ur.userId = :userId AND p.name = :permission
        AND ur.isActive = true AND p.isActive = true
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

module.exports = {
  auth,
  requireAuth,
  requireAdmin,
  requireTeacher,
  requirePermission,
  requireRole,
  optionalPermission,
  getUserPermissions,
  userHasPermission,
  checkIsAdmin,
  checkIsTeacher,
};
