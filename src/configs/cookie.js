class CookieManager {
  constructor() {
    // Default cookie options
    this.defaultOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      path: "/",
    };
  }

  /**
   * Set a cookie
   * @param {Object} res - Express response object
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {Object} options - Cookie options
   */
  setCookie(res, name, value, options = {}) {
    try {
      const cookieOptions = {
        ...this.defaultOptions,
        ...options,
      };

      res.cookie(name, value, cookieOptions);
      console.log(`🍪 Cookie set: ${name}`);
      return true;
    } catch (error) {
      console.error("❌ Error setting cookie:", error.message);
      return false;
    }
  }

  /**
   * Get a cookie value
   * @param {Object} req - Express request object
   * @param {string} name - Cookie name
   * @returns {string|null} Cookie value or null if not found
   */
  getCookie(req, name) {
    try {
      const value = req.cookies[name];
      return value || null;
    } catch (error) {
      console.error("❌ Error getting cookie:", error.message);
      return null;
    }
  }

  /**
   * Clear/delete a cookie
   * @param {Object} res - Express response object
   * @param {string} name - Cookie name
   * @param {Object} options - Cookie options (for path, domain matching)
   */
  clearCookie(res, name, options = {}) {
    try {
      const cookieOptions = {
        path: "/",
        ...options,
      };

      res.clearCookie(name, cookieOptions);
      console.log(`🗑️ Cookie cleared: ${name}`);
      return true;
    } catch (error) {
      console.error("❌ Error clearing cookie:", error.message);
      return false;
    }
  }

  /**
   * Set authentication token cookie
   * @param {Object} res - Express response object
   * @param {string} token - JWT token
   * @param {Object} customOptions - Custom cookie options
   */
  setAuthToken(res, token, customOptions = {}) {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      ...customOptions,
    };

    return this.setCookie(res, "auth_token", token, options);
  }

  /**
   * Get authentication token from cookie
   * @param {Object} req - Express request object
   * @returns {string|null} Auth token or null
   */
  getAuthToken(req) {
    return this.getCookie(req, "auth_token");
  }

  /**
   * Clear authentication token cookie
   * @param {Object} res - Express response object
   */
  clearAuthToken(res) {
    return this.clearCookie(res, "auth_token");
  }

  /**
   * Set refresh token cookie
   * @param {Object} res - Express response object
   * @param {string} token - Refresh token
   * @param {Object} customOptions - Custom cookie options
   */
  setRefreshToken(res, token, customOptions = {}) {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      ...customOptions,
    };

    return this.setCookie(res, "refresh_token", token, options);
  }

  /**
   * Get refresh token from cookie
   * @param {Object} req - Express request object
   * @returns {string|null} Refresh token or null
   */
  getRefreshToken(req) {
    return this.getCookie(req, "refresh_token");
  }

  /**
   * Clear refresh token cookie
   * @param {Object} res - Express response object
   */
  clearRefreshToken(res) {
    return this.clearCookie(res, "refresh_token");
  }

  /**
   * Set user preference cookie
   * @param {Object} res - Express response object
   * @param {Object} preferences - User preferences object
   * @param {Object} customOptions - Custom cookie options
   */
  setUserPreferences(res, preferences, customOptions = {}) {
    const options = {
      httpOnly: false, // Allow client-side access for preferences
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      ...customOptions,
    };

    const value = JSON.stringify(preferences);
    return this.setCookie(res, "user_preferences", value, options);
  }

  /**
   * Get user preferences from cookie
   * @param {Object} req - Express request object
   * @returns {Object|null} User preferences object or null
   */
  getUserPreferences(req) {
    try {
      const value = this.getCookie(req, "user_preferences");
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("❌ Error parsing user preferences cookie:", error.message);
      return null;
    }
  }

  /**
   * Set session ID cookie
   * @param {Object} res - Express response object
   * @param {string} sessionId - Session ID
   * @param {Object} customOptions - Custom cookie options
   */
  setSessionId(res, sessionId, customOptions = {}) {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      ...customOptions,
    };

    return this.setCookie(res, "session_id", sessionId, options);
  }

  /**
   * Get session ID from cookie
   * @param {Object} req - Express request object
   * @returns {string|null} Session ID or null
   */
  getSessionId(req) {
    return this.getCookie(req, "session_id");
  }

  /**
   * Clear session ID cookie
   * @param {Object} res - Express response object
   */
  clearSessionId(res) {
    return this.clearCookie(res, "session_id");
  }

  /**
   * Set remember me cookie
   * @param {Object} res - Express response object
   * @param {string} token - Remember me token
   * @param {Object} customOptions - Custom cookie options
   */
  setRememberMe(res, token, customOptions = {}) {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      ...customOptions,
    };

    return this.setCookie(res, "remember_me", token, options);
  }

  /**
   * Get remember me token from cookie
   * @param {Object} req - Express request object
   * @returns {string|null} Remember me token or null
   */
  getRememberMe(req) {
    return this.getCookie(req, "remember_me");
  }

  /**
   * Clear remember me cookie
   * @param {Object} res - Express response object
   */
  clearRememberMe(res) {
    return this.clearCookie(res, "remember_me");
  }

  /**
   * Check if a cookie exists
   * @param {Object} req - Express request object
   * @param {string} name - Cookie name
   * @returns {boolean} True if cookie exists
   */
  hasCookie(req, name) {
    return this.getCookie(req, name) !== null;
  }

  /**
   * Get all cookies
   * @param {Object} req - Express request object
   * @returns {Object} All cookies object
   */
  getAllCookies(req) {
    try {
      return req.cookies || {};
    } catch (error) {
      console.error("❌ Error getting all cookies:", error.message);
      return {};
    }
  }

  /**
   * Clear all application cookies
   * @param {Object} res - Express response object
   * @param {Array} cookieNames - Array of cookie names to clear
   */
  clearAllCookies(res, cookieNames = []) {
    const defaultCookies = [
      "auth_token",
      "refresh_token",
      "session_id",
      "remember_me",
      "user_preferences",
      "viewed_posts",
    ];

    const cookiesToClear =
      cookieNames.length > 0 ? cookieNames : defaultCookies;

    cookiesToClear.forEach((cookieName) => {
      this.clearCookie(res, cookieName);
    });

    console.log(`🧹 Cleared ${cookiesToClear.length} cookies`);
    return true;
  }

  /**
   * Set CSRF token cookie
   * @param {Object} res - Express response object
   * @param {string} token - CSRF token
   * @param {Object} customOptions - Custom cookie options
   */
  setCsrfToken(res, token, customOptions = {}) {
    const options = {
      httpOnly: false, // Client needs to read this for CSRF protection
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      ...customOptions,
    };

    return this.setCookie(res, "csrf_token", token, options);
  }

  /**
   * Get CSRF token from cookie
   * @param {Object} req - Express request object
   * @returns {string|null} CSRF token or null
   */
  getCsrfToken(req) {
    return this.getCookie(req, "csrf_token");
  }

  /**
   * Set language preference cookie
   * @param {Object} res - Express response object
   * @param {string} language - Language code (e.g., 'en', 'vi')
   * @param {Object} customOptions - Custom cookie options
   */
  setLanguage(res, language, customOptions = {}) {
    const options = {
      httpOnly: false, // Client needs to read this
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      ...customOptions,
    };

    return this.setCookie(res, "language", language, options);
  }

  /**
   * Get language preference from cookie
   * @param {Object} req - Express request object
   * @returns {string|null} Language code or null
   */
  getLanguage(req) {
    return this.getCookie(req, "language");
  }

  /**
   * Set viewed posts cookie
   * @param {Object} res - Express response object
   * @param {Array} postIds - Array of viewed post IDs
   * @param {Object} customOptions - Custom cookie options
   */
  setViewedPosts(res, postIds, customOptions = {}) {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      ...customOptions,
    };

    // Limit to last 100 posts to prevent cookie size issues
    const limitedPostIds = Array.isArray(postIds) ? postIds.slice(-100) : [];

    const value = JSON.stringify(limitedPostIds);
    return this.setCookie(res, "viewed_posts", value, options);
  }

  /**
   * Get viewed posts from cookie
   * @param {Object} req - Express request object
   * @returns {Array} Array of viewed post IDs
   */
  getViewedPosts(req) {
    try {
      const value = this.getCookie(req, "viewed_posts");
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error("❌ Error parsing viewed posts cookie:", error.message);
      return [];
    }
  }

  /**
   * Add a post to viewed posts cookie
   * @param {Object} res - Express response object
   * @param {Object} req - Express request object
   * @param {string} postId - Post ID to add
   */
  addViewedPost(res, req, postId) {
    const viewedPosts = this.getViewedPosts(req);

    if (!viewedPosts.includes(postId)) {
      viewedPosts.push(postId);
      this.setViewedPosts(res, viewedPosts);
    }

    return viewedPosts;
  }

  /**
   * Check if a post has been viewed
   * @param {Object} req - Express request object
   * @param {string} postId - Post ID to check
   * @returns {boolean} True if post has been viewed
   */
  hasViewedPost(req, postId) {
    const viewedPosts = this.getViewedPosts(req);
    return viewedPosts.includes(postId);
  }

  /**
   * Clear viewed posts cookie
   * @param {Object} res - Express response object
   */
  clearViewedPosts(res) {
    return this.clearCookie(res, "viewed_posts");
  }

  /**
   * Create secure cookie options for production
   * @param {Object} customOptions - Custom options to override defaults
   * @returns {Object} Secure cookie options
   */
  getSecureOptions(customOptions = {}) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      domain: process.env.COOKIE_DOMAIN || undefined,
      ...customOptions,
    };
  }

  /**
   * Create development cookie options
   * @param {Object} customOptions - Custom options to override defaults
   * @returns {Object} Development cookie options
   */
  getDevOptions(customOptions = {}) {
    return {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      ...customOptions,
    };
  }
}

const cookieManager = new CookieManager();
module.exports = cookieManager;
