import { env } from "./src/config/env.ts";
import logger from "./src/utils/logger.js";
import { createApp } from "./src/app.js";
import { startJobWorker } from "./src/services/jobsService.js";
import { registerNotificationJobHandlers } from "./src/services/notificationsService.js";

registerNotificationJobHandlers();

const app = createApp();

if (env.NODE_ENV !== "test") {
  startJobWorker({ intervalMs: env.JOB_WORKER_INTERVAL_MS });
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Server is running");
  });
}

export default app;
