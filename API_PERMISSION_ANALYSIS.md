# Phân tích Permission cho API Routes

## Tình trạng hiện tại

### Routes API không có permission protection:

- ❌ `/api/auth/*` - Authentication routes (hầu hết PUBLIC)
- ❌ `/api/users/*` - User profile routes (cần USER permissions)
- ❌ `/api/courses/*` - Course public routes (cần PUBLIC permissions)
- ❌ `/api/documents/*` - Document public routes (cần PUBLIC permissions)
- ❌ `/api/livestreams/*` - Livestream routes (cần PUBLIC permissions)
- ❌ `/api/cities` - Public data (cần PUBLIC permission)
- ❌ `/api/topics` - Public data (cần PUBLIC permission)
- ❌ `/api/schedules` - Public data (cần PUBLIC permission)
- ❌ `/api/socials` - Public data (cần PUBLIC permission)

## Đánh giá từng nhóm routes

### 1. 🔓 **PUBLIC Routes** - CẦN thêm permissions

```javascript
// Các routes này nên có PUBLIC permissions để:
// - Kiểm soát truy cập khi cần
// - Tracking và analytics
// - Có thể disable tính năng khi cần

// Cần thêm:
PERMISSIONS.PUBLIC.COURSES.LIST; // GET /api/courses
PERMISSIONS.PUBLIC.COURSES.VIEW; // GET /api/courses/:slug
PERMISSIONS.PUBLIC.DOCUMENTS.LIST; // GET /api/documents
PERMISSIONS.PUBLIC.DOCUMENTS.VIEW; // GET /api/documents/:slug
PERMISSIONS.PUBLIC.LIVESTREAMS.VIEW; // GET /api/livestreams/:slug
PERMISSIONS.PUBLIC.TOPICS.LIST; // GET /api/topics
PERMISSIONS.PUBLIC.CITIES.LIST; // GET /api/cities
PERMISSIONS.PUBLIC.SCHEDULES.LIST; // GET /api/schedules
PERMISSIONS.PUBLIC.SOCIALS.LIST; // GET /api/socials
```

### 2. 🔒 **USER Routes** - QUAN TRỌNG cần thêm permissions

```javascript
// Routes thao tác với dữ liệu cá nhân - BẮT BUỘC có permission

// Cần thêm ngay:
PERMISSIONS.USER.PROFILE.VIEW; // GET /api/users/:id
PERMISSIONS.USER.PROFILE.UPDATE; // PUT/PATCH /api/users/:id
PERMISSIONS.USER.PROFILE.UPLOAD_AVATAR; // POST /api/users/:id/upload-avatar
PERMISSIONS.USER.COURSES.VIEW_ENROLLED; // GET /api/users/my-courses
```

### 3. 🔐 **AUTH Routes** - CẦN selective permissions

```javascript
// Hầu hết auth routes là public, nhưng một số cần protection:

// Public (không cần permission):
// - POST /api/auth/login
// - POST /api/auth/register
// - POST /api/auth/google
// - POST /api/auth/forgot-password
// - GET /api/auth/verify-email
// - GET /api/auth/verify-reset-token

// Cần permission:
PERMISSIONS.USER.PROFILE.VIEW; // GET /api/auth/me
PERMISSIONS.USER.PROFILE.UPDATE; // POST /api/auth/change-password/:userId
PERMISSIONS.USER.PROFILE.UPDATE; // POST /api/auth/change-email
PERMISSIONS.USER.PROFILE.VIEW; // POST /api/auth/check-key
```

## Lý do cần thêm permissions

### ✅ **Lý do QUAN TRỌNG cần thêm:**

1. **Security & Access Control**

   - User routes hiện tại KHÔNG có bảo vệ gì cả
   - Bất kỳ ai cũng có thể update profile của người khác
   - Upload avatar cho bất kỳ user ID nào
   - Xem courses của bất kỳ user nào

2. **Data Protection**

   - `/api/users/:id/upload-avatar` - Không kiểm tra ownership
   - `/api/users/:id` PUT/PATCH - Không kiểm tra ownership
   - `/api/users/my-courses` - Không kiểm tra authentication

3. **Business Logic Control**

   - Có thể disable/enable features thông qua permissions
   - Tracking và analytics cho public content
   - A/B testing capabilities

4. **Future Scalability**
   - Dễ dàng thêm premium features
   - Role-based content access
   - Feature flags thông qua permissions

### ❌ **Rủi ro nếu KHÔNG thêm:**

1. **Critical Security Issues**

   - Unauthorized profile modifications
   - Data leakage
   - Privacy violations

2. **Business Impact**
   - Không thể kiểm soát feature access
   - Không thể implement premium features
   - Khó track user behavior

## Đề xuất Implementation

### Priority 1: USER Routes (CRITICAL)

```javascript
// src/routes/api/user.route.js
const { checkAuth } = require("@/middlewares/checkAuth");
const { requirePermission } = require("@/middlewares/checkPermission");
const { PERMISSIONS } = require("@/configs/permissions");

// Cần checkAuth + ownership validation
router.post(
  "/:id/upload-avatar",
  checkAuth,
  requirePermission(PERMISSIONS.USER.PROFILE.UPLOAD_AVATAR),
  validateOwnership, // Custom middleware kiểm tra req.userId === params.id
  userController.uploadAvatar
);

router.put(
  "/:id",
  checkAuth,
  requirePermission(PERMISSIONS.USER.PROFILE.UPDATE),
  validateOwnership,
  userValidator.updateProfile,
  userController.updateProfile
);

router.get(
  "/my-courses",
  checkAuth,
  requirePermission(PERMISSIONS.USER.COURSES.VIEW_ENROLLED),
  userController.getMyCourses
);
```

### Priority 2: PUBLIC Routes (RECOMMENDED)

```javascript
// src/routes/api/course.route.js
router.get(
  "/",
  requirePermission(PERMISSIONS.PUBLIC.COURSES.LIST),
  courseController.getAll
);

router.get(
  "/:slug",
  requirePermission(PERMISSIONS.PUBLIC.COURSES.VIEW),
  courseController.getOne
);
```

### Priority 3: AUTH Routes (SELECTIVE)

```javascript
// src/routes/api/auth.route.js
router.get(
  "/me",
  checkAuth,
  requirePermission(PERMISSIONS.USER.PROFILE.VIEW),
  authController.me
);
```

## Kết luận

### 🚨 **CRITICAL - Cần thêm ngay:**

- User profile routes: Có lỗ hổng bảo mật nghiêm trọng
- Cần authentication + ownership validation

### 📊 **RECOMMENDED - Nên thêm:**

- Public routes: Để tracking, analytics và future control
- Selective auth routes: Consistency và security

### 🔧 **Implementation Steps:**

1. Thêm permissions cho USER routes (priority 1)
2. Tạo `validateOwnership` middleware
3. Thêm permissions cho PUBLIC routes
4. Testing và validation
5. Documentation updates

**Kết luận: CRITICAL cần thêm permissions cho API routes, đặc biệt là USER routes có lỗ hổng bảo mật nghiêm trọng.**
