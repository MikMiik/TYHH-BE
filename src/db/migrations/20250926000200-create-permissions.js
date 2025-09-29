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
        comment: "Module/nhóm chức năng: user, teacher, course, livestream...",
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

    // Thêm data mặc định cho các permission (chỉ TEACHER và USER, ADMIN không cần)
    await queryInterface.bulkInsert("permissions", [
      // ========== USER PERMISSIONS ==========
      // Profile Management
      {
        name: "user.profile.view",
        displayName: "Xem profile cá nhân",
        description: "API: GET /auth/me - Xem thông tin profile của chính mình",
        module: "user",
        action: "profile_view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "user.profile.update",
        displayName: "Cập nhật profile cá nhân",
        description: "API: PUT /users/profile - Chỉnh sửa thông tin cá nhân",
        module: "user",
        action: "profile_update",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "user.profile.upload_avatar",
        displayName: "Upload avatar",
        description: "API: POST /users/upload-avatar - Upload ảnh đại diện",
        module: "user",
        action: "upload_avatar",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Course Access
      {
        name: "user.courses.view_enrolled",
        displayName: "Xem khóa học đã đăng ký",
        description: "API: GET /user/courses - Xem danh sách khóa học đã đăng ký",
        module: "user",
        action: "courses_view_enrolled",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "user.courses.enroll",
        displayName: "Đăng ký khóa học",
        description: "API: POST /courses/:id/enroll - Đăng ký tham gia khóa học",
        module: "user",
        action: "courses_enroll",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "user.courses.unenroll",
        displayName: "Hủy đăng ký khóa học",
        description: "API: DELETE /courses/:id/enroll - Hủy đăng ký khóa học",
        module: "user",
        action: "courses_unenroll",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Livestream Access
      {
        name: "user.livestreams.view_enrolled",
        displayName: "Xem livestream đã đăng ký",
        description: "API: GET /user/livestreams - Xem livestream đã đăng ký",
        module: "user",
        action: "livestreams_view_enrolled",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "user.livestreams.join",
        displayName: "Tham gia livestream",
        description: "API: POST /livestreams/:id/join - Tham gia buổi livestream",
        module: "user",
        action: "livestreams_join",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Document Access
      {
        name: "user.documents.download_allowed",
        displayName: "Download tài liệu được phép",
        description: "API: GET /documents/:id/download - Download tài liệu đã được cấp quyền",
        module: "user",
        action: "documents_download",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "user.documents.view_allowed",
        displayName: "Xem tài liệu được phép",
        description: "API: GET /documents/:id/view - Xem nội dung tài liệu đã được cấp quyền",
        module: "user",
        action: "documents_view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ========== TEACHER PERMISSIONS ==========
      // Course Management (Own courses)
      {
        name: "teacher.courses.create",
        displayName: "Tạo khóa học",
        description: "API: POST /courses - Tạo khóa học mới",
        module: "teacher",
        action: "courses_create",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.courses.manage_own",
        displayName: "Quản lý khóa học của mình",
        description: "API: PUT/DELETE /courses/:id - Quản lý khóa học do mình tạo",
        module: "teacher",
        action: "courses_manage_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.courses.view_own",
        displayName: "Xem khóa học của mình",
        description: "API: GET /teacher/courses - Xem danh sách khóa học đã tạo",
        module: "teacher",
        action: "courses_view_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.courses.update_own",
        displayName: "Cập nhật khóa học của mình",
        description: "API: PUT /courses/:id - Cập nhật thông tin khóa học",
        module: "teacher",
        action: "courses_update_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.courses.delete_own",
        displayName: "Xóa khóa học của mình",
        description: "API: DELETE /courses/:id - Xóa khóa học đã tạo",
        module: "teacher",
        action: "courses_delete_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Livestream Management (Own livestreams)
      {
        name: "teacher.livestreams.create",
        displayName: "Tạo livestream",
        description: "API: POST /livestreams - Tạo buổi livestream mới",
        module: "teacher",
        action: "livestreams_create",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.livestreams.manage_own",
        displayName: "Quản lý livestream của mình",
        description: "API: PUT/DELETE /livestreams/:id - Quản lý livestream do mình tạo",
        module: "teacher",
        action: "livestreams_manage_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.livestreams.view_own",
        displayName: "Xem livestream của mình",
        description: "API: GET /teacher/livestreams - Xem danh sách livestream đã tạo",
        module: "teacher",
        action: "livestreams_view_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.livestreams.update_own",
        displayName: "Cập nhật livestream của mình",
        description: "API: PUT /livestreams/:id - Cập nhật thông tin livestream",
        module: "teacher",
        action: "livestreams_update_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.livestreams.delete_own",
        displayName: "Xóa livestream của mình",
        description: "API: DELETE /livestreams/:id - Xóa livestream đã tạo",
        module: "teacher",
        action: "livestreams_delete_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Document Management
      {
        name: "teacher.documents.create",
        displayName: "Tạo tài liệu",
        description: "API: POST /documents - Upload tài liệu mới",
        module: "teacher",
        action: "documents_create",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.documents.manage_own",
        displayName: "Quản lý tài liệu của mình",
        description: "API: PUT/DELETE /documents/:id - Quản lý tài liệu do mình tạo",
        module: "teacher",
        action: "documents_manage_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.documents.view_own",
        displayName: "Xem tài liệu của mình",
        description: "API: GET /teacher/documents - Xem danh sách tài liệu đã tạo",
        module: "teacher",
        action: "documents_view_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.documents.update_own",
        displayName: "Cập nhật tài liệu của mình",
        description: "API: PUT /documents/:id - Cập nhật thông tin tài liệu",
        module: "teacher",
        action: "documents_update_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.documents.delete_own",
        displayName: "Xóa tài liệu của mình",
        description: "API: DELETE /documents/:id - Xóa tài liệu đã tạo",
        module: "teacher",
        action: "documents_delete_own",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Student Management
      {
        name: "teacher.students.view",
        displayName: "Xem học sinh",
        description: "API: GET /teacher/students - Xem danh sách học sinh trong khóa học",
        module: "teacher",
        action: "students_view",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "teacher.students.manage",
        displayName: "Quản lý học sinh",
        description: "API: POST/DELETE /courses/:id/students - Thêm/xóa học sinh khỏi khóa học",
        module: "teacher",
        action: "students_manage",
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