const { Comment } = require("@/models");

/**
 * Generate notification link based on type and target
 * @param {string} type - Notification type (like, follow, etc.)
 * @param {string} notifiableType - Target type (Post, Comment, User)
 * @param {number} notifiableId - Target ID
 * @returns {string|null} Generated relative link or null
 */
async function generateNotificationLink(type, notifiableType, notifiableId) {
  try {
    switch (notifiableType.toLowerCase()) {
      case "post":
        return `/blog/${notifiableId}`;

      case "comment": {
        const comment = await Comment.findOne({
          where: { id: notifiableId },
          attributes: ["id", "commentableId"],
          raw: true, // Use raw query for better performance
        });

        if (!comment) {
          return null;
        }

        return `/blog/${comment.commentableId}/#comment-${comment.id}`;
      }

      case "user":
        return `/profile/${notifiableId}`;

      default:
        return null;
    }
  } catch (error) {
    console.error("Error generating notification link:", error);
    return null;
  }
}

module.exports = generateNotificationLink;
