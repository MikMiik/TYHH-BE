const usersService = require("@/services/user.service");
const authService = require("@/services/auth.service");
const cookieManager = require("@/configs/cookie");
const { verifyMailToken } = require("@/services/jwt.service");
const buildTokenResponse = require("@/utils/buildTokenResponse");

const adminAuthController = {
  // Admin login - based on API auth login + admin check
  async login(req, res) {
    try {
      const data = (({ email, password, rememberMe }) => ({
        email,
        password,
        rememberMe,
      }))(req.body);

      const tokenData = await authService.login(data);

      // Get user data after successful login (tokenData doesn't include user)
      const { userId } = await authService.checkUser(tokenData.accessToken);
      const user = await usersService.getMe(userId);

      // Check if user is admin
      const isAdmin = authService.checkIsAdmin(user);

      if (!isAdmin) {
        return res.error(403, "Truy cập bị từ chối.");
      }

      // Set httpOnly cookies same as API auth
      cookieManager.setAuthCookies(res, {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        rememberMe: data.rememberMe,
      });

      // Return success without exposing tokens
      res.success(200, {
        message: "Admin login successful",
        user: user,
      });
    } catch (error) {
      res.error(401, error.message);
    }
  },

  // Admin logout - same as API auth logout
  async logout(req, res) {
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
          console.error(
            "DB cleanup failed during admin logout:",
            dbError.message
          );
        }
      }

      res.success(200, { message: "Admin logout successful" });
    } catch (error) {
      // Always clear cookies even if something fails
      cookieManager.clearAuthCookies(res);

      // Don't return error for logout - always succeed from user perspective
      res.success(200, { message: "Admin logout completed" });
    }
  },

  // Admin me - same as API auth me
  async me(req, res) {
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
  },

  // Admin refresh token - same as API auth refreshToken
  async refreshToken(req, res) {
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

      res.success(200, { message: "Admin token refreshed successfully" });
    } catch (error) {
      // Clear cookies on refresh error
      cookieManager.clearAuthCookies(res);
      res.error(403, error.message);
    }
  },

  async sendForgotEmail(req, res) {
    try {
      const result = await authService.sendForgotAdminEmail(req.body.email);
      res.success(200, result);
    } catch (error) {
      res.error(500, error.message);
    }
  },

  async verifyEmail(req, res) {
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
  },

  async verifyResetToken(req, res) {
    try {
      const { token } = req.query;
      const { userId } = verifyMailToken(token);
      res.success(200, { userId });
    } catch (error) {
      res.error(401, error.message);
    }
  },

  async resetPassword(req, res) {
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
  },
};

module.exports = adminAuthController;
