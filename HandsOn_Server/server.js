import { env } from "./src/config/env.ts";
import logger from "./src/utils/logger.js";
import { createApp } from "./src/app.js";

const app = createApp();

if (env.NODE_ENV !== "test") {
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Server is running");
  });
}

export default app;
