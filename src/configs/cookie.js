class CookieManager {
  constructor() {
    this.defaultOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    };
  }

  setCookie(res, name, value, options = {}) {
    try {
      const cookieOptions = {
        ...this.defaultOptions,
        ...options,
      };
      res.cookie(name, value, cookieOptions);
      return true;
    } catch (error) {
      console.error("Error setting cookie:", error.message);
      return false;
    }
  }

  getCookie(req, name) {
    try {
      const value = req.cookies[name];
      return value || null;
    } catch (error) {
      console.error("Error getting cookie:", error.message);
      return null;
    }
  }

  clearCookie(res, name, options = {}) {
    try {
      const cookieOptions = {
        path: "/",
        ...options,
      };
      res.clearCookie(name, cookieOptions);
      return true;
    } catch (error) {
      console.error("Error clearing cookie:", error.message);
      return false;
    }
  }

  hasCookie(req, name) {
    return this.getCookie(req, name) !== null;
  }

  // Authentication specific methods
  setAuthCookies(res, { accessToken, refreshToken, rememberMe = false }) {
    try {
      const accessTokenAge = 60 * 60 * 1000; // 1 hour
      const refreshTokenAge = rememberMe
        ? 30 * 24 * 60 * 60 * 1000 // 30 days if remember me
        : 1 * 24 * 60 * 60 * 1000; // 1 day default

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      };

      // Set access token cookie
      this.setCookie(res, "accessToken", accessToken, {
        ...cookieOptions,
        maxAge: accessTokenAge,
      });

      // Set refresh token cookie
      this.setCookie(res, "refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: refreshTokenAge,
      });

      return true;
    } catch (error) {
      console.error("Error setting auth cookies:", error.message);
      return false;
    }
  }

  clearAuthCookies(res) {
    try {
      // Clear cookies with all possible path variations to ensure complete removal
      const cookieOptions = {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      };

      // Clear with exact same options as when setting
      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);

      // Also clear with minimal options as fallback
      res.clearCookie("accessToken", { path: "/" });
      res.clearCookie("refreshToken", { path: "/" });

      return true;
    } catch (error) {
      console.error("Error clearing auth cookies:", error.message);
      return false;
    }
  }

  hasAuthCookies(req) {
    return (
      this.hasCookie(req, "accessToken") || this.hasCookie(req, "refreshToken")
    );
  }

  getAccessToken(req) {
    return this.getCookie(req, "accessToken");
  }

  getRefreshToken(req) {
    return this.getCookie(req, "refreshToken");
  }
}

module.exports = new CookieManager();
