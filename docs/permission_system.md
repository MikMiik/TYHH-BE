# Hệ Thống Phân Quyền (Permission System)

## Tổng Quan

Hệ thống phân quyền TYHH BE được thiết kế với kiến trúc 3 tầng:

- **Authentication** (Xác thực): Xác định user có đăng nhập không
- **Authorization** (Phân quyền): Xác định user có quyền truy cập resource không
- **Route Protection** (Bảo vệ route): Phân loại public/private routes

## Luồng Xử Lý Authentication & Authorization

### 1. Middleware `auth()` - Entry Point

```javascript
async function auth(req, res, next) {
  const isPublic = isPublicRoute(req.path, req.method);

  if (isPublic) {
    // PUBLIC ROUTE LOGIC
  } else {
    // PRIVATE ROUTE LOGIC
  }
}
```

## Sự Khác Biệt Giữa Public Routes và Private Routes

### 🌍 **PUBLIC ROUTES** (isPublic = true)

**Đặc điểm:**

- Không yêu cầu authentication bắt buộc
- Token có thể có hoặc không có
- Nếu có token hợp lệ → load user data (optional authentication)
- Nếu token invalid/không có → vẫn cho phép truy cập

**Logic xử lý:**

```javascript
if (isPublic) {
  const token = cookieManager.getAccessToken(req);
  if (token) {
    try {
      // Có token → verify và load user data
      const payload = jwtService.verifyAccessToken(token);
      req.userId = payload.userId;
      req.user = await userService.getMe(req.userId);
      await loadUserData(req); // Load roles, permissions
    } catch (error) {
      // Token invalid → ignore, continue as unauthenticated
    }
  }
  return next(); // Luôn cho phép truy cập
}
```

**Ví dụ Public Routes:**

- `GET /` - Trang chủ
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `GET /courses` - Xem danh sách khóa học
- `GET /documents` - Xem tài liệu công khai

**Use Cases:**

- Trang chủ có thể hiển thị nội dung khác nhau cho user đã login vs chưa login
- API public có thể trả về data khác nhau dựa trên authentication status

---

### 🔒 **PRIVATE ROUTES** (isPublic = false)

**Đặc điểm:**

- **Bắt buộc phải có authentication**
- Token phải hợp lệ
- Không có token → 401 Unauthorized
- Token invalid → 401 Unauthorized

**Logic xử lý:**

```javascript
// PRIVATE ROUTE - Bắt buộc có token
const token = cookieManager.getAccessToken(req);
if (!token) {
  return res.error(401, "Access token required");
}

const payload = jwtService.verifyAccessToken(token); // Throw nếu invalid
req.userId = payload.userId;
req.user = await userService.getMe(req.userId);
await loadUserData(req); // Load roles, permissions
next();
```

**Ví dụ Private Routes:**

- `GET /auth/me` - Lấy thông tin user hiện tại
- `PUT /users/profile` - Cập nhật profile
- `POST /courses/:id/enroll` - Đăng ký khóa học
- `GET /user/courses` - Khóa học đã đăng ký
- Tất cả admin routes: `/admin/*`

---

## Hệ Thống Phân Quyền Chi Tiết

### 2. Load User Data - `loadUserData(req)`

Sau khi authentication thành công, system load thông tin user:

```javascript
async function loadUserData(req) {
  // 1. Check Admin Status
  req.isAdmin = checkIsAdmin(req.user);

  if (req.isAdmin) {
    // Admin bypass - có tất cả quyền
    req.userRoles = ["admin"];
    req.userPermissions = getAllPermissions();
    return;
  }

  // 2. Load Roles từ database
  const userRoles = await sequelize.query(`
    SELECT DISTINCT r.name 
    FROM roles r
    JOIN user_role ur ON r.id = ur.roleId
    WHERE ur.userId = :userId AND ur.isActive = true
  `);

  // 3. Load Permissions từ database
  const userPermissions = await sequelize.query(`
    SELECT DISTINCT p.name
    FROM permissions p
    JOIN role_permission rp ON p.id = rp.permissionId
    JOIN user_role ur ON rp.roleId = ur.roleId
    WHERE ur.userId = :userId AND ur.isActive = true
  `);

  req.userRoles = userRoles.map((r) => r.name);
  req.userPermissions = userPermissions.map((p) => p.name);
}
```

### 3. Admin Detection - `checkIsAdmin(user)`

Hệ thống có 4 cách detect admin:

```javascript
function checkIsAdmin(user) {
  // Method 1: Role-based (preferred)
  if (user.roles?.some((role) => role.name === "admin")) return true;

  // Method 2: Legacy role field
  if (user.role === "admin") return true;

  // Method 3: Environment usernames
  const adminUsernames = process.env.ADMIN_USERNAMES?.split(",") || ["admin"];
  if (adminUsernames.includes(user.username)) return true;

  // Method 4: Email domain
  if (user.email?.endsWith(process.env.ADMIN_EMAIL_DOMAIN)) return true;

  return false;
}
```

### 4. Authorization Middlewares

