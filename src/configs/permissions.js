/**
 * Simplified Permissions Configuration
 * Chỉ quản lý permissions cho TEACHER và USER
 * ADMIN sẽ được xử lý riêng qua middleware isAdmin check
 *
 * Format: MODULE.ENTITY.ACTION
 * - MODULE: teacher, user, public
 * - ENTITY: courses, livestreams, documents, profile, etc.
 * - ACTION: create, view, update, delete, manage, enroll, etc.
 */

const PERMISSIONS = {
  // ===== TEACHER PERMISSIONS =====
  TEACHER: {
    // Course Management (Own courses)
    COURSES: {
      CREATE: "teacher.courses.create",
      MANAGE_OWN: "teacher.courses.manage_own",
      VIEW_OWN: "teacher.courses.view_own",
      UPDATE_OWN: "teacher.courses.update_own",
      DELETE_OWN: "teacher.courses.delete_own",
    },

    // Livestream Management (Own livestreams)
    LIVESTREAMS: {
      CREATE: "teacher.livestreams.create",
      MANAGE_OWN: "teacher.livestreams.manage_own",
      VIEW_OWN: "teacher.livestreams.view_own",
      UPDATE_OWN: "teacher.livestreams.update_own",
      DELETE_OWN: "teacher.livestreams.delete_own",
    },

    // Document Management
    DOCUMENTS: {
      CREATE: "teacher.documents.create",
      MANAGE_OWN: "teacher.documents.manage_own",
      VIEW_OWN: "teacher.documents.view_own",
      UPDATE_OWN: "teacher.documents.update_own",
      DELETE_OWN: "teacher.documents.delete_own",
    },

    // Student Management
    STUDENTS: {
      VIEW: "teacher.students.view",
      MANAGE: "teacher.students.manage",
    },
  },

  // ===== USER PERMISSIONS =====
  USER: {
    // Profile Management
    PROFILE: {
      VIEW: "user.profile.view",
      UPDATE: "user.profile.update",
      UPLOAD_AVATAR: "user.profile.upload_avatar",
    },

    // Course Access
    COURSES: {
      VIEW_ENROLLED: "user.courses.view_enrolled",
      ENROLL: "user.courses.enroll",
      UNENROLL: "user.courses.unenroll",
    },

    // Livestream Access
    LIVESTREAMS: {
      VIEW_ENROLLED: "user.livestreams.view_enrolled",
      JOIN: "user.livestreams.join",
    },

    // Document Access
    DOCUMENTS: {
      DOWNLOAD_ALLOWED: "user.documents.download_allowed",
      VIEW_ALLOWED: "user.documents.view_allowed",
    },
  },
};

/**
 * Helper function để flatten permissions object thành array
 * @returns {Array} Danh sách tất cả permission strings
 */
function getAllPermissions() {
  const permissions = [];

  function extractPermissions(obj) {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        permissions.push(obj[key]);
      } else if (typeof obj[key] === "object") {
        extractPermissions(obj[key]);
      }
    }
  }

  extractPermissions(PERMISSIONS);
  return permissions;
}

/**
 * Helper function để tìm permission theo tên
 * @param {string} permissionName - Tên permission cần tìm
 * @returns {boolean} True nếu permission tồn tại
 */
function hasPermission(permissionName) {
  const allPermissions = getAllPermissions();
  return allPermissions.includes(permissionName);
}

/**
 * Helper function để lấy permissions theo module
 * @param {string} module - Module name (admin, teacher, user, public)
 * @returns {Array} Danh sách permissions của module
 */
function getPermissionsByModule(module) {
  const moduleUpper = module.toUpperCase();
  if (!PERMISSIONS[moduleUpper]) {
    return [];
  }

  const permissions = [];
  function extractFromModule(obj) {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        permissions.push(obj[key]);
      } else if (typeof obj[key] === "object") {
        extractFromModule(obj[key]);
      }
    }
  }

  extractFromModule(PERMISSIONS[moduleUpper]);
  return permissions;
}

/**
 * Validation function để check permission format
 * @param {string} permission - Permission string to validate
 * @returns {boolean} True if valid format
 */
function isValidPermissionFormat(permission) {
  // Format: module.entity.action
  const parts = permission.split(".");
  return parts.length >= 2 && parts.length <= 4;
}

module.exports = {
  PERMISSIONS,
  getAllPermissions,
  hasPermission,
  getPermissionsByModule,
  isValidPermissionFormat,
};
