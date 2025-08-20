const redisClient = require("@/configs/redis");
const { Post } = require("@/models");

class ViewCountManager {
  /**
   * Get current view count for a post
   * Database is the source of truth
   * @param {string} postId - Post ID
   * @returns {Promise<number>} View count
   */
  static async getViewCount(postId) {
    try {
      // Always get from database first (source of truth)
      const post = await Post.findByPk(postId, {
        attributes: ["viewsCount"],
      });

      const dbCount = post?.viewsCount || 0;

      // Update Redis with database count to keep it in sync
      const redisKey = `post:${postId}:views`;
      await redisClient.set(redisKey, dbCount.toString(), 86400);

      console.log(`📊 View count from database for post ${postId}: ${dbCount}`);
      return dbCount;
    } catch (error) {
      console.error(
        "❌ Error getting view count from database:",
        error.message
      );

      // Only fallback to Redis if database fails
      try {
        const redisKey = `post:${postId}:views`;
        const redisCount = await redisClient.get(redisKey);
        console.log(`⚠️ Fallback to Redis count: ${redisCount || 0}`);
        return redisCount ? parseInt(redisCount) : 0;
      } catch (redisError) {
        console.error(
          "❌ Error getting view count from Redis:",
          redisError.message
        );
        return 0;
      }
    }
  }

  /**
   * Sync Redis view counts to database (Database is source of truth)
   * This should sync FROM database TO Redis, not the other way around
   * @param {string} postId - Post ID (optional, if not provided, sync all)
   */
  static async syncToDatabase(postId = null) {
    try {
      if (postId) {
        // Get accurate count from database
        const post = await Post.findByPk(postId, {
          attributes: ["viewsCount"],
        });

        if (post) {
          const dbCount = post.viewsCount || 0;

          // Update Redis to match database (database is source of truth)
          const redisKey = `post:${postId}:views`;
          await redisClient.set(redisKey, dbCount.toString(), 86400);

          console.log(
            `✅ Synced Redis with database for post ${postId}: ${dbCount}`
          );
          return { postId, viewCount: dbCount, synced: true };
        } else {
          console.log(`⚠️ Post ${postId} not found in database`);
          return { postId, error: "Post not found" };
        }
      } else {
        // For bulk sync, we need to implement batch processing
        console.log("🔄 Starting bulk sync from database to Redis...");

        // Get posts with view counts from database
        const posts = await Post.findAll({
          attributes: ["id", "viewsCount"],
          where: {
            viewsCount: {
              [require("sequelize").Op.gt]: 0,
            },
          },
        });

        const syncResults = [];
        for (const post of posts) {
          try {
            const redisKey = `post:${post.id}:views`;
            await redisClient.set(redisKey, post.viewsCount.toString(), 86400);
            syncResults.push({
              postId: post.id,
              viewCount: post.viewsCount,
              synced: true,
            });
          } catch (error) {
            console.error(`❌ Error syncing post ${post.id}:`, error.message);
            syncResults.push({ postId: post.id, error: error.message });
          }
        }

        console.log(
          `✅ Bulk sync completed: ${syncResults.filter((r) => r.synced).length}/${posts.length} posts synced`
        );
        return syncResults;
      }
    } catch (error) {
      console.error("❌ Error syncing view counts:", error.message);
      throw error;
    }
  }

  /**
   * Sync Redis view counts TO database (for emergency cases only)
   * This function exists for cases where Redis has more recent data
   * USE WITH CAUTION - Database should be the primary source of truth
   * @param {string} postId - Post ID
   */
  static async syncRedisToDatabase(postId) {
    try {
      const redisKey = `post:${postId}:views`;
      const redisCount = await redisClient.get(redisKey);

      if (redisCount !== null) {
        const count = parseInt(redisCount);

        // Get current database count for comparison
        const post = await Post.findByPk(postId, {
          attributes: ["viewsCount"],
        });

        const dbCount = post?.viewsCount || 0;

        if (count > dbCount) {
          await Post.update(
            { viewsCount: count },
            { where: { id: postId }, silent: true }
          );
          console.log(
            `⚠️ Emergency sync: Updated database from Redis for post ${postId}: ${dbCount} → ${count}`
          );
          return { postId, oldCount: dbCount, newCount: count, updated: true };
        } else {
          console.log(
            `✅ Database count (${dbCount}) is already >= Redis count (${count}) for post ${postId}`
          );
          return { postId, dbCount, redisCount: count, updated: false };
        }
      } else {
        console.log(`⚠️ No Redis data found for post ${postId}`);
        return { postId, error: "No Redis data" };
      }
    } catch (error) {
      console.error("❌ Error syncing Redis to database:", error.message);
      throw error;
    }
  }

  /**
   * Reset view tracking for a user
   * @param {string} userId - User ID
   */
  static async resetUserViews(userId) {
    try {
      // Use deletePattern to remove all user viewed keys
      const pattern = `user:${userId}:viewed:*`;
      const success = await redisClient.deletePattern(pattern);

      if (success) {
        console.log(`🔄 Reset view records for user ${userId}`);
      } else {
        console.log(`⚠️ No view records found for user ${userId}`);
      }
    } catch (error) {
      console.error("❌ Error resetting user views:", error.message);
    }
  }

  /**
   * Get user's viewed posts (simplified version)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array with limited info due to Redis constraints
   */
  static async getUserViewedPosts(userId) {
    try {
      console.log(
        "⚠️ getUserViewedPosts: Limited functionality with current Redis setup"
      );
      console.log("Consider using cookie-based tracking for user view history");
      return [];
    } catch (error) {
      console.error("❌ Error getting user viewed posts:", error.message);
      return [];
    }
  }

  /**
   * Get popular posts by view count (simplified version)
   * @param {number} limit - Number of posts to return
   * @returns {Promise<Array>} Array of posts from database
   */
  static async getPopularPosts(limit = 10) {
    try {
      // Fallback to database query for popular posts
      const posts = await Post.findAll({
        order: [["viewsCount", "DESC"]],
        limit,
        attributes: ["id", "title", "viewsCount"],
      });

      return posts.map((post) => ({
        postId: post.id,
        title: post.title,
        views: post.viewsCount,
      }));
    } catch (error) {
      console.error("❌ Error getting popular posts:", error.message);
      return [];
    }
  }
}

module.exports = ViewCountManager;
