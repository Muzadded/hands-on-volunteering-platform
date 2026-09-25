import * as jobsRepo from "../repositories/jobsRepository.js";
import logger from "../utils/logger.js";
import { env } from "../config/env.ts";

const handlers = new Map();

export function registerJobHandler(jobType, handler) {
  handlers.set(jobType, handler);
}

export async function enqueueJob(jobType, payload = {}, options = {}) {
  return jobsRepo.enqueue({
    jobType,
    payload,
    runAt: options.runAt || new Date(),
    dedupeKey: options.dedupeKey || null,
    maxAttempts: options.maxAttempts || 5,
  });
}

export async function cancelJobsByPrefix(prefix) {
  return jobsRepo.cancelByDedupePrefix(prefix);
}

export async function processOnce(limit = 10) {
  const jobs = await jobsRepo.claimNextBatch(limit);
  for (const job of jobs) {
    const handler = handlers.get(job.job_type);
    try {
      if (!handler) {
        throw new Error(`No handler for job type: ${job.job_type}`);
      }
      await handler(job.payload || {}, job);
      await jobsRepo.markCompleted(job.id);
    } catch (error) {
      logger.error({ err: error, jobId: job.id, jobType: job.job_type }, "Job failed");
      await jobsRepo.markFailed(job.id, error.message || error);
    }
  }
  return jobs.length;
}

let timer = null;

export function startJobWorker({ intervalMs = 2000 } = {}) {
  if (env.NODE_ENV === "test") return () => {};
  if (timer) return () => stopJobWorker();

  const tick = async () => {
    try {
      await processOnce(10);
    } catch (error) {
      logger.error({ err: error }, "Job worker tick failed");
    }
  };

  timer = setInterval(tick, intervalMs);
  // Kick once immediately
  tick();
  logger.info({ intervalMs }, "Background job worker started");
  return () => stopJobWorker();
}

export function stopJobWorker() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
