/**
 * Centralized Permissions Configuration
 * Quản lý tập trung tất cả permissions trong hệ thống
 *
 * Format: MODULE.ENTITY.ACTION
 * - MODULE: admin, teacher, user, public
 * - ENTITY: users, courses, livestreams, documents, dashboard, etc.
 * - ACTION: list, view, create, update, delete, manage, analytics, etc.
 */

const PERMISSIONS = {
  // ===== SYSTEM PERMISSIONS =====
  SYSTEM: {
    ADMIN: "system.admin", // Toàn quyền quản trị hệ thống
  },

  // ===== ADMIN PERMISSIONS =====
  ADMIN: {
    // User Management
    USERS: {
      LIST: "admin.users.list",
      VIEW: "admin.users.view",
      CREATE: "admin.users.create",
      UPDATE: "admin.users.update",
      DELETE: "admin.users.delete",
      TOGGLE_STATUS: "admin.users.toggle_status",
      SET_KEY: "admin.users.set_key",
      SEND_VERIFICATION: "admin.users.send_verification",
      ANALYTICS: "admin.users.analytics",
    },

    // Course Management
    COURSES: {
      LIST: "admin.courses.list",
      VIEW: "admin.courses.view",
      CREATE: "admin.courses.create",
      UPDATE: "admin.courses.update",
      DELETE: "admin.courses.delete",
      ANALYTICS: "admin.courses.analytics",
    },

    // Livestream Management
    LIVESTREAMS: {
      LIST: "admin.livestreams.list",
      VIEW: "admin.livestreams.view",
      CREATE: "admin.livestreams.create",
      UPDATE: "admin.livestreams.update",
      DELETE: "admin.livestreams.delete",
      ANALYTICS: "admin.livestreams.analytics",
    },

    // Document Management
    DOCUMENTS: {
      LIST: "admin.documents.list",
      VIEW: "admin.documents.view",
      CREATE: "admin.documents.create",
      UPDATE: "admin.documents.update",
      DELETE: "admin.documents.delete",
      ANALYTICS: "admin.documents.analytics",
    },

    // Dashboard & Analytics
    DASHBOARD: {
      VIEW: "admin.dashboard.view",
      OVERVIEW: "admin.dashboard.overview",
      USER_ANALYTICS: "admin.dashboard.user_analytics",
      COURSE_ANALYTICS: "admin.dashboard.course_analytics",
      LIVESTREAM_ANALYTICS: "admin.dashboard.livestream_analytics",
      DOCUMENT_ANALYTICS: "admin.dashboard.document_analytics",
      GROWTH_ANALYTICS: "admin.dashboard.growth_analytics",
    },
  },

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

  // ===== PUBLIC PERMISSIONS =====
  PUBLIC: {
    // Public Content Access
    COURSES: {
      LIST: "public.courses.list",
      VIEW: "public.courses.view",
    },

    DOCUMENTS: {
      LIST: "public.documents.list",
      VIEW: "public.documents.view",
    },

    LIVESTREAMS: {
      VIEW: "public.livestreams.view",
      TRACK_VIEW: "public.livestreams.track_view",
    },

    // Other Public Resources
    TOPICS: {
      LIST: "public.topics.list",
    },

    CITIES: {
      LIST: "public.cities.list",
    },

    SCHEDULES: {
      LIST: "public.schedules.list",
    },

    SOCIALS: {
      LIST: "public.socials.list",
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
