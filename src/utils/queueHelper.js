const queueService = require("@/services/queue.service");

/**
 * Helper functions to add jobs to queue
 */
class QueueHelper {
  /**
   * Add view count sync job to queue
   * @param {string} postId - Specific post ID to sync (optional)
   * @param {Object} options - Additional options
   */
  static async addViewCountSyncJob(postId = null, options = {}) {
    try {
      const payload = {
        postId,
        batchSize: options.batchSize || 100,
        timestamp: new Date().toISOString(),
      };

      const jobData = {
        type: "viewCountSyncJob",
        payload: JSON.stringify(payload),
        status: "pending",
        max_retries: options.maxRetries || 3,
        retries_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const job = await queueService.create(jobData);
      console.log(`📋 View count sync job added to queue: ${job.id}`);
      return job;
    } catch (error) {
      console.error(
        "❌ Error adding view count sync job to queue:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Add email verification job to queue
   * @param {Object} data - Email data
   */
  static async addVerifyEmailJob(data) {
    try {
      const jobData = {
        type: "sendVerifyEmailJob",
        payload: JSON.stringify(data),
        status: "pending",
        max_retries: 3,
        retries_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const job = await queueService.create(jobData);
      console.log(`📋 Verify email job added to queue: ${job.id}`);
      return job;
    } catch (error) {
      console.error(
        "❌ Error adding verify email job to queue:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Add forgot password email job to queue
   * @param {Object} data - Email data
   */
  static async addForgotPasswordEmailJob(data) {
    try {
      const jobData = {
        type: "sendForgotPasswordEmailJob",
        payload: JSON.stringify(data),
        status: "pending",
        max_retries: 3,
        retries_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const job = await queueService.create(jobData);
      console.log(`📋 Forgot password email job added to queue: ${job.id}`);
      return job;
    } catch (error) {
      console.error(
        "❌ Error adding forgot password email job to queue:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Schedule periodic view count sync jobs
   * This could be called from a cron job or scheduler
   */
  static async scheduleViewCountSync() {
    try {
      // Add a general sync job (without specific postId)
      await this.addViewCountSyncJob(null, {
        batchSize: 50,
        maxRetries: 2,
      });

      console.log("📅 Periodic view count sync job scheduled");
    } catch (error) {
      console.error("❌ Error scheduling view count sync:", error.message);
    }
  }
}

module.exports = QueueHelper;
