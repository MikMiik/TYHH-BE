const ViewCountManager = require("@/utils/viewCountManager");

/**
 * Script to ensure data consistency between Database and Redis
 * Run this script to fix any inconsistencies
 */

async function syncAllViewCounts() {
  try {
    console.log("🔄 Starting view count consistency check...");

    // Sync from Database to Redis (Database is source of truth)
    const results = await ViewCountManager.syncToDatabase();

    console.log("📊 Sync Results:");
    console.log(
      `✅ Successfully synced: ${results.filter((r) => r.synced).length} posts`
    );
    console.log(
      `❌ Failed to sync: ${results.filter((r) => r.error).length} posts`
    );

    if (results.filter((r) => r.error).length > 0) {
      console.log(
        "Failed posts:",
        results.filter((r) => r.error)
      );
    }

    console.log("✅ View count consistency check completed!");
    return results;
  } catch (error) {
    console.error("❌ Error during sync:", error.message);
    throw error;
  }
}

async function checkSpecificPost(postId) {
  try {
    console.log(`🔍 Checking consistency for post ${postId}...`);

    const result = await ViewCountManager.syncToDatabase(postId);
    console.log("Result:", result);

    return result;
  } catch (error) {
    console.error(`❌ Error checking post ${postId}:`, error.message);
    throw error;
  }
}

module.exports = {
  syncAllViewCounts,
  checkSpecificPost,
};
