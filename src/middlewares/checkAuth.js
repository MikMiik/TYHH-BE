const jwtService = require("@/services/jwt.service");
const cookieManager = require("@/configs/cookie");
const isPublicRoute = require("../configs/publicPaths");
const userService = require("@/services/user.service");

async function checkAuth(req, res, next) {
  try {
    const isPublic = isPublicRoute(req.path, req.method);

    if (isPublic) {
      // Optional authentication: Nếu có token, thử verify nhưng không bắt buộc
      const token = cookieManager.getAccessToken(req);
      if (token) {
        try {
          const payload = jwtService.verifyAccessToken(token);
          req.userId = payload.userId; // Set userId nếu token hợp lệ
        } catch (error) {
          // Token không hợp lệ, bỏ qua và tiếp tục như user không đăng nhập
        }
      }
      return next();
    }

    // Với private route, token bắt buộc phải có và hợp lệ
    const token = cookieManager.getAccessToken(req);
    if (!token) {
      return res.error(401, "Access token is required");
    }

    const payload = jwtService.verifyAccessToken(token);
    req.userId = payload.userId;
    const user = await userService.getMe(req.userId);
    req.user = user;
    next();
  } catch (error) {
    return res.error(401, error.message);
  }
}

module.exports = checkAuth;
