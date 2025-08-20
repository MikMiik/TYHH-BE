const jwtService = require("@/services/jwt.service");
const isPublicRoute = require("../configs/publicPaths");

async function checkAuth(req, res, next) {
  try {
    const authHeader = req.headers?.authorization;
    const isPublic = isPublicRoute(req.path, req.method);

    // Nếu là public route và không có authHeader, cho phép tiếp tục
    if (isPublic && !authHeader) {
      return next();
    }

    // Nếu không có authHeader và không phải public route, trả về lỗi
    if (!authHeader) {
      return res.error(401, "Authorization header is required");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.error(
        401,
        'Invalid Authorization format. Format is "Bearer <token>"'
      );
    }
    const token = parts[1];

    // Nếu là public route, thử verify token nhưng không trả về lỗi nếu hết hạn
    if (isPublic) {
      try {
        const payload = jwtService.verifyAccessToken(token);
        req.userId = payload.userId;
      } catch (error) {
        // Với public route, bỏ qua lỗi token và cho phép tiếp tục mà không set userId
      }
      return next();
    }

    // Với private route, token phải hợp lệ
    const payload = jwtService.verifyAccessToken(token);
    req.userId = payload.userId;

    next();
  } catch (error) {
    return res.error(401, error.message);
  }
}

module.exports = checkAuth;
