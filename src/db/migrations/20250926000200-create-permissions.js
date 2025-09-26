"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("permissions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: "Tên permission: create_course, edit_user, view_dashboard...",
      },
      displayName: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: "Tên hiển thị của permission",
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: "Mô tả chi tiết về permission",
      },
      module: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "Module/nhóm chức năng: user, course, livestream, system...",
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "Hành động: create, read, update, delete, manage...",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "Trạng thái hoạt động của permission",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Thêm index
    await queryInterface.addIndex("permissions", ["name"]);
    await queryInterface.addIndex("permissions", ["module"]);
    await queryInterface.addIndex("permissions", ["action"]);
    await queryInterface.addIndex("permissions", ["isActive"]);

    // Thêm data mặc định cho các permission dựa trên API endpoints thực tế
    await queryInterface.bulkInsert("permissions", [
      // ========== SYSTEM PERMISSIONS ==========
      {
        name: "system.admin_access",
        displayName: "Truy cập Admin Panel",
        description: "Có thể truy cập vào admin panel",
        module: "system",
        action: "admin_access",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ========== USER MANAGEMENT PERMISSIONS ==========
      {
        name: "admin.users.list",
        displayName: "Xem danh sách người dùng",
        description:
          "API: GET /admin/users - Xem danh sách tất cả người dùng với filtering",
        module: "admin_users",
        action: "list",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.users.view",
        displayName: "Xem chi tiết người dùng",
        description:
          "API: GET /admin/users/:id - Xem thông tin chi tiết người dùng",
        module: "admin_users",
        action: "view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.users.create",
        displayName: "Tạo người dùng",
        description: "API: POST /admin/users - Tạo tài khoản người dùng mới",
        module: "admin_users",
        action: "create",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.users.update",
        displayName: "Cập nhật người dùng",
        description:
          "API: PUT /admin/users/:id - Chỉnh sửa thông tin người dùng",
        module: "admin_users",
        action: "update",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.users.delete",
        displayName: "Xóa người dùng",
        description: "API: DELETE /admin/users/:id - Xóa tài khoản người dùng",
        module: "admin_users",
        action: "delete",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.users.toggle_status",
        displayName: "Bật/tắt trạng thái người dùng",
        description:
          "API: PATCH /admin/users/:id/status - Kích hoạt/vô hiệu hóa tài khoản",
        module: "admin_users",
        action: "toggle_status",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.users.set_key",
        displayName: "Đặt key cho người dùng",
        description:
          "API: POST /admin/users/:id/set-key - Đặt key đặc biệt cho user",
        module: "admin_users",
        action: "set_key",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.users.send_verification",
        displayName: "Gửi email xác thực",
        description:
          "API: POST /admin/users/:id/send-verification - Gửi lại email xác thực",
        module: "admin_users",
        action: "send_verification",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.users.analytics",
        displayName: "Xem thống kê người dùng",
        description:
          "API: GET /admin/users/analytics - Xem các chỉ số thống kê user",
        module: "admin_users",
        action: "analytics",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ========== COURSE MANAGEMENT PERMISSIONS ==========
      {
        name: "admin.courses.list",
        displayName: "Xem danh sách khóa học",
        description: "API: GET /admin/courses - Xem danh sách tất cả khóa học",
        module: "admin_courses",
        action: "list",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.courses.view",
        displayName: "Xem chi tiết khóa học",
        description:
          "API: GET /admin/courses/:id - Xem thông tin chi tiết khóa học",
        module: "admin_courses",
        action: "view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.courses.create",
        displayName: "Tạo khóa học",
        description: "API: POST /admin/courses - Tạo khóa học mới",
        module: "admin_courses",
        action: "create",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.courses.update",
        displayName: "Cập nhật khóa học",
        description: "API: PUT /admin/courses/:id - Chỉnh sửa khóa học",
        module: "admin_courses",
        action: "update",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.courses.delete",
        displayName: "Xóa khóa học",
        description: "API: DELETE /admin/courses/:id - Xóa khóa học",
        module: "admin_courses",
        action: "delete",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.courses.analytics",
        displayName: "Xem thống kê khóa học",
        description:
          "API: GET /admin/courses/analytics - Xem các chỉ số thống kê course",
        module: "admin_courses",
        action: "analytics",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ========== LIVESTREAM MANAGEMENT PERMISSIONS ==========
      {
        name: "admin.livestreams.list",
        displayName: "Xem danh sách livestream",
        description:
          "API: GET /admin/livestreams - Xem danh sách tất cả livestream",
        module: "admin_livestreams",
        action: "list",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.livestreams.view",
        displayName: "Xem chi tiết livestream",
        description:
          "API: GET /admin/livestreams/:id - Xem thông tin chi tiết livestream",
        module: "admin_livestreams",
        action: "view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.livestreams.create",
        displayName: "Tạo livestream",
        description: "API: POST /admin/livestreams - Tạo buổi livestream mới",
        module: "admin_livestreams",
        action: "create",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.livestreams.update",
        displayName: "Cập nhật livestream",
        description: "API: PUT /admin/livestreams/:id - Chỉnh sửa livestream",
        module: "admin_livestreams",
        action: "update",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.livestreams.delete",
        displayName: "Xóa livestream",
        description: "API: DELETE /admin/livestreams/:id - Xóa livestream",
        module: "admin_livestreams",
        action: "delete",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.livestreams.analytics",
        displayName: "Xem thống kê livestream",
        description:
          "API: GET /admin/livestreams/analytics - Xem các chỉ số thống kê livestream",
        module: "admin_livestreams",
        action: "analytics",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ========== DOCUMENT MANAGEMENT PERMISSIONS ==========
      {
        name: "admin.documents.list",
        displayName: "Xem danh sách tài liệu",
        description:
          "API: GET /admin/documents - Xem danh sách tất cả tài liệu",
        module: "admin_documents",
        action: "list",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.documents.view",
        displayName: "Xem chi tiết tài liệu",
        description:
          "API: GET /admin/documents/:id - Xem thông tin chi tiết tài liệu",
        module: "admin_documents",
        action: "view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.documents.create",
        displayName: "Tạo tài liệu",
        description: "API: POST /admin/documents - Upload tài liệu mới",
        module: "admin_documents",
        action: "create",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.documents.update",
        displayName: "Cập nhật tài liệu",
        description:
          "API: PUT /admin/documents/:id - Chỉnh sửa thông tin tài liệu",
        module: "admin_documents",
        action: "update",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.documents.delete",
        displayName: "Xóa tài liệu",
        description: "API: DELETE /admin/documents/:id - Xóa tài liệu",
        module: "admin_documents",
        action: "delete",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.documents.analytics",
        displayName: "Xem thống kê tài liệu",
        description:
          "API: GET /admin/documents/analytics - Xem các chỉ số thống kê document",
        module: "admin_documents",
        action: "analytics",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ========== DASHBOARD & ANALYTICS PERMISSIONS ==========
      {
        name: "admin.dashboard.view",
        displayName: "Xem dashboard tổng quan",
        description: "API: GET /admin/dashboard - Xem dashboard chính",
        module: "admin_dashboard",
        action: "view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.dashboard.overview",
        displayName: "Xem thống kê tổng quan",
        description:
          "API: GET /admin/dashboard/overview - Xem số liệu tổng quan",
        module: "admin_dashboard",
        action: "overview",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.dashboard.user_analytics",
        displayName: "Xem phân tích người dùng",
        description: "API: GET /admin/dashboard/users - Phân tích dữ liệu user",
        module: "admin_dashboard",
        action: "user_analytics",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.dashboard.course_analytics",
        displayName: "Xem phân tích khóa học",
        description:
          "API: GET /admin/dashboard/courses - Phân tích dữ liệu course",
        module: "admin_dashboard",
        action: "course_analytics",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.dashboard.livestream_analytics",
        displayName: "Xem phân tích livestream",
        description:
          "API: GET /admin/dashboard/livestreams - Phân tích dữ liệu livestream",
        module: "admin_dashboard",
        action: "livestream_analytics",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.dashboard.document_analytics",
        displayName: "Xem phân tích tài liệu",
        description:
          "API: GET /admin/dashboard/documents - Phân tích dữ liệu document",
        module: "admin_dashboard",
        action: "document_analytics",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "admin.dashboard.growth_analytics",
        displayName: "Xem phân tích tăng trưởng",
        description:
          "API: GET /admin/dashboard/growth - Phân tích xu hướng tăng trưởng",
        module: "admin_dashboard",
        action: "growth_analytics",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ========== USER SELF-MANAGEMENT PERMISSIONS ==========
      {
        name: "user.profile.view",
        displayName: "Xem profile cá nhân",
        description:
          "API: GET /users/:id - Xem thông tin profile của chính mình",
        module: "user_profile",
        action: "view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "user.profile.update",
        displayName: "Cập nhật profile cá nhân",
        description: "API: PUT /users/:id - Chỉnh sửa thông tin cá nhân",
        module: "user_profile",
        action: "update",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "user.profile.upload_avatar",
        displayName: "Upload avatar",
        description: "API: POST /users/:id/upload-avatar - Upload ảnh đại diện",
        module: "user_profile",
        action: "upload_avatar",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "user.courses.view",
        displayName: "Xem khóa học của tôi",
        description: "API: GET /users/my-courses - Xem các khóa học đã đăng ký",
        module: "user_courses",
        action: "view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ========== PUBLIC CONTENT PERMISSIONS ==========
      {
        name: "public.courses.list",
        displayName: "Xem danh sách khóa học công khai",
        description:
          "API: GET /courses - Xem danh sách khóa học (không cần auth)",
        module: "public_courses",
        action: "list",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "public.courses.view",
        displayName: "Xem chi tiết khóa học công khai",
        description:
          "API: GET /courses/:slug - Xem chi tiết khóa học (không cần auth)",
        module: "public_courses",
        action: "view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "public.documents.list",
        displayName: "Xem danh sách tài liệu công khai",
        description:
          "API: GET /documents - Xem danh sách tài liệu (không cần auth)",
        module: "public_documents",
        action: "list",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "public.documents.view",
        displayName: "Xem chi tiết tài liệu công khai",
        description:
          "API: GET /documents/:slug - Xem chi tiết tài liệu (không cần auth)",
        module: "public_documents",
        action: "view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "public.livestreams.view",
        displayName: "Xem livestream công khai",
        description:
          "API: GET /livestreams/:slug - Xem buổi livestream (không cần auth)",
        module: "public_livestreams",
        action: "view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "public.livestreams.track_view",
        displayName: "Track view livestream",
        description:
          "API: POST /livestreams/:slug/view - Đếm lượt xem livestream",
        module: "public_livestreams",
        action: "track_view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ========== TEACHER CONTENT CREATION PERMISSIONS ==========
      {
        name: "teacher.courses.create",
        displayName: "Tạo khóa học (Teacher)",
        description: "Teacher có thể tạo khóa học riêng của mình",
        module: "teacher_courses",
        action: "create",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.courses.manage_own",
        displayName: "Quản lý khóa học riêng (Teacher)",
        description: "Teacher quản lý các khóa học do mình tạo",
        module: "teacher_courses",
        action: "manage_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.livestreams.create",
        displayName: "Tạo livestream (Teacher)",
        description: "Teacher có thể tạo buổi livestream",
        module: "teacher_livestreams",
        action: "create",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.livestreams.manage_own",
        displayName: "Quản lý livestream riêng (Teacher)",
        description: "Teacher quản lý các livestream do mình tạo",
        module: "teacher_livestreams",
        action: "manage_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.documents.create",
        displayName: "Upload tài liệu (Teacher)",
        description: "Teacher có thể upload tài liệu học tập",
        module: "teacher_documents",
        action: "create",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.documents.manage_own",
        displayName: "Quản lý tài liệu riêng (Teacher)",
        description: "Teacher quản lý các tài liệu do mình upload",
        module: "teacher_documents",
        action: "manage_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("permissions");
  },
};
