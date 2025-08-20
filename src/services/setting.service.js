const { Setting, Follow, User } = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");
const userService = require("./user.service");
const sendUnverifiedUserEmail = require("@/utils/sendUnverifiedUserEmail");
const redisClient = require("@/configs/redis");

class SettingService {
  constructor() {
    this.CACHE_TTL = 300; // 5 minutes
    this.CACHE_PREFIX = "settings:";
  }

  // Getter for current user ID
  get userId() {
    return getCurrentUser();
  }

  // Helper to create cache key
  getCacheKey(userId) {
    return `${this.CACHE_PREFIX}${userId}`;
  }

  async createDefaultSettings(userId) {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await userService.getById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const defaultSettings = {
      userId,
      email: user.email,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      defaultPostVisibility: "public",
      allowComments: true,
      showViewCounts: true,
      notiNewComments: true,
      notiNewLikes: true,
      notiNewFollowers: true,
      notiWeeklyDigest: true,
      profileVisibility: "public",
      searchEngineIndexing: true,
    };

    const setting = await Setting.create(defaultSettings);

    // Cache immediately after creation
    await this.cacheSettings(userId, setting);

    return setting;
  }

  async upsertSetting(data) {
    const userId = this.userId;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const [setting, created] = await Setting.upsert({
      userId,
      ...data,
    });

    const user = await User.findOne({ where: { id: userId } });
    if (data.email && data.email !== user.email) {
      await user.update({ email: data.email, verifiedAt: null });
      sendUnverifiedUserEmail(user.id);
    }

    // Update cache after save to DB
    await this.cacheSettings(userId, setting);

    return setting;
  }

  async deleteSetting() {
    const userId = this.userId;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const result = await Setting.destroy({
      where: { userId },
    });

    // Remove from cache
    await this.clearSettingsCache(userId);

    return result > 0;
  }

  // === REDIS CACHE METHODS === //

  async getCachedSettings(userId) {
    try {
      const cacheKey = this.getCacheKey(userId);
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      console.error("Error getting cached settings:", error);
      return null;
    }
  }

  async cacheSettings(userId, settings) {
    try {
      const cacheKey = this.getCacheKey(userId);
      // Đảm bảo convert object thành JSON string
      const settingsJson = JSON.stringify(settings);

      await redisClient.set(cacheKey, settingsJson, this.CACHE_TTL);
      console.log(`💾 Settings cached for user: ${userId}`);
    } catch (error) {
      console.error("Error caching settings:", error);
    }
  }

  async clearSettingsCache(userId) {
    try {
      const cacheKey = this.getCacheKey(userId);
      await redisClient.del(cacheKey);
      console.log(`🗑️ Settings cache cleared for user: ${userId}`);
    } catch (error) {
      console.error("Error clearing settings cache:", error);
    }
  }

  // Clear cache for multiple users (useful for admin operations)
  async clearAllSettingsCache() {
    try {
      const pattern = `${this.CACHE_PREFIX}*`;
      await redisClient.deletePattern(pattern);
      console.log("🗑️ All settings cache cleared");
    } catch (error) {
      console.error("Error clearing all settings cache:", error);
    }
  }

  // === MAIN METHOD TO GET USER SETTINGS === //

  async getUserSettings(userId) {
    // Fix: Remove incorrect parameter `id`
    const targetUserId = userId || this.userId;
    if (!targetUserId) {
      throw new Error("User ID required");
    }

    // 1. Try to get from Redis cache first
    const cachedSettings = await this.getCachedSettings(targetUserId);
    if (cachedSettings) {
      console.log(`✅ Settings loaded from cache for user: ${targetUserId}`);
      return cachedSettings;
    }

    // 2. If not in cache, get from DB
    console.log(`📂 Settings loaded from DB for user: ${targetUserId}`);
    const user = await userService.getById(targetUserId);
    const email = user ? user.email : "";

    const setting = await Setting.findOne({
      where: { userId: targetUserId },
    });

    let settingsData;

    // Return default settings if no record exists
    if (!setting) {
      settingsData = {
        userId: targetUserId,
        email,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        defaultPostVisibility: "public",
        allowComments: true,
        showViewCounts: true,
        notiNewComments: true,
        notiNewLikes: true,
        notiNewFollowers: true,
        notiWeeklyDigest: true,
        profileVisibility: "public",
        searchEngineIndexing: true,
      };
    } else {
      // Convert Sequelize instance to plain object
      settingsData = { ...setting.toJSON(), email };
    }

    // 3. Cache the result - both cases are plain objects, OK to cache
    await this.cacheSettings(targetUserId, settingsData);

    return settingsData;
  }

  // === HELPER METHODS FOR CHECKING PERMISSIONS === //

  async canReceiveNotification(userId, notificationType) {
    const settings = await this.getUserSettings(userId);

    switch (notificationType) {
      case "comment":
        return settings.notiNewComments;
      case "like":
        return settings.notiNewLikes;
      case "follow":
        return settings.notiNewFollowers;
      case "digest":
        return settings.notiWeeklyDigest;
      default:
        return true;
    }
  }

  async canViewProfile(targetUserId, viewerUserId = null) {
    const settings = await this.getUserSettings(targetUserId);

    if (settings.profileVisibility === "public") {
      return true;
    }

    if (settings.profileVisibility === "private") {
      return targetUserId === viewerUserId;
    }

    if (settings.profileVisibility === "followers") {
      // Check if viewer is following target
      const isFollowing = await Follow.findOne({
        where: { followerId: viewerUserId, followedId: targetUserId },
      });
      console.log(typeof !!isFollowing);

      return !!isFollowing || targetUserId === viewerUserId;
    }

    return false;
  }

  async getPostVisibilityFilter(userId) {
    const settings = await this.getUserSettings(userId);
    return settings.defaultPostVisibility;
  }

  async shouldAllowComments(userId) {
    const settings = await this.getUserSettings(userId);
    return settings.allowComments;
  }

  async shouldShowViewCounts(userId) {
    const settings = await this.getUserSettings(userId);
    return settings.showViewCounts;
  }

  async canIndexBySearchEngine(userId) {
    const settings = await this.getUserSettings(userId);
    return settings.searchEngineIndexing;
  }

  // New method: Save user preferences in both Redis và cookie
  async saveUserPreferences(userId, preferences, res) {
    // 1. Save to Redis (authoritative source)
    const cacheKey = `preferences:${userId}`;
    await redisClient.set(cacheKey, JSON.stringify(preferences), 86400); // 24h

    // 2. Save subset to cookie for quick client access
    const cookiePrefs = {
      theme: preferences.theme,
      language: preferences.language,
      postsPerPage: preferences.postsPerPage,
      defaultPostVisibility: preferences.defaultPostVisibility,
    };

    res.cookie("userPrefs", JSON.stringify(cookiePrefs), {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: false, // Client needs access for UI
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return preferences;
  }
}

module.exports = new SettingService();
