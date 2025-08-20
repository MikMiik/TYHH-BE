const QueueHelper = require("@/utils/queueHelper");

/**
 * Example scheduler for view count sync jobs
 * This could be integrated with a cron job system like node-cron
 */

// Example 1: Schedule periodic sync every hour
// const cron = require('node-cron');
// cron.schedule('0 * * * *', async () => {
//   console.log('🕐 Running hourly view count sync...');
//   await QueueHelper.scheduleViewCountSync();
// });

// Example 2: Manually add sync job for specific post
async function syncSpecificPost(postId) {
  try {
    await QueueHelper.addViewCountSyncJob(postId);
    console.log(`✅ Sync job added for post ${postId}`);
  } catch (error) {
    console.error(
      `❌ Failed to add sync job for post ${postId}:`,
      error.message
    );
  }
}

// Example 3: Schedule bulk sync
async function scheduleBulkSync() {
  try {
    await QueueHelper.scheduleViewCountSync();
    console.log("✅ Bulk sync job scheduled");
  } catch (error) {
    console.error("❌ Failed to schedule bulk sync:", error.message);
  }
}

module.exports = {
  syncSpecificPost,
  scheduleBulkSync,
};

// Usage examples:
// syncSpecificPost('123');
// scheduleBulkSync();
