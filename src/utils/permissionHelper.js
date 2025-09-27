const { PERMISSIONS, getAllPermissions } = require("../configs/permissions");

/**
 * Tạo data permissions cho migration từ PERMISSIONS config
 * @returns {Array} Array các permission objects cho migration
 */
function generatePermissionMigrationData() {
  const permissionsData = [];

  // Mapping hiển thị tên và mô tả cho từng permission
  const permissionDisplayConfig = {
    // ===== SYSTEM PERMISSIONS =====
    [PERMISSIONS.SYSTEM.ADMIN]: {
      displayName: "Toàn quyền quản trị hệ thống",
      description: "Có thể thực hiện mọi thao tác trong hệ thống admin",
      module: "system",
      action: "admin",
    },

    // ===== ADMIN USER PERMISSIONS =====
    [PERMISSIONS.ADMIN.USERS.LIST]: {
      displayName: "Xem danh sách người dùng",
      description:
        "API: GET /admin/users - Xem danh sách tất cả người dùng với filtering",
      module: "admin_users",
      action: "list",
    },
    [PERMISSIONS.ADMIN.USERS.VIEW]: {
      displayName: "Xem chi tiết người dùng",
      description:
        "API: GET /admin/users/:id - Xem thông tin chi tiết người dùng",
      module: "admin_users",
      action: "view",
    },
    [PERMISSIONS.ADMIN.USERS.CREATE]: {
      displayName: "Tạo người dùng",
      description: "API: POST /admin/users - Tạo tài khoản người dùng mới",
      module: "admin_users",
      action: "create",
    },
    [PERMISSIONS.ADMIN.USERS.UPDATE]: {
      displayName: "Cập nhật người dùng",
      description: "API: PUT /admin/users/:id - Chỉnh sửa thông tin người dùng",
      module: "admin_users",
      action: "update",
    },
    [PERMISSIONS.ADMIN.USERS.DELETE]: {
      displayName: "Xóa người dùng",
      description: "API: DELETE /admin/users/:id - Xóa tài khoản người dùng",
      module: "admin_users",
      action: "delete",
    },
    [PERMISSIONS.ADMIN.USERS.TOGGLE_STATUS]: {
      displayName: "Bật/tắt trạng thái người dùng",
      description:
        "API: PATCH /admin/users/:id/status - Kích hoạt/vô hiệu hóa tài khoản",
      module: "admin_users",
      action: "toggle_status",
    },
    [PERMISSIONS.ADMIN.USERS.SET_KEY]: {
      displayName: "Đặt key cho người dùng",
      description:
        "API: POST /admin/users/:id/set-key - Đặt key đặc biệt cho user",
      module: "admin_users",
      action: "set_key",
    },
    [PERMISSIONS.ADMIN.USERS.SEND_VERIFICATION]: {
      displayName: "Gửi email xác thực",
      description:
        "API: POST /admin/users/:id/send-verification - Gửi lại email xác thực",
      module: "admin_users",
      action: "send_verification",
    },
    [PERMISSIONS.ADMIN.USERS.ANALYTICS]: {
      displayName: "Xem thống kê người dùng",
      description:
        "API: GET /admin/users/analytics - Xem báo cáo và thống kê người dùng",
      module: "admin_users",
      action: "analytics",
    },

    // ===== ADMIN COURSE PERMISSIONS =====
    [PERMISSIONS.ADMIN.COURSES.LIST]: {
      displayName: "Xem danh sách khóa học",
      description: "API: GET /admin/courses - Xem danh sách tất cả khóa học",
      module: "admin_courses",
      action: "list",
    },
    [PERMISSIONS.ADMIN.COURSES.VIEW]: {
      displayName: "Xem chi tiết khóa học",
      description:
        "API: GET /admin/courses/:id - Xem thông tin chi tiết khóa học",
      module: "admin_courses",
      action: "view",
    },
    [PERMISSIONS.ADMIN.COURSES.CREATE]: {
      displayName: "Tạo khóa học",
      description: "API: POST /admin/courses - Tạo khóa học mới",
      module: "admin_courses",
      action: "create",
    },
    [PERMISSIONS.ADMIN.COURSES.UPDATE]: {
      displayName: "Cập nhật khóa học",
      description: "API: PUT /admin/courses/:id - Chỉnh sửa thông tin khóa học",
      module: "admin_courses",
      action: "update",
    },
    [PERMISSIONS.ADMIN.COURSES.DELETE]: {
      displayName: "Xóa khóa học",
      description: "API: DELETE /admin/courses/:id - Xóa khóa học",
      module: "admin_courses",
      action: "delete",
    },
    [PERMISSIONS.ADMIN.COURSES.ANALYTICS]: {
      displayName: "Xem thống kê khóa học",
      description:
        "API: GET /admin/courses/analytics - Xem báo cáo và thống kê khóa học",
      module: "admin_courses",
      action: "analytics",
    },

    // ===== ADMIN LIVESTREAM PERMISSIONS =====
    [PERMISSIONS.ADMIN.LIVESTREAMS.LIST]: {
      displayName: "Xem danh sách livestream",
      description:
        "API: GET /admin/livestreams - Xem danh sách tất cả livestream",
      module: "admin_livestreams",
      action: "list",
    },
    [PERMISSIONS.ADMIN.LIVESTREAMS.VIEW]: {
      displayName: "Xem chi tiết livestream",
      description:
        "API: GET /admin/livestreams/:id - Xem thông tin chi tiết livestream",
      module: "admin_livestreams",
      action: "view",
    },
    [PERMISSIONS.ADMIN.LIVESTREAMS.CREATE]: {
      displayName: "Tạo livestream",
      description: "API: POST /admin/livestreams - Tạo livestream mới",
      module: "admin_livestreams",
      action: "create",
    },
    [PERMISSIONS.ADMIN.LIVESTREAMS.UPDATE]: {
      displayName: "Cập nhật livestream",
      description:
        "API: PUT /admin/livestreams/:id - Chỉnh sửa thông tin livestream",
      module: "admin_livestreams",
      action: "update",
    },
    [PERMISSIONS.ADMIN.LIVESTREAMS.DELETE]: {
      displayName: "Xóa livestream",
      description: "API: DELETE /admin/livestreams/:id - Xóa livestream",
      module: "admin_livestreams",
      action: "delete",
    },
    [PERMISSIONS.ADMIN.LIVESTREAMS.ANALYTICS]: {
      displayName: "Xem thống kê livestream",
      description:
        "API: GET /admin/livestreams/analytics - Xem báo cáo và thống kê livestream",
      module: "admin_livestreams",
      action: "analytics",
    },

    // ===== ADMIN DOCUMENT PERMISSIONS =====
    [PERMISSIONS.ADMIN.DOCUMENTS.LIST]: {
      displayName: "Xem danh sách tài liệu",
      description: "API: GET /admin/documents - Xem danh sách tất cả tài liệu",
      module: "admin_documents",
      action: "list",
    },
    [PERMISSIONS.ADMIN.DOCUMENTS.VIEW]: {
      displayName: "Xem chi tiết tài liệu",
      description:
        "API: GET /admin/documents/:id - Xem thông tin chi tiết tài liệu",
      module: "admin_documents",
      action: "view",
    },
    [PERMISSIONS.ADMIN.DOCUMENTS.CREATE]: {
      displayName: "Tạo tài liệu",
      description: "API: POST /admin/documents - Tạo tài liệu mới",
      module: "admin_documents",
      action: "create",
    },
    [PERMISSIONS.ADMIN.DOCUMENTS.UPDATE]: {
      displayName: "Cập nhật tài liệu",
      description:
        "API: PUT /admin/documents/:id - Chỉnh sửa thông tin tài liệu",
      module: "admin_documents",
      action: "update",
    },
    [PERMISSIONS.ADMIN.DOCUMENTS.DELETE]: {
      displayName: "Xóa tài liệu",
      description: "API: DELETE /admin/documents/:id - Xóa tài liệu",
      module: "admin_documents",
      action: "delete",
    },
    [PERMISSIONS.ADMIN.DOCUMENTS.ANALYTICS]: {
      displayName: "Xem thống kê tài liệu",
      description:
        "API: GET /admin/documents/analytics - Xem báo cáo và thống kê tài liệu",
      module: "admin_documents",
      action: "analytics",
    },

    // ===== ADMIN DASHBOARD PERMISSIONS =====
    [PERMISSIONS.ADMIN.DASHBOARD.VIEW]: {
      displayName: "Xem dashboard",
      description: "API: GET /admin/dashboard - Truy cập vào dashboard admin",
      module: "admin_dashboard",
      action: "view",
    },
    [PERMISSIONS.ADMIN.DASHBOARD.OVERVIEW]: {
      displayName: "Xem tổng quan hệ thống",
      description:
        "API: GET /admin/dashboard/overview - Xem tổng quan thống kê hệ thống",
      module: "admin_dashboard",
      action: "overview",
    },
    [PERMISSIONS.ADMIN.DASHBOARD.USER_ANALYTICS]: {
      displayName: "Xem phân tích người dùng",
      description:
        "API: GET /admin/dashboard/users - Xem phân tích dữ liệu người dùng",
      module: "admin_dashboard",
      action: "user_analytics",
    },
    [PERMISSIONS.ADMIN.DASHBOARD.COURSE_ANALYTICS]: {
      displayName: "Xem phân tích khóa học",
      description:
        "API: GET /admin/dashboard/courses - Xem phân tích dữ liệu khóa học",
      module: "admin_dashboard",
      action: "course_analytics",
    },
    [PERMISSIONS.ADMIN.DASHBOARD.LIVESTREAM_ANALYTICS]: {
      displayName: "Xem phân tích livestream",
      description:
        "API: GET /admin/dashboard/livestreams - Xem phân tích dữ liệu livestream",
      module: "admin_dashboard",
      action: "livestream_analytics",
    },
    [PERMISSIONS.ADMIN.DASHBOARD.DOCUMENT_ANALYTICS]: {
      displayName: "Xem phân tích tài liệu",
      description:
        "API: GET /admin/dashboard/documents - Xem phân tích dữ liệu tài liệu",
      module: "admin_dashboard",
      action: "document_analytics",
    },
    [PERMISSIONS.ADMIN.DASHBOARD.GROWTH_ANALYTICS]: {
      displayName: "Xem phân tích tăng trưởng",
      description:
        "API: GET /admin/dashboard/growth - Xem phân tích tăng trưởng hệ thống",
      module: "admin_dashboard",
      action: "growth_analytics",
    },

    // ===== TEACHER PERMISSIONS =====
    [PERMISSIONS.TEACHER.COURSES.CREATE]: {
      displayName: "Tạo khóa học (Giáo viên)",
      description: "Giáo viên có thể tạo khóa học mới",
      module: "teacher_courses",
      action: "create",
    },
    [PERMISSIONS.TEACHER.COURSES.MANAGE_OWN]: {
      displayName: "Quản lý khóa học riêng",
      description: "Giáo viên có thể quản lý các khóa học của mình",
      module: "teacher_courses",
      action: "manage_own",
    },
    [PERMISSIONS.TEACHER.COURSES.VIEW_OWN]: {
      displayName: "Xem khóa học riêng",
      description: "Giáo viên có thể xem các khóa học của mình",
      module: "teacher_courses",
      action: "view_own",
    },
    [PERMISSIONS.TEACHER.COURSES.UPDATE_OWN]: {
      displayName: "Cập nhật khóa học riêng",
      description: "Giáo viên có thể cập nhật các khóa học của mình",
      module: "teacher_courses",
      action: "update_own",
    },
    [PERMISSIONS.TEACHER.COURSES.DELETE_OWN]: {
      displayName: "Xóa khóa học riêng",
      description: "Giáo viên có thể xóa các khóa học của mình",
      module: "teacher_courses",
      action: "delete_own",
    },

    [PERMISSIONS.TEACHER.LIVESTREAMS.CREATE]: {
      displayName: "Tạo livestream (Giáo viên)",
      description: "Giáo viên có thể tạo livestream mới",
      module: "teacher_livestreams",
      action: "create",
    },
    [PERMISSIONS.TEACHER.LIVESTREAMS.MANAGE_OWN]: {
      displayName: "Quản lý livestream riêng",
      description: "Giáo viên có thể quản lý các livestream của mình",
      module: "teacher_livestreams",
      action: "manage_own",
    },
    [PERMISSIONS.TEACHER.LIVESTREAMS.VIEW_OWN]: {
      displayName: "Xem livestream riêng",
      description: "Giáo viên có thể xem các livestream của mình",
      module: "teacher_livestreams",
      action: "view_own",
    },
    [PERMISSIONS.TEACHER.LIVESTREAMS.UPDATE_OWN]: {
      displayName: "Cập nhật livestream riêng",
      description: "Giáo viên có thể cập nhật các livestream của mình",
      module: "teacher_livestreams",
      action: "update_own",
    },
    [PERMISSIONS.TEACHER.LIVESTREAMS.DELETE_OWN]: {
      displayName: "Xóa livestream riêng",
      description: "Giáo viên có thể xóa các livestream của mình",
      module: "teacher_livestreams",
      action: "delete_own",
    },

    [PERMISSIONS.TEACHER.DOCUMENTS.CREATE]: {
      displayName: "Tạo tài liệu (Giáo viên)",
      description: "Giáo viên có thể tạo tài liệu mới",
      module: "teacher_documents",
      action: "create",
    },
    [PERMISSIONS.TEACHER.DOCUMENTS.MANAGE_OWN]: {
      displayName: "Quản lý tài liệu riêng",
      description: "Giáo viên có thể quản lý các tài liệu của mình",
      module: "teacher_documents",
      action: "manage_own",
    },
    [PERMISSIONS.TEACHER.DOCUMENTS.VIEW_OWN]: {
      displayName: "Xem tài liệu riêng",
      description: "Giáo viên có thể xem các tài liệu của mình",
      module: "teacher_documents",
      action: "view_own",
    },
    [PERMISSIONS.TEACHER.DOCUMENTS.UPDATE_OWN]: {
      displayName: "Cập nhật tài liệu riêng",
      description: "Giáo viên có thể cập nhật các tài liệu của mình",
      module: "teacher_documents",
      action: "update_own",
    },
    [PERMISSIONS.TEACHER.DOCUMENTS.DELETE_OWN]: {
      displayName: "Xóa tài liệu riêng",
      description: "Giáo viên có thể xóa các tài liệu của mình",
      module: "teacher_documents",
      action: "delete_own",
    },

    [PERMISSIONS.TEACHER.STUDENTS.VIEW]: {
      displayName: "Xem danh sách học viên",
      description: "Giáo viên có thể xem danh sách học viên của mình",
      module: "teacher_students",
      action: "view",
    },
    [PERMISSIONS.TEACHER.STUDENTS.MANAGE]: {
      displayName: "Quản lý học viên",
      description: "Giáo viên có thể quản lý học viên của mình",
      module: "teacher_students",
      action: "manage",
    },

    // ===== USER PERMISSIONS =====
    [PERMISSIONS.USER.PROFILE.VIEW]: {
      displayName: "Xem hồ sơ cá nhân",
      description: "Người dùng có thể xem hồ sơ cá nhân của mình",
      module: "user_profile",
      action: "view",
    },
    [PERMISSIONS.USER.PROFILE.UPDATE]: {
      displayName: "Cập nhật hồ sơ cá nhân",
      description: "Người dùng có thể cập nhật hồ sơ cá nhân của mình",
      module: "user_profile",
      action: "update",
    },
    [PERMISSIONS.USER.PROFILE.UPLOAD_AVATAR]: {
      displayName: "Tải lên ảnh đại diện",
      description: "Người dùng có thể tải lên và thay đổi ảnh đại diện",
      module: "user_profile",
      action: "upload_avatar",
    },

    [PERMISSIONS.USER.COURSES.VIEW_ENROLLED]: {
      displayName: "Xem khóa học đã đăng ký",
      description: "Người dùng có thể xem các khóa học đã đăng ký",
      module: "user_courses",
      action: "view_enrolled",
    },
    [PERMISSIONS.USER.COURSES.ENROLL]: {
      displayName: "Đăng ký khóa học",
      description: "Người dùng có thể đăng ký khóa học",
      module: "user_courses",
      action: "enroll",
    },
    [PERMISSIONS.USER.COURSES.UNENROLL]: {
      displayName: "Hủy đăng ký khóa học",
      description: "Người dùng có thể hủy đăng ký khóa học",
      module: "user_courses",
      action: "unenroll",
    },

    [PERMISSIONS.USER.LIVESTREAMS.VIEW_ENROLLED]: {
      displayName: "Xem livestream đã đăng ký",
      description: "Người dùng có thể xem các livestream đã đăng ký",
      module: "user_livestreams",
      action: "view_enrolled",
    },
    [PERMISSIONS.USER.LIVESTREAMS.JOIN]: {
      displayName: "Tham gia livestream",
      description: "Người dùng có thể tham gia livestream",
      module: "user_livestreams",
      action: "join",
    },

    [PERMISSIONS.USER.DOCUMENTS.DOWNLOAD_ALLOWED]: {
      displayName: "Tải xuống tài liệu được phép",
      description: "Người dùng có thể tải xuống các tài liệu được phép",
      module: "user_documents",
      action: "download_allowed",
    },
    [PERMISSIONS.USER.DOCUMENTS.VIEW_ALLOWED]: {
      displayName: "Xem tài liệu được phép",
      description: "Người dùng có thể xem các tài liệu được phép",
      module: "user_documents",
      action: "view_allowed",
    },

    // ===== PUBLIC PERMISSIONS =====
    [PERMISSIONS.PUBLIC.COURSES.LIST]: {
      displayName: "Xem danh sách khóa học công khai",
      description: "Có thể xem danh sách các khóa học công khai",
      module: "public_courses",
      action: "list",
    },
    [PERMISSIONS.PUBLIC.COURSES.VIEW]: {
      displayName: "Xem chi tiết khóa học công khai",
      description: "Có thể xem chi tiết các khóa học công khai",
      module: "public_courses",
      action: "view",
    },

    [PERMISSIONS.PUBLIC.DOCUMENTS.LIST]: {
      displayName: "Xem danh sách tài liệu công khai",
      description: "Có thể xem danh sách các tài liệu công khai",
      module: "public_documents",
      action: "list",
    },
    [PERMISSIONS.PUBLIC.DOCUMENTS.VIEW]: {
      displayName: "Xem chi tiết tài liệu công khai",
      description: "Có thể xem chi tiết các tài liệu công khai",
      module: "public_documents",
      action: "view",
    },

    [PERMISSIONS.PUBLIC.LIVESTREAMS.VIEW]: {
      displayName: "Xem livestream công khai",
      description: "Có thể xem các livestream công khai",
      module: "public_livestreams",
      action: "view",
    },
    [PERMISSIONS.PUBLIC.LIVESTREAMS.TRACK_VIEW]: {
      displayName: "Theo dõi lượt xem livestream",
      description: "Có thể theo dõi lượt xem livestream",
      module: "public_livestreams",
      action: "track_view",
    },

    [PERMISSIONS.PUBLIC.TOPICS.LIST]: {
      displayName: "Xem danh sách chủ đề",
      description: "Có thể xem danh sách các chủ đề",
      module: "public_topics",
      action: "list",
    },

    [PERMISSIONS.PUBLIC.CITIES.LIST]: {
      displayName: "Xem danh sách thành phố",
      description: "Có thể xem danh sách các thành phố",
      module: "public_cities",
      action: "list",
    },

    [PERMISSIONS.PUBLIC.SCHEDULES.LIST]: {
      displayName: "Xem danh sách lịch trình",
      description: "Có thể xem danh sách lịch trình",
      module: "public_schedules",
      action: "list",
    },

    [PERMISSIONS.PUBLIC.SOCIALS.LIST]: {
      displayName: "Xem danh sách mạng xã hội",
      description: "Có thể xem danh sách các mạng xã hội",
      module: "public_socials",
      action: "list",
    },
  };

  // Lấy tất cả permissions từ config
  const allPermissions = getAllPermissions();

  // Generate migration data cho từng permission
  allPermissions.forEach((permissionName) => {
    const config = permissionDisplayConfig[permissionName];

    if (config) {
      permissionsData.push({
        name: permissionName,
        displayName: config.displayName,
        description: config.description,
        module: config.module,
        action: config.action,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // Fallback cho permissions không có config
      console.warn(`Missing config for permission: ${permissionName}`);
      const parts = permissionName.split(".");
      permissionsData.push({
        name: permissionName,
        displayName: permissionName.replace(/\./g, " ").replace(/_/g, " "),
        description: `Auto-generated permission: ${permissionName}`,
        module: parts.slice(0, -1).join("_"),
        action: parts[parts.length - 1],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  return permissionsData;
}

/**
 * Lấy tất cả permission names từ config
 * @returns {Array} Array các permission names
 */
function getAllPermissionNames() {
  return getAllPermissions();
}

module.exports = {
  generatePermissionMigrationData,
  getAllPermissionNames,
};
