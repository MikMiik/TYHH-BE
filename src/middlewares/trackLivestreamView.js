const { Livestream, UserLivestream } = require("@/models");

const trackLivestreamView = async (req, res, next) => {
  try {
    const livestreamSlugOrId = req.params.id || req.params.slug; // Support both id and slug
    const userId = req.userId || null; // Get from checkAuth middleware, allow anonymous

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

    // Generate session ID for anonymous users
    const sessionId = userId || req.sessionID || req.ip || "anonymous";

    console.log(
      `📊 New livestream view tracked: User/Session ${sessionId} viewed livestream ${livestreamId}`
    );

    // Track user-livestream relationship if userId exists
    if (userId) {
      try {
        // Check if user has already viewed this livestream
        const existingView = await UserLivestream.findOne({
          where: {
            userId: userId,
            livestreamId: livestreamId,
          },
        });

        // Only create record if user hasn't viewed this livestream before
        if (!existingView) {
          await UserLivestream.create({
            userId: userId,
            livestreamId: livestreamId,
          });
          console.log(
            `📝 First-time view recorded for user ${userId} on livestream ${livestreamId}`
          );
        } else {
          console.log(
            `🔄 Return view for user ${userId} on livestream ${livestreamId} (not recorded)`
          );
        }
      } catch (error) {
        console.error(
          "❌ Error tracking user-livestream relationship:",
          error.message
        );
      }
    }

    // Đơn giản: tăng view trực tiếp trong database (always increment regardless)
    try {
      await Livestream.increment("view", {
        where: { id: livestreamId },
        silent: true, // Don't trigger hooks
      });
      console.log(`✅ View count updated for livestream ${livestreamId}`);
    } catch (error) {
      console.error("❌ Error updating view count:", error.message);
    }

    // Always mark as new view since we allow multiple views
    req.isNewView = true;
    next();
  } catch (error) {
    console.error("❌ Error in trackLivestreamView middleware:", error.message);
    // Don't block the request if view tracking fails
    next();
  }
};

module.exports = trackLivestreamView;