#### a) `requirePermission(permissions, options)`

```javascript
// Sử dụng
router.get(
  "/auth/me",
  auth,
  requirePermission("user.profile.view"),
  controller
);

// Logic
function requirePermission(permissions, options = {}) {
  return (req, res, next) => {
    // 1. Check authentication
    if (!req.userId || !req.user) {
      return res.error(401, "Authentication required");
    }

    // 2. Admin bypass
    if (req.isAdmin) return next();

    // 3. Validate permissions exist
    const permissionsArray = Array.isArray(permissions)
      ? permissions
      : [permissions];
    const invalidPermissions = permissionsArray.filter(
      (p) => !isValidPermission(p)
    );
    if (invalidPermissions.length > 0) {
      return res.error(500, "Invalid permission configuration");
    }

    // 4. Check user permissions
    const { requireAll = false } = options;
    const userPerms = req.userPermissions || [];

    let hasPermission = false;
    if (requireAll) {
      // Cần TẤT CẢ permissions
      hasPermission = permissionsArray.every((p) => userPerms.includes(p));
    } else {
      // Chỉ cần MỘT permission
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
```

#### b) `requireRole(roles)`

```javascript
// Sử dụng
router.get("/teacher/courses", auth, requireRole("teacher"), controller);

// Logic tương tự requirePermission nhưng check roles
```

#### c) `requireAdmin()`

```javascript
// Sử dụng
router.get("/admin/users", auth, requireAdmin, controller);

// Logic
function requireAdmin(req, res, next) {
  if (!req.userId || !req.user) {
    return res.error(401, "Authentication required");
  }

  if (!req.isAdmin) {
    return res.error(403, "Admin access required");
  }

  next();
}
```

#### d) `optionalPermission(permissions)`

```javascript
// Sử dụng cho API có thể truy cập cả public và private
router.get(
  "/courses",
  auth,
  optionalPermission("user.courses.view"),
  controller
);

// Logic
function optionalPermission(permissions, options = {}) {
  return (req, res, next) => {
    // Skip nếu không có user (public access)
    if (!req.userId || !req.user) return next();

    // Apply permission check cho authenticated users
    return requirePermission(permissions, options)(req, res, next);
  };
}
```

### 5. Ownership Validation Layer

**⚠️ Quan trọng**: Permission system chỉ kiểm tra user có quyền thực hiện action, còn Ownership validation đảm bảo user chỉ thao tác với **dữ liệu của chính mình**.

#### a) `validateUserOwnership(paramName)`

```javascript
// Đảm bảo user chỉ truy cập profile của chính mình
router.put(
  "/:id",
  auth,
  requirePermission("user.profile.update"),
  validateUserOwnership("id"), // Ownership check
  controller.updateProfile
);

// User A (ID: 1) có permission 'user.profile.update'
// User B (ID: 2) có permission 'user.profile.update'
// Nhưng:
// PUT /users/1 với User A → ✅ OK (ownership match)
// PUT /users/1 với User B → ❌ Blocked by validateOwnership
```

#### b) `validateOwnership(validatorFn, paramName)`

```javascript
// Custom ownership logic
const isCourseOwner = async (req, courseId, userId) => {
  const { Course } = require("@/models");
  const course = await Course.findByPk(courseId);
  return course && course.teacherId === userId;
};

router.delete(
  "/:courseId",
  auth,
  requirePermission("teacher.courses.delete"),
  validateOwnership(isCourseOwner, "courseId"),
  controller.deleteCourse
);
```

#### c) Pre-configured Ownership Validators

```javascript
const { ownershipValidators } = require("@/middlewares/validateOwnership");

// Course ownership (teacher)
router.put(
  "/:id",
  auth,
  requirePermission("teacher.courses.update"),
  validateOwnership(ownershipValidators.courseOwner, "id"),
  controller.updateCourse
);

// Course enrollment (student)
router.get(
  "/:id/materials",
  auth,
  requirePermission("user.courses.view_materials"),
  validateOwnership(ownershipValidators.courseEnrollment, "id"),
  controller.getCourseMaterials
);
```

**Key Features:**

- **Admin Bypass**: Admin tự động bypass ownership checks
- **No Duplicate Auth**: Không check authentication lại (đã có ở requirePermission)
- **Factory Functions**: Tạo validators tự động cho common patterns
- **Custom Logic**: Hỗ trợ business logic phức tạp

## Database Schema

### Bảng Roles

```sql
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  displayName VARCHAR(100),
  description TEXT,
  isActive BOOLEAN DEFAULT true
);

-- Default roles
INSERT INTO roles (name, displayName) VALUES
('user', 'Học viên'),
('teacher', 'Giáo viên');
```

### Bảng Permissions

```sql
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  displayName VARCHAR(100),
  description TEXT,
  module VARCHAR(50),
  action VARCHAR(50),
  isActive BOOLEAN DEFAULT true
);

-- Example permissions
INSERT INTO permissions (name, displayName, module, action) VALUES
('user.profile.view', 'Xem profile cá nhân', 'user', 'profile_view'),
('user.profile.update', 'Cập nhật profile', 'user', 'profile_update'),
('teacher.courses.create', 'Tạo khóa học', 'teacher', 'courses_create');
```

