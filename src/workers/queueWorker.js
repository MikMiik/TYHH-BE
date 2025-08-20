require("module-alias/register");
require("dotenv").config();
const queueService = require("@/services/queue.service");
const sendVerifyEmailJob = require("@/jobs/sendVerifyEmailJob");
const sendForgotPasswordEmailJob = require("@/jobs/sendForgotPasswordEmailJob");

const handlers = {
  sendVerifyEmailJob,
  sendForgotPasswordEmailJob,
};

async function queueWorker() {
  while (true) {
    const jobs = await queueService.getPendingJobs();
    for (let job of jobs) {
      await jobProcess(job);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function jobProcess(job) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const handler = handlers[job.type];
  if (handler) {
    try {
      await queueService.update(job.id, { status: "processing" });
      await handler(job);
      await queueService.update(job.id, { status: "completed" });
    } catch (error) {
      await queueService.update(job.id, { status: "reject" });
      console.log("Error:", error.message);
      if (job.retries_count < job.max_retries) {
        await queueService.update(job.id, {
          status: "reject",
          retries_count: (job.retries_count += 1),
        });
        console.log(`Retry times: ${job.retries_count}`);
        jobProcess(job);
      }
    }
  }
}

queueWorker();
