const redisClient = require("@/configs/redis");
const cookieManager = require("@/configs/cookie");
const getCurrentUser = require("@/utils/getCurrentUser");

/**
 * Middleware to track post views using Redis and Cookies
 * Only counts views for authenticated users
 */
const trackPostView = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = getCurrentUser();

    // Chỉ track view cho user đã đăng nhập
    if (!userId) {
      return next();
    }

    // 1. Check cookie first (fast check)
    const hasViewedInCookie = cookieManager.hasViewedPost(req, postId);

    // If already viewed in cookie, skip the rest
    if (hasViewedInCookie) {
      req.isNewView = false;
      console.log(
        `👀 User ${userId} already viewed post ${postId} (from cookie)`
      );
      return next();
    }

    // 2. Create Redis key with userId
    const viewKey = `user:${userId}:viewed:${postId}`;

    // 3. Check Redis for more accurate tracking
    const hasViewedInRedis = await redisClient.exists(viewKey);

    // 4. If not viewed in Redis, increment view count
    if (!hasViewedInRedis) {
      console.log(`📊 New view tracked: User ${userId} viewed post ${postId}`);

      // Set Redis flag with 24h TTL (86400 seconds)
      await redisClient.set(viewKey, "viewed", 86400);

      // Increment view count in Redis for fast access
      const viewCountKey = `post:${postId}:views`;
      await redisClient.incr(viewCountKey);

      // Update cookie (client-side tracking)
      cookieManager.addViewedPost(res, req, postId);

      // IMMEDIATE database update to ensure consistency
      // Database is the source of truth
      try {
        const { Post } = require("@/models");
        await Post.increment("viewsCount", {
          where: { id: postId },
          silent: true, // Don't trigger hooks
        });
        console.log(
          `✅ Database view count updated immediately for post ${postId}`
        );

        // Sync Redis with the updated database count to ensure consistency
        const updatedPost = await Post.findByPk(postId, {
          attributes: ["viewsCount"],
        });
        if (updatedPost) {
          await redisClient.set(
            viewCountKey,
            updatedPost.viewsCount.toString(),
            86400
          );
          console.log(
            `🔄 Redis synced with database count: ${updatedPost.viewsCount}`
          );
        }
      } catch (error) {
        console.error(
          "❌ Error updating view count in database:",
          error.message
        );
        // If database update fails, rollback Redis increment
        await redisClient.decr(viewCountKey);
        console.log("🔄 Rolled back Redis increment due to database error");
      }

      // Add flag to request for controller
      req.isNewView = true;
    } else {
      req.isNewView = false;
      console.log(
        `👀 User ${userId} already viewed post ${postId} (from Redis)`
      );

      // Even if Redis has the record, make sure cookie is also updated
      // This handles cases where Redis was set but cookie might be missing
      cookieManager.addViewedPost(res, req, postId);
    }

    next();
  } catch (error) {
    console.error("❌ Error in trackPostView middleware:", error.message);
    // Don't block the request if view tracking fails
    next();
  }
};

module.exports = trackPostView;
