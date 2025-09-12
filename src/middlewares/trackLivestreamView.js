const redisClient = require("@/configs/redis");
const { Livestream } = require("@/models");

const trackLivestreamView = async (req, res, next) => {
  try {
    const livestreamSlugOrId = req.params.id || req.params.slug; // Support both id and slug
    const userId = req.userId; // Get from checkAuth middleware

    // Chỉ track view cho user đã đăng nhập
    if (!userId) {
      return next();
    }

    // Nếu không có livestreamId, skip tracking
    if (!livestreamSlugOrId) {
      return next();
    }

    // First, find the actual livestream to get consistent ID for Redis key
    let livestream;
    try {
      if (isNaN(livestreamSlugOrId)) {
        // It's a slug
        livestream = await Livestream.findOne({
          where: { slug: livestreamSlugOrId },
        });
      } else {
        // It's an id
        livestream = await Livestream.findByPk(livestreamSlugOrId);
      }

      if (!livestream) {
        console.log(`⚠️  Livestream not found: ${livestreamSlugOrId}`);
        return next();
      }
    } catch (error) {
      console.error("❌ Error finding livestream:", error.message);
      return next();
    }

    const livestreamId = livestream.id; // Use actual database ID for consistency

    // 1. Check cookie first (fast check) - simplified for now
    const hasViewedInCookie = false; // Skip cookie check for simplicity

    // If already viewed in cookie, skip the rest
    if (hasViewedInCookie) {
      req.isNewView = false;
      console.log(
        `👀 User ${userId} already viewed livestream ${livestreamId} (from cookie)`
      );
      return next();
    }

    // 2. Create Redis key with userId
    const viewKey = `user:${userId}:viewed:livestream:${livestreamId}`;

    // 3. Check Redis for more accurate tracking
    const hasViewedInRedis = await redisClient.exists(viewKey);

    // 4. If not viewed in Redis, increment view count
    if (!hasViewedInRedis) {
      console.log(
        `📊 New livestream view tracked: User ${userId} viewed livestream ${livestreamId}`
      );

      // Set Redis flag with 24h TTL (86400 seconds)
      await redisClient.set(viewKey, "viewed", 86400);

      // Increment view count in Redis for fast access
      const viewCountKey = `livestream:${livestreamId}:views`;
      await redisClient.incr(viewCountKey);

      // Skip cookie update for now - simplified implementation

      // IMMEDIATE database update to ensure consistency
      // Database is the source of truth
      try {
        await Livestream.increment("view", {
          where: { id: livestreamId },
          silent: true, // Don't trigger hooks
        });
        console.log(
          `✅ Database view count updated immediately for livestream ${livestreamId}`
        );

        // Sync Redis with the updated database count to ensure consistency
        const updatedLivestream = await Livestream.findByPk(livestreamId, {
          attributes: ["view"],
        });
        if (updatedLivestream) {
          await redisClient.set(
            viewCountKey,
            updatedLivestream.view.toString(),
            86400
          );
          console.log(
            `🔄 Redis synced with database count: ${updatedLivestream.view}`
          );
        }
      } catch (error) {
        console.error(
          "❌ Error updating livestream view count in database:",
          error.message
        );
        // If database update fails, rollback Redis increment
        try {
          await redisClient.decr(viewCountKey);
          console.log("🔄 Rolled back Redis increment due to database error");
        } catch (rollbackError) {
          console.error("❌ Error rolling back Redis:", rollbackError.message);
        }
      }

      // Add flag to request for controller
      req.isNewView = true;
    } else {
      req.isNewView = false;
      console.log(
        `👀 User ${userId} already viewed livestream ${livestreamId} (from Redis)`
      );

      // Skip cookie update for now - simplified implementation
    }

    next();
  } catch (error) {
    console.error("❌ Error in trackLivestreamView middleware:", error.message);
    // Don't block the request if view tracking fails
    next();
  }
};

module.exports = trackLivestreamView;