### Bảng Junction Tables

```sql
-- User-Role relationship
CREATE TABLE user_role (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  roleId INT NOT NULL,
  isActive BOOLEAN DEFAULT true,
  UNIQUE KEY user_role_unique (userId, roleId)
);

-- Role-Permission relationship
CREATE TABLE role_permission (
  id INT PRIMARY KEY AUTO_INCREMENT,
  roleId INT NOT NULL,
  permissionId INT NOT NULL,
  UNIQUE KEY role_permission_unique (roleId, permissionId)
);
```

## Luồng Xử Lý Hoàn Chỉnh

### Request Flow Diagram

```
HTTP Request
     ↓
1. auth() Middleware
     ↓
   isPublicRoute?
     ↙        ↘
   YES         NO
     ↓          ↓
2a. Public    2b. Private
   Optional     Required
   Token        Token
     ↓          ↓
3. Load User Data (nếu có token hợp lệ)
     ↓
4. checkIsAdmin()
     ↓
5. Load Roles & Permissions
     ↓
6. Authorization Middleware (nếu có)
   - requirePermission()
   - requireRole()
   - requireAdmin()
     ↓
7. Controller Logic
```

### Ví Dụ Thực Tế

#### Case 1: Public Route với Optional Auth

```javascript
// GET /courses - Anyone can access, but results may vary
router.get(
  "/courses",
  auth,
  optionalPermission("user.courses.view_enrolled"),
  async (req, res) => {
    let courses;

    if (
      req.user &&
      req.userPermissions.includes("user.courses.view_enrolled")
    ) {
      // Authenticated user - show enrolled courses + public courses
      courses = await getCourses({ includeEnrolled: true, userId: req.userId });
    } else {
      // Public access - only public courses
      courses = await getCourses({ publicOnly: true });
    }

    res.success(courses);
  }
);
```

#### Case 2: Private Route với Permission

```javascript
// GET /auth/me - Requires authentication + specific permission
router.get(
  "/auth/me",
  auth,
  requirePermission("user.profile.view"),
  async (req, res) => {
    // Guaranteed: req.user exists và có permission 'user.profile.view'
    const profile = await userService.getMe(req.userId);
    res.success(profile);
  }
);
```

#### Case 3: Admin Route

```javascript
// GET /admin/users - Admin only
router.get("/admin/users", auth, requireAdmin, async (req, res) => {
  // Guaranteed: req.isAdmin === true
  const users = await userService.getAll();
  res.success(users);
});
```

## Best Practices

### 1. Route Organization

```javascript
// Public routes
router.post("/auth/login", auth, loginController);
router.get(
  "/courses",
  auth,
  optionalPermission("course.view"),
  coursesController
);

// User routes
router.get(
  "/auth/me",
  auth,
  requirePermission("user.profile.view"),
  meController
);
router.put(
  "/profile",
  auth,
  requirePermission("user.profile.update"),
  updateProfileController
);

// Teacher routes
router.get(
  "/teacher/courses",
  auth,
  requireRole("teacher"),
  teacherCoursesController
);
router.post(
  "/teacher/courses",
  auth,
  requirePermission("teacher.courses.create"),
  createCourseController
);

// Admin routes
router.get("/admin/users", auth, requireAdmin, adminUsersController);
```

### 2. Permission Naming Convention

- Module: `user`, `teacher`, `admin`, `course`, `document`
- Action: `view`, `create`, `update`, `delete`, `enroll`
- Format: `{module}.{resource}.{action}`
- Examples: `user.profile.view`, `teacher.courses.create`, `course.enroll`

### 3. Error Handling

- **401 Unauthorized**: No authentication or invalid token
- **403 Forbidden**: Authenticated but no permission
- **500 Internal Server Error**: Invalid permission configuration

### 4. Testing Scenarios

- Public routes với và không có token
- Private routes với invalid/missing token
- Permission checks với admin bypass
- Role-based access control
- Multiple permissions (requireAll vs requireOne)

## Troubleshooting

### Common Issues

1. **Token valid nhưng user không load được**: Check `userService.getMe()`
2. **Admin bypass không hoạt động**: Check `checkIsAdmin()` logic
3. **Permission not found**: Verify permission exists trong database và config
4. **Role assignment**: Check `user_role` và `role_permission` tables

### Debug Commands

```javascript
// Check user permissions
console.log("User roles:", req.userRoles);
console.log("User permissions:", req.userPermissions);
console.log("Is admin:", req.isAdmin);

// Check route classification
console.log("Is public route:", isPublicRoute(req.path, req.method));
```

---

**Tóm tắt:** Hệ thống phân quyền TYHH BE cung cấp flexibility cao với public/private routes, role-based access control, permission-based authorization, và admin bypass. Thiết kế modular giúp dễ mở rộng và maintain.
