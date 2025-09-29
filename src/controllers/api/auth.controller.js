const usersService = require("@/services/user.service");
const authService = require("@/services/auth.service");
const cookieManager = require("@/configs/cookie");
const buildTokenResponse = require("@/utils/buildTokenResponse");
const { verifyMailToken } = require("@/services/jwt.service");

exports.login = async (req, res) => {
  try {
    const data = (({ email, password, rememberMe }) => ({
      email,
      password,
      rememberMe,
    }))(req.body);
    const tokenData = await authService.login(data);

    // Set httpOnly cookies instead of returning tokens in response
    cookieManager.setAuthCookies(res, {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      rememberMe: data.rememberMe,
    });

    // Return success without exposing tokens
    res.success(200, {
      message: "Login successful",
      user: tokenData.user,
    });
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.error(401, "No token provided");
    }
    const userData = await authService.googleLogin(token);

    // Set httpOnly cookies for Google login too
    cookieManager.setAuthCookies(res, {
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
      rememberMe: true, // Google login defaults to remember
    });

    res.success(200, {
      message: "Google login successful",
      user: userData.user,
    });
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.register = async (req, res) => {
  let { confirmPassword, ...data } = req.body;
  const result = await authService.register(data);
  res.success(201, result);
};

exports.changeEmail = async (req, res) => {
  try {
    const { userId } = req.user;
    const { newEmail } = req.body;
    const updatedUser = await authService.changeEmail({ userId, newEmail });
    res.success(200, updatedUser);
  } catch (error) {
    res.error(400, error.message);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(userId, {
      currentPassword,
      newPassword,
    });
    res.success(200, result);
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.me = async (req, res) => {
  try {
    // Get access token from cookies instead of Authorization header
    const accessToken = cookieManager.getAccessToken(req);
    if (!accessToken) {
      return res.error(401, "Access token not found");
    }

    const { userId } = await authService.checkUser(accessToken);
    const user = await usersService.getMe(userId);
    res.success(200, user);
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookies
    const refreshToken = cookieManager.getRefreshToken(req);
    if (!refreshToken) {
      return res.error(403, "Refresh token not found");
    }

    const tokenData = await authService.refreshAccessToken(refreshToken);

    // Set new cookies instead of returning tokens
    cookieManager.setAuthCookies(res, {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      rememberMe: true, // Preserve remember me state
    });

    res.success(200, { message: "Token refreshed successfully" });
  } catch (error) {
    // Clear cookies on refresh error
    cookieManager.clearAuthCookies(res);
    res.error(403, error.message);
  }
};

exports.logout = async (req, res) => {
  try {
    // Get refresh token from cookies
    const refreshToken = cookieManager.getRefreshToken(req);

    // Clear authentication cookies FIRST (most important step)
    cookieManager.clearAuthCookies(res);

    // Then handle database cleanup (less critical)
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (dbError) {
        // Log but don't fail logout if DB cleanup fails
        console.error("DB cleanup failed during logout:", dbError.message);
      }
    }

    res.success(200, { message: "Logout successful" });
  } catch (error) {
    // Always clear cookies even if something fails
    cookieManager.clearAuthCookies(res);

    // Don't return error for logout - always succeed from user perspective
    res.success(200, { message: "Logout completed" });
  }
};

exports.sendForgotEmail = async (req, res) => {
  try {
    const result = await authService.sendForgotEmail(req.body.email);
    res.success(200, result);
  } catch (error) {
    res.error(500, error.message);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const { userId } = verifyMailToken(token);
    await usersService.update(userId, {
      verifiedAt: new Date(),
    });

    // Generate tokens using buildTokenResponse and set as httpOnly cookies
    const tokenData = await buildTokenResponse({
      userId,
      rememberMe: true, // Email verification implies user wants to stay logged in
    });
    cookieManager.setAuthCookies(res, {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      rememberMe: true,
    });

    return res.success(200, { message: "Email verified successfully" });
  } catch (error) {
    res.error(500, error.message);
  }
};

exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    const { userId } = verifyMailToken(token);
    res.success(200, { userId });
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { userId } = verifyMailToken(token);
    const result = await usersService.update(userId, {
      newPassword: req.body.password, // Pass raw password, let service hash it
    });
    res.success(200, { message: "Reset password successfully" });
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.checkKey = async (req, res) => {
  try {
    const { key } = req.body;
    const userId = req.userId; // Từ middleware checkAuth

    if (!key) {
      return res.error(400, "Key is required");
    }

    const result = await authService.checkKey(userId, key);
    res.success(200, result);
  } catch (error) {
    res.error(400, error.message);
  }
};
