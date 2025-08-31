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
}

module.exports = new CookieManager();
